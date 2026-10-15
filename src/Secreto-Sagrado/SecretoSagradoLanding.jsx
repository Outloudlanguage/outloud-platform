// src/Secreto-Sagrado/SecretoSagradoLanding.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  NODOS_MULTIMODALES_POR_ERA,
  generarDesafioConGemini,
  evaluarExplicacionFamiliarConGemini,
  verificarBibliaConCamaraGemini
} from './geminiDirectorEngine';

/* ==========================================================================
   ACTIVOS OFICIALES EN CLOUDFLARE R2 PROPORCIONADOS
   ========================================================================== */
const URL_FONDO_MONTANA = 'https://pub-4ca81ef087364b84a5b486b76cc2b72e.r2.dev/1791990986647.jpg';
const URL_MUSICA_MENU = 'https://pub-f968bc599b9e4b30965522b355899a7e.r2.dev/crown_of_the_morning_mist.mp3';
const URL_LOGO_OFICIAL = 'https://pub-4ca81ef087364b84a5b486b76cc2b72e.r2.dev/S%20ECRETO%20SAGRADO.png';
/* ==========================================================================
   POOL OFICIAL DE 50 LLAVES DE API DE GEMINI + BALANCEADOR DE CARGA FLUIDO
   ========================================================================== */
const POOL_CLAVES_GEMINI = [
  'AQ.Ab8RN6LiD0PYs8Jdu9p7VrlSRG8Ut4FuYs8c8ykWZTJRyhmXkQ', // Llave 01
  'AQ.Ab8RN6KgGB6WR-gf1_MLQ2RQ_LpVpd1cekTo5cL7jFvuSY52uw', // Llave 02
  'AQ.Ab8RN6IChZMzbumOtEzZkmO1JR_v1lltFjIn0_m0_Ice_kfpdQ', // Llave 03
  'AQ.Ab8RN6IkBlRxaHF0aS5ER8_8RRXdJgwdjLpvbxOBb526UxvBjw', // Llave 04
  'AQ.Ab8RN6JUIUSCl65Gw57W4qzFG-4MMbEjyiXZwcgENE7tYsRprA', // Llave 05
  'AQ.Ab8RN6ICCvNh7ZFyh6teZoLlstV9V-9_lhwGro1kmgXjUH5c9w', // Llave 06
  'AQ.Ab8RN6Klj859g_H5vnHenKxm_Yk1OzQ2fynzQJ_k8Sn8cAdr5A', // Llave 07
  'AQ.Ab8RN6IjSLQMTtxv7UdK6VuEadGzpu8OvIlxz8xSyg6Z6tNndA', // Llave 08
  'AQ.Ab8RN6L-i0ZEvajoMf17vjN02iCiYcNnIDXd8ip3FAGDJcQHkw', // Llave 09
  'AQ.Ab8RN6I7VvcQn_G-N9ndd6eXbkMrnGIVwdEzmS4S59hxUV0rAQ', // Llave 10
  'AQ.Ab8RN6J9LEGQtKJBj3NDIXMGE6ylLfE4B473Ehk_w3wZEFpzFg', // Llave 11
  'AQ.Ab8RN6LaMYpMYps-U1VAzeZHsMYKhNE6QDd0OvlWPQPyI7bgeQ', // Llave 12
  'AQ.Ab8RN6LiSFi9Gw7K9yy68UXLBx7_LFjs1I327jlmbTY5JT2Ldw', // Llave 13
  'AQ.Ab8RN6Kem_2ZRrgwwbun8MM_60Y8n20cMmbqBCYa0lUkAuvv4g', // Llave 14
  'AQ.Ab8RN6LOrX5UBmbshfDE0PJ3VuPnRz0duPulL-O_RYCSPdGuiA', // Llave 15
  'AQ.Ab8RN6I4hC8CKfS-0bSlYMl13iIDdmWJ2syyNxC9RCrpEk4-FA', // Llave 16
  'AQ.Ab8RN6IGrxK4rKxJXWhhtYFDFiKQ1mnEDt0zSjVszNU_fRim8Q', // Llave 17
  'AQ.Ab8RN6ItOO29y1ia_hdVfZek5gG0hiEacAhYEt7a3ZN29ddqIA', // Llave 18
  'AQ.Ab8RN6JSEwcpz1uRp-X_812ExXJo7SiD0sa5iTYQv2c1xJ_xZg', // Llave 19
  'AQ.Ab8RN6KeJnl2i7a-YpnvZ3znJWYBB2YwbqaLX4J25PFGXe1A1g', // Llave 20
  'AQ.Ab8RN6KkEduRFevRO8SeNOjm_NQXJVO9vgyYD41GVcnnYO_yww', // Llave 21
  'AQ.Ab8RN6IQmB7OsxZMOdWZkt_9SzdomHqAQdvNOqlYJxmzNbM_5w', // Llave 22
  'AQ.Ab8RN6L6dGBQbLUKdmIW_uJhI6CUBOLDUZpwKPTGGEkfeenaWw', // Llave 23
  'AQ.Ab8RN6Igz1cBlTZd1cplbatZqPNscc8rYsVR-1QGxikMPrDtCA', // Llave 24
  'AQ.Ab8RN6IrJyr0dlpRlT4GGiIQYYp1LkemSaANxhN1ZenqwElysQ', // Llave 25
  'AQ.Ab8RN6KSKwEVq-OWwfSbPxgIB6r2-5T4seg82Iew03lLVBB0eQ', // Llave 26
  'AQ.Ab8RN6LGogfrdG7A8rgxLdOeFscEPmiNkJuEjlZCxz1VfPKPMA', // Llave 27
  'AQ.Ab8RN6KxCiQosXbA-ei_ecj-aOmfKfln82op0fJjZn7j3wrQEQ', // Llave 28
  'AQ.Ab8RN6ILvoXysfuFo29-Z5PtwkmsvXrHakr3gO1-Tj0Df_RPng', // Llave 29
  'AQ.Ab8RN6LQm66b31EU5uxvvvPdm-6HbTiUTL2S8X9MaGb3BLoiGA', // Llave 30
  'AQ.Ab8RN6LkCqb7FEe4EzhcPu4wLWqdNqBVC8SDPyS87llK8LKhew', // Llave 31
  'AQ.Ab8RN6LhIKOki2t-V-8_Z7DRn_w9YIaPVFDyLPmg6FuAyJzFYA', // Llave 32
  'AQ.Ab8RN6LwJHzs-QTaLqoiwuOET2GFeg527hm08Jd5VKLsN0cSvg', // Llave 33
  'AQ.Ab8RN6JPcQ6jGxL79oQxg5Av3FYBSrF1gktaDuPGyZ8uxPAOOA', // Llave 34
  'AQ.Ab8RN6JaVFejANTo_nNyYXVua0igM3evvh52isvzVo2TQO77qw', // Llave 35
  'AQ.Ab8RN6Ib33qtG2bhJpPiIjHrPI2CvOaREMlwJmWa_Flw1nGDQg', // Llave 36
  'AQ.Ab8RN6KRwijhIqjBeiArIokQYDyDRGcjvpZXK6xpNMt5Z31g_g', // Llave 37
  'AQ.Ab8RN6I26alih36_fQOq-Dx767Ca-UdjDN31HradPDKbRnNgkQ', // Llave 38
  'AQ.Ab8RN6IJy4q1VdpP5NosFxKolNlMTytEZ419T8Z6eVx3j0PQ7Q', // Llave 39
  'AQ.Ab8RN6KTm31BSS0zR7CulaENCbIDNmooe_JUMfRbwoOPJXtRoA', // Llave 40
  'AQ.Ab8RN6JXmUlYqSPmUhDSpFVb8UbuBeaaELmJK87HgNYYqyZQMQ', // Llave 41
  'AQ.Ab8RN6LencR-SPJGeZ-yRVoECWK5mBNbohDM-NObjIp83_TWag', // Llave 42
  'AQ.Ab8RN6I9OczeKWj4QznPjLJcYfjmTjHQBmTIg0bpkDcZ5IerDQ', // Llave 43
  'AQ.Ab8RN6IU4TD1tovt1BDEheRMGp_RijEy5zYwbL1QItAJ6nkAJA', // Llave 44
  'AQ.Ab8RN6L-wzfAgbll7DvBhDnLkjmIYDXAFBwWKUlJFDLKG3ORsg', // Llave 45
  'AQ.Ab8RN6IUSwjdr-PyoSBdB1tkIZ_YdYKYGjGjqXr7o-ShP3Sgdg', // Llave 46
  'AQ.Ab8RN6LG-Np3AW1SDfikMMDlJ4PDjy1JexNNNPH30qS0CCIJzQ', // Llave 47
  'AQ.Ab8RN6I5ZOYND0MyaazkENB2UDyWxevy1otu8MBwzUCiYTX-aA', // Llave 48
  'AQ.Ab8RN6JNXPJcect1XMuelLavMIgVjvtjWz9hg3EwpeFyPPlZEQ', // Llave 49
  'AQ.Ab8RN6LeQrkEaO8XaAlAUmgsWS3X-h8v3V2oUshShRZrTe-BXg'  // Llave 50
];

const DEFAULT_GEMINI_API_KEY = POOL_CLAVES_GEMINI.join(', ');

// Devuelve la lista de llaves disponibles (excluyendo las que ya agotaron su cuota hoy)
function obtenerPoolClavesDisponibles(cadenaClaves = '') {
  if (!window.__ssClavesAgotadas) {
    window.__ssClavesAgotadas = new Set();
  }
  const desdeInput = (cadenaClaves || '')
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean);

  // Unir siempre con las 50 llaves oficiales sin duplicados
  const todas = Array.from(new Set([...desdeInput, ...POOL_CLAVES_GEMINI]));
  const activas = todas.filter((k) => !window.__ssClavesAgotadas.has(k));

  // Si todas las llaves fueron marcadas en algún modelo, liberar el listado para reintentar
  if (activas.length === 0) {
    window.__ssClavesAgotadas.clear();
    return todas;
  }
  return activas;
}

function obtenerSiguienteClaveRotativa(cadenaClaves = '') {
  const disponibles = obtenerPoolClavesDisponibles(cadenaClaves);
  if (typeof window.__ssIndiceClaveActiva !== 'number') {
    window.__ssIndiceClaveActiva = 0;
  }
  const clave = disponibles[window.__ssIndiceClaveActiva % disponibles.length];
  window.__ssIndiceClaveActiva = (window.__ssIndiceClaveActiva + 1) % disponibles.length;
  return clave;
}

/* ==========================================================================
   SISTEMA DE ICONOGRAFÍA VECTORIAL SVG DE LUJO (CERO EMOJIS)
   ========================================================================== */
function IconoSagradoSVG({ tipo, className = 'w-6 h-6' }) {
  const renderTrazado = () => {
    switch (tipo) {
      case 'pastor':
        return (
          <>
            <path d="M12 22c4.97 0 9-4.03 9-9-4.97 0-9 4.03-9 9z" />
            <path d="M12 22c-4.97 0-9-4.03-9-9 4.97 0 9 4.03 9 9z" />
            <path d="M12 2v20" />
            <path d="M12 13c3.5-3.5 6-8 0-11-6 3-3.5 7.5 0 11z" />
          </>
        );
      case 'historiador':
      case 'escriba':
        return (
          <>
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            <path d="M8 7h8M8 11h8M8 15h5" />
          </>
        );
      case 'profeta':
        return (
          <>
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
            <circle cx="12" cy="12" r="3.5" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41" />
          </>
        );
      case 'rey':
      case 'noble':
        return (
          <>
            <path d="M3 18h18v2H3z" />
            <path d="M4 15l-1-9 5.5 4L12 4l3.5 6L21 6l-1 9H4z" />
            <circle cx="12" cy="2" r="1" />
          </>
        );
      case 'angel':
      case 'estrella':
        return (
          <>
            <polygon points="12 2 14.8 8.5 22 9.3 16.5 14 18.2 21 12 17.3 5.8 21 7.5 14 2 9.3 9.2 8.5 12 2" />
            <circle cx="12" cy="12" r="2" />
          </>
        );
      case 'guerrero':
        return (
          <>
            <path d="M14.5 17.5L3 6V3h3l11.5 11.5" />
            <path d="M13 19l6-6" />
            <path d="M16 16l4 4" />
            <path d="M19 21l2-2" />
          </>
        );
      case 'sacerdote':
        return (
          <>
            <path d="M3 21h18" />
            <path d="M4 10h16" />
            <path d="M6 10v11M10 10v11M14 10v11M18 10v11" />
            <polygon points="12 3 21 10 3 10 12 3" />
          </>
        );
      case 'mayordomo':
        return (
          <>
            <rect x="3" y="7" width="18" height="13" rx="2" />
            <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <path d="M3 12h18" />
            <circle cx="12" cy="12" r="1.5" />
          </>
        );
      case 'juez':
        return (
          <>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="M12 8v8M8 12h8" />
          </>
        );
      case 'proselito':
        return (
          <>
            <path d="M12 3c-4.5 5-7 8-7 11.5a7 7 0 0 0 14 0C19 11 16.5 8 12 3z" />
            <path d="M12 18a3.5 3.5 0 0 1-3.5-3.5" />
          </>
        );
      case 'patriarca':
        return (
          <>
            <circle cx="12" cy="5" r="2.5" />
            <circle cx="6" cy="18" r="2.5" />
            <circle cx="18" cy="18" r="2.5" />
            <path d="M12 7.5v4.5M12 12L6 15.5M12 12l6 3.5" />
          </>
        );
      case 'express':
        return <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />;
      case 'estandar':
        return (
          <>
            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
            <line x1="8" y1="2" x2="8" y2="18" />
            <line x1="16" y1="6" x2="16" y2="22" />
          </>
        );
      case 'pulgar':
        return (
          <>
            <path d="M12 10v4" />
            <path d="M8 8.5a4 4 0 0 1 8 0v7a4 4 0 0 1-8 0v-7z" />
            <path d="M5 12a7 7 0 0 0 14 0" />
            <circle cx="12" cy="12" r="10" strokeDasharray="3 3" />
          </>
        );
      case 'hp':
        return (
          <>
            <polygon points="12 2 20 8.5 16.5 21 7.5 21 4 8.5 12 2" />
            <polyline points="4 8.5 12 13 20 8.5" />
            <line x1="12" y1="2" x2="12" y2="21" />
          </>
        );
      case 'oracion':
        return (
          <>
            {/* Manos unidas en oración con destello superior */}
            <path d="M12 2v2.5M7.5 4l1.5 1.5M16.5 4L15 5.5" />
            <path d="M12 7c-1.2 0-2.2 1-2.5 2.3L8 16l-2.5 2.5c-.6.6-.6 1.5 0 2.1.6.6 1.5.6 2.1 0L11 17.5V9.5c0-.8.4-1.5 1-1.5s1 .7 1 1.5v8l3.4 3.1c.6.6 1.5.6 2.1 0 .6-.6.6-1.5 0-2.1L16 16l-1.5-6.7C14.2 8 13.2 7 12 7z" />
          </>
        );
      case 'guardar':
        return (
          <>
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          </>
        );
      case 'cerrar':
        return (
          <>
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </>
        );
      case 'fullscreen':
        return (
          <>
            <polyline points="15 3 21 3 21 9" />
            <polyline points="9 21 3 21 3 15" />
            <line x1="21" y1="3" x2="14" y2="10" />
            <line x1="3" y1="21" x2="10" y2="14" />
          </>
        );
      case 'mic':
        return (
          <>
            <rect x="9" y="2" width="6" height="11" rx="3" />
            <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
            <line x1="12" y1="18" x2="12" y2="22" />
            <line x1="8" y1="22" x2="16" y2="22" />
          </>
        );
      case 'camara':
        return (
          <>
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </>
        );
      case 'pasos':
        return (
          <>
            <circle cx="12" cy="12" r="9" />
            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
          </>
        );
      case 'biblia':
        return (
          <>
            <path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z" />
            <path d="M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z" />
          </>
        );
      case 'audio':
        return (
          <>
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          </>
        );
      case 'opcion':
      default:
        return (
          <>
            <polygon points="12 2 22 12 12 22 2 12 12 2" />
            <circle cx="12" cy="12" r="3" />
          </>
        );
    }
  };

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {renderTrazado()}
    </svg>
  );
}

/* ==========================================================================
   NORMALIZADOR DE CITAS BÍBLICAS PARA VOZ NATURAL (EVITA LEER "3:15" COMO HORA)
   ========================================================================== */
function formatearCitasParaLocucion(textoOriginal) {
  if (!textoOriginal) return '';
  let t = textoOriginal;

  // Expandir abreviaturas bíblicas comunes
  t = t.replace(/\ba\.\s*E\.\s*C\./gi, 'antes de nuestra era');
  t = t.replace(/\bE\.\s*C\./gi, 'de nuestra era');
  t = t.replace(/\bGén\./gi, 'Génesis');
  t = t.replace(/\bÉx\./gi, 'Éxodo');
  t = t.replace(/\bLev\./gi, 'Levítico');
  t = t.replace(/\bNúm\./gi, 'Números');
  t = t.replace(/\bDeut\./gi, 'Deuteronomio');
  t = t.replace(/\b2\s*Sam\./gi, 'Segundo de Samuel');
  t = t.replace(/\b1\s*Sam\./gi, 'Primero de Samuel');
  t = t.replace(/\b2\s*Crón\./gi, 'Segundo de Crónicas');
  t = t.replace(/\b1\s*Crón\./gi, 'Primero de Crónicas');
  t = t.replace(/\bMiq\./gi, 'Miqueas');
  t = t.replace(/\bDan\./gi, 'Daniel');
  t = t.replace(/\bIsa\./gi, 'Isaías');
  t = t.replace(/\bMat\./gi, 'Mateo');
  t = t.replace(/\bGál\./gi, 'Gálatas');
  t = t.replace(/\bApoc\./gi, 'Apocalipsis');
  t = t.replace(/\bRev\./gi, 'Revelación');

  // Reemplazar "Capítulo:Versículo-Versículo" tras punto y coma: ej. "; 49:8-10" -> ", y capítulo 49, versículos 8 al 10"
  t = t.replace(/;\s*(\d+):(\d+)-(\d+)/g, ', y capítulo $1, versículos $2 al $3');
  // Reemplazar "; 4:4" -> ", y capítulo 4, versículo 4"
  t = t.replace(/;\s*(\d+):(\d+)/g, ', y capítulo $1, versículo $2');
  // Reemplazar "22:20, 28-30" -> "capítulo 22, versículo 20, y 28 al 30"
  t = t.replace(/(\d+):(\d+),\s*(\d+)-(\d+)/g, 'capítulo $1, versículo $2, y versículos $3 al $4');
  // Reemplazar "3:15, 16" -> "capítulo 3, versículos 15 y 16"
  t = t.replace(/(\d+):(\d+),\s*(\d+)/g, 'capítulo $1, versículos $2 y $3');
  // Reemplazar "22:16-18" -> "capítulo 22, versículos 16 al 18"
  t = t.replace(/(\d+):(\d+)-(\d+)/g, 'capítulo $1, versículos $2 al $3');
  // Reemplazar "3:15" -> "capítulo 3, versículo 15"
  t = t.replace(/(\d+):(\d+)/g, 'capítulo $1, versículo $2');

  return t;
}

