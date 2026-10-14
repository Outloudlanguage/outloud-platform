// src/Secreto-Sagrado/secretoSupabaseClient.js
import { createClient } from '@supabase/supabase-js';

// Usa las variables de entorno que ya tienes en outloud-platform (o pon aquí las de un proyecto Supabase dedicado)
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || import.meta.env?.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || import.meta.env?.VITE_SUPABASE_ANON_KEY;

// Cliente 100% aislado: persistSession: false evita tocar el Auth de Outloud Language Academy
export const secretoSupabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

// Guardar o actualizar partida en Supabase
export async function guardarPartidaEnSupabase(datosPartida) {
  const { data, error } = await secretoSupabase
    .from('ss_partidas')
    .upsert(
      {
        codigo_sala: datosPartida.codigoSala,
        nombre_familia: datosPartida.nombreFamilia,
        modo_partida: datosPartida.modoPartida,
        dm_activo: datosPartida.dmActivoId,
        era_actual: datosPartida.eraActual,
        nodo_actual: datosPartida.nodoActual,
        conviccion_hp: datosPartida.conviccionHP,
        tokens_oracion: datosPartida.tokensOracion,
        vuelta_roster: datosPartida.vueltaRoster,
        heroe_en_turno_id: datosPartida.heroeEnTurnoId,
        roster_jugadores: datosPartida.party,
        logo_personalizado_url: datosPartida.logoUrl,
        actualizado_en: new Date().toISOString()
      },
      { onConflict: 'codigo_sala' }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Listar partidas guardadas en Supabase
export async function listarPartidasDeSupabase() {
  const { data, error } = await secretoSupabase
    .from('ss_partidas')
    .select('*')
    .order('actualizado_en', { ascending: false })
    .limit(10);

  if (error) throw error;
  return data || [];
}