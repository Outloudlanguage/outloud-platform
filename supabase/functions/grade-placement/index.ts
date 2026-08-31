import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ANSWER_KEY: Record<string, string> = {
  "1": "are", "2": "went", "3": "children", "4": "is raining", "5": "any",
  "6": "on", "7": "Do", "8": "best", "9": "were", "10": "for",
  "11": "had already finished", "12": "don't have to", "13": "to visiting", "14": "needs to be", "15": "to living",
  "16": "must", "17": "will be", "18": "if", "19": "had", "20": "complete",
  "21": "subtle", "22": "had told", "23": "engrossed", "24": "purposes", "25": "All of the above",
  "26": "to handle", "27": "attributed", "28": "arduous", "29": "adamant", "30": "bordered"
};

const READING_PASSAGE = `Paragraph 1: Many people live in houses or apartments. A house usually has a kitchen, a living room, and bedrooms... (Historically, the way we lived was quite different. In ancient times, communities were smaller, and people often built their own homes using local materials like stone, wood, or mud. These structures were not just for sleeping; they were central to survival. Families spent most of their time together, sharing chores and meals. As towns grew into cities, the design of houses changed to save space, but the goal of creating a "home" remained the same. Paragraph 3: The industrial revolution acted as a primary catalyst for the shift toward modern urbanization. As factories sprouted in urban centers, thousands of people migrated from rural areas in search of employment. This mass influx necessitated the rapid construction of high-density housing, often at the expense of aesthetic value and personal space. Consequently, the psychological relationship between a person and their environment began to transform, as the "home" became a sanctuary from the frantic pace of industrial life. Paragraph 4: In the contemporary era, the concept of a "habitat" has transcended physical boundaries, becoming inextricably linked with digital connectivity and sustainable architecture. We are currently witnessing a shift toward "smart" homes that integrate technology to minimize energy consumption while maximizing efficiency. However, this advancement invites a complex debate regarding privacy and the potential for social isolation. While we are more "connected" than ever through our devices, the physical shared spaces that once defined community life are increasingly underutilized. Paragraph 5: Ultimately, the metamorphosis of the human dwelling reflects our broader societal values and tensions. The tension between the desire for individualistic luxury and the burgeoning necessity for collective environmental responsibility remains unresolved. As we look toward the future, the challenge lies in reconciling our ancestral need for physical community with the relentless march of technological progress. The "home" of tomorrow will likely be a synthesis of these competing forces, serving as both a high-tech node and a primal refuge.)`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { candidateInfo, answers } = await req.json()

    // 1. Grade Multiple Choice Natively (Q1 - Q30)
    let mcqScore = 0;
    for (let i = 1; i <= 30; i++) {
      if (answers[i] === ANSWER_KEY[i.toString()]) {
        mcqScore++;
      }
    }

    // 2. Format Written Answers for AI (Q31 - Q50)
    const writtenAnswers = Object.entries(answers)
      .filter(([id]) => parseInt(id) > 30)
      .map(([id, answer]) => `Question ${id}: ${answer}`)
      .join('\n');

    // 3. Grade Written Section using Gemini API
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    let writtenScore = 0;

    if (geminiApiKey && writtenAnswers.length > 0) {
      const prompt = `You are a strict ESOL evaluator. Review the student's answers to 20 reading comprehension questions based on the following passage. 
      Passage: "${READING_PASSAGE}"
      Student Answers:
      ${writtenAnswers}
      
      Evaluate grammar, comprehension, and expression. Grade them strictly out of 20 points (1 point per question). 
      Return ONLY a JSON object exactly like this, with no markdown formatting: {"score": 15}`;

      const aiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { response_mime_type: "application/json" }
        })
      });

      const aiData = await aiResponse.json();
      if (aiData.candidates && aiData.candidates[0].content.parts[0].text) {
        const parsed = JSON.parse(aiData.candidates[0].content.parts[0].text);
        writtenScore = parsed.score || 0;
      }
    }

    // 4. Combine Scores & Inject to Database
    const finalWrittenScore = mcqScore + writtenScore;
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { error } = await supabaseClient.from('placement_assessments').insert({
      first_name: candidateInfo.firstName,
      last_name: candidateInfo.lastName,
      email: candidateInfo.email,
      phone: candidateInfo.phone,
      written_score: finalWrittenScore,
      raw_answers: answers,
      status: 'pending'
    });

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, mcqScore, writtenScore, total: finalWrittenScore }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
})