/* ==========================================================================
   CATÁLOGO DE LOS 6 ARQUETIPOS DEL SYSTEM DM Y LOS 8 ROLES DE JUGADOR
   ========================================================================== */
const CATALOGO_DMS = [
  {
    id: 'pastor',
    nombre: 'El Pastor',
    subtitulo: 'Enfoque reflexivo y guiado',
    iconoTipo: 'pastor',
    colorHex: '#10b981',
    colorSecundario: '#34d399',
    pitchVoz: 0.78,
    rateVoz: 0.96,
    introHistoria:
      'Bienvenidos. A lo largo de ocho eras analizaremos cómo se desarrolló el propósito bíblico desde Génesis hasta Revelación. En cada turno les indicaré el pasaje que deben consultar en su Biblia y la mecánica correspondiente. Cuando estén listos, podemos comenzar.'
  },
  {
    id: 'historiador',
    nombre: 'El Historiador',
    subtitulo: 'Cronología exacta, mapas y linajes',
    iconoTipo: 'historiador',
    colorHex: '#38bdf8',
    colorSecundario: '#60a5fa',
    pitchVoz: 0.76,
    rateVoz: 0.96,
    introHistoria:
      'Bienvenidos. Recorreremos en orden cronológico las ocho eras bíblicas, verificando fechas, linajes y sucesos clave directamente en las Escrituras. En cada ronda les indicaré la referencia a consultar y cómo resolver el desafío. Indiquen cuando estén listos para empezar.'
  },
  {
    id: 'profeta',
    nombre: 'El Profeta',
    subtitulo: 'Conexión profética y cumplimiento',
    iconoTipo: 'profeta',
    colorHex: '#a855f7',
    colorSecundario: '#f59e0b',
    pitchVoz: 0.74,
    rateVoz: 0.95,
    introHistoria:
      'Bienvenidos. Examinaremos la relación entre las profecías antiguas, los pactos y su cumplimiento a través de las ocho eras. Tengan su Biblia a la mano para verificar cada referencia. Cuando estén listos, iniciamos.'
  },
  {
    id: 'rey',
    nombre: 'El Rey',
    subtitulo: 'Pactos reales y soberanía',
    iconoTipo: 'rey',
    colorHex: '#f59e0b',
    colorSecundario: '#fbbf24',
    pitchVoz: 0.72,
    rateVoz: 0.95,
    introHistoria:
      'Bienvenidos. En esta partida estudiaremos el desarrollo de los pactos reales y la cuestión de la soberanía a lo largo de las ocho eras bíblicas. Yo coordinaré el orden de los turnos y las pruebas de cada etapa. Confirmen cuando estén listos para comenzar.'
  },
  {
    id: 'angel',
    nombre: 'El Mensajero',
    subtitulo: 'Revelación progresiva (Apocalipsis 19:10)',
    iconoTipo: 'angel',
    colorHex: '#22d3ee',
    colorSecundario: '#818cf8',
    pitchVoz: 0.76,
    rateVoz: 0.96,
    introHistoria:
      'Bienvenidos. Exploraremos paso a paso cómo se fue revelando el propósito divino a través de ocho etapas históricas. En cada desafío usarán su Biblia y la interfaz en pantalla para responder. Confirmen cuando deseen comenzar.'
  },
  {
    id: 'guerrero',
    nombre: 'El Estratega',
    subtitulo: 'Defensa bíblica y pruebas bajo presión',
    iconoTipo: 'guerrero',
    colorHex: '#f97316',
    colorSecundario: '#ef4444',
    pitchVoz: 0.72,
    rateVoz: 0.95,
    introHistoria:
      'Bienvenidos. A lo largo de ocho eras pondremos a prueba su conocimiento y discernimiento de las Escrituras frente a los desafíos de cada época. Tengan su Biblia lista para respaldar cada respuesta. Confirmen cuando estén listos para iniciar.'
  }
];

const CLASES_ROLES = [
  { id: 'escriba', nombre: 'El Escriba', iconoTipo: 'escriba', color: '#38bdf8', ventaja: 'Análisis del Texto: permite descartar 2 opciones falsas una vez por partida' },
  { id: 'sacerdote', nombre: 'El Sacerdote', iconoTipo: 'sacerdote', color: '#facc15', ventaja: 'Escudo de Expiación: evita perder Convicción ante un error' },
  { id: 'profeta', nombre: 'El Profeta', iconoTipo: 'profeta', color: '#c084fc', ventaja: 'Luz Profética: descarta 2 opciones falsas en pantalla' },
  { id: 'noble', nombre: 'El Noble', iconoTipo: 'noble', color: '#fb7185', ventaja: 'Decreto Real: otorga +1 de Convicción extra al equipo al acertar' },
  { id: 'mayordomo', nombre: 'El Mayordomo', iconoTipo: 'mayordomo', color: '#34d399', ventaja: 'Archivo Real: muestra contexto histórico y arqueológico' },
  { id: 'juez', nombre: 'El Juez', iconoTipo: 'juez', color: '#fb923c', ventaja: 'Llamado de Valor: otorga +1 Convicción extra al acertar' },
  { id: 'proselito', nombre: 'El Prosélito', iconoTipo: 'proselito', color: '#22d3ee', ventaja: 'Hambre de Verdad: restaura +1 Convicción al explicar la verdad' },
  { id: 'patriarca', nombre: 'El Patriarca', iconoTipo: 'patriarca', color: '#818cf8', ventaja: 'Bendición Ancestral: puede usar su poder para reactivar a un aliado' }
];

const TITULOS_OCHO_ERAS = [
  { era: 1, nombre: 'Edén y el Linaje Antediluviano' },
  { era: 2, nombre: 'Los Patriarcas y la Promesa de Siló' },
  { era: 3, nombre: 'La Ley Mosaica y el Santuario' },
  { era: 4, nombre: 'Los Jueces y el Pacto Davídico' },
  { era: 5, nombre: 'Los Profetas y las 70 Semanas' },
  { era: 6, nombre: 'La Llegada del Mesías y el Rescate' },
  { era: 7, nombre: 'La Congregación y los Coherederos' },
  { era: 8, nombre: 'El Clímax de Revelación y el Paraíso' }
];

/* ==========================================================================
   COMPONENTE DEL ORBE LÍQUIDO GLASSMÓRFICO REACTIVO A LA VOZ
   ========================================================================== */
