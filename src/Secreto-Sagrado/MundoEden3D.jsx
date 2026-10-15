// src/Secreto-Sagrado/MundoEden3D.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';

/* ==========================================================================
   CARGADOR DINÁMICO DE THREE.JS
   ========================================================================== */
function cargarThreeJS() {
  return new Promise((resolve, reject) => {
    if (window.THREE) {
      resolve(window.THREE);
      return;
    }
    const existente = document.getElementById('threejs-cdn-script');
    if (existente) {
      existente.addEventListener('load', () => resolve(window.THREE));
      return;
    }
    const script = document.createElement('script');
    script.id = 'threejs-cdn-script';
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    script.async = true;
    script.onload = () => resolve(window.THREE);
    script.onerror = (e) => reject(e);
    document.head.appendChild(script);
  });
}

/* ==========================================================================
   MUNDO 1: EL JARDÍN DE EDÉN (EXPERIENCIA NARRATIVA 3D SIN HUD)
   ========================================================================== */
export default function MundoEden3D({ hablarConVozDM, onCompletar }) {
  // Fases: EXPLORACION -> DIALOGO_SERPIENTE -> EVA_COMIENDO -> DESTELLO_BLANCO -> EXPULSION_QUERUBINES -> CORTE_NEGRO
  const [faseHistoria, setFaseHistoria] = useState('EXPLORACION');
  const [mostrarOpcionSerpiente, setMostrarOpcionSerpiente] = useState(false);
  const [pasoDialogoSerpiente, setPasoDialogoSerpiente] = useState(0); // 0: no iniciado, 1: pregunta serpiente, 2: respondido
  const [intensidadDestello, setIntensidadDestello] = useState(0);
  const [corteNegro, setCorteNegro] = useState(false);

  // Controles de Joysticks
  const [joyIzqPos, setJoyIzqPos] = useState({ x: 0, y: 0 });
  const [joyDerPos, setJoyDerPos] = useState({ x: 0, y: 0 });

  const contenedorRef = useRef(null);
  const camaraRef = useRef(null);
  const movRef = useRef({ avanzar: 0, lateral: 0, yaw: 0, pitch: 0 });
  const orientacionBaseRef = useRef(null);

  // Referencias de estado para el bucle 60 FPS
  const faseRef = useRef('EXPLORACION');
  const tiempoExploradoRef = useRef(0);
  const yaHabloSerpienteRef = useRef(false);
  const listoParaEvaRef = useRef(false);
  const secuenciaEvaIniciadaRef = useRef(false);

  // Grupos 3D dinámicos
  const grupoJardinInteriorRef = useRef(null);
  const grupoEvaArbustosRef = useRef(null);
  const brazoEvaRef = useRef(null);
  const grupoExteriorExpulsionRef = useRef(null);
  const espadaGiratoriaRef = useRef(null);

  useEffect(() => {
    faseRef.current = faseHistoria;
  }, [faseHistoria]);

  /* ==========================================================================
     SECUENCIA CINEMATOGRÁFICA: EVA -> RESPLANDOR -> EXPULSIÓN -> GÉNESIS 3:15
     ========================================================================== */
  const dispararSecuenciaMordiscoYExpulsion = useCallback(() => {
    if (secuenciaEvaIniciadaRef.current) return;
    secuenciaEvaIniciadaRef.current = true;
    setFaseHistoria('EVA_COMIENDO');
    setMostrarOpcionSerpiente(false);

    // Mostrar a Eva junto al árbol cubierta por los arbustos floridos
    if (grupoEvaArbustosRef.current) {
      grupoEvaArbustosRef.current.visible = true;
    }

    // Tras 3.2 segundos viendo a Eva comer del fruto, inicia el resplandor intenso desde el árbol
    setTimeout(() => {
      setFaseHistoria('DESTELLO_BLANCO');
      setIntensidadDestello(1);

      const locucionInicio = 'Y así fue como todo comenzó.';
      const pasarAExpulsion = () => {
        // Cambiar el escenario 3D al exterior del Jardín con Adán, Eva y los 3 Querubines + Espada
        if (grupoJardinInteriorRef.current) grupoJardinInteriorRef.current.visible = false;
        if (grupoExteriorExpulsionRef.current) grupoExteriorExpulsionRef.current.visible = true;

        if (camaraRef.current) {
          camaraRef.current.position.set(0, 3.3, 18);
          camaraRef.current.rotation.set(0, 0, 0);
        }

        setFaseHistoria('EXPULSION_QUERUBINES');
        setTimeout(() => setIntensidadDestello(0), 300);

        // Narración final de Génesis 3:15 y corte a negro
        setTimeout(() => {
          const textoGenesis315 =
            'Pondré enemistad entre tú y la mujer, y entre tu descendencia y la descendencia de ella. Él te aplastará la cabeza y tú le herirás el talón. De modo que ese día nació un secreto que tardaría miles de años en revelarse por completo: el secreto sagrado.';

          if (hablarConVozDM) {
            hablarConVozDM(textoGenesis315, () => {
              setCorteNegro(true);
              setFaseHistoria('CORTE_NEGRO');
              setTimeout(() => {
                if (onCompletar) onCompletar();
              }, 1800);
            });
          } else {
            setTimeout(() => {
              setCorteNegro(true);
              setTimeout(() => onCompletar && onCompletar(), 1800);
            }, 9000);
          }
        }, 900);
      };

      if (hablarConVozDM) {
        hablarConVozDM(locucionInicio, pasarAExpulsion);
      } else {
        setTimeout(pasarAExpulsion, 3200);
      }
    }, 3400);
  }, [hablarConVozDM, onCompletar]);

  /* ==========================================================================
     RESPUESTA DEL JUGADOR A LA SERPIENTE (BIBLIA DE ESTUDIO GÉNESIS 3:2-5)
     ========================================================================== */
  const responderALaSerpiente = () => {
    setMostrarOpcionSerpiente(false);
    setPasoDialogoSerpiente(2);

    const dialogoBiblico =
      'Podemos comer del fruto de los árboles del jardín. Pero del fruto del árbol que está en medio del jardín, Dios ha dicho: No coman de él, no, ni lo toquen; de lo contrario, morirán. Entonces la serpiente dijo: De ningún modo morirán. Porque Dios sabe que en el mismo día que coman de él se les abrirán los ojos y serán como Dios: conocerán lo bueno y lo malo.';

    if (hablarConVozDM) {
      hablarConVozDM(dialogoBiblico, () => {
        listoParaEvaRef.current = true;
      });
    } else {
      setTimeout(() => {
        listoParaEvaRef.current = true;
      }, 4000);
    }
  };

  /* ==========================================================================
     CONSTRUCCIÓN DEL MUNDO 3D EN THREE.JS (ESTILO VOYAGER + ILUSTRACIONES EDÉN)
     ========================================================================== */
  useEffect(() => {
    let cancelado = false;
    let rafId = null;
    let renderer = null;

    cargarThreeJS().then((THREE) => {
      if (cancelado || !contenedorRef.current) return;

      const contenedor = contenedorRef.current;
      contenedor.innerHTML = '';

      const width = window.innerWidth;
      const height = window.innerHeight;

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x88d4f7);
      scene.fog = new THREE.FogExp2(0xbbe6fb, 0.0045);

      const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 450);
      // Posición inicial mirando hacia la laguna de los elefantes, las cascadas y la colina del árbol
      camera.position.set(0, 3.4, 28);
      camera.rotation.order = 'YXZ';
      camaraRef.current = camera;

      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      contenedor.appendChild(renderer.domElement);

      // Iluminación Cálida Estilizada (Referencia Voyager)
      const hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x3f6212, 0.95);
      scene.add(hemiLight);

      const dirLight = new THREE.DirectionalLight(0xfffbeb, 1.35);
      dirLight.position.set(45, 75, 35);
      dirLight.castShadow = true;
      dirLight.shadow.mapSize.width = 2048;
      dirLight.shadow.mapSize.height = 2048;
      scene.add(dirLight);

      const animadores = [];
      const grupoInterior = new THREE.Group();
      scene.add(grupoInterior);
      grupoJardinInteriorRef.current = grupoInterior;

      // Materiales estilizados suaves (Voyager / Cel-Shaded)
      const matPasto = new THREE.MeshStandardMaterial({ color: 0x4d9b36, roughness: 0.85 });
      const matColina = new THREE.MeshStandardMaterial({ color: 0x65b741, roughness: 0.8 });
      const matRoca = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.75, flatShading: true });
      const matRocaCascada = new THREE.MeshStandardMaterial({ color: 0xa8a29e, roughness: 0.7, flatShading: true });
      const matTronco = new THREE.MeshStandardMaterial({ color: 0x6b4423, roughness: 0.85 });
      const matAguaLaguna = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        roughness: 0.12,
        metalness: 0.25,
        transparent: true,
        opacity: 0.86
      });

      // 1. Suelo Verde Exuberante + Laguna Turquesa Central + Ríos
      const suelo = new THREE.Mesh(new THREE.CircleGeometry(190, 64), matPasto);
      suelo.rotation.x = -Math.PI / 2;
      suelo.receiveShadow = true;
      grupoInterior.add(suelo);

      const laguna = new THREE.Mesh(new THREE.CircleGeometry(28, 48), matAguaLaguna);
      laguna.rotation.x = -Math.PI / 2;
      laguna.position.set(2, 0.08, -6);
      grupoInterior.add(laguna);

      // 2. Nubes Volumétricas Estilizadas (Estilo Voyager)
      const matNube = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.9,
        emissive: 0xfef9c3,
        emissiveIntensity: 0.15
      });
      for (let n = 0; n < 18; n++) {
        const grupoNube = new THREE.Group();
        const cantBolas = 4 + (n % 4);
        for (let b = 0; b < cantBolas; b++) {
          const bola = new THREE.Mesh(
            new THREE.SphereGeometry(4.5 + (b % 3) * 2.2, 16, 16),
            matNube
          );
          bola.position.set(b * 4.2 - 6, (b % 2) * 1.5, (b % 3) * 1.8);
          bola.scale.y = 0.62;
          grupoNube.add(bola);
        }
        const ang = (n / 18) * Math.PI * 2;
        const dist = 85 + (n % 3) * 25;
        grupoNube.position.set(Math.cos(ang) * dist, 38 + (n % 4) * 6, Math.sin(ang) * dist);
        grupoInterior.add(grupoNube);
        animadores.push((t) => {
          grupoNube.position.x += Math.sin(t * 0.1 + n) * 0.015;
        });
      }

      // 3. Montañas de Fondo y Gran Cascada Escalonada (Como en las 3 Ilustraciones)
      const acantiladoFondo = new THREE.Mesh(
        new THREE.BoxGeometry(85, 42, 26),
        matRocaCascada
      );
      acantiladoFondo.position.set(12, 21, -78);
      grupoInterior.add(acantiladoFondo);

      // Terraza intermedia de cascada (Ilustración 2 y 3)
      const terrazaCascada = new THREE.Mesh(
        new THREE.BoxGeometry(54, 7.5, 18),
        matRocaCascada
      );
      terrazaCascada.position.set(0, 3.75, -34);
      grupoInterior.add(terrazaCascada);

      // Cortinas de agua animadas (Cascada alta y cascada baja)
      const matCascada = new THREE.MeshBasicMaterial({
        color: 0xe0f2fe,
        transparent: true,
        opacity: 0.85
      });
      const cortinaAlta = new THREE.Mesh(new THREE.PlaneGeometry(26, 40), matCascada);
      cortinaAlta.position.set(12, 21, -64.8);
      grupoInterior.add(cortinaAlta);

      const cortinaBaja = new THREE.Mesh(new THREE.PlaneGeometry(38, 7.6), matCascada);
      cortinaBaja.position.set(0, 3.8, -24.8);
      grupoInterior.add(cortinaBaja);

      // Espuma en la base de las cascadas
      const espumaBaja = [];
      for (let e = 0; e < 16; e++) {
        const bolaEspuma = new THREE.Mesh(
          new THREE.SphereGeometry(1.1 + (e % 3) * 0.4, 12, 12),
          matNube
        );
        bolaEspuma.position.set(-18 + e * 2.4, 0.4, -24.2);
        grupoInterior.add(bolaEspuma);
        espumaBaja.push(bolaEspuma);
      }
      animadores.push((t) => {
        espumaBaja.forEach((b, i) => {
          const esc = 0.85 + Math.sin(t * 5 + i) * 0.25;
          b.scale.set(esc, esc, esc);
        });
      });

      // Cordilleras perimetrales suaves
      for (let m = 0; m < 26; m++) {
        const ang = (m / 26) * Math.PI * 2;
        const radioDist = 125 + (m % 3) * 18;
        const montana = new THREE.Mesh(
          new THREE.ConeGeometry(26 + (m % 4) * 8, 36 + (m % 5) * 10, 9),
          new THREE.MeshStandardMaterial({
            color: m % 2 === 0 ? 0x4ade80 : 0x22c55e,
            roughness: 0.9,
            flatShading: true
          })
        );
        montana.position.set(Math.cos(ang) * radioDist, 16, Math.sin(ang) * radioDist);
        grupoInterior.add(montana);
      }

      // 4. Colina Esmeralda y el ÁRBOL DEL CONOCIMIENTO que Pulsa con Luz (Ilustración 3)
      const POS_ARBOL = { x: -4, y: 4.2, z: -42 };
      const colinaArbol = new THREE.Mesh(
        new THREE.CylinderGeometry(14, 22, 4.4, 32),
        matColina
      );
      colinaArbol.position.set(POS_ARBOL.x, 2.1, POS_ARBOL.z);
      grupoInterior.add(colinaArbol);

      const grupoArbolProhibido = new THREE.Group();
      grupoArbolProhibido.position.set(POS_ARBOL.x, POS_ARBOL.y, POS_ARBOL.z);
      grupoInterior.add(grupoArbolProhibido);

      // Tronco robusto con raíces y ramas abiertas
      const troncoPrincipal = new THREE.Mesh(
        new THREE.CylinderGeometry(1.1, 1.9, 6.5, 12),
        matTronco
      );
      troncoPrincipal.position.y = 3.2;
      grupoArbolProhibido.add(troncoPrincipal);

      // Gran copa frondosa extendida (como el árbol en la colina de tu 4ª imagen)
      const matCopaLuz = new THREE.MeshStandardMaterial({
        color: 0x4ade80,
        emissive: 0xfacc15,
        emissiveIntensity: 0.35,
        roughness: 0.45
      });
      const posicionesCopa = [
        [0, 7.8, 0, 5.2],
        [-3.8, 6.8, 1.2, 3.8],
        [3.8, 6.8, 1.2, 3.8],
        [-2.5, 7.2, -2.5, 3.6],
        [2.5, 7.2, -2.5, 3.6],
        [0, 6.5, 2.8, 3.5]
      ];
      posicionesCopa.forEach(([cx, cy, cz, cr]) => {
        const follaje = new THREE.Mesh(new THREE.SphereGeometry(cr, 18, 18), matCopaLuz);
        follaje.position.set(cx, cy, cz);
        follaje.scale.y = 0.72;
        grupoArbolProhibido.add(follaje);
      });

      // Frutos prohibidos brillantes en las ramas
      const matFruto = new THREE.MeshStandardMaterial({
        color: 0xef4444,
        emissive: 0xf59e0b,
        emissiveIntensity: 0.7,
        roughness: 0.2
      });
      for (let f = 0; f < 18; f++) {
        const ang = (f / 18) * Math.PI * 2;
        const radioF = 2.8 + (f % 3) * 1.4;
        const fruto = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 12), matFruto);
        fruto.position.set(
          Math.cos(ang) * radioF,
          5.3 + (f % 3) * 0.7,
          Math.sin(ang) * radioF
        );
        grupoArbolProhibido.add(fruto);
      }

      // Luz pulsante del Árbol
      const luzPulsoArbol = new THREE.PointLight(0xfef08a, 2.8, 32);
      luzPulsoArbol.position.set(0, 6.5, 2);
      grupoArbolProhibido.add(luzPulsoArbol);

      const haloArbol = new THREE.Mesh(
        new THREE.SphereGeometry(6.8, 24, 24),
        new THREE.MeshBasicMaterial({
          color: 0xfef08a,
          transparent: true,
          opacity: 0.18
        })
      );
      haloArbol.position.y = 6.8;
      grupoArbolProhibido.add(haloArbol);

      // La Serpiente en las ramas bajas del árbol
      const grupoSerpiente = new THREE.Group();
      const cuerpoSerpiente = new THREE.Mesh(
        new THREE.TorusKnotGeometry(0.65, 0.12, 48, 10, 2, 3),
        new THREE.MeshStandardMaterial({
          color: 0x065f46,
          emissive: 0x10b981,
          emissiveIntensity: 0.25,
          roughness: 0.3
        })
      );
      const cabezaSerpiente = new THREE.Mesh(
        new THREE.ConeGeometry(0.22, 0.55, 10),
        new THREE.MeshStandardMaterial({ color: 0x047857 })
      );
      cabezaSerpiente.rotation.x = Math.PI / 2;
      cabezaSerpiente.position.set(0, 0.35, 0.75);
      grupoSerpiente.add(cuerpoSerpiente);
      grupoSerpiente.add(cabezaSerpiente);
      grupoSerpiente.position.set(1.4, 4.2, 2.6);
      grupoArbolProhibido.add(grupoSerpiente);

      animadores.push((t) => {
        const pulso = 0.5 + Math.sin(t * 2.6) * 0.5;
        luzPulsoArbol.intensity = 1.8 + pulso * 2.4;
        haloArbol.scale.setScalar(0.95 + pulso * 0.18);
        haloArbol.material.opacity = 0.12 + pulso * 0.16;
        matCopaLuz.emissiveIntensity = 0.2 + pulso * 0.35;
        grupoSerpiente.position.y = 4.2 + Math.sin(t * 2.2) * 0.08;
        cabezaSerpiente.rotation.y = Math.sin(t * 1.8) * 0.25;
      });

      // 5. EVA JUNTO AL ÁRBOL (Cubierta discretamente por arbustos floridos, oculta al inicio)
      const grupoEva = new THREE.Group();
      grupoEva.position.set(POS_ARBOL.x - 2.6, POS_ARBOL.y, POS_ARBOL.z + 3.2);
      grupoEva.visible = false;
      grupoInterior.add(grupoEva);
      grupoEvaArbustosRef.current = grupoEva;

      const matPiel = new THREE.MeshStandardMaterial({ color: 0xe0ac69, roughness: 0.6 });
      const matCabello = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.75 });

      const torsoEva = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.36, 1.4, 12), matPiel);
      torsoEva.position.y = 2.1;
      grupoEva.add(torsoEva);

      const cabezaEva = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 16), matPiel);
      cabezaEva.position.y = 3.05;
      grupoEva.add(cabezaEva);

      const cabelloEva = new THREE.Mesh(new THREE.CylinderGeometry(0.31, 0.38, 1.1, 12), matCabello);
      cabelloEva.position.set(0, 2.75, -0.08);
      grupoEva.add(cabelloEva);

      // Brazo que lleva el fruto a la boca
      const pivoteBrazo = new THREE.Group();
      pivoteBrazo.position.set(0.32, 2.65, 0);
      const brazoMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.75, 8), matPiel);
      brazoMesh.position.set(0, 0.3, 0.25);
      brazoMesh.rotation.x = Math.PI / 3;
      const frutoMano = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 12), matFruto);
      frutoMano.position.set(0, 0.62, 0.42);
      pivoteBrazo.add(brazoMesh);
      pivoteBrazo.add(frutoMano);
      grupoEva.add(pivoteBrazo);
      brazoEvaRef.current = pivoteBrazo;

      // Arbustos floridos densos que cubren la mayor parte de su cuerpo
      const matArbustoEva = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.7 });
      [
        [0, 1.1, 0.35, 1.15],
        [-0.55, 1.0, 0.25, 0.95],
        [0.55, 1.0, 0.25, 0.95],
        [0, 1.85, 0.28, 0.78]
      ].forEach(([bx, by, bz, br], idx) => {
        const arb = new THREE.Mesh(new THREE.SphereGeometry(br, 14, 14), matArbustoEva);
        arb.position.set(bx, by, bz);
        grupoEva.add(arb);

        const flor = new THREE.Mesh(
          new THREE.SphereGeometry(0.16, 8, 8),
          new THREE.MeshBasicMaterial({ color: idx % 2 === 0 ? 0xf472b6 : 0x38bdf8 })
        );
        flor.position.set(bx + 0.2, by + 0.35, bz + 0.55);
        grupoEva.add(flor);
      });

      animadores.push((t) => {
        if (grupoEva.visible && brazoEvaRef.current) {
          // Movimiento suave llevando la fruta hacia la boca
          brazoEvaRef.current.rotation.x = -0.35 + Math.sin(t * 2.5) * 0.25;
        }
      });

      // 6. ÁRBOLES VARIADOS (Palmeras, Cipreses, Árboles Frutales y Arbustos con Flores)
      const crearPalmera = (x, z, esc = 1) => {
        const g = new THREE.Group();
        const tronco = new THREE.Mesh(
          new THREE.CylinderGeometry(0.22 * esc, 0.38 * esc, 7.5 * esc, 8),
          matTronco
        );
        tronco.position.y = 3.75 * esc;
        tronco.rotation.z = 0.08;
        g.add(tronco);
        for (let h = 0; h < 6; h++) {
          const hoja = new THREE.Mesh(
            new THREE.ConeGeometry(0.8 * esc, 3.6 * esc, 4),
            matColina
          );
          const ang = (h / 6) * Math.PI * 2;
          hoja.position.set(Math.cos(ang) * 1.4 * esc, 7.4 * esc, Math.sin(ang) * 1.4 * esc);
          hoja.rotation.z = -Math.cos(ang) * 1.1;
          hoja.rotation.x = Math.sin(ang) * 1.1;
          g.add(hoja);
        }
        g.position.set(x, 0, z);
        grupoInterior.add(g);
      };

      const crearArbolFrondoso = (x, z, esc = 1, colorHojas = 0x22c55e) => {
        const g = new THREE.Group();
        const tronco = new THREE.Mesh(
          new THREE.CylinderGeometry(0.4 * esc, 0.65 * esc, 4.5 * esc, 8),
          matTronco
        );
        tronco.position.y = 2.25 * esc;
        g.add(tronco);
        const matH = new THREE.MeshStandardMaterial({ color: colorHojas, roughness: 0.65 });
        for (let c = 0; c < 3; c++) {
          const bola = new THREE.Mesh(
            new THREE.SphereGeometry((2.4 - c * 0.4) * esc, 14, 14),
            matH
          );
          bola.position.set((c - 1) * 0.7 * esc, (4.6 + c * 0.9) * esc, 0);
          g.add(bola);
        }
        g.position.set(x, 0, z);
        grupoInterior.add(g);
      };

      // Distribuir palmeras, cipreses y árboles alrededor de la laguna
      crearPalmera(11, -12, 1.3);
      crearPalmera(14, -15, 1.1);
      crearPalmera(-16, -10, 1.25);
      for (let a = 0; a < 36; a++) {
        const ang = (a / 36) * Math.PI * 2;
        const radio = 34 + (a % 4) * 14;
        const x = Math.cos(ang) * radio;
        const z = Math.sin(ang) * radio - 10;
        if (Math.hypot(x - POS_ARBOL.x, z - POS_ARBOL.z) > 16) {
          crearArbolFrondoso(
            x,
            z,
            1.0 + (a % 3) * 0.35,
            a % 3 === 0 ? 0x16a34a : a % 2 === 0 ? 0x4ade80 : 0x15803d
          );
        }
      }

      // Flores de primer plano (Rosas, Celestes y Amarillas como en la Ilustración 1 y 2)
      const coloresFlores = [0xf472b6, 0x38bdf8, 0xfacc15, 0xc084fc];
      for (let fl = 0; fl < 65; fl++) {
        const ang = Math.random() * Math.PI * 2;
        const dist = 8 + Math.random() * 45;
        const fx = Math.cos(ang) * dist;
        const fz = Math.sin(ang) * dist;
        if (Math.hypot(fx - 2, fz + 6) > 22) {
          const mata = new THREE.Mesh(
            new THREE.SphereGeometry(0.65 + Math.random() * 0.5, 10, 10),
            matPasto
          );
          mata.position.set(fx, 0.3, fz);
          grupoInterior.add(mata);

          const petalo = new THREE.Mesh(
            new THREE.SphereGeometry(0.22, 8, 8),
            new THREE.MeshBasicMaterial({ color: coloresFlores[fl % coloresFlores.length] })
          );
          petalo.position.set(fx, 0.85, fz);
          grupoInterior.add(petalo);
        }
      }

      // 7. FAUNA VIVA DEL EDÉN (Elefantes, Leones, Jirafas, Venados, Zorros, Aves y Mariposas)
      // A. Elefantes en la laguna (Ilustración 1 y 2)
      const matElefante = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.8 });
      const crearElefante = (x, z, rotY) => {
        const g = new THREE.Group();
        const cuerpo = new THREE.Mesh(new THREE.SphereGeometry(1.65, 14, 14), matElefante);
        cuerpo.scale.set(1.3, 1.0, 0.95);
        cuerpo.position.y = 2.0;
        g.add(cuerpo);
        const cabeza = new THREE.Mesh(new THREE.SphereGeometry(1.05, 14, 14), matElefante);
        cabeza.position.set(1.6, 2.5, 0);
        g.add(cabeza);
        const trompa = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.14, 1.8, 8), matElefante);
        trompa.position.set(2.4, 1.6, 0);
        trompa.rotation.z = 0.35;
        g.add(trompa);
        // Colmillos de marfil
        [-0.35, 0.35].forEach((cz) => {
          const colmillo = new THREE.Mesh(
            new THREE.ConeGeometry(0.1, 0.9, 8),
            new THREE.MeshBasicMaterial({ color: 0xfefce8 })
          );
          colmillo.position.set(2.3, 1.9, cz);
          colmillo.rotation.z = -1.1;
          g.add(colmillo);
        });
        [
          [-0.9, -0.6],
          [-0.9, 0.6],
          [0.9, -0.6],
          [0.9, 0.6]
        ].forEach(([px, pz]) => {
          const pata = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.3, 1.8, 8), matElefante);
          pata.position.set(px, 0.9, pz);
          g.add(pata);
        });
        g.position.set(x, 0, z);
        g.rotation.y = rotY;
        grupoInterior.add(g);
        animadores.push((t) => {
          cabeza.rotation.z = Math.sin(t * 1.4 + x) * 0.08;
          trompa.rotation.z = 0.35 + Math.sin(t * 1.8 + x) * 0.18;
        });
      };
      crearElefante(0, -10, -0.8);
      crearElefante(4.5, -11.5, -1.2);
      crearElefante(9, -10.5, -1.5);

      // B. León, Leona y Cachorro descansando en paz (Ilustración 1 y 2)
      const matLeon = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.7 });
      const matMelena = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.85 });
      const crearLeon = (x, z, rotY, conMelena = true, escala = 1) => {
        const g = new THREE.Group();
        const cuerpo = new THREE.Mesh(
          new THREE.CylinderGeometry(0.55 * escala, 0.6 * escala, 1.9 * escala, 10),
          matLeon
        );
        cuerpo.rotation.z = Math.PI / 2;
        cuerpo.position.y = 0.95 * escala;
        g.add(cuerpo);
        if (conMelena) {
          const melena = new THREE.Mesh(new THREE.SphereGeometry(0.75 * escala, 12, 12), matMelena);
          melena.position.set(0.85 * escala, 1.25 * escala, 0);
          g.add(melena);
        }
        const cabeza = new THREE.Mesh(new THREE.SphereGeometry(0.48 * escala, 12, 12), matLeon);
        cabeza.position.set(1.05 * escala, 1.25 * escala, 0);
        g.add(cabeza);
        g.position.set(x, 0, z);
        g.rotation.y = rotY;
        grupoInterior.add(g);
        animadores.push((t) => {
          cabeza.rotation.y = Math.sin(t * 1.2 + x) * 0.15;
        });
      };
      crearLeon(-6, 14, 0.4, true, 1.1);
      crearLeon(5, 13, 2.4, false, 0.95);
      crearLeon(3.2, 14.5, 1.8, false, 0.52); // Cachorro

      // C. Jirafas junto a los árboles (Ilustración 2)
      const matJirafa = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.7 });
      const crearJirafa = (x, z, rotY) => {
        const g = new THREE.Group();
        const cuerpo = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.2, 0.95), matJirafa);
        cuerpo.position.y = 2.6;
        g.add(cuerpo);
        const cuello = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.35, 3.8, 8), matJirafa);
        cuello.position.set(0.95, 4.4, 0);
        cuello.rotation.z = -0.25;
        g.add(cuello);
        const cabeza = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.4, 0.38), matJirafa);
        cabeza.position.set(1.4, 6.1, 0);
        g.add(cabeza);
        g.position.set(x, 0, z);
        g.rotation.y = rotY;
        grupoInterior.add(g);
      };
      crearJirafa(16, -4, -2.2);
      crearJirafa(19, -7, -1.9);

      // D. Venados en la colina derecha (Ilustración 3) y Zorros en las rocas (Ilustración 2)
      crearLeon(12, -32, -1.5, false, 0.65);
      crearLeon(14.5, -33, -1.8, false, 0.6);
      crearLeon(-15, 11, 0.6, false, 0.48);

      // E. Aves y Guacamayas volando en el cielo (Ilustraciones 1 y 2)
      const coloresAves = [0x2563eb, 0xef4444, 0xf8fafc, 0xfacc15];
      for (let av = 0; av < 16; av++) {
        const aveGrupo = new THREE.Group();
        const matAve = new THREE.MeshBasicMaterial({
          color: coloresAves[av % coloresAves.length],
          side: THREE.DoubleSide
        });
        const alaIzq = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.35), matAve);
        alaIzq.position.x = -0.45;
        const alaDer = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.35), matAve);
        alaDer.position.x = 0.45;
        aveGrupo.add(alaIzq);
        aveGrupo.add(alaDer);

        const radioVuelo = 18 + (av % 5) * 8;
        const alturaVuelo = 11 + (av % 4) * 3.5;
        grupoInterior.add(aveGrupo);

        animadores.push((t) => {
          const ang = t * (0.28 + (av % 3) * 0.08) + av;
          aveGrupo.position.set(
            Math.cos(ang) * radioVuelo,
            alturaVuelo + Math.sin(t * 1.5 + av) * 0.8,
            Math.sin(ang) * radioVuelo - 12
          );
          aveGrupo.rotation.y = -ang;
          const aleteo = Math.sin(t * 9 + av) * 0.55;
          alaIzq.rotation.z = aleteo;
          alaDer.rotation.z = -aleteo;
        });
      }

      // F. Mariposas revoloteando cerca de las flores (Ilustración 1)
      const coloresMariposas = [0xc084fc, 0x38bdf8, 0xfacc15, 0xf472b6];
      for (let mp = 0; mp < 28; mp++) {
        const mariposa = new THREE.Group();
        const matM = new THREE.MeshBasicMaterial({
          color: coloresMariposas[mp % coloresMariposas.length],
          side: THREE.DoubleSide
        });
        const aI = new THREE.Mesh(new THREE.CircleGeometry(0.16, 6), matM);
        aI.position.x = -0.1;
        const aD = new THREE.Mesh(new THREE.CircleGeometry(0.16, 6), matM);
        aD.position.x = 0.1;
        mariposa.add(aI);
        mariposa.add(aD);

        const baseX = (Math.random() - 0.5) * 42;
        const baseZ = (Math.random() - 0.5) * 42;
        grupoInterior.add(mariposa);

        animadores.push((t) => {
          mariposa.position.set(
            baseX + Math.sin(t * 1.8 + mp) * 2.2,
            1.2 + Math.abs(Math.sin(t * 3.2 + mp)) * 1.4,
            baseZ + Math.cos(t * 1.6 + mp) * 2.2
          );
          const batido = Math.sin(t * 18 + mp) * 0.9;
          aI.rotation.y = batido;
          aD.rotation.y = -batido;
        });
      }

      /* ======================================================================
         ESCENA EXTERIOR: ADÁN Y EVA FUERA DEL JARDÍN + 3 QUERUBINES + ESPADA
         ====================================================================== */
      const grupoExterior = new THREE.Group();
      grupoExterior.visible = false;
      scene.add(grupoExterior);
      grupoExteriorExpulsionRef.current = grupoExterior;

      // Suelo árido fuera de Edén
      const sueloExterior = new THREE.Mesh(
        new THREE.CircleGeometry(140, 48),
        new THREE.MeshStandardMaterial({ color: 0x57534e, roughness: 0.92 })
      );
      sueloExterior.rotation.x = -Math.PI / 2;
      sueloExterior.position.y = 0.02;
      grupoExterior.add(sueloExterior);

      // Los 3 Ángeles (Querubines) custodiando la entrada oriental del Jardín
      const matAngel = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0x38bdf8,
        emissiveIntensity: 0.55,
        roughness: 0.2
      });
      const matAlasAngel = new THREE.MeshBasicMaterial({
        color: 0xe0f2fe,
        transparent: true,
        opacity: 0.78,
        side: THREE.DoubleSide
      });

      [-6.5, 0, 6.5].forEach((ax, idx) => {
        const angel = new THREE.Group();
        const tunica = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 1.1, 4.8, 16), matAngel);
        tunica.position.y = 2.4;
        angel.add(tunica);

        const cabezaA = new THREE.Mesh(new THREE.SphereGeometry(0.48, 16, 16), matAngel);
        cabezaA.position.y = 5.2;
        angel.add(cabezaA);

        const ala1 = new THREE.Mesh(new THREE.ConeGeometry(1.6, 4.8, 4), matAlasAngel);
        ala1.position.set(-1.4, 3.8, -0.4);
        ala1.rotation.z = 0.55;
        const ala2 = new THREE.Mesh(new THREE.ConeGeometry(1.6, 4.8, 4), matAlasAngel);
        ala2.position.set(1.4, 3.8, -0.4);
        ala2.rotation.z = -0.55;
        angel.add(ala1);
        angel.add(ala2);

        angel.position.set(ax, 0, -14 - (idx === 1 ? 2 : 0));
        grupoExterior.add(angel);
      });

      // La Hoja Llameante de la Espada que daba vueltas continuamente (Génesis 3:24)
      const grupoEspadaFuego = new THREE.Group();
      const hojaLlama = new THREE.Mesh(
        new THREE.ConeGeometry(0.48, 6.2, 6),
        new THREE.MeshBasicMaterial({ color: 0xf97316 })
      );
      const hojaLlamaInvertida = new THREE.Mesh(
        new THREE.ConeGeometry(0.48, 2.2, 6),
        new THREE.MeshBasicMaterial({ color: 0xfef08a })
      );
      hojaLlamaInvertida.rotation.x = Math.PI;
      hojaLlamaInvertida.position.y = -2.0;

      const anilloFuego1 = new THREE.Mesh(
        new THREE.TorusGeometry(3.4, 0.14, 12, 48),
        new THREE.MeshBasicMaterial({ color: 0xf97316 })
      );
      const anilloFuego2 = new THREE.Mesh(
        new THREE.TorusGeometry(2.6, 0.1, 12, 48),
        new THREE.MeshBasicMaterial({ color: 0xfef08a })
      );
      anilloFuego2.rotation.x = Math.PI / 2;

      const luzEspada = new THREE.PointLight(0xf97316, 4.5, 38);
      grupoEspadaFuego.add(hojaLlama);
      grupoEspadaFuego.add(hojaLlamaInvertida);
      grupoEspadaFuego.add(anilloFuego1);
      grupoEspadaFuego.add(anilloFuego2);
      grupoEspadaFuego.add(luzEspada);
      grupoEspadaFuego.position.set(0, 4.4, -10);
      grupoExterior.add(grupoEspadaFuego);
      espadaGiratoriaRef.current = grupoEspadaFuego;

      // Adán y Eva fuera del jardín (vestidos con prendas largas de piel, cabizbajos)
      const matPielVestido = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
      [
        [-2.2, 5.5, 1.05],
        [2.2, 6.0, 0.94]
      ].forEach(([px, pz, esc]) => {
        const figura = new THREE.Group();
        const cuerpoVestido = new THREE.Mesh(
          new THREE.CylinderGeometry(0.38 * esc, 0.58 * esc, 2.5 * esc, 12),
          matPielVestido
        );
        cuerpoVestido.position.y = 1.25 * esc;
        figura.add(cuerpoVestido);
        const cab = new THREE.Mesh(new THREE.SphereGeometry(0.32 * esc, 14, 14), matPiel);
        cab.position.set(0, 2.75 * esc, -0.15);
        figura.add(cab);
        figura.position.set(px, 0, pz);
        figura.rotation.x = -0.14; // Inclinados con pesar mirando hacia la entrada cerrada
        grupoExterior.add(figura);
      });

      const ajustarVentana = () => {
        if (!renderer || !camera) return;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };
      window.addEventListener('resize', ajustarVentana);

      /* ======================================================================
         BUCLE PRINCIPAL DE SIMULACIÓN Y PROXIMIDAD (60 FPS)
         ====================================================================== */
      const vecDirCamara = new THREE.Vector3();
      const vecHaciaArbol = new THREE.Vector3();
      const posArbolVec = new THREE.Vector3(POS_ARBOL.x, POS_ARBOL.y + 3, POS_ARBOL.z);

      let reloj = 0;
      const loop = () => {
        if (cancelado) return;
        reloj += 0.016;
        tiempoExploradoRef.current += 0.016;

        // 1. Movimiento libre del jugador (Joysticks + Pasos físicos)
        if (faseRef.current === 'EXPLORACION' || faseRef.current === 'DIALOGO_SERPIENTE') {
          const m = movRef.current;
          camera.rotation.y -= m.yaw * 0.032;
          camera.rotation.x = Math.max(-0.65, Math.min(0.65, camera.rotation.x + m.pitch * 0.025));

          if (Math.abs(m.avanzar) > 0.01 || Math.abs(m.lateral) > 0.01) {
            const vel = 0.28;
            const sinY = Math.sin(camera.rotation.y);
            const cosY = Math.cos(camera.rotation.y);

            camera.position.x -= sinY * m.avanzar * vel - cosY * m.lateral * vel;
            camera.position.z -= cosY * m.avanzar * vel + sinY * m.lateral * vel;

            // Ajustar altura suavemente si sube a la colina del árbol
            const distColina = Math.hypot(
              camera.position.x - POS_ARBOL.x,
              camera.position.z - POS_ARBOL.z
            );
            const alturaSuelo = distColina < 20 ? Math.max(0, (20 - distColina) * 0.22) : 0;
            camera.position.y = 3.4 + alturaSuelo + Math.sin(reloj * 8.5) * 0.12;
          }

          // 2. Comprobar cercanía al Árbol Prohibido y a la Serpiente
          const distAlArbol = Math.hypot(
            camera.position.x - POS_ARBOL.x,
            camera.position.z - POS_ARBOL.z
          );

          if (distAlArbol < 16.5) {
            if (!yaHabloSerpienteRef.current) {
              yaHabloSerpienteRef.current = true;
              setPasoDialogoSerpiente(1);
              setMostrarOpcionSerpiente(true);
              if (hablarConVozDM) {
                hablarConVozDM(
                  '¿De verdad les dijo Dios que no pueden comer de todos los árboles del jardín?'
                );
              }
            } else if (pasoDialogoSerpiente < 2) {
              setMostrarOpcionSerpiente(true);
            }
          } else {
            // Si el jugador se aleja, la serpiente lo deja en paz y desaparece el cuadro
            setMostrarOpcionSerpiente(false);
            if (yaHabloSerpienteRef.current && tiempoExploradoRef.current > 14) {
              listoParaEvaRef.current = true;
            }
          }

          // Si ya exploró suficiente tiempo (> 28s), habilitar la aparición de Eva al mirar hacia el árbol
          if (tiempoExploradoRef.current > 28 && distAlArbol > 17) {
            listoParaEvaRef.current = true;
          }

          // 3. Si ya exploró y vuelve a mirar hacia el árbol, aparece Eva comiendo del fruto
          if (listoParaEvaRef.current && !secuenciaEvaIniciadaRef.current) {
            camera.getWorldDirection(vecDirCamara);
            vecHaciaArbol.subVectors(posArbolVec, camera.position).normalize();
            const alineacionMirada = vecDirCamara.dot(vecHaciaArbol);

            if (alineacionMirada > 0.62 && distAlArbol < 55) {
              dispararSecuenciaMordiscoYExpulsion();
            }
          }
        }

        // Giro continuo de la espada llameante en la escena de expulsión
        if (espadaGiratoriaRef.current && grupoExterior.visible) {
          espadaGiratoriaRef.current.rotation.z = reloj * 5.5;
          espadaGiratoriaRef.current.rotation.y = reloj * 2.8;
          scene.background.setHex(0x0f172a);
          scene.fog.color.setHex(0x1e293b);
        }

        animadores.forEach((fn) => fn(reloj));
        renderer.render(scene, camera);
        rafId = requestAnimationFrame(loop);
      };

      rafId = requestAnimationFrame(loop);
    });

    return () => {
      cancelado = true;
      if (rafId) cancelAnimationFrame(rafId);
      if (renderer) renderer.dispose();
    };
  }, [dispararSecuenciaMordiscoYExpulsion, hablarConVozDM, pasoDialogoSerpiente]);

  /* ==========================================================================
     GIROSCOPIO (VENTANA AR 360°) Y CAMINATA FÍSICA EN LA SALA
     ========================================================================== */
  useEffect(() => {
    const manejarGiroscopio = (e) => {
      if (!camaraRef.current || e.alpha === null) return;
      if (!orientacionBaseRef.current) {
        orientacionBaseRef.current = {
          alpha: e.alpha || 0,
          gamma: e.gamma || 0
        };
      }
      const deltaYaw = ((e.alpha - orientacionBaseRef.current.alpha) * Math.PI) / 180;
      camaraRef.current.rotation.y = deltaYaw;
    };

    let ultimoPaso = 0;
    const manejarPasos = (e) => {
      const acc = e.accelerationIncludingGravity;
      if (!acc || !camaraRef.current) return;
      const mag = Math.sqrt((acc.x || 0) ** 2 + (acc.y || 0) ** 2 + (acc.z || 0) ** 2);
      const ahora = Date.now();
      if (mag > 12.8 && ahora - ultimoPaso > 360) {
        ultimoPaso = ahora;
        const cam = camaraRef.current;
        cam.position.x -= Math.sin(cam.rotation.y) * 1.8;
        cam.position.z -= Math.cos(cam.rotation.y) * 1.8;
      }
    };

    window.addEventListener('deviceorientation', manejarGiroscopio);
    window.addEventListener('devicemotion', manejarPasos);
    return () => {
      window.removeEventListener('deviceorientation', manejarGiroscopio);
      window.removeEventListener('devicemotion', manejarPasos);
    };
  }, []);

  /* ==========================================================================
     MANEJADORES DE LOS DOS JOYSTICKS ANALÓGICOS SIN TEXTO
     ========================================================================== */
  const actualizarJoystick = (ev, lado) => {
    const rect = ev.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const clientX = ev.touches ? ev.touches[0].clientX : ev.clientX;
    const clientY = ev.touches ? ev.touches[0].clientY : ev.clientY;
    const maxR = rect.width / 2;
    const dx = Math.max(-1, Math.min(1, (clientX - cx) / maxR));
    const dy = Math.max(-1, Math.min(1, (clientY - cy) / maxR));

    if (lado === 'IZQ') {
      setJoyIzqPos({ x: dx * 28, y: dy * 28 });
      movRef.current.lateral = dx;
      movRef.current.avanzar = -dy;
    } else {
      setJoyDerPos({ x: dx * 28, y: dy * 28 });
      movRef.current.yaw = dx;
      movRef.current.pitch = -dy;
    }
  };

  const soltarJoystick = (lado) => {
    if (lado === 'IZQ') {
      setJoyIzqPos({ x: 0, y: 0 });
      movRef.current.lateral = 0;
      movRef.current.avanzar = 0;
    } else {
      setJoyDerPos({ x: 0, y: 0 });
      movRef.current.yaw = 0;
      movRef.current.pitch = 0;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black select-none overflow-hidden">
      {/* LIENZO 3D PURO SIN TEXTO NI HUD */}
      <div ref={contenedorRef} className="fixed inset-0 z-0" />

      {/* OPCIÓN DE RESPUESTA FLOTANTE FRENTE A LA SERPIENTE (SOLO SI TE QUEDAS CERCA DEL ÁRBOL) */}
      {mostrarOpcionSerpiente && faseHistoria === 'EXPLORACION' && (
        <div className="fixed inset-x-0 bottom-32 z-30 flex justify-center px-6 animate-[fadeIn_0.35s_ease-out]">
          <button
            onClick={responderALaSerpiente}
            className="max-w-xl p-5 rounded-3xl bg-slate-950/70 hover:bg-slate-950/85 backdrop-blur-2xl border border-amber-300/70 text-white text-sm md:text-base font-bold leading-relaxed shadow-[0_0_45px_rgba(251,191,36,0.45)] hover:scale-[1.02] transition-all text-center"
          >
            «Podemos comer del fruto de los árboles del jardín. Pero del fruto del árbol que está en medio del jardín, Dios ha dicho: “No coman de él, no, ni lo toquen; de lo contrario, morirán”.»
          </button>
        </div>
      )}

      {/* DOS JOYSTICKS TRANSLÚCIDOS SIN TEXTO (CAMINAR E INSPECCIONAR) */}
      {(faseHistoria === 'EXPLORACION' || faseHistoria === 'DIALOGO_SERPIENTE') && (
        <div className="fixed bottom-7 left-8 right-8 z-20 flex items-center justify-between pointer-events-none">
          {/* Joystick Izquierdo: Caminar */}
          <div
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              actualizarJoystick(e, 'IZQ');
            }}
            onPointerMove={(e) => {
              if (e.buttons > 0) actualizarJoystick(e, 'IZQ');
            }}
            onPointerUp={() => soltarJoystick('IZQ')}
            onPointerCancel={() => soltarJoystick('IZQ')}
            className="pointer-events-auto w-28 h-28 rounded-full bg-white/10 backdrop-blur-md border border-white/30 flex items-center justify-center touch-none opacity-45 hover:opacity-90 active:opacity-100 transition-opacity"
          >
            <div
              style={{ transform: `translate(${joyIzqPos.x}px, ${joyIzqPos.y}px)` }}
              className="w-11 h-11 rounded-full bg-white/60 border border-white shadow-[0_0_20px_rgba(255,255,255,0.8)] pointer-events-none"
            />
          </div>

          {/* Joystick Derecho: Mirar Alrededor */}
          <div
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              actualizarJoystick(e, 'DER');
            }}
            onPointerMove={(e) => {
              if (e.buttons > 0) actualizarJoystick(e, 'DER');
            }}
            onPointerUp={() => soltarJoystick('DER')}
            onPointerCancel={() => soltarJoystick('DER')}
            className="pointer-events-auto w-28 h-28 rounded-full bg-white/10 backdrop-blur-md border border-white/30 flex items-center justify-center touch-none opacity-45 hover:opacity-90 active:opacity-100 transition-opacity"
          >
            <div
              style={{ transform: `translate(${joyDerPos.x}px, ${joyDerPos.y}px)` }}
              className="w-11 h-11 rounded-full bg-white/60 border border-white shadow-[0_0_20px_rgba(255,255,255,0.8)] pointer-events-none"
            />
          </div>
        </div>
      )}

      {/* RESPLANDOR INTENSO DESDE EL ÁRBOL ("Y ASÍ FUE COMO TODO COMENZÓ") */}
      <div
        style={{
          opacity: intensidadDestello,
          background: 'radial-gradient(circle at 50% 42%, #ffffff 0%, #fef08a 45%, #f59e0b 100%)'
        }}
        className="fixed inset-0 z-40 pointer-events-none transition-opacity duration-1000"
      />

      {/* CORTE A NEGRO FINAL */}
      <div
        className={`fixed inset-0 z-50 bg-black pointer-events-none transition-opacity duration-700 ${
          corteNegro ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
}