import React, { useState, useEffect, useRef } from 'react';

// Custom Dropdown Component (Accordion Style)
const CustomDropdown = ({
  options,
  value,
  onChange,
  titleEng,
  titleSpan,
  hasError,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-full mb-4" ref={dropdownRef}>
      <div className="relative">
        <div
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full cursor-pointer flex justify-between items-center rounded-full px-4 py-2.5 text-[11px] lg:text-xs font-montserrat transition-all duration-300 ${
            hasError
              ? 'animate-error-blink text-red-700'
              : 'bg-[#e6f0f9] text-outloud-blue hover:bg-[#d6e6f5]'
          }`}
        >
          <span className="truncate pr-2">{value || titleSpan}</span>
          <svg
            className={`w-4 h-4 shrink-0 transition-transform duration-300 ${
              isOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>

        {hasError && (
          <p className="absolute -bottom-4 left-4 text-[9px] font-bold text-red-600 animate-text-blink whitespace-nowrap z-10">
            Debe completar este campo
          </p>
        )}
      </div>

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen
            ? 'grid-rows-[1fr] opacity-100 mt-2'
            : 'grid-rows-[0fr] opacity-0 mt-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="w-full bg-white border border-gray-100 rounded-2xl shadow-md flex flex-col">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 cursor-default shrink-0">
              <p className="text-[11px] lg:text-xs font-bold text-outloud-blue leading-tight mb-0.5">
                {titleEng}
              </p>
              <p className="text-[10px] lg:text-[11px] text-outloud-blue/80 leading-tight">
                {titleSpan}
              </p>
            </div>

            <div className="max-h-48 overflow-y-auto">
              {options.map((option, index) => (
                <div
                  key={index}
                  onClick={() => {
                    onChange(option);
                    setIsOpen(false);
                  }}
                  className="px-4 py-2.5 text-[11px] lg:text-xs font-montserrat text-outloud-blue hover:bg-student-yellow hover:font-bold cursor-pointer transition-colors border-b border-gray-50 last:border-none"
                >
                  {option}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const RegistrationPage = ({ onReturnHome }) => {
  // PASTE YOUR DISCORD WEBHOOK URL HERE
  const DISCORD_WEBHOOK_URL =
    'https://discordapp.com/api/webhooks/1534265478179196928/8R96hVzk1NqYi_F-dAzTpeUjnJa5DyXSFWQ338FQGwnKK9FztZt5l7ECE2bZcqhS0fwb';

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    reason: '',
    fluentTime: '',
    interest: '',
    investTime: '',
    referralToggle: false,
    refName: '',
    refPhone: '',
    planType: '',
    planSelect: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reasonOptions = [
    'A) Para viajar',
    'B) Por mis estudios',
    'C) Por trabajo',
    'D) Para mudarme',
    'E) Por placer',
  ];
  const fluentOptions = [
    'A) 3 meses o menos',
    'B) 6 meses',
    'C) 9 meses o más',
  ];
  const interestOptions = [
    'A) Música',
    'B) Tecnología',
    'C) Películas',
    'D) Moda',
    'E) Viajes',
    'F) Artes',
    'G) Deportes',
  ];
  const investOptions = [
    'A) 3 meses o menos',
    'B) 6 meses',
    'C) 9 meses o más',
  ];
  const planTypeOptions = ['A) Plan mensual', 'B) Plan a tu ritmo'];

  const monthlyPlans = [
    'A) Plan básico: 3 meses $50',
    'B) Plan eficiente: 6 meses $85',
    'C) Plan óptimo: 9 meses $120',
    'D) Plan Nativo: 12 meses $160',
  ];
  const rhythmPlans = [
    'A) Plan básico: 8 créditos $20',
    'B) Plan eficiente: 12 créditos $30',
    'C) Plan óptimo: 24 créditos $50',
    'D) Plan ideal: 36 créditos $70',
  ];

  const currentPlanOptions =
    formData.planType === 'A) Plan mensual'
      ? monthlyPlans
      : formData.planType === 'B) Plan a tu ritmo'
      ? rhythmPlans
      : [];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: false }));
    if (field === 'planType')
      setFormData((prev) => ({ ...prev, planSelect: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    let newErrors = {};
    const requiredFields = [
      'fullName',
      'email',
      'phone',
      'reason',
      'fluentTime',
      'interest',
      'investTime',
      'planType',
      'planSelect',
    ];

    requiredFields.forEach((field) => {
      if (!formData[field]) newErrors[field] = true;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    // Submission Counter Logic
    let currentCount = parseInt(
      localStorage.getItem('ola_submission_count') || '0',
      10
    );
    currentCount += 1;
    localStorage.setItem('ola_submission_count', currentCount.toString());
    const formattedSubmissionId = `Submission #${String(currentCount).padStart(
      3,
      '0'
    )}`;

    // Discord Rich Embed Payload
    const discordPayload = {
      username: 'OLA Registry Hub',
      avatar_url: 'https://i.postimg.cc/fyvnv4XT/Diseno-sin-titulo-(14).png',
      embeds: [
        {
          title: `🎓 Nuevo Estudiante Registrado | ${formattedSubmissionId}`,
          description: `Se ha recibido una nueva planilla de inscripción de **${formData.fullName}**.`,
          color: 1461973, // Outloud Academy Blue (Decimal)
          fields: [
            {
              name: '👤 SECTION 1: PERSONAL INFO',
              value: `**Email:** ${formData.email}\n**WhatsApp:** ${formData.phone}`,
              inline: false,
            },
            {
              name: '🎯 SECTION 2: COURSE GOALS',
              value: `**Motivo:** ${formData.reason.substring(
                3
              )}\n**Meta de fluidez:** ${formData.fluentTime.substring(
                3
              )}\n**Interés principal:** ${formData.interest.substring(
                3
              )}\n**Tiempo disponible:** ${formData.investTime.substring(3)}`,
              inline: false,
            },
          ],
          footer: {
            text: 'Outloud Language Academy • Official Registry',
            icon_url:
              'https://i.postimg.cc/fyvnv4XT/Diseno-sin-titulo-(14).png',
          },
          timestamp: new Date().toISOString(),
        },
      ],
    };

    // Conditionally inject Referral Data if toggled
    if (formData.referralToggle && (formData.refName || formData.refPhone)) {
      discordPayload.embeds[0].fields.push({
        name: '🤝 REFERRAL INFO',
        value: `**Refirió a:** ${
          formData.refName || 'N/A'
        }\n**Teléfono del referido:** ${formData.refPhone || 'N/A'}`,
        inline: false,
      });
    }

    // Always inject Payment Plan last
    discordPayload.embeds[0].fields.push({
      name: '💳 SECTION 3: PAYMENT PLANS',
      value: `**Modalidad:** ${formData.planType.substring(
        3
      )}\n**Plan Seleccionado:** ${formData.planSelect.substring(3)}`,
      inline: false,
    });

    try {
      await fetch(DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(discordPayload),
      });

      alert(
        '¡Inscripción enviada con éxito! / Registration submitted successfully!'
      );
      onReturnHome();
    } catch (error) {
      console.error('Error sending to Discord:', error);
      alert('Hubo un error al enviar la inscripción. Intente de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full font-sans bg-[#eef5fc] overflow-y-auto overflow-x-hidden flex flex-col p-4 md:p-8">
      <style>{`
        @keyframes blink-bg {
          0%, 100% { background-color: #e6f0f9; box-shadow: 0 0 0px transparent; }
          50% { background-color: #fef08a; box-shadow: inset 0 0 0 2px #eab308; }
        }
        @keyframes blink-text {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .animate-error-blink { animation: blink-bg 1s infinite; }
        .animate-text-blink { animation: blink-text 1s infinite; }
      `}</style>

      <div className="fixed inset-0 z-0 pointer-events-none">
        <img
          src="https://i.postimg.cc/PJbrcZdF/Agregar-un-subtitulo-(5).png"
          alt="Bubble Background"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="relative z-10 flex flex-row justify-between items-center w-full max-w-[90rem] mx-auto mb-6 shrink-0">
        <div className="flex items-center">
          <img
            src="https://i.postimg.cc/fyvnv4XT/Diseno-sin-titulo-(14).png"
            alt="Outloud Logo"
            className="h-10 lg:h-12 object-contain shrink-0"
          />
          <div className="mx-4 h-8 w-[2px] bg-outloud-blue opacity-40 shrink-0"></div>
          <span className="text-base lg:text-xl font-light text-outloud-blue font-montserrat whitespace-nowrap">
            Online Platform
          </span>
        </div>

        <button
          onClick={onReturnHome}
          className="flex items-center space-x-2 text-outloud-blue font-bold font-montserrat hover:text-blue-900 transition"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span className="text-sm lg:text-base">Return Home</span>
          <svg
            className="w-5 h-5 lg:w-6 lg:h-6"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
        </button>
      </div>

      <div className="relative z-10 flex-grow w-full max-w-[90rem] mx-auto bg-white/95 backdrop-blur-md rounded-[2.5rem] shadow-[0_20px_40px_rgba(0,0,0,0.1)] p-6 lg:p-10 flex flex-col mb-8">
        <div className="text-center mb-8 shrink-0">
          <h1 className="text-2xl lg:text-4xl font-black text-outloud-blue font-montserrat tracking-wide">
            NEW STUDENT REGISTRATION
          </h1>
          <p className="text-sm lg:text-lg text-outloud-blue font-montserrat mt-1 uppercase tracking-widest">
            (Planilla de Inscripción)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 flex-grow">
          {/* COLUMN 1 */}
          <div className="flex flex-col">
            <h3 className="text-xs lg:text-sm font-black text-outloud-blue font-montserrat tracking-wide mb-6">
              SECTION 1: PERSONAL INFO
            </h3>

            <div className="mb-4 relative">
              <label className="block text-[11px] lg:text-xs font-bold text-outloud-blue font-montserrat mb-1">
                Full name:
                <br />
                <span className="font-normal">(Nombre completo:)</span>
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                className={`w-full rounded-full px-4 py-2.5 text-[11px] lg:text-xs font-montserrat text-outloud-blue outline-none transition-all ${
                  errors.fullName
                    ? 'animate-error-blink text-red-700'
                    : 'bg-[#e6f0f9] focus:bg-[#d6e6f5]'
                }`}
              />
              {errors.fullName && (
                <p className="absolute -bottom-4 left-4 text-[9px] font-bold text-red-600 animate-text-blink">
                  Debe completar este campo
                </p>
              )}
            </div>

            <div className="mb-4 relative">
              <label className="block text-[11px] lg:text-xs font-bold text-outloud-blue font-montserrat mb-1">
                Email address:
                <br />
                <span className="font-normal">(Correo electrónico:)</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full rounded-full px-4 py-2.5 text-[11px] lg:text-xs font-montserrat text-outloud-blue outline-none transition-all ${
                  errors.email
                    ? 'animate-error-blink text-red-700'
                    : 'bg-[#e6f0f9] focus:bg-[#d6e6f5]'
                }`}
              />
              {errors.email && (
                <p className="absolute -bottom-4 left-4 text-[9px] font-bold text-red-600 animate-text-blink">
                  Debe completar este campo
                </p>
              )}
            </div>

            <div className="mb-4 relative">
              <label className="block text-[11px] lg:text-xs font-bold text-outloud-blue font-montserrat mb-1">
                Whatsapp/phone number:
                <br />
                <span className="font-normal">
                  (Número de teléfono/Whatsapp:)
                </span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={`w-full rounded-full px-4 py-2.5 text-[11px] lg:text-xs font-montserrat text-outloud-blue outline-none transition-all ${
                  errors.phone
                    ? 'animate-error-blink text-red-700'
                    : 'bg-[#e6f0f9] focus:bg-[#d6e6f5]'
                }`}
              />
              {errors.phone && (
                <p className="absolute -bottom-4 left-4 text-[9px] font-bold text-red-600 animate-text-blink">
                  Debe completar este campo
                </p>
              )}
            </div>
          </div>

          {/* COLUMN 2 */}
          <div className="flex flex-col md:border-l md:border-r border-gray-200 md:px-8 lg:px-12">
            <h3 className="text-xs lg:text-sm font-black text-outloud-blue font-montserrat tracking-wide mb-6 whitespace-nowrap">
              SECTION 2: COURSE GOALS
              <br />
              <span className="font-normal">(METAS PARA EL CURSO)</span>
            </h3>

            <CustomDropdown
              titleEng="Why do you want to learn English?"
              titleSpan="¿Por qué quieres aprender inglés?"
              options={reasonOptions}
              value={formData.reason}
              onChange={(val) => handleInputChange('reason', val)}
              hasError={errors.reason}
            />
            <CustomDropdown
              titleEng="You expect to be fluent in..."
              titleSpan="¿En cuánto tiempo te gustaría hablar fluido?"
              options={fluentOptions}
              value={formData.fluentTime}
              onChange={(val) => handleInputChange('fluentTime', val)}
              hasError={errors.fluentTime}
            />
            <CustomDropdown
              titleEng="Select one interest category"
              titleSpan="Selecciona 1 Interés"
              options={interestOptions}
              value={formData.interest}
              onChange={(val) => handleInputChange('interest', val)}
              hasError={errors.interest}
            />
            <CustomDropdown
              titleEng="How much time can you invest?"
              titleSpan="¿De cuánto tiempo dispones para aprender?"
              options={investOptions}
              value={formData.investTime}
              onChange={(val) => handleInputChange('investTime', val)}
              hasError={errors.investTime}
            />

            <div className="mt-2 relative z-10">
              <div
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    referralToggle: !prev.referralToggle,
                  }))
                }
                className="w-full cursor-pointer flex justify-between items-center rounded-full bg-[#e6f0f9] hover:bg-[#d6e6f5] px-4 py-2.5 text-[11px] lg:text-xs font-montserrat text-outloud-blue transition-all duration-300 mb-2"
              >
                <span>Quiero recomendar este curso a alguien</span>
                <svg
                  className={`w-4 h-4 transition-transform duration-300 ${
                    formData.referralToggle ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>

              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  formData.referralToggle
                    ? 'grid-rows-[1fr] opacity-100'
                    : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="overflow-hidden flex flex-col space-y-2">
                  <input
                    type="text"
                    placeholder="Nombre del referido"
                    value={formData.refName}
                    onChange={(e) =>
                      handleInputChange('refName', e.target.value)
                    }
                    className="w-full rounded-full bg-[#e6f0f9] px-4 py-2.5 text-[10px] lg:text-[11px] font-montserrat text-outloud-blue outline-none"
                  />
                  <input
                    type="tel"
                    placeholder="Teléfono del referido"
                    value={formData.refPhone}
                    onChange={(e) =>
                      handleInputChange('refPhone', e.target.value)
                    }
                    className="w-full rounded-full bg-[#e6f0f9] px-4 py-2.5 text-[10px] lg:text-[11px] font-montserrat text-outloud-blue outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* COLUMN 3 */}
          <div className="flex flex-col flex-grow justify-between">
            <div>
              <h3 className="text-xs lg:text-sm font-black text-outloud-blue font-montserrat tracking-wide mb-6 whitespace-nowrap">
                SECTION 3: PAYMENT PLANS
                <br />
                <span className="font-normal">(PLANES DE PAGO)</span>
              </h3>

              <CustomDropdown
                titleEng="Plan type"
                titleSpan="Tipo de plan"
                options={planTypeOptions}
                value={formData.planType}
                onChange={(val) => handleInputChange('planType', val)}
                hasError={errors.planType}
              />
              <CustomDropdown
                titleEng="Select plan"
                titleSpan="Seleccione su plan"
                options={currentPlanOptions}
                value={formData.planSelect}
                onChange={(val) => handleInputChange('planSelect', val)}
                hasError={errors.planSelect}
              />
            </div>

            <div className="flex flex-col space-y-3 mt-10 lg:mt-auto">
              <button
                type="button"
                className="w-full bg-student-yellow hover:bg-yellow-500 text-outloud-blue font-black font-montserrat py-3 lg:py-4 rounded-xl shadow-md transition-colors text-sm lg:text-base border-2 border-transparent"
              >
                FREE TRIAL /<br />
                PRUEBA GRATIS
              </button>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-outloud-blue hover:bg-blue-900 text-white font-black font-montserrat py-3 lg:py-4 rounded-xl shadow-md transition-colors text-sm lg:text-base border-2 border-transparent"
              >
                {isSubmitting ? 'ENVIANDO...' : 'SUBMIT / ENVIAR'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPage;
