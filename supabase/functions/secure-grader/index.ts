import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // 1. Manejo de CORS para la conexión segura con React
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 2. Inicializar cliente de Supabase usando los headers de autenticación del usuario
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { payload } = await req.json()
    
    // 3. REVISIÓN DE VELOCIDAD (Filtro Anti-Bot de 5 minutos - EXCEPTO INVITADOS)
    if (!payload.isGuest && payload.timeSpentSeconds < 300) {
       throw new Error("Violación de Seguridad: Tiempo de completación por debajo del umbral mínimo de 5 minutos.");
    }

    // 4. Extraer el Blueprint Maestro desde la Base de Datos (Oculto del Estudiante)
    let queryLevel = payload.level === 'Staff' ? 'A1' : payload.level.split(':')[0].trim(); 
    let queryUnit = String(payload.unit).toLowerCase().startsWith('unit') ? payload.unit : `Unit ${payload.unit}`;

    const { data: blueprintReq, error: fetchError } = await supabaseClient
      .from('content_blueprints')
      .select('blueprint_data')
      .ilike('level', `${queryLevel}%`) 
      .ilike('unit', queryUnit)   
      .ilike('content_type', payload.activityType)
      .maybeSingle();

    if (fetchError || !blueprintReq) throw new Error("No se encontró el contenido maestro para calificar.");

    const elements = typeof blueprintReq.blueprint_data === 'string' 
        ? JSON.parse(blueprintReq.blueprint_data).elements || []
        : blueprintReq.blueprint_data?.elements || [];

    // 5. MOTOR DE CALIFICACIÓN (Lógica importada desde React)
    const cleanStr = (str: any) => {
      if (typeof str !== 'string') return '';
      return str.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim().toLowerCase();
    };

    const metrics = {
      Listening: { p: 0, c: 0, i: 0 }, Speaking: { p: 0, c: 0, i: 0 },
      Grammar: { p: 0, c: 0, i: 0 }, Writing: { p: 0, c: 0, i: 0 },
      Reading: { p: 0, c: 0, i: 0 }, Comprehension: { p: 0, c: 0, i: 0 },
    };
    
    const add = (cat: keyof typeof metrics, p: number, c: number, i: number) => {
       metrics[cat].p += p; metrics[cat].c += c; metrics[cat].i += i;
    };

    const answers = payload.rawAnswers || {};

    elements.forEach((el: any) => {
       let possible = 0; let correct = 0; let incorrect = 0;
       
       if (el.type === 'short_answer' && el.data?.correctAnswer) {
         possible++;
         const ans = cleanStr(answers[el.id]);
         const target = cleanStr(el.data.correctAnswer);
         if (!ans) incorrect++; else if (ans === target) correct++; else incorrect++;
       } 
       else if (el.type === 'fill_in_the_blank' && el.data?.answerText) {
         const rawGroups = el.data.answerText.split(',');
         rawGroups.forEach((group: string, index: number) => {
           const cleanedTarget = group.replace(/^["'\s]+|["'\s]+$/g, '');
           if (cleanedTarget) {
             possible++;
             const studentAns = (answers[`${el.id}_${index}`] || '').trim();
             const validOptions = cleanedTarget.split(/[|/]/).map((w: string) => w.trim());
             if (!studentAns) incorrect++;
             else if (validOptions.some((opt: string) => cleanStr(opt) === cleanStr(studentAns))) correct++;
             else incorrect++;
           }
         });
       }
       else if (el.type === 'multiple_selection') {
         el.data.options?.forEach((opt: any) => {
           if (opt.isCorrect) {
             possible++;
             if (answers[`${el.id}_${opt.id}`]) correct++; else incorrect++; 
           } else {
             if (answers[`${el.id}_${opt.id}`]) incorrect++; 
           }
         });
       }
       else if (el.type === 'drag_and_drop') {
         el.data.items?.forEach((item: any, idx: number) => {
           if (item.targetText && item.imageUrl) {
             possible++;
             const placed = cleanStr(answers[`${el.id}_${idx}`]);
             const target = cleanStr(item.targetText);
             if (!placed) incorrect++; else if (placed === target) correct++; else incorrect++;
           }
         });
       }
       else if (el.type === 'slider_bar' && el.data?.options) {
         const correctIdx = el.data.options.findIndex((opt: any) => opt.isCorrect);
         if (correctIdx !== -1) {
           possible++;
           const maxIdx = Math.max(0, el.data.options.length - 1);
           const defaultIdx = Math.floor(maxIdx / 2);
           const ans = answers[el.id] !== undefined ? parseInt(answers[el.id]) : defaultIdx;
           if (ans === correctIdx) correct++; else incorrect++;
         }
       }
       else if (el.type === 'word_search') {
         let isGraded = false;
         if (el.data?.placedWords) {
            el.data.placedWords.forEach((pw: any) => {
               possible++; isGraded = true;
               const studentCells = answers[`${el.id}_cells`] || [];
               const allSelected = pw.cells.every((c: string) => {
                  const altC = c.replace('-', '_');
                  return studentCells.includes(c) || studentCells.includes(altC);
               });
               if (allSelected) correct++; else incorrect++;
            });
            const studentCells = answers[`${el.id}_cells`] || [];
            const allCorrectCells = el.data.placedWords.flatMap((pw: any) => 
                pw.cells.flatMap((c: string) => [c, c.replace('-', '_')])
            );
            studentCells.forEach((sc: string) => { if (!allCorrectCells.includes(sc)) incorrect++; });
         }
         if (!isGraded) possible++; 
       }
       else if (el.type === 'crossword' && el.data?.grid) {
         let isGraded = false;
         ['across', 'down'].forEach(dir => {
            (el.data[dir] || []).forEach((wordObj: any) => {
               if (wordObj.answer && wordObj.row !== undefined && wordObj.col !== undefined) {
                  possible++; isGraded = true;
                  let isWordCorrect = true;
                  for(let i=0; i<wordObj.answer.length; i++) {
                     const r = dir === 'across' ? wordObj.row : wordObj.row + i;
                     const c = dir === 'across' ? wordObj.col + i : wordObj.col;
                     const studentLetter = answers[`${el.id}_${r}_${c}`] || '';
                     if (studentLetter.toUpperCase() !== wordObj.answer[i].toUpperCase()) isWordCorrect = false;
                  }
                  if (isWordCorrect) correct++; else incorrect++;
               }
            });
         });
         if (!isGraded) possible++; 
       }
       else if (el.type === 'record_compare') {
          possible++;
          if (answers[`${el.id}_recorded`]) correct++; else incorrect++;
       }

       // Categorización de los resultados
       if (possible > 0) {
          if (el.type === 'record_compare') { add('Listening', possible, correct, incorrect); add('Speaking', possible, correct, incorrect); }
          else if (el.type === 'fill_in_the_blank') { add('Grammar', possible, correct, incorrect); add('Writing', possible, correct, incorrect); }
          else if (el.type === 'drag_and_drop') { add('Reading', possible, correct, incorrect); } 
          else if (el.type === 'short_answer') { add('Writing', possible, correct, incorrect); }
          else if (el.type === 'multiple_selection') { add('Comprehension', possible, correct, incorrect); add('Reading', possible, correct, incorrect); }
          else if (el.type === 'slider_bar') { add('Comprehension', possible, correct, incorrect); }
          else if (el.type === 'word_search' || el.type === 'crossword') { add('Reading', possible, correct, incorrect); } 
       }
    });

    const finalize = (cat: keyof typeof metrics) => {
       const m = metrics[cat];
       if (m.p === 0) return 100;
       const earned = Math.max(0, m.c - (m.i * 0.5)); // Penalización de 0.5 puntos
       return Math.round((earned / m.p) * 100);
    };

    const finalScores = payload.activityType === 'Workbook' 
      ? { Reading: finalize('Reading'), Grammar: finalize('Grammar'), Comprehension: finalize('Comprehension'), Writing: finalize('Writing') || 80 } 
      : { Listening: finalize('Listening'), Reading: finalize('Reading'), Grammar: finalize('Grammar'), Comprehension: finalize('Comprehension'), Speaking: finalize('Speaking') || 75 };

    const scoreValues = Object.values(finalScores);
    const average = scoreValues.length > 0 ? Math.round(scoreValues.reduce((a, b) => (a as number) + (b as number), 0) / scoreValues.length) : 0;
    const passed = average >= 75;

    // 6. GUARDADO SEGURO: El servidor inserta la calificación verificada en la base de datos (EXCEPTO INVITADOS)
    if (!payload.isGuest) {
      const { error: insertError } = await supabaseClient.from('academic_records').insert({
          student_id: payload.studentId,
          unit: payload.unit || 1,
          activity_type: payload.activityType,
          score_percentage: average,
          teacher_notes: 'Auto-Graded (Verified Server-Side)'
      });

      if (insertError) throw insertError;
    }

    // 7. Retornar los datos limpios y verificados al front-end de React para mostrar el modal
    return new Response(
      JSON.stringify({ scores: finalScores, average, passed }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 })
  }
})