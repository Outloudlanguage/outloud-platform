import React from 'react';

const METHOD_SCENES = [
  {
    src: 'https://pub-4ca81ef087364b84a5b486b76cc2b72e.r2.dev/Method%20Images/Scene%201.webp',
    alt: 'Estudiante escuchando y practicando pronunciación en Live Lab',
  },
  {
    src: 'https://pub-4ca81ef087364b84a5b486b76cc2b72e.r2.dev/Method%20Images/Scene%202.webp',
    alt: 'Estudiante practicando en su workbook digital desde casa',
  },
  {
    src: 'https://pub-4ca81ef087364b84a5b486b76cc2b72e.r2.dev/Method%20Images/Scene%203.webp',
    alt: 'Práctica flexible de inglés en horario nocturno',
  },
  {
    src: 'https://pub-4ca81ef087364b84a5b486b76cc2b72e.r2.dev/Method%20Images/Scene%204.webp',
    alt: 'Profesor y estudiantes en una clase práctica 100% en vivo',
  },
  {
    src: 'https://pub-4ca81ef087364b84a5b486b76cc2b72e.r2.dev/Method%20Images/Scene%205.webp',
    alt: 'Comunidad de estudiantes conversando juntos en inglés',
  },
];

export default function OutLoudCycleScene({ stepIndex = 0 }) {
  const safeIndex = stepIndex >= 0 && stepIndex < METHOD_SCENES.length ? stepIndex : 0;
  const activeScene = METHOD_SCENES[safeIndex];

  return (
    <div className="w-full flex items-center justify-center">
      <style>{`
        @keyframes olaEditorialFade {
          0% { opacity: 0; transform: translateY(6px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .ola-editorial-fade {
          animation: olaEditorialFade 0.28s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        @media (prefers-reduced-motion: reduce) {
          .ola-editorial-fade { animation: none; }
        }
      `}</style>

      <div
        key={safeIndex}
        className="ola-editorial-fade w-full max-w-[460px] aspect-[4/3] rounded-[1.75rem] overflow-hidden bg-[#fdfcf8] border-2 border-[#1e2246] shadow-[0_6px_0_#1e2246,0_16px_30px_-14px_rgba(30,34,70,0.28)]"
      >
        <img
          src={activeScene.src}
          alt={activeScene.alt}
          width={1000}
          height={750}
          loading={safeIndex === 0 ? 'eager' : 'lazy'}
          decoding="async"
          draggable="false"
          className="w-full h-full object-cover block select-none"
        />
      </div>
    </div>
  );
}