function OrbeLiquidoReactivo({
  colorPrimario = '#38bdf8',
  colorSecundario = '#818cf8',
  amplitudVoz = 0,
  tamano = 220,
  etiquetaSuperior = '',
  nombreCentral = '',
  iconoTipo = 'estrella',
  enEsquina = false,
  onClick = null
}) {
  const canvasOrbRef = useRef(null);
  const faseRef = useRef(0);

  useEffect(() => {
    const canvas = canvasOrbRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let rafId;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = tamano * dpr;
    canvas.height = tamano * dpr;
    ctx.scale(dpr, dpr);

    const renderizarFluido = () => {
      ctx.clearRect(0, 0, tamano, tamano);
      const cx = tamano / 2;
      const cy = tamano / 2;
      const radioBase = tamano * 0.36;

      const energia = Math.min(1.2, amplitudVoz * 1.6);
      faseRef.current += 0.032 + energia * 0.095;
      const f = faseRef.current;

      ctx.save();
      ctx.globalCompositeOperation = 'screen';

      const capas = [
        { color: colorPrimario, velocidad: 1.0, desfase: 0, escala: 1.0 + energia * 0.22 },
        { color: colorSecundario, velocidad: -1.3, desfase: 2.1, escala: 0.92 + energia * 0.28 },
        { color: colorPrimario, velocidad: 1.6, desfase: 4.2, escala: 0.72 + energia * 0.3 }
      ];

      capas.forEach((capa, idx) => {
        ctx.beginPath();
        const puntos = 64;
        for (let i = 0; i <= puntos; i++) {
          const ang = (i / puntos) * Math.PI * 2;
          const onda1 = Math.sin(ang * 3 + f * capa.velocidad + capa.desfase) * (6 + energia * 18);
          const onda2 = Math.cos(ang * 5 - f * 1.4 + idx) * (4 + energia * 12);
          const r = (radioBase + onda1 + onda2) * capa.escala;
          const x = cx + Math.cos(ang) * r;
          const y = cy + Math.sin(ang) * r;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();

        // Núcleo oscuro suave y bordes luminosos para que el texto blanco central tenga máximo contraste
        const grad = ctx.createRadialGradient(cx, cy, radioBase * 0.12, cx, cy, radioBase * 1.35);
        grad.addColorStop(0, 'rgba(15, 23, 42, 0.85)');
        grad.addColorStop(0.5, capa.color);
        grad.addColorStop(1, 'transparent');

        ctx.fillStyle = grad;
        ctx.globalAlpha = idx === 2 ? 0.55 + energia * 0.25 : 0.78;
        ctx.fill();
      });

      ctx.restore();
      rafId = requestAnimationFrame(renderizarFluido);
    };

    rafId = requestAnimationFrame(renderizarFluido);
    return () => cancelAnimationFrame(rafId);
  }, [colorPrimario, colorSecundario, amplitudVoz, tamano]);

  return (
    <div
      onClick={onClick}
      style={{
        width: tamano,
        height: tamano,
        boxShadow: `0 0 ${35 + amplitudVoz * 65}px ${colorPrimario}88, inset 0 0 28px rgba(15,23,42,0.75)`
      }}
      className={`relative rounded-full bg-slate-950/55 backdrop-blur-2xl border border-white/60 flex flex-col items-center justify-center overflow-hidden select-none transition-all duration-700 ${
        onClick ? 'cursor-pointer hover:scale-105' : ''
      }`}
    >
      <canvas
        ref={canvasOrbRef}
        style={{ width: tamano, height: tamano }}
        className="absolute inset-0 pointer-events-none"
      />

      {/* Viñeta central oscura translúcida para garantizar lectura impecable del texto blanco */}
      <div
        style={{
          background: 'radial-gradient(circle, rgba(2,6,23,0.78) 0%, rgba(2,6,23,0.45) 52%, transparent 78%)'
        }}
        className="absolute inset-0 pointer-events-none"
      />

      <div className="absolute top-2 left-1/4 right-1/4 h-1/5 rounded-full bg-gradient-to-b from-white/35 to-transparent pointer-events-none blur-[1px]" />

      <div className="relative z-10 flex flex-col items-center justify-center text-center px-3 pointer-events-none">
        {iconoTipo && (
          <div className="text-amber-200 drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
            <IconoSagradoSVG
              tipo={iconoTipo}
              className={enEsquina ? 'w-5 h-5' : 'w-7 h-7 md:w-8 md:h-8'}
            />
          </div>
        )}
        {etiquetaSuperior && !enEsquina && (
          <span
            style={{ textShadow: '0 2px 6px rgba(0,0,0,1), 0 0 12px rgba(0,0,0,0.9)' }}
            className="text-[10px] font-black tracking-[0.2em] uppercase text-amber-200 mt-1"
          >
            {etiquetaSuperior}
          </span>
        )}
        {nombreCentral && (
          <span
            style={{ textShadow: '0 2px 8px rgba(0,0,0,1), 0 0 14px rgba(0,0,0,0.95)' }}
            className={`font-black tracking-wide text-white ${
              enEsquina ? 'text-[10px] mt-0.5' : 'text-base md:text-xl mt-0.5'
            }`}
          >
            {nombreCentral}
          </span>
        )}
      </div>
    </div>
  );
}

/* ==========================================================================
   COMPONENTE PRINCIPAL: SECRETO SAGRADO LANDING
   ========================================================================== */
export default function SecretoSagradoLanding() {
  /* ------------------------------------------------------------------------
     1. ESTADOS DE FLUJO DE PANTALLAS Y CONFIGURACIÓN LINEAL
     ------------------------------------------------------------------------ */
  // Pantallas: BOOT_LOGO | MENU_PRINCIPAL | SETUP_NARRADOR | SETUP_PARTIDA | SETUP_ESTILO | CONFIGURACION | RITUAL_PULGARES | JUEGO
  const [pantalla, setPantalla] = useState('BOOT_LOGO');
  const [faseBoot, setFaseBoot] = useState(0);

  // Configuración del Juego
  const [dmId, setDmId] = useState('historiador');
  const [modoEstilo, setModoEstilo] = useState('ESTANDAR'); // EXPRESS | ESTANDAR
  const [jugadores, setJugadores] = useState([
    { id: 'j1', nombre: 'Jesús', rolIdx: 0, disponible: true, poderUsado: false },
    { id: 'j2', nombre: 'María', rolIdx: 2, disponible: true, poderUsado: false },
    { id: 'j3', nombre: 'David', rolIdx: 3, disponible: true, poderUsado: false }
  ]);
  const [nuevoNombreInput, setNuevoNombreInput] = useState('');
  const [nuevoRolIdxInput, setNuevoRolIdxInput] = useState(1);

  // Ajustes en "Configuración" (Carga automáticamente el Pool completo de 50 Llaves)
  const [geminiApiKey, setGeminiApiKey] = useState(() => {
    try {
      localStorage.setItem('ss_gemini_api_key', DEFAULT_GEMINI_API_KEY);
    } catch (e) {}
    return DEFAULT_GEMINI_API_KEY;
  });
  const [volumenMusica, setVolumenMusica] = useState(0.65);
  const [vozSinteticaActiva, setVozSinteticaActiva] = useState(true);
  const [vibracionActiva, setVibracionActiva] = useState(true);
  const [sensoresMovimientoActivos, setSensoresMovimientoActivos] = useState(true);
  const [vocesDisponibles, setVocesDisponibles] = useState([]);
  const [vozSeleccionadaURI, setVozSeleccionadaURI] = useState('');

  /* ------------------------------------------------------------------------
     2. ESTADOS DEL RITUAL DE PULGARES (3 SEGUNDOS) PARA TRANSICIONES DE CONTROL
     ------------------------------------------------------------------------ */
  const [configRitual, setConfigRitual] = useState({
    titulo: 'Sostén la Tablet Horizontalmente',
    subtitulo: 'Coloca ambos pulgares en los círculos laterales durante 3 segundos para iniciar',
    colorLuz: '#38bdf8',
    destinoCallback: null
  });
  const [pulgarIzqActivo, setPulgarIzqActivo] = useState(false);
  const [pulgarDerActivo, setPulgarDerActivo] = useState(false);
  const [progresoPulgares, setProgresoPulgares] = useState(0);
  const [explosionLuzCompleta, setExplosionLuzCompleta] = useState(false);

  /* ------------------------------------------------------------------------
     3. ESTADOS DEL JUEGO EN VIVO Y COREOGRAFÍA DEL ORBE
     ------------------------------------------------------------------------ */
  const [subFaseJuego, setSubFaseJuego] = useState('INTRO_HISTORIA');
  const [eraActualNum, setEraActualNum] = useState(1);
  const [indiceRetoEnEra, setIndiceRetoEnEra] = useState(0);
  const [conviccionHP, setConviccionHP] = useState(10);
  const [tokensOracion, setTokensOracion] = useState(2);
  const [vueltaNumero, setVueltaNumero] = useState(1);

  const [jugadorActivoId, setJugadorActivoId] = useState(null);
  const [retoActual, setRetoActual] = useState(NODOS_MULTIMODALES_POR_ERA[1][0]);
  const [cargandoRetoIA, setCargandoRetoIA] = useState(false);
  const [opcionesOcultasIds, setOpcionesOcultasIds] = useState([]);
  const [mensajeFeedbackDM, setMensajeFeedbackDM] = useState('');

  // Estados de Voz, Micrófono Push-to-Talk, Contador de Pasos y Cámara
  const [amplitudVozDM, setAmplitudVozDM] = useState(0);
  const [amplitudVozJugador, setAmplitudVozJugador] = useState(0);
  const [manteniendoMic, setManteniendoMic] = useState(false);
  const [transcripcionVoz, setTranscripcionVoz] = useState('');
  const [evaluandoIA, setEvaluandoIA] = useState(false);
  const [pasosCaminados, setPasosCaminados] = useState(0);
  const [camaraActiva, setCamaraActiva] = useState(false);
  const [notificacionGuardado, setNotificacionGuardado] = useState('');

  // Referencias
  const canvasAtmosferaRef = useRef(null);
  const audioMenuRef = useRef(null);
  const audioCtxRef = useRef(null);
  const reconocimientoVozRef = useRef(null);
  const videoCamaraRef = useRef(null);
  const streamCamaraRef = useRef(null);
  const streamMicAmbienteRef = useRef(null);

  const dmPerfil = CATALOGO_DMS.find((d) => d.id === dmId) || CATALOGO_DMS[0];
  const jugadorActivo = jugadores.find((j) => j.id === jugadorActivoId) || null;
  const claseJugadorActivo = jugadorActivo ? CLASES_ROLES[jugadorActivo.rolIdx] : null;
  const retosMetaPorEra = modoEstilo === 'EXPRESS' ? 1 : 2;

  /* ==========================================================================
     FUNCIÓN PARA ACTIVAR PANTALLA COMPLETA (OCULTAR BARRAS DEL NAVEGADOR)
     ========================================================================== */
  const activarPantallaCompleta = useCallback(() => {
    try {
      const elem = document.documentElement;
      if (!document.fullscreenElement) {
        if (elem.requestFullscreen) {
          elem.requestFullscreen().catch(() => {});
        } else if (elem.webkitRequestFullscreen) {
          elem.webkitRequestFullscreen();
        }
      }
    } catch (e) {}
  }, []);

  const alternarPantallaCompleta = useCallback(() => {
    try {
      if (!document.fullscreenElement) {
        activarPantallaCompleta();
      } else if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    } catch (e) {}
  }, [activarPantallaCompleta]);

  /* ==========================================================================
     EFECTO 1: ANIMACIÓN DE ARRANQUE Y PRECARGA INMEDIATA DEL AUDIO
     ========================================================================== */
  useEffect(() => {
    // Precargar la música desde el segundo 0
    const audio = new Audio(URL_MUSICA_MENU);
    audio.preload = 'auto';
    audio.loop = true;
    audio.volume = volumenMusica;
    audioMenuRef.current = audio;
    audio.load();

    const t1 = setTimeout(() => setFaseBoot(1), 250);
    return () => clearTimeout(t1);
  }, []);

  const entrarDesdeBoot = () => {
    activarPantallaCompleta();
    if (audioMenuRef.current) {
      audioMenuRef.current.volume = volumenMusica;
      audioMenuRef.current.currentTime = 0;
      audioMenuRef.current.play().catch(() => {});
    }
    setFaseBoot(2);
    setTimeout(() => setPantalla('MENU_PRINCIPAL'), 550);
  };

  /* ==========================================================================
     EFECTO 2: GESTIÓN DE MÚSICA DEL MENÚ (SE DETIENE AL INICIAR EL JUEGO REAL)
     ========================================================================== */
  useEffect(() => {
    if (!audioMenuRef.current) return;
    audioMenuRef.current.volume = volumenMusica;

    const enMenuOSetup = [
      'MENU_PRINCIPAL',
      'SETUP_NARRADOR',
      'SETUP_PARTIDA',
      'SETUP_ESTILO',
      'CONFIGURACION'
    ].includes(pantalla);

    if (enMenuOSetup) {
      if (audioMenuRef.current.paused) {
        audioMenuRef.current.play().catch(() => {});
      }
    } else if (pantalla === 'JUEGO') {
      const audio = audioMenuRef.current;
      let vol = audio.volume;
      const fadeInterval = setInterval(() => {
        if (vol > 0.05) {
          vol -= 0.05;
          audio.volume = Math.max(0, vol);
        } else {
          audio.pause();
          audio.currentTime = 0;
          clearInterval(fadeInterval);
        }
      }, 75);
      return () => clearInterval(fadeInterval);
    }
  }, [pantalla, volumenMusica]);

  const desbloquearAudioAlTocar = () => {
    if (
      audioMenuRef.current &&
      audioMenuRef.current.paused &&
      pantalla !== 'JUEGO' &&
      pantalla !== 'RITUAL_PULGARES'
    ) {
      audioMenuRef.current.volume = volumenMusica;
      audioMenuRef.current.play().catch(() => {});
    }
  };

/* ==========================================================================
     EFECTO 3: VOZ VARONIL CÁLIDA Y PODEROSA + TEXTO SINCRONIZADO EN TIEMPO REAL
     ========================================================================== */
  const fuenteAudioTTSRef = useRef(null);
  const intervaloTextoRef = useRef(null);
  const [cargandoVozDM, setCargandoVozDM] = useState(false);
  const [hablandoDM, setHablandoDM] = useState(false);
  const [textoSincronizadoDM, setTextoSincronizadoDM] = useState('');

  // Lista corta y limpia de rollos bíblicos (nunca repite el anterior)
  const ROLLOS_SECRETO_SAGRADO = useRef([
    'Revisando el rollo de Génesis...',
    'Revisando el rollo de Éxodo...',
    'Revisando el rollo de Levítico...',
    'Revisando el rollo de Números...',
    'Revisando el rollo de Deuteronomio...',
    'Revisando el rollo de Rut...',
    'Revisando el rollo de Samuel...',
    'Revisando el rollo de las Crónicas...',
    'Revisando el rollo de los Salmos...',
    'Revisando el rollo de Isaías...',
    'Revisando el rollo de Jeremías...',
    'Revisando el rollo de Ezequiel...',
    'Revisando el rollo de Daniel...',
    'Revisando el rollo de Oseas...',
    'Revisando el rollo de Miqueas...',
    'Revisando el rollo de Ageo...',
    'Revisando el rollo de Zacarías...',
    'Revisando el rollo de Malaquías...',
    'Revisando el rollo de Mateo...',
    'Revisando el rollo de Marcos...',
    'Revisando el rollo de Lucas...',
    'Revisando el rollo de Juan...',
    'Revisando el rollo de los Hechos...',
    'Revisando el rollo de los Romanos...',
    'Revisando el rollo de los Corintios...',
    'Revisando el rollo de los Gálatas...',
    'Revisando el rollo de los Efesios...',
    'Revisando el rollo de los Colosenses...',
    'Revisando el rollo de los Hebreos...',
    'Revisando el rollo de Pedro...',
    'Revisando el rollo de Revelación...'
  ]);

  const mazoIndicesRollosRef = useRef([]);
  const ultimoIndiceRolloRef = useRef(-1);
  const [leyendaRolloActual, setLeyendaRolloActual] = useState(
    ROLLOS_SECRETO_SAGRADO.current[0]
  );

  const obtenerSiguienteLeyendaRollo = useCallback(() => {
    const lista = ROLLOS_SECRETO_SAGRADO.current;
    if (mazoIndicesRollosRef.current.length === 0) {
      const indices = lista.map((_, idx) => idx);
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      if (indices[0] === ultimoIndiceRolloRef.current && indices.length > 1) {
        [indices[0], indices[indices.length - 1]] = [indices[indices.length - 1], indices[0]];
      }
      mazoIndicesRollosRef.current = indices;
    }
    const sigIdx = mazoIndicesRollosRef.current.shift();
    ultimoIndiceRolloRef.current = sigIdx;
    return lista[sigIdx];
  }, []);

  // Indicador con el Logo animado y el nombre corto del rollo
  const renderizarEstadoPensandoDM = () => (
    <div className="flex flex-col items-center justify-center py-4 px-6 gap-3 animate-[fadeIn_0.3s_ease-out]">
      <div className="relative flex items-center justify-center">
        <div className="absolute -inset-3 rounded-full bg-cyan-400/25 blur-xl animate-pulse" />
        <div
          style={{ animation: 'giroAnilloSagrado 8s linear infinite' }}
          className="absolute w-16 h-16 rounded-full border border-dashed border-amber-200/60"
        />
        <img
          src={URL_LOGO_OFICIAL}
          alt="Cargando"
          className="relative z-10 w-14 h-14 object-contain logo-interactivo"
        />
      </div>
      <p className="text-xs md:text-sm font-extrabold text-amber-200 tracking-[0.14em] uppercase text-center">
        {leyendaRolloActual}
      </p>
      <div className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );

  const cacheAudioTTSRef = useRef(new Map());
  const idLocucionActualRef = useRef(0);

  // Caché persistente en IndexedDB para que los audios generados se guarden en la Tablet y no gasten cuota al recargar
  const leerAudioDeIndexedDB = useCallback((claveTexto) => {
    return new Promise((resolve) => {
      try {
        const req = window.indexedDB.open('SecretoSagradoAudioDB', 1);
        req.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains('audios')) {
            db.createObjectStore('audios');
          }
        };
        req.onsuccess = (e) => {
          const db = e.target.result;
          const tx = db.transaction('audios', 'readonly');
          const getReq = tx.objectStore('audios').get(claveTexto);
          getReq.onsuccess = () => resolve(getReq.result || null);
          getReq.onerror = () => resolve(null);
        };
        req.onerror = () => resolve(null);
      } catch (err) {
        resolve(null);
      }
    });
  }, []);

  const guardarAudioEnIndexedDB = useCallback((claveTexto, base64Data) => {
    try {
      const req = window.indexedDB.open('SecretoSagradoAudioDB', 1);
      req.onsuccess = (e) => {
        const db = e.target.result;
        const tx = db.transaction('audios', 'readwrite');
        tx.objectStore('audios').put(base64Data, claveTexto);
      };
    } catch (err) {}
  }, []);

  useEffect(() => {
    setVocesDisponibles([
      { voiceURI: 'Charon', name: 'IA Gemini — Charon (Barítono Profundo)' }
    ]);
    setVozSeleccionadaURI('Charon');
  }, []);

  const hablarConVozDM = useCallback(
    async (textoCrudo, alTerminarCallback = null) => {
      const textoLimpio = formatearCitasParaLocucion(textoCrudo);
      const palabrasOriginales = (textoCrudo || '').trim().split(/\s+/);

      try { window.speechSynthesis?.cancel(); } catch (e) {}

      idLocucionActualRef.current += 1;
      const miIdLocucion = idLocucionActualRef.current;

      if (intervaloTextoRef.current) clearInterval(intervaloTextoRef.current);
      if (fuenteAudioTTSRef.current) {
        try {
          fuenteAudioTTSRef.current.onended = null;
          fuenteAudioTTSRef.current.stop();
        } catch (e) {}
        fuenteAudioTTSRef.current = null;
      }

      setLeyendaRolloActual(obtenerSiguienteLeyendaRollo());
      setCargandoVozDM(true);
      setHablandoDM(false);
      setTextoSincronizadoDM('');

      // Función que revela el texto palabra por palabra si la voz está silenciada o si la llave agotó sus 15 audios diarios gratuitos
      const revelarPalabraPorPalabraSinCorte = () => {
        if (miIdLocucion !== idLocucionActualRef.current) return;
        setCargandoVozDM(false);
        setHablandoDM(true);
        let idxPalabra = 0;
        intervaloTextoRef.current = setInterval(() => {
          if (miIdLocucion !== idLocucionActualRef.current) {
            clearInterval(intervaloTextoRef.current);
            return;
          }
          idxPalabra += 1;
          setAmplitudVozDM(0.38 + Math.sin(idxPalabra * 0.8) * 0.32);
          setTextoSincronizadoDM(palabrasOriginales.slice(0, idxPalabra).join(' '));
          if (idxPalabra >= palabrasOriginales.length) {
            clearInterval(intervaloTextoRef.current);
            setAmplitudVozDM(0);
            setHablandoDM(false);
            if (alTerminarCallback) alTerminarCallback();
          }
        }, 175);
      };

      if (!vozSinteticaActiva || !geminiApiKey || geminiApiKey.trim() === '') {
        setTimeout(revelarPalabraPorPalabraSinCorte, 650);
        return;
      }

      // 1. Buscar primero en RAM o en el disco permanente de la Tablet (0 consumo de cuota)
      let base64Audio = cacheAudioTTSRef.current.get(textoLimpio) || null;
      if (!base64Audio) {
        base64Audio = await leerAudioDeIndexedDB(textoLimpio);
        if (base64Audio) cacheAudioTTSRef.current.set(textoLimpio, base64Audio);
      }

      // 2. Rotar inteligentemente entre todas las API Keys (recordando la última llave activa que funcionó)
      const listaClaves = geminiApiKey
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean);
      const modelosTTS = ['gemini-2.5-flash-preview-tts', 'gemini-2.5-pro-preview-tts'];

      if (typeof window.__ssIndiceClaveActiva !== 'number') {
        window.__ssIndiceClaveActiva = 0;
      }

      for (let m = 0; m < modelosTTS.length && !base64Audio; m++) {
        const modeloActual = modelosTTS[m];
        for (let paso = 0; paso < listaClaves.length && !base64Audio; paso++) {
          if (miIdLocucion !== idLocucionActualRef.current) return;
          const idxReal = (window.__ssIndiceClaveActiva + paso) % listaClaves.length;
          const claveActual = listaClaves[idxReal];
          try {
            const res = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/${modeloActual}:generateContent?key=${claveActual}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  contents: [
                    {
                      parts: [{ text: textoLimpio }]
                    }
                  ],
                  generationConfig: {
                    responseModalities: ['AUDIO'],
                    speechConfig: {
                      voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Charon' }
                      }
                    }
                  }
                })
              }
            );

            if (res.ok) {
              const data = await res.json();
              const extraido = data?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
              if (extraido) {
                // Guardar esta llave como la activa para que el próximo turno sea instantáneo
                window.__ssIndiceClaveActiva = idxReal;
                base64Audio = extraido;
                cacheAudioTTSRef.current.set(textoLimpio, extraido);
                guardarAudioEnIndexedDB(textoLimpio, extraido);
                break;
              }
            }
          } catch (err) {}
        }
      }

      if (miIdLocucion !== idLocucionActualRef.current) return;

      if (base64Audio) {
        try {
          const Ctx = window.AudioContext || window.webkitAudioContext;
          if (!audioCtxRef.current) audioCtxRef.current = new Ctx();
          const ctx = audioCtxRef.current;
          if (ctx.state === 'suspended') await ctx.resume();

          const binaryStr = window.atob(base64Audio);
          const len = binaryStr.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) bytes[i] = binaryStr.charCodeAt(i);

          const int16 = new Int16Array(bytes.buffer);
          const audioBuffer = ctx.createBuffer(1, int16.length, 24000);
          const channelData = audioBuffer.getChannelData(0);
          for (let i = 0; i < int16.length; i++) {
            channelData[i] = int16[i] / 32768.0;
          }

          const source = ctx.createBufferSource();
          source.buffer = audioBuffer;

          // Barítono profundo ('Charon' con velocidad 0.96x y detune -115 cents)
          const velocidadVoz = 0.96;
          source.playbackRate.value = velocidadVoz;
          if (source.detune) source.detune.value = -115;

          const filtroCuerpoGrave = ctx.createBiquadFilter();
          filtroCuerpoGrave.type = 'lowshelf';
          filtroCuerpoGrave.frequency.value = 115;
          filtroCuerpoGrave.gain.value = 6.5;

          const filtroSuavidad = ctx.createBiquadFilter();
          filtroSuavidad.type = 'peaking';
          filtroSuavidad.frequency.value = 3000;
          filtroSuavidad.Q.value = 1.0;
          filtroSuavidad.gain.value = -2.5;

          const analyser = ctx.createAnalyser();
          analyser.fftSize = 64;

          source.connect(filtroCuerpoGrave);
          filtroCuerpoGrave.connect(filtroSuavidad);
          filtroSuavidad.connect(analyser);
          analyser.connect(ctx.destination);
          fuenteAudioTTSRef.current = source;

          const duracionRealSeg = (audioBuffer.duration / velocidadVoz) * 1.04;
          const tiempoInicio = ctx.currentTime;
          const dataArr = new Uint8Array(analyser.frequencyBinCount);
          let activo = true;

          setCargandoVozDM(false);
          setHablandoDM(true);

          const actualizarPulsoYTexto = () => {
            if (!activo || miIdLocucion !== idLocucionActualRef.current) return;
            analyser.getByteFrequencyData(dataArr);
            const prom = dataArr.reduce((a, b) => a + b, 0) / dataArr.length;
            setAmplitudVozDM(Math.min(1.15, prom / 70));

            const transcurrido = Math.max(0, ctx.currentTime - tiempoInicio);
            const progreso = Math.min(1, transcurrido / Math.max(0.4, duracionRealSeg * 0.95));
            const numPalabras = Math.max(1, Math.ceil(progreso * palabrasOriginales.length));
            setTextoSincronizadoDM(palabrasOriginales.slice(0, numPalabras).join(' '));

            requestAnimationFrame(actualizarPulsoYTexto);
          };

          source.onended = () => {
            if (miIdLocucion !== idLocucionActualRef.current) return;
            activo = false;
            setTextoSincronizadoDM(textoCrudo);
            setAmplitudVozDM(0);
            setHablandoDM(false);
            if (alTerminarCallback) alTerminarCallback();
          };

          source.start(0);
          actualizarPulsoYTexto();
          return;
        } catch (err) {}
      }

      // Si las llaves agotaron su cuota gratuita en ambos modelos, mantiene la animación del rollo 900ms
      // y luego revela el texto palabra por palabra (nunca de golpe)
      await new Promise((r) => setTimeout(r, 900));
      revelarPalabraPorPalabraSinCorte();
    },
    [vozSinteticaActiva, geminiApiKey, obtenerSiguienteLeyendaRollo, leerAudioDeIndexedDB, guardarAudioEnIndexedDB]
  );
  

  /* ==========================================================================
     EFECTO 4: NIEBLA DENSA EN MOVIMIENTO, AVES REALISTAS Y DESTELLO EN LA CUMBRE
     ========================================================================== */
  useEffect(() => {
    const canvas = canvasAtmosferaRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;

    const ajustar = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    ajustar();
    window.addEventListener('resize', ajustar);

    // 1. Nubes y bancos de niebla multicapa de alta visibilidad sobre el valle y las laderas
    const bancosNiebla = Array.from({ length: 14 }, (_, i) => ({
      x: (i / 14) * window.innerWidth * 1.5 - window.innerWidth * 0.25,
      y: window.innerHeight * (0.34 + (i % 6) * 0.11),
      radioX: window.innerWidth * (0.28 + (i % 4) * 0.09),
      radioY: window.innerHeight * (0.09 + (i % 3) * 0.045),
      velocidad: (i % 2 === 0 ? 1 : -1) * (0.65 + (i % 4) * 0.28),
      opacidad: 0.42 + (i % 3) * 0.12
    }));

    // 2. Bandada de aves lejanas con articulación doble de alas y planeo natural
    const bandadaAves = Array.from({ length: 12 }, (_, i) => ({
      x: window.innerWidth * 0.08 + i * 38 + (i % 3) * 16,
      y: window.innerHeight * 0.14 + Math.abs(i - 6) * 11 + (i % 2) * 7,
      escala: 0.42 + (i % 4) * 0.12,
      velX: 0.55 + (i % 3) * 0.14,
      velY: -0.04 + Math.sin(i) * 0.05,
      faseAla: i * 0.9,
      tiempoPlaneo: i * 25
    }));

    // 3. Brillo atmosférico ascendente
    const destellosSol = Array.from({ length: 40 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 2.4 + 0.8,
      vx: (Math.random() - 0.3) * 0.4,
      vy: -Math.random() * 0.35 - 0.1,
      faseBrillo: Math.random() * Math.PI * 2
    }));

    let tiempo = 0;

    const animarPaisaje = () => {
      tiempo += 0.02;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // A. DESTELLO CORREGIDO: ÚNICAMENTE EN LA CUMBRE REAL DE LA MONTAÑA (ARRIBA A LA DERECHA)
      const cumbreX = canvas.width * 0.885;
      const cumbreY = canvas.height * 0.065;

      ctx.save();
      ctx.globalCompositeOperation = 'screen';

      const pulsoCumbre = 0.48 + Math.sin(tiempo * 1.5) * 0.18;
      const gradCumbre = ctx.createRadialGradient(
        cumbreX,
        cumbreY,
        4,
        cumbreX,
        cumbreY,
        canvas.width * 0.36
      );
      gradCumbre.addColorStop(0, `rgba(255, 255, 255, ${Math.min(1, pulsoCumbre + 0.35)})`);
      gradCumbre.addColorStop(0.22, `rgba(254, 249, 195, ${pulsoCumbre})`);
      gradCumbre.addColorStop(0.55, `rgba(253, 224, 71, ${pulsoCumbre * 0.35})`);
      gradCumbre.addColorStop(1, 'transparent');
      ctx.fillStyle = gradCumbre;
      ctx.beginPath();
      ctx.arc(cumbreX, cumbreY, canvas.width * 0.36, 0, Math.PI * 2);
      ctx.fill();

      // Haces de luz solar diagonales que bajan desde la cumbre nevada hacia el valle
      ctx.save();
      ctx.translate(cumbreX, cumbreY);
      for (let r = 0; r < 6; r++) {
        const anguloRayo = Math.PI * 0.58 + r * 0.14 + Math.sin(tiempo * 0.7 + r) * 0.03;
        ctx.save();
        ctx.rotate(anguloRayo);
        const gradRayo = ctx.createLinearGradient(0, 0, canvas.width * 0.55, 0);
        gradRayo.addColorStop(0, `rgba(255, 251, 235, ${pulsoCumbre * 0.38})`);
        gradRayo.addColorStop(0.6, `rgba(254, 240, 138, ${pulsoCumbre * 0.12})`);
        gradRayo.addColorStop(1, 'transparent');
        ctx.fillStyle = gradRayo;
        ctx.beginPath();
        ctx.moveTo(0, -8);
        ctx.lineTo(canvas.width * 0.55, -45);
        ctx.lineTo(canvas.width * 0.55, 45);
        ctx.lineTo(0, 8);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
      ctx.restore();
      ctx.restore();

      // B. BANDADA DE AVES CON CINEMÁTICA NATURAL (ALETEO SUAVE + PLANEO)
      ctx.save();
      bandadaAves.forEach((ave, idx) => {
        ave.x += ave.velX;
        ave.tiempoPlaneo += 1;
        // Alterna entre aleteo suave y planeo con alas extendidas
        const estaPlaneando = Math.sin(ave.tiempoPlaneo * 0.03 + idx) > 0.35;
        ave.faseAla += estaPlaneando ? 0.03 : 0.16;
        ave.y += ave.velY + Math.sin(tiempo + idx) * 0.12;

        if (ave.x > canvas.width + 80) {
          ave.x = -80;
          ave.y = canvas.height * (0.1 + Math.random() * 0.18);
        }

        const s = ave.escala;
        const batido = estaPlaneando ? 0.25 : Math.sin(ave.faseAla);
        const codoY = -Math.abs(batido) * 3.2 * s;
        const puntaY = batido * 6.5 * s;

        ctx.save();
        ctx.translate(ave.x, ave.y);
        ctx.rotate(-0.06);
        ctx.fillStyle = `rgba(30, 41, 59, ${0.42 + s * 0.35})`;

        ctx.beginPath();
        // Cuerpo estilizado y alas articuladas en dos tramos (codo y punta)
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-4 * s, codoY - 1.5 * s, -10 * s, puntaY);
        ctx.quadraticCurveTo(-5 * s, codoY + 0.5 * s, 0, 1.6 * s);
        ctx.quadraticCurveTo(5 * s, codoY + 0.5 * s, 10 * s, puntaY);
        ctx.quadraticCurveTo(4 * s, codoY - 1.5 * s, 0, 0);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      });
      ctx.restore();

      // C. NUBES Y NIEBLA VOLUMÉTRICA COMPUESTA (3 LÓBULOS POR NUBE)
      bancosNiebla.forEach((nube) => {
        nube.x += nube.velocidad;
        if (nube.velocidad > 0 && nube.x - nube.radioX * 1.4 > canvas.width) {
          nube.x = -nube.radioX * 1.4;
        } else if (nube.velocidad < 0 && nube.x + nube.radioX * 1.4 < 0) {
          nube.x = canvas.width + nube.radioX * 1.4;
        }

        const lobulos = [
          { dx: 0, dy: 0, escX: 1, escY: 1 },
          { dx: -nube.radioX * 0.42, dy: nube.radioY * 0.18, escX: 0.75, escY: 0.85 },
          { dx: nube.radioX * 0.45, dy: nube.radioY * 0.12, escX: 0.8, escY: 0.8 }
        ];

        lobulos.forEach((lob) => {
          ctx.save();
          ctx.translate(nube.x + lob.dx, nube.y + lob.dy);
          ctx.scale(lob.escX, (nube.radioY / nube.radioX) * lob.escY);
          const gradNiebla = ctx.createRadialGradient(0, 0, 8, 0, 0, nube.radioX);
          gradNiebla.addColorStop(0, `rgba(255, 255, 255, ${nube.opacidad})`);
          gradNiebla.addColorStop(0.48, `rgba(241, 245, 249, ${nube.opacidad * 0.72})`);
          gradNiebla.addColorStop(0.8, `rgba(226, 232, 240, ${nube.opacidad * 0.28})`);
          gradNiebla.addColorStop(1, 'transparent');
          ctx.fillStyle = gradNiebla;
          ctx.beginPath();
          ctx.arc(0, 0, nube.radioX, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
      });

      // D. PARTÍCULAS LUMINOSAS DORADAS
      destellosSol.forEach((d) => {
        d.x += d.vx;
        d.y += d.vy;
        d.faseBrillo += 0.05;
        if (d.y < -10) d.y = canvas.height + 10;
        if (d.x < -10) d.x = canvas.width + 10;
        if (d.x > canvas.width + 10) d.x = -10;

        const alfa = 0.3 + Math.abs(Math.sin(d.faseBrillo)) * 0.7;
        ctx.save();
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = '#fffbeb';
        ctx.globalAlpha = alfa;
        ctx.shadowBlur = 14;
        ctx.shadowColor = '#fde047';
        ctx.fill();
        ctx.restore();
      });

      raf = requestAnimationFrame(animarPaisaje);
    };

    raf = requestAnimationFrame(animarPaisaje);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', ajustar);
    };
  }, []);

  /* ==========================================================================
     SINTETIZADOR DE SONIDOS Y MOTOR HÁPTICO (VIBRACIÓN FÍSICA + SUB-GRAVE 60HZ)
     ========================================================================== */
  const dispararVibracionHaptica = useCallback(
    (patronMs = 60, intensidadGrave = 0.18) => {
      if (!vibracionActiva) return;
      try {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(patronMs);
        }
      } catch (e) {}

      // Pulso táctil sub-grave (58 Hz) que hace vibrar físicamente el chasis de cualquier Tablet
      try {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!audioCtxRef.current) audioCtxRef.current = new Ctx();
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') ctx.resume();

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(62, now);
        osc.frequency.exponentialRampToValueAtTime(42, now + 0.14);

        gain.gain.setValueAtTime(intensidadGrave, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.16);
      } catch (e) {}
    },
    [vibracionActiva]
  );

  const sonarAcordeSintetico = useCallback(
    (frecuencias = [523.25, 659.25, 783.99], duracion = 0.55) => {
      dispararVibracionHaptica(45, 0.14);
      try {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!audioCtxRef.current) audioCtxRef.current = new Ctx();
        if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();

        const now = audioCtxRef.current.currentTime;
        frecuencias.forEach((f, i) => {
          const osc = audioCtxRef.current.createOscillator();
          const gain = audioCtxRef.current.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(f, now + i * 0.05);
          gain.gain.setValueAtTime(0.001, now + i * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.09, now + i * 0.05 + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.05 + duracion);
          osc.connect(gain);
          gain.connect(audioCtxRef.current.destination);
          osc.start(now + i * 0.05);
          osc.stop(now + i * 0.05 + duracion + 0.04);
        });
      } catch (e) {}
    },
    [dispararVibracionHaptica]
  );

  /* ==========================================================================
     TRANSICIÓN DE 3 SEGUNDOS CON AMBOS PULGARES (TOMAR / DEVOLVER CONTROL)
     ========================================================================== */
  const lanzarRitualPulgares = ({ titulo, subtitulo, colorLuz, alCompletar }) => {
    setPulgarIzqActivo(false);
    setPulgarDerActivo(false);
    setProgresoPulgares(0);
    setExplosionLuzCompleta(false);
    setConfigRitual({ titulo, subtitulo, colorLuz, destinoCallback: alCompletar });
    setPantalla('RITUAL_PULGARES');
  };

  useEffect(() => {
    if (pantalla !== 'RITUAL_PULGARES') return;
    const ambosActivos = pulgarIzqActivo && pulgarDerActivo;

    if (!ambosActivos) {
      setProgresoPulgares((prev) => Math.max(0, prev - 8));
      return;
    }

    // Disparo inmediato de patrón de vibración al apoyar ambos pulgares
    dispararVibracionHaptica([90, 40, 120, 40, 160, 40, 220], 0.25);

    const timer = setInterval(() => {
      setProgresoPulgares((prev) => {
        const nuevo = Math.min(100, prev + 3.4);

        // Vibración física y acústica creciente conforme se acerca al 100%
        dispararVibracionHaptica(Math.floor(40 + (nuevo / 100) * 80), 0.12 + (nuevo / 100) * 0.28);

        if (Math.floor(nuevo) % 9 === 0) {
          sonarAcordeSintetico([180 + nuevo * 5.2, 270 + nuevo * 5.8], 0.16);
        }

        if (nuevo >= 100) {
          clearInterval(timer);
          setExplosionLuzCompleta(true);
          dispararVibracionHaptica([180, 50, 350], 0.35);
          sonarAcordeSintetico([523.25, 659.25, 783.99, 1046.5, 1318.5], 1.2);

          setTimeout(() => {
            if (configRitual.destinoCallback) {
              configRitual.destinoCallback();
            }
          }, 680);
        }
        return nuevo;
      });
    }, 95);

    return () => clearInterval(timer);
  }, [pantalla, pulgarIzqActivo, pulgarDerActivo, vibracionActiva, configRitual, sonarAcordeSintetico, dispararVibracionHaptica]);

  /* ==========================================================================
     REACTIVIDAD DEL ORBE DEL JUGADOR A LA VOZ AMBIENTAL DE LA SALA
     ========================================================================== */
  useEffect(() => {
    if (pantalla !== 'JUEGO' || subFaseJuego !== 'JUGADOR_ACTIVO') {
      setAmplitudVozJugador(0);
      return;
    }

    let animId;
    let audioContextMic;

    navigator.mediaDevices
      ?.getUserMedia({ audio: true })
      .then((stream) => {
        streamMicAmbienteRef.current = stream;
        const Ctx = window.AudioContext || window.webkitAudioContext;
        audioContextMic = new Ctx();
        const source = audioContextMic.createMediaStreamSource(stream);
        const analyser = audioContextMic.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);
        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const leerVolumen = () => {
          analyser.getByteFrequencyData(dataArray);
          const promedio = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
          setAmplitudVozJugador(Math.min(1, promedio / 95));
          animId = requestAnimationFrame(leerVolumen);
        };
        leerVolumen();
      })
      .catch(() => {
        let t = 0;
        const loopSuave = () => {
          t += 0.05;
          setAmplitudVozJugador(0.15 + Math.abs(Math.sin(t)) * 0.2);
          animId = requestAnimationFrame(loopSuave);
        };
        loopSuave();
      });

    return () => {
      if (animId) cancelAnimationFrame(animId);
      if (streamMicAmbienteRef.current) {
        streamMicAmbienteRef.current.getTracks().forEach((tr) => tr.stop());
      }
      if (audioContextMic) audioContextMic.close().catch(() => {});
    };
  }, [pantalla, subFaseJuego]);

  /* ==========================================================================
     DETECTOR DE PASOS FÍSICOS (ACELERÓMETRO) PARA RETOS DE CAMINATA
     ========================================================================== */
  useEffect(() => {
    if (
      pantalla !== 'JUEGO' ||
      subFaseJuego !== 'JUGADOR_ACTIVO' ||
      retoActual?.tipoMecanica !== 'CAMINATA_PEREGRINAJE' ||
      !sensoresMovimientoActivos
    ) {
      return;
    }

    let ultimoPasoMs = 0;
    const manejarMovimiento = (e) => {
      const acc = e.accelerationIncludingGravity;
      if (!acc) return;
      const magnitud = Math.sqrt((acc.x || 0) ** 2 + (acc.y || 0) ** 2 + (acc.z || 0) ** 2);
      const ahora = Date.now();
      if (magnitud > 13.2 && ahora - ultimoPasoMs > 420) {
        ultimoPasoMs = ahora;
        setPasosCaminados((prev) => prev + 1);
      }
    };

    window.addEventListener('devicemotion', manejarMovimiento);
    return () => window.removeEventListener('devicemotion', manejarMovimiento);
  }, [pantalla, subFaseJuego, retoActual, sensoresMovimientoActivos]);

  /* ==========================================================================
     FLUJO DEL JUEGO EN VIVO: INICIO, SELECCIÓN DE JUGADOR Y PREGUNTA DEL DM
     ========================================================================== */
  const iniciarJuegoTrasConfiguracion = () => {
    activarPantallaCompleta();
    lanzarRitualPulgares({
      titulo: 'Apertura del Secreto Sagrado',
      subtitulo: 'Sostén la Tablet horizontalmente y mantén ambos pulgares en los círculos durante 3 segundos',
      colorLuz: dmPerfil.colorHex,
      alCompletar: () => {
        setPantalla('JUEGO');
        setSubFaseJuego('INTRO_HISTORIA');
        setEraActualNum(1);
        setIndiceRetoEnEra(0);
        setConviccionHP(10);
        setVueltaNumero(1);
        setJugadores((prev) => prev.map((j) => ({ ...j, disponible: true, poderUsado: false })));
        hablarConVozDM(dmPerfil.introHistoria);
      }
    });
  };

const [feedbackRespuesta, setFeedbackRespuesta] = useState(null); // { esCorrecto, idSeleccionado, textoCorrecto }
  const [ordenElegidoIds, setOrdenElegidoIds] = useState([]);
  const contadorTurnosGlobalRef = useRef(0);
  const usadosLocalesRef = useRef(new Set());

  // Mezcla aleatoriamente las opciones en retos de selección o desordena los pasos en retos de secuencia
  const barajarOpcionesReto = useCallback((reto) => {
    if (!reto || !Array.isArray(reto.opciones)) return reto;
    const copiaOpciones = [...reto.opciones];
    for (let i = copiaOpciones.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copiaOpciones[i], copiaOpciones[j]] = [copiaOpciones[j], copiaOpciones[i]];
    }
    return { ...reto, opciones: copiaOpciones };
  }, []);

  const concederPermisoYPrepararReto = async (eraNum = eraActualNum, idxReto = indiceRetoEnEra) => {
    sonarAcordeSintetico([523.25, 659.25, 1046.5], 0.6);
    setSubFaseJuego('ELEGIR_JUGADOR');
    setOpcionesOcultasIds([]);
    setPasosCaminados(0);
    setTranscripcionVoz('');
    setFeedbackRespuesta(null);
    setOrdenElegidoIds([]);

    const turnoActual = contadorTurnosGlobalRef.current;
    contadorTurnosGlobalRef.current += 1;

    const listaEra = NODOS_MULTIMODALES_POR_ERA[eraNum] || NODOS_MULTIMODALES_POR_ERA[1];
    const noUsados = listaEra.filter((r) => !usadosLocalesRef.current.has(r.tituloNodo));
    const poolElegible = noUsados.length > 0 ? noUsados : listaEra;
    const idxAzarLocal = Math.floor(Math.random() * poolElegible.length);
    const elegidoLocal = poolElegible[idxAzarLocal];
    usadosLocalesRef.current.add(elegidoLocal.tituloNodo);

    setRetoActual(barajarOpcionesReto(elegidoLocal));

    hablarConVozDM('¿Quién de los jugadores disponibles tomará el desafío en este turno?');

    if (geminiApiKey && geminiApiKey.trim() !== '') {
      // Pasar hasta 6 llaves rotativas del pool para garantizar que la IA genere siempre en tiempo real
      const poolDisponible = obtenerPoolClavesDisponibles(geminiApiKey);
      const subPoolRotativo = Array.from({ length: Math.min(6, poolDisponible.length) }, () =>
        obtenerSiguienteClaveRotativa(geminiApiKey)
      ).join(', ');

      setCargandoRetoIA(true);
      try {
        const generado = await generarDesafioConGemini({
          apiKey: subPoolRotativo,
          numeroEra: eraNum,
          dmPerfil,
          nombreFamilia: 'el equipo',
          conviccionHP,
          modoPartida: modoEstilo,
          indiceRetoEnEra: turnoActual
        });
        setRetoActual(barajarOpcionesReto(generado));
      } catch (e) {
        // Conserva el reto de respaldo si no hay conexión a Internet
      } finally {
        setCargandoRetoIA(false);
      }
    }
  };

  const elegirJugadorParaElTurno = (jugador) => {
    if (!jugador.disponible) return;
    const clase = CLASES_ROLES[jugador.rolIdx];
    setJugadorActivoId(jugador.id);
    sonarAcordeSintetico([523.25, 659.25, 783.99], 0.5);

    setSubFaseJuego('ANIMACION_DESVANECER_OTROS');

    setTimeout(() => {
      lanzarRitualPulgares({
        titulo: `${jugador.nombre} (${clase.nombre}) Toma el Control`,
        subtitulo: `${jugador.nombre}, coloca ambos pulgares durante 3 segundos para recibir el desafío`,
        colorLuz: clase.color,
        alCompletar: () => {
          setPantalla('JUEGO');
          setSubFaseJuego('DM_PREGUNTA');

          const locucionCorta = `Abran ${retoActual.citaBiblia}. ${retoActual.pregunta}`;
          hablarConVozDM(locucionCorta, () => {
            setSubFaseJuego('JUGADOR_ACTIVO');
          });
        }
      });
    }, 850);
  };

  /* ==========================================================================
     ANIMACIÓN EDUCATIVA DE RESPUESTA (CORRECTO / INCORRECTO) + RESOLUCIÓN
     ========================================================================== */
  const completarTurnoYDevolverControlAlDM = (fueCorrecto, comentarioExtraDM = '', idOpcionElegida = null) => {
    if (!jugadorActivo || feedbackRespuesta) return;
    const clase = CLASES_ROLES[jugadorActivo.rolIdx];

    // Sonido y vibración diferenciados según acierto o fallo
    if (fueCorrecto) {
      sonarAcordeSintetico([523.25, 659.25, 783.99, 1046.5], 0.85);
      dispararVibracionHaptica([70, 40, 140], 0.25);
    } else {
      sonarAcordeSintetico([220, 196, 164.81], 0.75);
      dispararVibracionHaptica([180, 60, 220], 0.35);
    }

    const opCorrectaObj = retoActual.opciones?.find((o) => o.correcta);
    const textoCorrecto = opCorrectaObj
      ? opCorrectaObj.titulo
      : retoActual.hiloDorado;

    // Mostrar animación educativa en pantalla durante 2.2 segundos antes de pasar a los pulgares
    setFeedbackRespuesta({
      esCorrecto: fueCorrecto,
      idSeleccionado: idOpcionElegida,
      textoCorrecto
    });

    setTimeout(() => {
      setFeedbackRespuesta(null);

      let nuevaLista = jugadores.map((j) => {
        if (j.id === jugadorActivo.id) {
          return { ...j, disponible: false };
        }
        return j;
      });

      if (!nuevaLista.some((j) => j.disponible)) {
        nuevaLista = nuevaLista.map((j) => ({ ...j, disponible: true }));
        setVueltaNumero((v) => v + 1);
      }
      setJugadores(nuevaLista);

      if (fueCorrecto) {
        if (clase.id === 'juez' || clase.id === 'proselito' || clase.id === 'noble') {
          setConviccionHP((hp) => Math.min(10, hp + 1));
        }
      } else if (clase.id !== 'sacerdote') {
        setConviccionHP((hp) => Math.max(1, hp - 1));
      }

      lanzarRitualPulgares({
        titulo: `${jugadorActivo.nombre} Devuelve el Control al Guía`,
        subtitulo: 'Mantén ambos pulgares durante 3 segundos para escuchar la enseñanza bíblica',
        colorLuz: fueCorrecto ? '#10b981' : '#f43f5e',
        alCompletar: () => {
          setPantalla('JUEGO');
          setSubFaseJuego('REVELACION_HILO');
          setJugadorActivoId(null);

          const textoFinal = fueCorrecto
            ? `${comentarioExtraDM || `¡Correcto, ${jugadorActivo.nombre}!`} ${retoActual.hiloDorado}`
            : `${comentarioExtraDM || `Repasemos ${retoActual.citaBiblia}.`} ${retoActual.hiloDorado}`;

          setMensajeFeedbackDM(textoFinal);
          hablarConVozDM(textoFinal);
        }
      });
    }, 2200);
  };

  const avanzarAlSiguienteNodoOEra = () => {
    const siguienteRetoIdx = indiceRetoEnEra + 1;
    if (siguienteRetoIdx < retosMetaPorEra) {
      setIndiceRetoEnEra(siguienteRetoIdx);
      concederPermisoYPrepararReto(eraActualNum, siguienteRetoIdx);
    } else if (eraActualNum < 8) {
      const siguienteEra = eraActualNum + 1;
      setEraActualNum(siguienteEra);
      setIndiceRetoEnEra(0);
      concederPermisoYPrepararReto(siguienteEra, 0);
    } else {
      setSubFaseJuego('FIN_PARTIDA');
      hablarConVozDM(
        '¡Felicidades! Han completado las ocho eras del Secreto Sagrado, desde Génesis hasta Revelación. ¡El Reino Mesiánico ha triunfado para la gloria eterna de Jehová!'
      );
    }
  };

  /* ==========================================================================
     MICRÓFONO DEDICADO (PUSH-TO-TALK: SOLO ESCUCHA AL MANTENER PRESIONADO)
     ========================================================================== */
  const iniciarEscuchaPushToTalk = (e) => {
    e.preventDefault();
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    setManteniendoMic(true);

    if (!SpeechRec) return;
    const rec = new SpeechRec();
    rec.lang = 'es-ES';
    rec.continuous = true;
    rec.interimResults = true;

    rec.onresult = (event) => {
      let texto = '';
      for (let i = 0; i < event.results.length; i++) {
        texto += event.results[i][0].transcript + ' ';
      }
      setTranscripcionVoz(texto.trim());
    };

    reconocimientoVozRef.current = rec;
    try {
      rec.start();
    } catch (err) {}
  };

  const soltarEscuchaPushToTalk = async () => {
    setManteniendoMic(false);
    if (reconocimientoVozRef.current) {
      try {
        reconocimientoVozRef.current.stop();
      } catch (err) {}
    }

    if (subFaseJuego === 'INTRO_HISTORIA' && transcripcionVoz.trim().length > 0) {
      concederPermisoYPrepararReto(1, 0);
      return;
    }

    if (subFaseJuego === 'JUGADOR_ACTIVO' && transcripcionVoz.trim().length > 3) {
      setEvaluandoIA(true);
      try {
        const clavesLimpias = geminiApiKey.split(',').map((k) => k.trim()).filter(Boolean);
        const claveActiva = clavesLimpias[(window.__ssIndiceClaveActiva || 0) % Math.max(1, clavesLimpias.length)] || '';
        const res = await evaluarExplicacionFamiliarConGemini({
          apiKey: claveActiva,
          numeroEra: eraActualNum,
          dmPerfil,
          nombreJugador: jugadorActivo?.nombre || 'Jugador',
          citaBiblia: retoActual.citaBiblia,
          preguntaActual: retoActual.pregunta,
          explicacionDelJugador: transcripcionVoz
        });
        completarTurnoYDevolverControlAlDM(res.aprobado, res.comentarioDM);
      } catch (e) {
        completarTurnoYDevolverControlAlDM(true);
      } finally {
        setEvaluandoIA(false);
      }
    }
  };

  /* ==========================================================================
     CÁMARA PARA VERIFICAR LA BIBLIA FÍSICA
     ========================================================================== */
  const abrirCamaraBiblia = async () => {
    setCamaraActiva(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamCamaraRef.current = stream;
      if (videoCamaraRef.current) {
        videoCamaraRef.current.srcObject = stream;
      }
    } catch (e) {}
  };

  const capturarYVerificarBiblia = async () => {
    setEvaluandoIA(true);
    let base64 = '';
    try {
      if (videoCamaraRef.current && videoCamaraRef.current.videoWidth > 0) {
        const c = document.createElement('canvas');
        c.width = 480;
        c.height = 360;
        c.getContext('2d').drawImage(videoCamaraRef.current, 0, 0, c.width, c.height);
        base64 = c.toDataURL('image/jpeg', 0.75).split(',')[1];
      }
      if (streamCamaraRef.current) {
        streamCamaraRef.current.getTracks().forEach((t) => t.stop());
      }
      setCamaraActiva(false);

      const clavesLimpias = geminiApiKey.split(',').map((k) => k.trim()).filter(Boolean);
      const claveActiva = clavesLimpias[(window.__ssIndiceClaveActiva || 0) % Math.max(1, clavesLimpias.length)] || '';
      const veredicto = await verificarBibliaConCamaraGemini({
        apiKey: claveActiva,
        base64JpegSinPrefijo: base64,
        citaBiblia: retoActual.citaBiblia,
        dmPerfil,
        nombreJugador: jugadorActivo?.nombre || 'Jugador'
      });
      completarTurnoYDevolverControlAlDM(veredicto.aprobado, veredicto.comentarioDM);
    } catch (e) {
      completarTurnoYDevolverControlAlDM(true);
    } finally {
      setEvaluandoIA(false);
    }
  };

  /* ==========================================================================
     GUARDAR Y CERRAR PARTIDA (SIEMPRE DISPONIBLES ARRIBA A LA DERECHA)
     ========================================================================== */
  const guardarPartidaActual = () => {
    try {
      const datos = {
        dmId,
        modoEstilo,
        jugadores,
        eraActualNum,
        indiceRetoEnEra,
        conviccionHP,
        tokensOracion,
        vueltaNumero,
        fecha: new Date().toLocaleString('es-ES')
      };
      localStorage.setItem('ss_partida_guardada_v4', JSON.stringify(datos));
      setNotificacionGuardado('Partida Guardada');
      setTimeout(() => setNotificacionGuardado(''), 2200);
    } catch (e) {}
  };

  const cargarPartidaGuardada = () => {
    try {
      activarPantallaCompleta();
      const raw = localStorage.getItem('ss_partida_guardada_v4');
      if (!raw) return;
      const d = JSON.parse(raw);
      setDmId(d.dmId || 'historiador');
      setModoEstilo(d.modoEstilo || 'ESTANDAR');
      setJugadores(d.jugadores || jugadores);
      setEraActualNum(d.eraActualNum || 1);
      setIndiceRetoEnEra(d.indiceRetoEnEra || 0);
      setConviccionHP(d.conviccionHP || 10);
      setTokensOracion(d.tokensOracion ?? 2);
      setVueltaNumero(d.vueltaNumero || 1);
      setPantalla('JUEGO');
      setSubFaseJuego('ELEGIR_JUGADOR');
    } catch (e) {}
  };

  return (
    <div
      onClick={desbloquearAudioAlTocar}
      className="relative w-screen h-screen overflow-hidden select-none font-sans text-white bg-slate-950"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&family=Syne:wght@700;800&display=swap');
        .font-cinzel {
          font-family: 'Syne', 'Outfit', sans-serif;
          letter-spacing: -0.02em;
        }
        @keyframes levitarLogo {
          0%, 100% { transform: translateY(0px) scale(1); filter: drop-shadow(0 12px 28px rgba(0,0,0,0.6)) drop-shadow(0 0 22px rgba(254,240,138,0.45)); }
          50% { transform: translateY(-9px) scale(1.03); filter: drop-shadow(0 20px 34px rgba(0,0,0,0.7)) drop-shadow(0 0 38px rgba(56,189,248,0.7)); }
        }
        @keyframes giroAnilloSagrado {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .logo-interactivo {
          animation: levitarLogo 4.5s ease-in-out infinite;
          transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.35s ease;
        }
        .logo-interactivo:hover, .logo-interactivo:active {
          transform: scale(1.12) rotate(-2deg) !important;
          filter: drop-shadow(0 0 45px rgba(255,255,255,1)) drop-shadow(0 0 70px rgba(251,191,36,0.9)) !important;
        }
      `}</style>

      {/* 1. IMAGEN DE FONDO PERSONALIZADA DE MONTAÑA */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center transition-transform duration-[18000ms] ease-out scale-105"
        style={{ backgroundImage: `url('${URL_FONDO_MONTANA}')` }}
      />

      {/* Sutil velo atmosférico lateral izquierdo para que las letras blancas brillen sobre las nubes */}
      <div className="fixed inset-0 z-0 bg-gradient-to-r from-slate-950/50 via-slate-950/15 to-transparent pointer-events-none" />
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-slate-950/15 via-transparent to-slate-950/40 pointer-events-none" />

      {/* 2. CAPA ANIMADA EN CANVAS: NIEBLA MÍSTICA, BANDADA DE AVES Y BRILLO EN LA CUMBRE */}
      <canvas ref={canvasAtmosferaRef} className="fixed inset-0 z-10 pointer-events-none" />

{/* ====================================================================
          PANTALLA 0: ANIMACIÓN DE ARRANQUE (BOTÓN MÁS ALTO Y LIMPIO)
          ==================================================================== */}
      {pantalla === 'BOOT_LOGO' && (
        <section
          onClick={entrarDesdeBoot}
          className={`fixed inset-0 z-50 flex flex-col items-center justify-center pb-14 transition-all duration-700 cursor-pointer ${
            faseBoot === 2 ? 'bg-slate-950/0 opacity-0 pointer-events-none' : 'bg-slate-950/90 opacity-100'
          }`}
        >
          <div
            className={`relative flex flex-col items-center transition-all duration-1000 transform ${
              faseBoot === 0
                ? 'scale-75 opacity-0 blur-md'
                : faseBoot === 1
                ? 'scale-100 opacity-100 blur-0'
                : 'scale-110 opacity-0'
            }`}
          >
            <div className="absolute -inset-16 rounded-full bg-cyan-400/30 blur-3xl animate-pulse pointer-events-none" />
            <img
              src={URL_LOGO_OFICIAL}
              alt="Secreto Sagrado"
              className="w-60 md:w-80 object-contain logo-interactivo"
            />
            <h1 className="font-cinzel text-3xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-100 to-cyan-200 mt-3 drop-shadow-lg">
              Secreto Sagrado
            </h1>
            <p className="text-xs md:text-sm font-bold tracking-[0.28em] uppercase text-amber-200/90 mt-1">
              y su magnífica revelación
            </p>
            <button
              onClick={entrarDesdeBoot}
              className="mt-6 px-10 py-3 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-xl border border-white/60 text-xs tracking-[0.28em] uppercase text-white font-black shadow-[0_0_30px_rgba(255,255,255,0.35)] hover:scale-105 transition-all"
            >
              Entrar
            </button>
          </div>
        </section>
      )}

      {/* ====================================================================
          PANTALLA 1: MENÚ PRINCIPAL (LOGO GRANDE REACTIVO + TÍTULO MODERNO + OPCIONES)
          ==================================================================== */}
      {pantalla === 'MENU_PRINCIPAL' && (
        <section className="relative z-20 w-full h-full flex flex-col justify-between px-10 md:px-20 py-8 md:py-12">
          {/* Botón de Pantalla Completa más alto y sin texto emergente */}
          <button
            onClick={alternarPantallaCompleta}
            className="fixed top-4 right-5 z-30 p-2.5 rounded-full bg-slate-950/35 hover:bg-white/25 backdrop-blur-xl border border-white/35 text-white/90 transition-all"
          >
            <IconoSagradoSVG tipo="fullscreen" className="w-5 h-5" />
          </button>
        

          {/* BLOQUE IZQUIERDO ALINEADO DIRECTAMENTE SOBRE EL MENÚ */}
          <div className="flex flex-col items-start max-w-md my-auto">
            <div
              onClick={() => sonarAcordeSintetico([523.25, 659.25, 783.99, 1046.5], 0.8)}
              className="group relative flex flex-col items-start text-left cursor-pointer select-none -ml-2"
            >
              {/* Anillos celestes y dorados animados detrás del emblema */}
              <div className="relative flex items-center justify-center ml-4">
                <div className="absolute -inset-5 rounded-full bg-gradient-to-r from-amber-300/25 via-cyan-300/25 to-amber-300/25 blur-2xl group-hover:scale-125 group-hover:opacity-100 opacity-75 transition-all duration-500 pointer-events-none" />
                <div
                  style={{ animation: 'giroAnilloSagrado 24s linear infinite' }}
                  className="absolute w-40 h-40 md:w-48 md:h-48 rounded-full border border-dashed border-amber-200/40 group-hover:border-white/80 transition-colors pointer-events-none"
                />
                <img
                  src={URL_LOGO_OFICIAL}
                  alt="Logo Secreto Sagrado"
                  className="relative z-10 w-44 md:w-56 object-contain logo-interactivo"
                />
              </div>

              <h1 className="font-cinzel text-3xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-100 to-cyan-100 drop-shadow-[0_4px_20px_rgba(0,0,0,0.85)] mt-2 pl-2 group-hover:translate-x-1 transition-transform">
                Secreto Sagrado
              </h1>
              <p className="text-[11px] md:text-xs font-extrabold tracking-[0.24em] uppercase text-amber-200 drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)] mt-1 pl-2">
                y su magnífica revelación
              </p>
            </div>

            {/* OPCIONES DEL MENÚ JUSTO DEBAJO Y EN LA MISMA LÍNEA VERTICAL IZQUIERDA */}
            <nav className="flex flex-col items-start gap-3.5 mt-8 md:mt-10 pl-1">
              <button
                onClick={() => {
                  activarPantallaCompleta();
                  sonarAcordeSintetico([523.25, 659.25, 783.99]);
                  setPantalla('SETUP_NARRADOR');
                }}
                className="bg-transparent border-none text-left text-3xl md:text-5xl font-black tracking-tight text-white/90 hover:text-white active:scale-95 transition-all duration-300 hover:translate-x-4 drop-shadow-[0_4px_16px_rgba(0,0,0,0.85)] hover:drop-shadow-[0_0_32px_rgba(255,255,255,1)] focus:outline-none"
              >
                Iniciar
              </button>

              {localStorage.getItem('ss_partida_guardada_v4') && (
                <button
                  onClick={cargarPartidaGuardada}
                  className="bg-transparent border-none text-left text-2xl md:text-4xl font-extrabold tracking-tight text-amber-200/95 hover:text-amber-100 active:scale-95 transition-all duration-300 hover:translate-x-4 drop-shadow-[0_4px_16px_rgba(0,0,0,0.85)] hover:drop-shadow-[0_0_32px_rgba(253,224,71,1)] focus:outline-none"
                >
                  Continuar
                </button>
              )}

              <button
                onClick={() => {
                  sonarAcordeSintetico([440, 554.37, 659.25]);
                  setPantalla('CONFIGURACION');
                }}
                className="bg-transparent border-none text-left text-3xl md:text-5xl font-black tracking-tight text-white/85 hover:text-white active:scale-95 transition-all duration-300 hover:translate-x-4 drop-shadow-[0_4px_16px_rgba(0,0,0,0.85)] hover:drop-shadow-[0_0_32px_rgba(255,255,255,1)] focus:outline-none"
              >
                Configuración
              </button>
            </nav>
          </div>
        </section>
      )}

      {/* ====================================================================
          PASO LINEAL 1: NARRADOR (CAJAS GLASSMORPHIC CON ÍCONOS SVG)
          ==================================================================== */}
      {pantalla === 'SETUP_NARRADOR' && (
        <section className="relative z-20 w-full h-full flex flex-col justify-between p-6 md:p-12">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setPantalla('MENU_PRINCIPAL')}
                className="px-5 py-2.5 rounded-full bg-slate-950/45 hover:bg-white/30 backdrop-blur-xl border border-white/40 text-xs font-extrabold tracking-wider uppercase transition-all"
              >
                ← Regresar
              </button>
              <button
                onClick={() => setPantalla('MENU_PRINCIPAL')}
                className="px-5 py-2.5 rounded-full bg-slate-950/35 hover:bg-white/20 backdrop-blur-xl border border-white/25 text-xs font-bold tracking-wider uppercase transition-all"
              >
                Menú Principal
              </button>
            </div>
            <button
              onClick={alternarPantallaCompleta}
              className="p-2.5 rounded-full bg-slate-950/40 backdrop-blur-xl border border-white/30"
            >
              <IconoSagradoSVG tipo="fullscreen" className="w-4 h-4" />
            </button>
          </header>

          <main className="my-auto max-w-5xl w-full mx-auto flex flex-col items-center gap-6">
            <div className="text-center">
              <span className="text-xs font-black tracking-[0.28em] uppercase text-amber-200 drop-shadow">
                Paso 1 de 3 • Narrador
              </span>
              <h2 className="font-cinzel text-3xl md:text-5xl font-black tracking-tight drop-shadow-lg mt-1">
                Elige el Estilo del Guía
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full">
              {CATALOGO_DMS.map((dm) => {
                const activo = dm.id === dmId;
                return (
                  <button
                    key={dm.id}
                    onClick={() => {
                      setDmId(dm.id);
                      sonarAcordeSintetico([523.25, 659.25]);
                    }}
                    style={{
                      boxShadow: activo ? `0 0 35px ${dm.colorHex}66` : undefined,
                      borderColor: activo ? '#ffffff' : 'rgba(255,255,255,0.35)'
                    }}
                    className={`p-5 rounded-3xl backdrop-blur-2xl border text-left transition-all duration-300 flex flex-col gap-3 ${
                      activo ? 'bg-white/30 scale-[1.03]' : 'bg-slate-950/45 hover:bg-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        style={{ backgroundColor: `${dm.colorHex}33`, borderColor: dm.colorHex }}
                        className="w-12 h-12 rounded-2xl border flex items-center justify-center text-white shrink-0 shadow-inner"
                      >
                        <IconoSagradoSVG tipo={dm.iconoTipo} className="w-6 h-6" />
                      </div>
                      <span className="font-black text-base md:text-lg leading-tight">{dm.nombre}</span>
                    </div>
                    <p className="text-xs text-white/85 leading-relaxed">{dm.subtitulo}</p>
                  </button>
                );
              })}
            </div>
          </main>

          <footer className="flex justify-center">
            <button
              onClick={() => {
                sonarAcordeSintetico([523.25, 659.25, 783.99]);
                setPantalla('SETUP_PARTIDA');
              }}
              className="px-12 py-4 rounded-full bg-white/25 hover:bg-white/40 backdrop-blur-2xl border border-white/70 font-black text-sm tracking-widest uppercase shadow-[0_0_35px_rgba(255,255,255,0.5)] hover:scale-105 transition-all"
            >
              Continuar →
            </button>
          </footer>
        </section>
      )}

      {/* ====================================================================
          PASO LINEAL 2: PARTIDA (NOMBRES Y ROLES CON ÍCONOS SVG, HASTA 8 JUGADORES)
          ==================================================================== */}
      {pantalla === 'SETUP_PARTIDA' && (
        <section className="relative z-20 w-full h-full flex flex-col justify-between p-6 md:p-12">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setPantalla('SETUP_NARRADOR')}
                className="px-5 py-2.5 rounded-full bg-slate-950/45 hover:bg-white/30 backdrop-blur-xl border border-white/40 text-xs font-extrabold tracking-wider uppercase transition-all"
              >
                ← Regresar
              </button>
              <button
                onClick={() => setPantalla('MENU_PRINCIPAL')}
                className="px-5 py-2.5 rounded-full bg-slate-950/35 hover:bg-white/20 backdrop-blur-xl border border-white/25 text-xs font-bold tracking-wider uppercase transition-all"
              >
                Menú Principal
              </button>
            </div>
            <button
              onClick={alternarPantallaCompleta}
              className="p-2.5 rounded-full bg-slate-950/40 backdrop-blur-xl border border-white/30"
            >
              <IconoSagradoSVG tipo="fullscreen" className="w-4 h-4" />
            </button>
          </header>

          <main className="my-auto max-w-5xl w-full mx-auto flex flex-col items-center gap-5">
            <div className="text-center">
              <span className="text-xs font-black tracking-[0.28em] uppercase text-amber-200 drop-shadow">
                Paso 2 de 3 • Partida ({jugadores.length}/8 Jugadores)
              </span>
              <h2 className="font-cinzel text-3xl md:text-4xl font-black tracking-tight drop-shadow-lg mt-1">
                Registra a los Jugadores y su Rol
              </h2>
            </div>

            {jugadores.length < 8 && (
              <div className="w-full max-w-3xl p-4 rounded-3xl bg-slate-950/45 backdrop-blur-2xl border border-white/50 flex flex-wrap items-center gap-3 shadow-2xl">
                <input
                  type="text"
                  value={nuevoNombreInput}
                  onChange={(e) => setNuevoNombreInput(e.target.value)}
                  placeholder="Escribe el nombre del jugador..."
                  className="flex-1 min-w-[180px] px-4 py-3 rounded-2xl bg-black/45 border border-white/40 text-sm font-bold text-white placeholder-white/60 focus:outline-none focus:border-white"
                />
                <select
                  value={nuevoRolIdxInput}
                  onChange={(e) => setNuevoRolIdxInput(Number(e.target.value))}
                  className="px-4 py-3 rounded-2xl bg-black/55 border border-white/40 text-sm font-bold text-white focus:outline-none"
                >
                  {CLASES_ROLES.map((r, i) => (
                    <option key={r.id} value={i} className="bg-slate-900 text-white">
                      {r.nombre}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    if (!nuevoNombreInput.trim() || jugadores.length >= 8) return;
                    setJugadores([
                      ...jugadores,
                      {
                        id: 'j_' + Date.now(),
                        nombre: nuevoNombreInput.trim(),
                        rolIdx: nuevoRolIdxInput,
                        disponible: true,
                        poderUsado: false
                      }
                    ]);
                    setNuevoNombreInput('');
                    setNuevoRolIdxInput((nuevoRolIdxInput + 1) % CLASES_ROLES.length);
                    sonarAcordeSintetico([587.33, 880]);
                  }}
                  className="px-6 py-3 rounded-2xl bg-white text-slate-950 font-black text-xs uppercase tracking-wider hover:scale-105 transition-all"
                >
                  + Añadir ({8 - jugadores.length} disp.)
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 w-full max-h-[42vh] overflow-y-auto p-1">
              {jugadores.map((jug, idx) => {
                const clase = CLASES_ROLES[jug.rolIdx];
                return (
                  <div
                    key={jug.id}
                    style={{ borderColor: clase.color }}
                    className="p-4 rounded-3xl bg-slate-950/50 backdrop-blur-2xl border-2 flex flex-col items-center gap-2 relative shadow-xl"
                  >
                    {jugadores.length > 1 && (
                      <button
                        onClick={() => setJugadores(jugadores.filter((_, i) => i !== idx))}
                        className="absolute top-2.5 right-3 text-white/60 hover:text-white"
                      >
                        <IconoSagradoSVG tipo="cerrar" className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        const copia = [...jugadores];
                        copia[idx].rolIdx = (copia[idx].rolIdx + 1) % CLASES_ROLES.length;
                        setJugadores(copia);
                      }}
                      style={{ backgroundColor: `${clase.color}33`, borderColor: clase.color }}
                      className="w-12 h-12 rounded-full border-2 flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform"
                      title="Toca para cambiar de Rol"
                    >
                      <IconoSagradoSVG tipo={clase.iconoTipo} className="w-6 h-6" />
                    </button>
                    <input
                      type="text"
                      value={jug.nombre}
                      onChange={(e) => {
                        const copia = [...jugadores];
                        copia[idx].nombre = e.target.value;
                        setJugadores(copia);
                      }}
                      className="w-full bg-white/10 border border-white/25 rounded-xl px-2 py-1 text-center font-extrabold text-xs text-white focus:outline-none"
                    />
                    <span className="text-[11px] font-black text-amber-200">{clase.nombre}</span>
                    <span className="text-[10px] text-white/75 text-center leading-tight">{clase.ventaja}</span>
                  </div>
                );
              })}
            </div>
          </main>

          <footer className="flex justify-center">
            <button
              onClick={() => {
                sonarAcordeSintetico([523.25, 659.25, 783.99]);
                setPantalla('SETUP_ESTILO');
              }}
              className="px-12 py-4 rounded-full bg-white/25 hover:bg-white/40 backdrop-blur-2xl border border-white/70 font-black text-sm tracking-widest uppercase shadow-[0_0_35px_rgba(255,255,255,0.5)] hover:scale-105 transition-all"
            >
              Continuar →
            </button>
          </footer>
        </section>
      )}

      {/* ====================================================================
          PASO LINEAL 3: ESTILO (EMBLEMAS VECTORIALES PREMIUM EN LUGAR DE EMOJIS)
          ==================================================================== */}
      {pantalla === 'SETUP_ESTILO' && (
        <section className="relative z-20 w-full h-full flex flex-col justify-between p-6 md:p-12">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setPantalla('SETUP_PARTIDA')}
                className="px-5 py-2.5 rounded-full bg-slate-950/45 hover:bg-white/30 backdrop-blur-xl border border-white/40 text-xs font-extrabold tracking-wider uppercase transition-all"
              >
                ← Regresar
              </button>
              <button
                onClick={() => setPantalla('MENU_PRINCIPAL')}
                className="px-5 py-2.5 rounded-full bg-slate-950/35 hover:bg-white/20 backdrop-blur-xl border border-white/25 text-xs font-bold tracking-wider uppercase transition-all"
              >
                Menú Principal
              </button>
            </div>
            <button
              onClick={alternarPantallaCompleta}
              className="p-2.5 rounded-full bg-slate-950/40 backdrop-blur-xl border border-white/30"
            >
              <IconoSagradoSVG tipo="fullscreen" className="w-4 h-4" />
            </button>
          </header>

          <main className="my-auto max-w-4xl w-full mx-auto flex flex-col items-center gap-8">
            <div className="text-center">
              <span className="text-xs font-black tracking-[0.28em] uppercase text-amber-200 drop-shadow">
                Paso 3 de 3 • Estilo
              </span>
              <h2 className="font-cinzel text-3xl md:text-5xl font-black tracking-tight drop-shadow-lg mt-1">
                Selecciona la Duración de la Partida
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              <button
                onClick={() => setModoEstilo('EXPRESS')}
                className={`p-8 rounded-[34px] backdrop-blur-2xl border-2 text-left transition-all duration-300 flex flex-col gap-4 ${
                  modoEstilo === 'EXPRESS'
                    ? 'bg-slate-950/55 border-amber-300 scale-105 shadow-[0_0_45px_rgba(253,224,71,0.35)]'
                    : 'bg-slate-950/40 border-white/30 hover:bg-slate-950/55'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-amber-400/20 border border-amber-300/60 flex items-center justify-center text-amber-200 shadow-[0_0_20px_rgba(251,191,36,0.4)]">
                  <IconoSagradoSVG tipo="express" className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-black">Express (~30 Minutos)</h3>
                <p className="text-sm text-white/90 leading-relaxed">
                  Recorre las <strong>8 Eras completas</strong> con una selección directa de retos clave por época, ideal para una sesión familiar ágil y dinámica.
                </p>
              </button>

              <button
                onClick={() => setModoEstilo('ESTANDAR')}
                className={`p-8 rounded-[34px] backdrop-blur-2xl border-2 text-left transition-all duration-300 flex flex-col gap-4 ${
                  modoEstilo === 'ESTANDAR'
                    ? 'bg-slate-950/55 border-cyan-300 scale-105 shadow-[0_0_45px_rgba(34,211,238,0.35)]'
                    : 'bg-slate-950/40 border-white/30 hover:bg-slate-950/55'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-cyan-400/20 border border-cyan-300/60 flex items-center justify-center text-cyan-200 shadow-[0_0_20px_rgba(34,211,238,0.4)]">
                  <IconoSagradoSVG tipo="estandar" className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-black">Estándar (Recorrido Completo)</h3>
                <p className="text-sm text-white/90 leading-relaxed">
                  Experiencia profunda a través de todos los nodos y desafíos sensoriales de las <strong>8 Eras bíblicas</strong>.
                </p>
              </button>
            </div>
          </main>

          <footer className="flex justify-center">
            <button
              onClick={iniciarJuegoTrasConfiguracion}
              className="px-14 py-4 rounded-full bg-gradient-to-r from-amber-300 via-yellow-200 to-cyan-200 text-slate-950 font-black text-sm tracking-widest uppercase shadow-[0_0_45px_rgba(254,240,138,0.85)] hover:scale-105 transition-all"
            >
              Comenzar la Aventura →
            </button>
          </footer>
        </section>
      )}

      {/* ====================================================================
          PANTALLA DE CONFIGURACIÓN GENERAL (APIs, VOZ NEURONAL, SONIDO Y FULLSCREEN)
          ==================================================================== */}
      {pantalla === 'CONFIGURACION' && (
        <section className="relative z-20 w-full h-full flex flex-col justify-between p-6 md:p-12 overflow-y-auto">
          <header className="flex items-center justify-between">
            <button
              onClick={() => setPantalla('MENU_PRINCIPAL')}
              className="px-6 py-2.5 rounded-full bg-slate-950/45 hover:bg-white/30 backdrop-blur-xl border border-white/40 text-xs font-extrabold tracking-wider uppercase transition-all"
            >
              ← Menú Principal
            </button>
            <h2 className="font-cinzel text-2xl font-black tracking-wide">Configuración del Sistema</h2>
            <button
              onClick={alternarPantallaCompleta}
              className="px-4 py-2 rounded-full bg-white/15 border border-white/35 text-xs font-bold flex items-center gap-2"
            >
              <IconoSagradoSVG tipo="fullscreen" className="w-4 h-4" />
              <span>Pantalla Completa</span>
            </button>
          </header>

          <main className="my-auto max-w-3xl w-full mx-auto p-7 rounded-[36px] bg-slate-950/60 backdrop-blur-2xl border border-white/35 shadow-2xl flex flex-col gap-5">
            {/* API Key de Gemini */}
            <div className="flex flex-col gap-2 pb-4 border-b border-white/15">
              <label className="text-xs font-black tracking-widest uppercase text-cyan-300">
                Clave de API de Google Gemini (Storytelling, Preguntas y Visión)
              </label>
              <input
                type="password"
                value={geminiApiKey}
                onChange={(e) => {
                  setGeminiApiKey(e.target.value);
                  try {
                    localStorage.setItem('ss_gemini_api_key', e.target.value.trim());
                  } catch (err) {}
                }}
                placeholder="AIzaSy... o AQ..."
                className="w-full px-4 py-3 rounded-2xl bg-black/50 border border-white/30 text-sm text-white focus:outline-none focus:border-cyan-300"
              />
            </div>

            {/* Selector de Voz Natural */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/15">
              <div>
                <div className="font-extrabold text-sm">Motor de Voz del Narrador</div>
                <div className="text-xs text-white/70">
                  Prioriza voces neuronales y pronuncia las citas bíblicas por capítulo y versículo
                </div>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={vozSeleccionadaURI}
                  onChange={(e) => setVozSeleccionadaURI(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-black/60 border border-white/30 text-xs font-bold text-white max-w-[220px]"
                >
                  {vocesDisponibles.length === 0 ? (
                    <option value="">Voz Natural del Sistema</option>
                  ) : (
                    vocesDisponibles.map((v) => (
                      <option key={v.voiceURI} value={v.voiceURI} className="bg-slate-900">
                        {v.name}
                      </option>
                    ))
                  )}
                </select>
                <button
                  onClick={() =>
                    hablarConVozDM('Abran su Biblia en Génesis 3:15; 4:4 para comenzar el estudio.')
                  }
                  className="px-3.5 py-2 rounded-xl bg-cyan-400 text-slate-950 font-black text-xs"
                >
                  Probar
                </button>
              </div>
            </div>

            {/* Volumen de Música del Menú */}
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-white/15">
              <div>
                <div className="font-extrabold text-sm">Volumen de Música del Menú</div>
                <div className="text-xs text-white/70">Se detiene automáticamente cuando comienza la partida</div>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volumenMusica}
                onChange={(e) => setVolumenMusica(parseFloat(e.target.value))}
                className="w-40 accent-cyan-400"
              />
            </div>

            {/* Interruptores de Voz, Vibración y Sensores */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => setVozSinteticaActiva((v) => !v)}
                className={`p-4 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                  vozSinteticaActiva ? 'bg-emerald-500/25 border-emerald-300' : 'bg-white/5 border-white/20 opacity-60'
                }`}
              >
                <IconoSagradoSVG tipo="audio" className="w-5 h-5 text-emerald-300 shrink-0" />
                <div>
                  <div className="font-black text-xs uppercase">Voz del Guía</div>
                  <div className="text-[11px] mt-0.5">{vozSinteticaActiva ? 'Activada' : 'Silenciada'}</div>
                </div>
              </button>

              <button
                onClick={() => setVibracionActiva((v) => !v)}
                className={`p-4 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                  vibracionActiva ? 'bg-cyan-500/25 border-cyan-300' : 'bg-white/5 border-white/20 opacity-60'
                }`}
              >
                <IconoSagradoSVG tipo="pulgar" className="w-5 h-5 text-cyan-300 shrink-0" />
                <div>
                  <div className="font-black text-xs uppercase">Vibración Háptica</div>
                  <div className="text-[11px] mt-0.5">{vibracionActiva ? 'Activada' : 'Desactivada'}</div>
                </div>
              </button>

              <button
                onClick={() => setSensoresMovimientoActivos((v) => !v)}
                className={`p-4 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                  sensoresMovimientoActivos ? 'bg-amber-500/25 border-amber-300' : 'bg-white/5 border-white/20 opacity-60'
                }`}
              >
                <IconoSagradoSVG tipo="pasos" className="w-5 h-5 text-amber-300 shrink-0" />
                <div>
                  <div className="font-black text-xs uppercase">Contador de Pasos</div>
                  <div className="text-[11px] mt-0.5">{sensoresMovimientoActivos ? 'Activado' : 'Modo Manual'}</div>
                </div>
              </button>
            </div>
          </main>

          <footer className="flex justify-center">
            <button
              onClick={() => setPantalla('MENU_PRINCIPAL')}
              className="px-10 py-3.5 rounded-full bg-white text-slate-950 font-black text-xs tracking-widest uppercase"
            >
              Guardar y Volver
            </button>
          </footer>
        </section>
      )}

      {/* ====================================================================
          SINCRONIZACIÓN DE 3 SEGUNDOS CON AMBOS PULGARES (VIBRACIÓN + TEMBLOR FÍSICO)
          ==================================================================== */}
      {pantalla === 'RITUAL_PULGARES' && (
        <section
          style={{
            transform:
              progresoPulgares > 0
                ? `translate(${(Math.random() - 0.5) * (progresoPulgares * 0.14)}px, ${(Math.random() - 0.5) * (progresoPulgares * 0.14)}px)`
                : 'none'
          }}
          className="fixed inset-0 z-40 flex items-center justify-between px-8 md:px-20 bg-slate-950/65 backdrop-blur-2xl overflow-hidden"
        >
          <div
            style={{
              transform: `scale(${0.2 + (progresoPulgares / 100) * 3.8})`,
              opacity: progresoPulgares / 100,
              background: `radial-gradient(circle, #ffffff 0%, ${configRitual.colorLuz} 55%, transparent 75%)`
            }}
            className="fixed inset-0 pointer-events-none transition-transform duration-100"
          />

          <div
            className={`fixed inset-0 bg-white pointer-events-none transition-opacity duration-500 z-50 ${
              explosionLuzCompleta ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* CÍRCULO DEL PULGAR IZQUIERDO */}
          <button
            onPointerDown={() => {
              dispararVibracionHaptica([120, 40, 180], 0.3);
              setPulgarIzqActivo(true);
            }}
            onPointerUp={() => setPulgarIzqActivo(false)}
            onPointerLeave={() => setPulgarIzqActivo(false)}
            style={{
              borderColor: pulgarIzqActivo ? '#ffffff' : configRitual.colorLuz,
              boxShadow: pulgarIzqActivo ? `0 0 65px ${configRitual.colorLuz}` : undefined
            }}
            className={`relative z-20 w-36 h-36 md:w-44 md:h-44 rounded-full backdrop-blur-2xl border-4 flex flex-col items-center justify-center gap-2 transition-all duration-200 ${
              pulgarIzqActivo ? 'bg-white/40 scale-110' : 'bg-white/10 animate-pulse'
            }`}
          >
            <IconoSagradoSVG tipo="pulgar" className="w-10 h-10 text-white" />
            <span className="text-xs font-black tracking-widest uppercase">Pulgar Izq.</span>
          </button>

          {/* TEXTO CENTRAL E INDICADOR DE LOS 3 SEGUNDOS */}
          <div className="relative z-20 max-w-md text-center flex flex-col items-center gap-4 px-4">
            <span className="text-xs font-black tracking-[0.28em] uppercase text-amber-200">
              Transición de Control • {Math.ceil((100 - progresoPulgares) / 33.4)}s
            </span>
            <h2 className="font-cinzel text-2xl md:text-4xl font-extrabold leading-tight drop-shadow-lg">
              {configRitual.titulo}
            </h2>
            <p className="text-xs md:text-sm text-white/85 leading-relaxed">
              {configRitual.subtitulo}
            </p>

            <div className="w-64 h-2.5 rounded-full bg-white/20 overflow-hidden border border-white/40">
              <div
                style={{ width: `${progresoPulgares}%`, backgroundColor: configRitual.colorLuz }}
                className="h-full transition-all duration-100"
              />
            </div>

            <button
              onPointerDown={() => {
                dispararVibracionHaptica([120, 40, 200, 40, 300], 0.3);
                setPulgarIzqActivo(true);
                setPulgarDerActivo(true);
              }}
              onPointerUp={() => {
                setPulgarIzqActivo(false);
                setPulgarDerActivo(false);
              }}
              className="mt-2 px-5 py-2 rounded-full bg-white/15 border border-white/30 text-[11px] font-bold text-white/85 hover:bg-white/25"
            >
              Mantén presionado aquí si estás en PC con ratón
            </button>
          </div>

          {/* CÍRCULO DEL PULGAR DERECHO */}
          <button
            onPointerDown={() => {
              dispararVibracionHaptica([120, 40, 180], 0.3);
              setPulgarDerActivo(true);
            }}
            onPointerUp={() => setPulgarDerActivo(false)}
            onPointerLeave={() => setPulgarDerActivo(false)}
            style={{
              borderColor: pulgarDerActivo ? '#ffffff' : configRitual.colorLuz,
              boxShadow: pulgarDerActivo ? `0 0 65px ${configRitual.colorLuz}` : undefined
            }}
            className={`relative z-20 w-36 h-36 md:w-44 md:h-44 rounded-full backdrop-blur-2xl border-4 flex flex-col items-center justify-center gap-2 transition-all duration-200 ${
              pulgarDerActivo ? 'bg-white/40 scale-110' : 'bg-white/10 animate-pulse'
            }`}
          >
            <IconoSagradoSVG tipo="pulgar" className="w-10 h-10 text-white" />
            <span className="text-xs font-black tracking-widest uppercase">Pulgar Der.</span>
          </button>
        </section>
      )}

      {/* ====================================================================
          PANTALLA DE JUEGO EN VIVO (CON SCROLL VERTICAL LIBRE Y ANIMACIÓN EDUCATIVA)
          ==================================================================== */}
      {pantalla === 'JUEGO' && (
        <section className="relative z-20 w-full h-full flex flex-col justify-between px-4 md:px-10 pt-4 pb-10 overflow-y-auto overflow-x-hidden">
          <style>{`
            @keyframes aciertoPulso {
              0% { transform: scale(0.95); box-shadow: 0 0 0px rgba(16,185,129,0); }
              50% { transform: scale(1.04); box-shadow: 0 0 55px rgba(16,185,129,0.9); }
              100% { transform: scale(1.02); box-shadow: 0 0 35px rgba(16,185,129,0.7); }
            }
            @keyframes errorSacudida {
              0%, 100% { transform: translateX(0); }
              20%, 60% { transform: translateX(-10px); }
              40%, 80% { transform: translateX(10px); }
            }
            .anim-acierto { animation: aciertoPulso 0.6s ease-out forwards; }
            .anim-error { animation: errorSacudida 0.45s ease-in-out; }
          `}</style>
          {/* ESFERA PERSISTENTE DEL DM: VIAJA Y SE ENCOGE FLUIDAMENTE DEL CENTRO A LA ESQUINA SUPERIOR IZQUIERDA */}
          {subFaseJuego !== 'FIN_PARTIDA' && (
            <div
              className={`fixed z-30 transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                subFaseJuego === 'JUGADOR_ACTIVO'
                  ? 'top-4 left-5 translate-x-0 translate-y-0 scale-[0.36] origin-top-left'
                  : 'top-[28%] left-1/2 -translate-x-1/2 -translate-y-1/2 scale-100 origin-center'
              }`}
            >
              <OrbeLiquidoReactivo
                colorPrimario={dmPerfil.colorHex}
                colorSecundario={dmPerfil.colorSecundario}
                amplitudVoz={amplitudVozDM}
                tamano={225}
                iconoTipo={subFaseJuego === 'REVELACION_HILO' ? 'estrella' : dmPerfil.iconoTipo}
                etiquetaSuperior={
                  subFaseJuego === 'DM_PREGUNTA'
                    ? retoActual.citaBiblia
                    : `Era ${eraActualNum} • Vuelta ${vueltaNumero}`
                }
                nombreCentral={dmPerfil.nombre}
                enEsquina={false}
                onClick={() => hablarConVozDM(`${retoActual.pregunta}. ${retoActual.instruccionInput}`)}
              />
            </div>
          )}

          {/* ETIQUETA DE ERA ARRIBA A LA IZQUIERDA (SE DESPLAZA AL LADO DE LA ESFERA CUANDO SE RETIRA) */}
          <div
            className={`fixed top-5 z-30 transition-all duration-700 ${
              subFaseJuego === 'JUGADOR_ACTIVO' ? 'left-28' : 'left-6'
            }`}
          >
            <div className="px-4 py-2 rounded-full bg-slate-950/45 backdrop-blur-xl border border-white/35 text-xs font-black tracking-widest uppercase">
              Era {eraActualNum} de 8 • {TITULOS_OCHO_ERAS[eraActualNum - 1].nombre}
            </div>
          </div>

          {/* PARTE SUPERIOR CENTRAL COMPACTA (70% DEL ANCHO) */}
          {subFaseJuego === 'JUGADOR_ACTIVO' && (
            <div className="w-[82vw] md:w-[70vw] mx-auto mt-11 px-5 py-3.5 rounded-3xl bg-slate-950/65 backdrop-blur-2xl border border-white/45 shadow-2xl text-center z-20 animate-[fadeIn_0.5s_ease-out]">
              <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-amber-300/20 border border-amber-300/60 text-amber-200 text-[11px] font-black tracking-widest uppercase mb-1">
                <IconoSagradoSVG tipo="biblia" className="w-3.5 h-3.5" />
                <span>Biblia: {retoActual.citaBiblia}</span>
              </div>
              <h2 className="font-cinzel text-base md:text-xl font-extrabold leading-snug text-white">
                {retoActual.pregunta}
              </h2>
            </div>
          )}

          {/* BANNER EDUCATIVO ANIMADO DE ACIERTO O CORRECCIÓN */}
          {feedbackRespuesta && (
            <div
              className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-8 py-4 rounded-3xl backdrop-blur-3xl border-2 shadow-2xl flex flex-col items-center text-center max-w-lg w-[90vw] ${
                feedbackRespuesta.esCorrecto
                  ? 'bg-emerald-950/90 border-emerald-300 text-emerald-100 anim-acierto'
                  : 'bg-rose-950/90 border-rose-300 text-rose-100 anim-error'
              }`}
            >
              <div className="text-base md:text-xl font-black tracking-wide uppercase">
                {feedbackRespuesta.esCorrecto
                  ? '¡Respuesta Correcta! +Conocimiento Bíblico'
                  : 'Respuesta Incorrecta'}
              </div>
              {!feedbackRespuesta.esCorrecto && feedbackRespuesta.textoCorrecto && (
                <div className="text-xs md:text-sm text-amber-200 font-bold mt-1">
                  Respuesta correcta: «{feedbackRespuesta.textoCorrecto}»
                </div>
              )}
            </div>
          )}

          {/* ESQUINA SUPERIOR DERECHA: HP, ORACIÓN CLARA, HERRAMIENTAS, GUARDAR Y CERRAR */}
          <div className="fixed top-5 right-6 z-30 flex items-center gap-2">
            {notificacionGuardado && (
              <span className="px-3 py-1.5 rounded-full bg-emerald-500/80 text-xs font-black">
                {notificacionGuardado}
              </span>
            )}

            {/* Convicción (HP) */}
            <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-slate-950/50 backdrop-blur-xl border border-white/35">
              <IconoSagradoSVG tipo="hp" className="w-4 h-4 text-cyan-300" />
              <span className="text-[11px] font-black text-amber-200">HP {conviccionHP}/10</span>
            </div>

            {/* Herramienta: Oración con Icono Claro y Texto */}
            <button
              onClick={() => {
                if (tokensOracion <= 0) return;
                setTokensOracion((t) => t - 1);
                setConviccionHP((hp) => Math.min(10, hp + 2));
                sonarAcordeSintetico([523.25, 659.25, 1046.5]);
              }}
              title="Herramienta de Oración (+2 HP)"
              className="px-3.5 py-2 rounded-full bg-amber-400/25 hover:bg-amber-400/45 backdrop-blur-xl border border-amber-300/70 text-xs font-black flex items-center gap-1.5 text-amber-100"
            >
              <IconoSagradoSVG tipo="oracion" className="w-4 h-4 text-amber-200" />
              <span>Oración ({tokensOracion})</span>
            </button>

            {/* Herramienta: Poder del Rol Activo */}
            {subFaseJuego === 'JUGADOR_ACTIVO' && jugadorActivo && !jugadorActivo.poderUsado && (
              <button
                onClick={() => {
                  const copia = jugadores.map((j) =>
                    j.id === jugadorActivo.id ? { ...j, poderUsado: true } : j
                  );
                  if (claseJugadorActivo.id === 'patriarca') {
                    const idxApagado = copia.findIndex((j) => !j.disponible);
                    if (idxApagado !== -1) copia[idxApagado].disponible = true;
                  } else if (retoActual.opciones?.length) {
                    const falsas = retoActual.opciones
                      .filter((o) => !o.correcta)
                      .slice(0, 2)
                      .map((o) => o.id);
                    setOpcionesOcultasIds(falsas);
                  }
                  setJugadores(copia);
                  sonarAcordeSintetico([659.25, 880, 1174.66]);
                }}
                className="px-3.5 py-2 rounded-full bg-purple-500/35 hover:bg-purple-500/55 backdrop-blur-xl border border-purple-300 text-xs font-black flex items-center gap-1.5"
              >
                <IconoSagradoSVG tipo="express" className="w-3.5 h-3.5" />
                <span>{claseJugadorActivo.nombre}</span>
              </button>
            )}

            {/* Botón Pantalla Completa */}
            <button
              onClick={alternarPantallaCompleta}
              title="Pantalla Completa"
              className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-xl border border-white/40 flex items-center justify-center"
            >
              <IconoSagradoSVG tipo="fullscreen" className="w-4 h-4" />
            </button>

            {/* Botón Guardar */}
            <button
              onClick={guardarPartidaActual}
              title="Guardar Partida"
              className="px-3.5 py-2 rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-xl border border-white/40 text-xs font-black flex items-center gap-1.5"
            >
              <IconoSagradoSVG tipo="guardar" className="w-3.5 h-3.5" />
              <span>Guardar</span>
            </button>

            {/* Botón Cerrar */}
            <button
              onClick={() => {
                window.speechSynthesis?.cancel();
                setPantalla('MENU_PRINCIPAL');
              }}
              title="Cerrar y salir al Menú Principal"
              className="w-9 h-9 rounded-full bg-rose-500/30 hover:bg-rose-500/55 backdrop-blur-xl border border-rose-300/60 flex items-center justify-center"
            >
              <IconoSagradoSVG tipo="cerrar" className="w-4 h-4" />
            </button>
          </div>

          {/* ================================================================
              NÚCLEO CENTRAL DE LA PANTALLA SEGÚN LA SUB-FASE DEL TURNO
              ================================================================ */}
          <main className="my-auto w-full max-w-5xl mx-auto flex flex-col items-center justify-center gap-6">
            {/* SUB-FASE 1: INTRODUCCIÓN DEL DM Y CONFIRMACIÓN DE INICIO */}
            {subFaseJuego === 'INTRO_HISTORIA' && (
              <div className="flex flex-col items-center gap-6 text-center max-w-2xl w-full mt-52">
                <div className="w-full min-h-[140px] p-6 rounded-3xl bg-slate-950/55 backdrop-blur-2xl border border-white/40 shadow-2xl flex items-center justify-center">
                  {cargandoVozDM ? (
                    renderizarEstadoPensandoDM()
                  ) : (
                    <p className="text-sm md:text-base text-white/95 leading-relaxed">
                      {textoSincronizadoDM}
                      {hablandoDM && (
                        <span className="inline-block w-2 h-4 ml-1 align-middle bg-amber-300 animate-pulse" />
                      )}
                    </p>
                  )}
                </div>

                {!cargandoVozDM && (
                  <div className="flex flex-wrap items-center justify-center gap-4 animate-[fadeIn_0.4s_ease-out]">
                    <button
                      onClick={() => concederPermisoYPrepararReto(1, 0)}
                      className="px-10 py-4 rounded-full bg-white/25 hover:bg-white/40 backdrop-blur-2xl border border-white/80 font-black text-sm tracking-widest uppercase shadow-[0_0_35px_rgba(255,255,255,0.5)] hover:scale-105 transition-all"
                    >
                      Comenzar Partida
                    </button>

                    <button
                      onPointerDown={iniciarEscuchaPushToTalk}
                      onPointerUp={soltarEscuchaPushToTalk}
                      className={`px-7 py-4 rounded-full backdrop-blur-2xl border font-black text-xs tracking-wider uppercase transition-all flex items-center gap-2 ${
                        manteniendoMic
                          ? 'bg-emerald-400 text-slate-950 border-white scale-105 shadow-[0_0_35px_#34d399]'
                          : 'bg-slate-950/45 border-white/40 text-white'
                      }`}
                    >
                      <IconoSagradoSVG tipo="mic" className="w-4 h-4" />
                      <span>{manteniendoMic ? 'Escuchando...' : 'Confirmar con Voz'}</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* SUB-FASE 2: EL DM PREGUNTA QUIÉN VA A JUGAR Y MUESTRA LOS CÍRCULOS DE JUGADORES */}
            {(subFaseJuego === 'ELEGIR_JUGADOR' || subFaseJuego === 'ANIMACION_DESVANECER_OTROS') && (
              <div className="flex flex-col items-center gap-7 text-center max-w-2xl w-full mt-52">
                <div className="w-full min-h-[120px] p-5 rounded-3xl bg-slate-950/50 backdrop-blur-2xl border border-white/35 shadow-2xl flex items-center justify-center">
                  {cargandoVozDM || cargandoRetoIA ? (
                    renderizarEstadoPensandoDM()
                  ) : (
                    <p className="font-cinzel text-lg md:text-2xl font-extrabold tracking-tight text-white drop-shadow-lg">
                      {textoSincronizadoDM || '¿Quién tomará el desafío en este turno?'}
                      {hablandoDM && (
                        <span className="inline-block w-2 h-4 ml-1 align-middle bg-amber-300 animate-pulse" />
                      )}
                    </p>
                  )}
                </div>

                {!cargandoVozDM && !cargandoRetoIA && (
                  <div className="flex flex-wrap items-center justify-center gap-5 animate-[fadeIn_0.4s_ease-out]">
                    {jugadores.map((jug) => {
                      const clase = CLASES_ROLES[jug.rolIdx];
                      const fueElegido = jugadorActivoId === jug.id;
                      const desvanecer =
                        subFaseJuego === 'ANIMACION_DESVANECER_OTROS' && !fueElegido;

                      return (
                        <button
                          key={jug.id}
                          disabled={!jug.disponible || subFaseJuego === 'ANIMACION_DESVANECER_OTROS'}
                          onClick={() => elegirJugadorParaElTurno(jug)}
                          style={{
                            backgroundColor: jug.disponible ? `${clase.color}33` : 'rgba(15,23,42,0.45)',
                            borderColor: jug.disponible ? clase.color : 'rgba(148,163,184,0.25)',
                            boxShadow: jug.disponible ? `0 0 28px ${clase.color}66` : 'none'
                          }}
                          className={`w-28 h-28 md:w-32 md:h-32 rounded-full backdrop-blur-2xl border-2 flex flex-col items-center justify-center p-2 transition-all duration-700 ${
                            desvanecer
                              ? 'scale-0 opacity-0 pointer-events-none'
                              : fueElegido
                              ? 'scale-125 ring-4 ring-white'
                              : jug.disponible
                              ? 'hover:scale-110 cursor-pointer'
                              : 'grayscale opacity-35 cursor-not-allowed'
                          }`}
                        >
                          <IconoSagradoSVG tipo={clase.iconoTipo} className="w-7 h-7 mb-1.5 text-white" />
                          <span className="font-black text-xs md:text-sm leading-tight truncate max-w-full">
                            {jug.nombre}
                          </span>
                          <span className="text-[10px] font-bold text-white/80 mt-0.5">
                            {jug.disponible ? clase.nombre.replace('El ', '') : 'En espera'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* SUB-FASE 3: EL DM ENUNCIA LA PREGUNTA PALABRA POR PALABRA ANTES DE RETIRARSE A LA ESQUINA */}
            {subFaseJuego === 'DM_PREGUNTA' && (
              <div className="flex flex-col items-center gap-6 text-center max-w-2xl w-full mt-52">
                <div className="w-full min-h-[165px] p-6 rounded-3xl bg-slate-950/55 backdrop-blur-2xl border border-white/40 shadow-2xl flex flex-col items-center justify-center">
                  {cargandoVozDM ? (
                    renderizarEstadoPensandoDM()
                  ) : (
                    <>
                      <div className="inline-flex items-center gap-2 px-3.5 py-0.5 rounded-full bg-amber-300/20 border border-amber-300/60 text-amber-200 text-[11px] font-black tracking-widest uppercase mb-2">
                        <IconoSagradoSVG tipo="biblia" className="w-3.5 h-3.5" />
                        <span>{retoActual.citaBiblia}</span>
                      </div>
                      <h3 className="font-cinzel text-lg md:text-xl font-black text-amber-200 mb-2">
                        {retoActual.tituloNodo}
                      </h3>
                      <p className="text-sm md:text-base text-white/95 leading-relaxed">
                        {textoSincronizadoDM}
                        {hablandoDM && (
                          <span className="inline-block w-2 h-4 ml-1 align-middle bg-cyan-300 animate-pulse" />
                        )}
                      </p>
                    </>
                  )}
                </div>

                {!cargandoVozDM && !hablandoDM && (
                  <button
                    onClick={() => setSubFaseJuego('JUGADOR_ACTIVO')}
                    className="px-8 py-3 rounded-full bg-white/25 hover:bg-white/40 backdrop-blur-xl border border-white/60 text-xs font-black uppercase tracking-widest animate-[fadeIn_0.3s_ease-out]"
                  >
                    Resolver Ahora →
                  </button>
                )}
              </div>
            )}

            {/* SUB-FASE 4: ORBE COMPACTO + DESAFÍOS MULTIMODALES VARIADOS CON ANIMACIÓN */}
            {subFaseJuego === 'JUGADOR_ACTIVO' && jugadorActivo && (
              <div className="w-full flex flex-col items-center gap-3.5 pb-6">
                <OrbeLiquidoReactivo
                  colorPrimario={claseJugadorActivo.color}
                  colorSecundario="#ffffff"
                  amplitudVoz={amplitudVozJugador}
                  tamano={105}
                  iconoTipo={claseJugadorActivo.iconoTipo}
                  etiquetaSuperior={claseJugadorActivo.nombre}
                  nombreCentral={jugadorActivo.nombre}
                />

                {/* MECÁNICA 1 y 2: SELECCIÓN MÚLTIPLE O COMPLETAR VERSÍCULO */}
                {(retoActual.tipoMecanica === 'SELECCION_MULTIPLE' ||
                  retoActual.tipoMecanica === 'COMPLETAR_VERSICULO') && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-4xl">
                    {retoActual.opciones?.map((op) => {
                      const oculta = opcionesOcultasIds.includes(op.id);
                      const fueTocada = feedbackRespuesta?.idSeleccionado === op.id;
                      const mostrarComoCorrecta = feedbackRespuesta && op.correcta;
                      const mostrarComoError = feedbackRespuesta && fueTocada && !op.correcta;

                      return (
                        <button
                          key={op.id}
                          disabled={oculta || Boolean(feedbackRespuesta)}
                          onClick={() =>
                            completarTurnoYDevolverControlAlDM(op.correcta, '', op.id)
                          }
                          className={`p-3.5 md:p-4 rounded-3xl backdrop-blur-2xl border-2 text-left flex items-center gap-3.5 transition-all duration-300 ${
                            oculta
                              ? 'opacity-15 pointer-events-none grayscale bg-black/20 border-white/10'
                              : mostrarComoCorrecta
                              ? 'bg-emerald-500/40 border-emerald-300 anim-acierto'
                              : mostrarComoError
                              ? 'bg-rose-500/45 border-rose-300 anim-error'
                              : 'bg-slate-950/60 hover:bg-white/20 border-white/40 hover:border-white'
                          }`}
                        >
                          <span className="w-10 h-10 rounded-2xl bg-white/15 border border-white/35 flex items-center justify-center shrink-0 text-amber-200">
                            <IconoSagradoSVG tipo="opcion" className="w-5 h-5" />
                          </span>
                          <div>
                            <div className="font-black text-sm md:text-base text-white leading-tight">
                              {op.titulo}
                            </div>
                            {op.subtitulo && (
                              <div className="text-xs text-white/80 leading-snug mt-0.5">
                                {op.subtitulo}
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* MECÁNICA 3: VERDADERO O FALSO BÍBLICO */}
                {retoActual.tipoMecanica === 'VERDADERO_FALSO' && (
                  <div className="grid grid-cols-2 gap-4 w-full max-w-2xl">
                    {retoActual.opciones?.map((op) => {
                      const mostrarComoCorrecta = feedbackRespuesta && op.correcta;
                      const mostrarComoError =
                        feedbackRespuesta &&
                        feedbackRespuesta.idSeleccionado === op.id &&
                        !op.correcta;

                      return (
                        <button
                          key={op.id}
                          disabled={Boolean(feedbackRespuesta)}
                          onClick={() =>
                            completarTurnoYDevolverControlAlDM(op.correcta, '', op.id)
                          }
                          className={`p-6 rounded-3xl backdrop-blur-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                            mostrarComoCorrecta
                              ? 'bg-emerald-500/45 border-emerald-300 anim-acierto'
                              : mostrarComoError
                              ? 'bg-rose-500/45 border-rose-300 anim-error'
                              : 'bg-slate-950/60 hover:bg-white/25 border-white/45 hover:scale-105'
                          }`}
                        >
                          <span className="font-cinzel text-xl md:text-2xl font-black tracking-wider uppercase text-amber-200">
                            {op.titulo}
                          </span>
                          <span className="text-xs text-white/85 text-center">{op.subtitulo}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* MECÁNICA 4: ORDENAR SECUENCIA CRONOLÓGICA / BÍBLICA */}
                {retoActual.tipoMecanica === 'ORDENAR_SECUENCIA' && (
                  <div className="flex flex-col items-center gap-3 w-full max-w-3xl">
                    <span className="text-xs font-extrabold uppercase tracking-widest text-amber-200">
                      Toca las tarjetas en el orden correcto (1º a {retoActual.opciones?.length || 4}º)
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                      {retoActual.opciones?.map((op) => {
                        const posElegida = ordenElegidoIds.indexOf(op.id);
                        const yaElegida = posElegida !== -1;

                        return (
                          <button
                            key={op.id}
                            disabled={yaElegida || Boolean(feedbackRespuesta)}
                            onClick={() => {
                              const nuevoOrden = [...ordenElegidoIds, op.id];
                              setOrdenElegidoIds(nuevoOrden);
                              sonarAcordeSintetico([440 + nuevoOrden.length * 110], 0.25);

                              if (nuevoOrden.length === retoActual.opciones.length) {
                                const esOrdenCorrecto = nuevoOrden.every((idSel, idx) => {
                                  const item = retoActual.opciones.find((o) => o.id === idSel);
                                  return item && Number(item.ordenCorrecto) === idx + 1;
                                });
                                completarTurnoYDevolverControlAlDM(esOrdenCorrecto, '', op.id);
                              }
                            }}
                            className={`p-3.5 rounded-3xl backdrop-blur-2xl border-2 text-left flex items-center gap-3.5 transition-all ${
                              yaElegida
                                ? 'bg-amber-400/30 border-amber-300 scale-[0.98]'
                                : 'bg-slate-950/60 hover:bg-white/20 border-white/40'
                            }`}
                          >
                            <span className="w-9 h-9 rounded-full bg-white/20 border border-white/50 flex items-center justify-center font-black text-sm text-amber-200 shrink-0">
                              {yaElegida ? `${posElegida + 1}º` : '?'}
                            </span>
                            <div>
                              <div className="font-black text-sm text-white">{op.titulo}</div>
                              {op.subtitulo && (
                                <div className="text-xs text-white/75">{op.subtitulo}</div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    {ordenElegidoIds.length > 0 && !feedbackRespuesta && (
                      <button
                        onClick={() => setOrdenElegidoIds([])}
                        className="px-4 py-1.5 rounded-full bg-white/15 border border-white/30 text-xs font-bold"
                      >
                        Reiniciar Orden
                      </button>
                    )}
                  </div>
                )}

                {/* MECÁNICA B: CAMINATA FÍSICA CON CONTADOR DE PASOS Y GIROSCOPIO */}
                {retoActual.tipoMecanica === 'CAMINATA_PEREGRINAJE' && (
                  <div className="p-6 rounded-3xl bg-slate-950/55 backdrop-blur-2xl border border-white/45 max-w-xl w-full text-center flex flex-col items-center gap-4">
                    <div className="text-xs font-black tracking-widest uppercase text-cyan-200 flex items-center gap-2">
                      <IconoSagradoSVG tipo="pasos" className="w-4 h-4" />
                      <span>Contador de Pasos y Movimiento Activo</span>
                    </div>
                    <div className="text-3xl font-black">
                      {pasosCaminados} / {retoActual.pasosObjetivo || 12} Pasos
                    </div>
                    <div className="w-full h-3 rounded-full bg-white/15 overflow-hidden border border-white/30">
                      <div
                        style={{
                          width: `${Math.min(100, (pasosCaminados / (retoActual.pasosObjetivo || 12)) * 100)}%`,
                          backgroundColor: claseJugadorActivo.color
                        }}
                        className="h-full transition-all duration-300"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          const nuevo = pasosCaminados + 2;
                          setPasosCaminados(nuevo);
                          if (nuevo >= (retoActual.pasosObjetivo || 12)) {
                            completarTurnoYDevolverControlAlDM(
                              true,
                              `¡Peregrinaje completado con fe por ${jugadorActivo.nombre}!`
                            );
                          }
                        }}
                        className="px-6 py-2.5 rounded-full bg-white/20 hover:bg-white/35 border border-white/50 text-xs font-black"
                      >
                        Registrar Paso (+2)
                      </button>
                      {pasosCaminados >= (retoActual.pasosObjetivo || 12) && (
                        <button
                          onClick={() => completarTurnoYDevolverControlAlDM(true)}
                          className="px-6 py-2.5 rounded-full bg-emerald-400 text-slate-950 text-xs font-black"
                        >
                          Completar Recorrido
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* MECÁNICA C: ESCANEO DE LA BIBLIA FÍSICA CON CÁMARA */}
                {retoActual.tipoMecanica === 'CAMARA_ESCRITURA' && (
                  <div className="p-5 rounded-3xl bg-slate-950/55 backdrop-blur-2xl border border-white/45 max-w-xl w-full text-center flex flex-col items-center gap-4">
                    {!camaraActiva ? (
                      <button
                        onClick={abrirCamaraBiblia}
                        className="px-8 py-4 rounded-full bg-cyan-400/30 hover:bg-cyan-400/50 border border-cyan-200 font-black text-sm tracking-wider uppercase shadow-[0_0_30px_rgba(34,211,238,0.45)] flex items-center gap-2.5"
                      >
                        <IconoSagradoSVG tipo="camara" className="w-5 h-5" />
                        <span>Activar Cámara para Verificar {retoActual.citaBiblia}</span>
                      </button>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <video
                          ref={videoCamaraRef}
                          autoPlay
                          playsInline
                          className="w-64 h-44 object-cover rounded-2xl border-2 border-cyan-300"
                        />
                        <button
                          onClick={capturarYVerificarBiblia}
                          disabled={evaluandoIA}
                          className="px-8 py-3 rounded-full bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-widest"
                        >
                          {evaluandoIA ? 'Verificando con IA...' : 'Capturar y Verificar Escritura'}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* BOTÓN DEDICADO DE MICRÓFONO PUSH-TO-TALK */}
                <div className="flex flex-col items-center gap-2">
                  {transcripcionVoz && (
                    <div className="px-4 py-1.5 rounded-full bg-slate-950/60 border border-white/30 text-xs text-cyan-200 max-w-lg truncate">
                      «{transcripcionVoz}»
                    </div>
                  )}
                  <button
                    onPointerDown={iniciarEscuchaPushToTalk}
                    onPointerUp={soltarEscuchaPushToTalk}
                    disabled={evaluandoIA}
                    className={`px-8 py-3.5 rounded-full backdrop-blur-2xl border-2 font-black text-xs tracking-widest uppercase transition-all flex items-center gap-2.5 ${
                      manteniendoMic
                        ? 'bg-rose-500 border-white text-white scale-110 shadow-[0_0_40px_#f43f5e]'
                        : 'bg-white/20 hover:bg-white/30 border-white/60 text-white shadow-lg'
                    }`}
                  >
                    <IconoSagradoSVG tipo="mic" className="w-4 h-4" />
                    <span>
                      {evaluandoIA
                        ? 'Evaluando con Gemini...'
                        : manteniendoMic
                        ? 'Escuchando... Suelta para enviar'
                        : 'Mantén presionado para responder con voz'}
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* SUB-FASE 5: REVELACIÓN DEL HILO DORADO CON EL DM EN EL CENTRO */}
            {subFaseJuego === 'REVELACION_HILO' && (
              <div className="flex flex-col items-center gap-6 text-center max-w-2xl w-full mt-52">
                <div className="w-full min-h-[150px] p-6 rounded-3xl bg-slate-950/55 backdrop-blur-2xl border border-amber-300/60 shadow-[0_0_45px_rgba(251,191,36,0.3)] flex items-center justify-center">
                  {cargandoVozDM ? (
                    renderizarEstadoPensandoDM('Desvelando el Hilo Dorado de la revelación...')
                  ) : (
                    <p className="text-sm md:text-base text-white/95 leading-relaxed">
                      {textoSincronizadoDM}
                      {hablandoDM && (
                        <span className="inline-block w-2 h-4 ml-1 align-middle bg-amber-300 animate-pulse" />
                      )}
                    </p>
                  )}
                </div>
                {!cargandoVozDM && !hablandoDM && (
                  <button
                    onClick={avanzarAlSiguienteNodoOEra}
                    className="px-10 py-4 rounded-full bg-gradient-to-r from-amber-300 to-cyan-300 text-slate-950 font-black text-sm tracking-widest uppercase shadow-2xl hover:scale-105 transition-all animate-[fadeIn_0.35s_ease-out]"
                  >
                    Continuar al Siguiente Desafío →
                  </button>
                )}
              </div>
            )}

            {/* SUB-FASE 6: GRAN FINAL DE LAS 8 ERAS */}
            {subFaseJuego === 'FIN_PARTIDA' && (
              <div className="flex flex-col items-center gap-6 text-center max-w-2xl">
                <OrbeLiquidoReactivo
                  colorPrimario="#facc15"
                  colorSecundario="#38bdf8"
                  amplitudVoz={0.6}
                  tamano={240}
                  iconoTipo="rey"
                  etiquetaSuperior="Revelación 10:7"
                  nombreCentral="¡Secreto Sagrado Terminado!"
                />
                <div className="p-7 rounded-3xl bg-slate-950/55 backdrop-blur-2xl border border-white/50 shadow-2xl">
                  <h2 className="font-cinzel text-2xl md:text-4xl font-black text-amber-200 mb-3">
                    ¡Victoria del Reino Mesiánico!
                  </h2>
                  <p className="text-sm md:text-base text-white/90 leading-relaxed">
                    Han recorrido en unidad las 8 Eras bíblicas verificando en su Biblia física cómo Jehová cumplió cada promesa desde Génesis 3:15 hasta el Paraíso restaurado de Revelación.
                  </p>
                </div>
                <button
                  onClick={() => setPantalla('MENU_PRINCIPAL')}
                  className="px-10 py-4 rounded-full bg-white text-slate-950 font-black text-xs tracking-widest uppercase"
                >
                  Volver al Menú Principal
                </button>
              </div>
            )}
          </main>

          <div className="h-2" />
        </section>
      )}
    </div>
  );
}