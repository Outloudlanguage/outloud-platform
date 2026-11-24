import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LEVEL_OPTIONS } from '../../../constants/adminConfigs';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

const MONTHLY_PRICES = { A1: 20, A2: 20, B1: 30, B2: 30, C1: 50, C2: 50 };
const getBaseLevel = (lvlString) => (lvlString ? lvlString.split(':')[0].trim() : 'A1');
const getDefaultCohort = () => (new Date().getDate() <= 15 ? 15 : 30);

const StudentManagerModal = ({ isOpen, onClose, userData, isPending, supabase, onSuccess, onImpersonate }) => {
  const reportRef = useRef(null);
  const [activeTab, setActiveTab] = useState('INFO_PERSONAL');
  const userRole = userData?.role || 'Student';

  // TAB 1: INFO PERSONAL
  const [provEmail, setProvEmail] = useState('');
  const [provPassword, setProvPassword] = useState('');
  const [provFirstName, setProvFirstName] = useState('');
  const [provLastName, setProvLastName] = useState('');
  const [provPhone, setProvPhone] = useState('');
  const [provAvatarUrl, setProvAvatarUrl] = useState('');

  const [isEditingCreds, setIsEditingCreds] = useState(false);
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');

  const [isProcessing, setIsProcessing] = useState(false);
  const [accountStatus, setAccountStatus] = useState('active');

  const [levelOverride, setLevelOverride] = useState('A1: Básico 1');
  const [unitOverride, setUnitOverride] = useState(1);

  // TAB 2: FINANZAS (Students)
  const [cohort, setCohort] = useState(15);
  const [credits, setCredits] = useState(0);

  const [payType, setPayType] = useState('Mensualidad');
  const [payAmount, setPayAmount] = useState(20);
  const [payRef, setPayRef] = useState('');

  const [provPayRef, setProvPayRef] = useState('');
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState(false);

  // TAB 3: ESTADISTICAS (Students)
  const [academicHistory, setAcademicHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // TEACHER PAYROLL & STATS STATES
  const [pendingClasses, setPendingClasses] = useState([]);
  const [pendingShifts, setPendingShifts] = useState([]);
  const [payrollCadence, setPayrollCadence] = useState('Monthly');
  const [payrollRef, setPayrollRef] = useState('');
  const [isFetchingPayroll, setIsFetchingPayroll] = useState(false);

  const [manualBonus, setManualBonus] = useState('');
  const [manualDeduction, setManualDeduction] = useState('');
  const [evaluations, setEvaluations] = useState([]);
  const [opMetrics, setOpMetrics] = useState(null);
  const [opScore, setOpScore] = useState(0);

  // Lightweight Toast
  const [modalToast, setModalToast] = useState(null);
  const showToast = (message, tone = 'success') => {
    setModalToast({ message, tone });
    setTimeout(() => {
      setModalToast((curr) => (curr?.message === message ? null : curr));
    }, 3400);
  };

  const updatePrice = (type, levelString) => {
    if (type === 'Extra') setPayAmount(12);
    else setPayAmount(MONTHLY_PRICES[getBaseLevel(levelString)] || 20);
  };

  // ==========================================
  // INITIALIZATION
  // ==========================================
  useEffect(() => {
    if (userData) {
      setProvEmail(userData.email || '');
      setProvPassword('');
      setProvAvatarUrl(userData.avatar_url || '');

      const nameParts = (userData.full_name || '').trim().split(' ');
      setProvFirstName(userData.first_name || nameParts[0] || '');
      setProvLastName(userData.last_name || (nameParts.length > 1 ? nameParts.slice(1).join(' ') : ''));
      setProvPhone(userData.whatsapp || userData.phone || '');

      setEditEmail(userData.email || '');
      setEditPassword(userData.assigned_password || '');
      setEditAvatarUrl(userData.avatar_url || '');
      setIsEditingCreds(false);

      setAccountStatus(userData.status || 'active');
      const initLevel = userData.level || 'A1: Básico 1';
      setLevelOverride(initLevel);
      setUnitOverride(userData.unit || 1);

      setCohort(userData.cohort || getDefaultCohort());
      setCredits(userData.available_credits || 0);

      setActiveTab('INFO_PERSONAL');
      setPayType('Mensualidad');
      setPayAmount(MONTHLY_PRICES[getBaseLevel(initLevel)] || 20);
    }
  }, [userData]);

  // ==========================================
  // DATA FETCHERS (Clean useCallback)
  // ==========================================
  const fetchPaymentHistory = useCallback(async () => {
    if (!userData?.id) return;
    setIsLoadingPayments(true);
    try {
      const { data, error } = await supabase
        .from('student_payments')
        .select('*')
        .eq('student_id', userData.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setPaymentHistory(data || []);
    } catch (err) {
      console.error('Error fetching payments:', err);
    } finally {
      setIsLoadingPayments(false);
    }
  }, [supabase, userData?.id]);

  const fetchAcademicHistory = useCallback(async () => {
    if (!userData?.id) return;
    setIsLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from('academic_records')
        .select('*, teacher:profiles!teacher_id(first_name, last_name)')
        .eq('student_id', userData.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAcademicHistory(data || []);
    } catch (error) {
      console.error('Error fetching academic history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [supabase, userData?.id]);

  const fetchTeacherPayroll = useCallback(async () => {
    if (!userData?.id) return;
    setIsFetchingPayroll(true);
    try {
      const { data: classes } = await supabase
        .from('live_sessions')
        .select('*')
        .eq('teacher_id', userData.id)
        .eq('is_paid_out', false)
        .eq('status', 'completed');

      const { data: shifts } = await supabase
        .from('teacher_shifts')
        .select('*')
        .eq('teacher_id', userData.id)
        .eq('is_paid_out', false);

      const { data: evals } = await supabase
        .from('class_evaluations')
        .select('*')
        .eq('teacher_id', userData.id);

      let punctualityScore = 100;
      let responsibilityScore = 100;
      let socialScore = 100;
      let teachingScore = 100;
      let passRateScore = 100;

      const { data: allSessions } = await supabase
        .from('live_sessions')
        .select('*')
        .eq('teacher_id', userData.id);

      if (allSessions && allSessions.length > 0) {
        const standardClasses = allSessions.filter(
          (s) => s.status === 'completed' && (!s.class_type || !s.class_type.toLowerCase().includes('social'))
        );
        if (standardClasses.length > 0) {
          let totalPunctuality = 0;
          standardClasses.forEach((c) => {
            const sched = new Date(c.scheduled_at);
            const prepStart = c.prep_started_at
              ? new Date(c.prep_started_at)
              : new Date(sched.getTime() - 10 * 60000);
            const actualStart = c.actual_start_at ? new Date(c.actual_start_at) : sched;
            const actualEnd = c.ended_at ? new Date(c.ended_at) : new Date(sched.getTime() + 45 * 60000);
            const gradedAt = c.graded_at ? new Date(c.graded_at) : new Date(actualEnd.getTime() + 5 * 60000);

            let classMins = 60;
            const prepDiff = (sched - prepStart) / 60000;
            if (prepDiff < 10) classMins -= 10 - Math.max(0, prepDiff);
            const startDelay = (actualStart - sched) / 60000;
            if (startDelay > 0) classMins -= startDelay;
            const endEarly = (new Date(sched.getTime() + 45 * 60000) - actualEnd) / 60000;
            if (endEarly > 0) classMins -= endEarly;
            const gradeDelay = (gradedAt - actualEnd) / 60000;
            if (gradeDelay > 5) classMins -= Math.min(6, gradeDelay - 5);

            totalPunctuality += Math.max(0, (classMins / 60) * 100);
          });
          punctualityScore = Math.round(totalPunctuality / standardClasses.length);
        }

        const cancelledCount = allSessions.filter(
          (s) => s.status === 'cancelled' && s.cancelled_by === userData.id
        ).length;
        responsibilityScore -= cancelledCount * 15;

        const socialClasses = allSessions.filter(
          (s) => s.class_type && s.class_type.toLowerCase().includes('social')
        );
        if (socialClasses.length > 0) {
          const successfulSocials = socialClasses.filter((s) => {
            if (s.status !== 'completed') return false;
            const start = new Date(s.actual_start_at || s.scheduled_at);
            const end = new Date(s.ended_at || new Date(start.getTime() + 60 * 60000));
            return (end - start) / 60000 >= 55;
          }).length;
          socialScore = Math.round((successfulSocials / socialClasses.length) * 100);
        }
      }

      const { data: allShifts } = await supabase
        .from('teacher_shifts')
        .select('status')
        .eq('teacher_id', userData.id);
      if (allShifts && allShifts.length > 0) {
        const missedShifts = allShifts.filter((s) => s.status === 'missed').length;
        responsibilityScore -= missedShifts * 10;
      }
      responsibilityScore = Math.max(0, responsibilityScore);

      if (userData.total_rating_questions > 0) {
        teachingScore = Math.round((userData.total_positive_ratings / userData.total_rating_questions) * 100);
      } else {
        teachingScore = 95;
      }

      const { data: supervision } = await supabase
        .from('engine_teacher_supervision')
        .select('teacher_fail_rate')
        .eq('teacher_id', userData.id)
        .maybeSingle();
      if (supervision && supervision.teacher_fail_rate !== null) {
        passRateScore = Math.round(100 - supervision.teacher_fail_rate * 100);
      } else {
        passRateScore = 92;
      }

      setOpMetrics([
        { subject: 'Puntualidad', score: punctualityScore, fullMark: 100 },
        { subject: 'Responsabilidad', score: responsibilityScore, fullMark: 100 },
        { subject: 'Pedagogía', score: teachingScore, fullMark: 100 },
        { subject: 'Aprobación', score: passRateScore, fullMark: 100 },
        { subject: 'Eventos Sociales', score: socialScore, fullMark: 100 },
      ]);
      setOpScore(Math.round((punctualityScore + responsibilityScore + teachingScore + passRateScore + socialScore) / 5));

      setPendingClasses(classes || []);
      setPendingShifts(shifts || []);
      setEvaluations(evals || []);
      setPayrollCadence(userData.payroll_cadence || 'Monthly');
    } catch (e) {
      console.error('Error fetching payroll:', e);
    } finally {
      setIsFetchingPayroll(false);
    }
  }, [
    supabase,
    userData?.id,
    userData?.total_rating_questions,
    userData?.total_positive_ratings,
    userData?.payroll_cadence,
  ]);

  useEffect(() => {
    if (isOpen && !isPending && userData?.id && !String(userData?.id).startsWith('mock')) {
      if (activeTab === 'ESTADISTICAS' && userRole === 'Student') {
        fetchAcademicHistory();
      }
      if ((activeTab === 'PAYROLL' || activeTab === 'TEACHER_STATS') && userRole === 'Teacher') {
        fetchTeacherPayroll();
      }
      if (activeTab === 'FINANZAS' && userRole === 'Student') {
        fetchPaymentHistory();
      }
    }
  }, [
    isOpen,
    isPending,
    userData?.id,
    activeTab,
    userRole,
    fetchAcademicHistory,
    fetchTeacherPayroll,
    fetchPaymentHistory,
  ]);

  // ==========================================
  // TEACHER PAYROLL ACTIONS
  // ==========================================
  const handleSaveCadence = async (newCadence) => {
    setPayrollCadence(newCadence);
    try {
      await supabase.from('profiles').update({ payroll_cadence: newCadence }).eq('id', userData.id);
      showToast(`Frecuencia actualizada: ${newCadence}`, 'info');
    } catch (e) {
      console.error('Error saving cadence', e);
    }
  };

  let totalPayroll = 0;
  let nightClassesCount = 0;
  let dayClassesCount = 0;
  let noShowCount = 0;

  pendingClasses.forEach((cls) => {
    if (cls.student_no_show) {
      totalPayroll += 2;
      noShowCount++;
    } else {
      const date = new Date(cls.scheduled_at);
      const hour = date.getHours();
      const durationHrs = (cls.duration_minutes || 60) / 60;

      if (hour >= 18) {
        totalPayroll += 4 * durationHrs;
        nightClassesCount++;
      } else {
        totalPayroll += 3 * durationHrs;
        dayClassesCount++;
      }
    }
  });

  const shiftCount = pendingShifts.length;
  totalPayroll += shiftCount * 2;

  const finalTotalPayroll = Math.max(
    0,
    totalPayroll + (Number(manualBonus) || 0) - (Number(manualDeduction) || 0)
  );

  const handleMarkAsPaid = async (e) => {
    e.preventDefault();
    if (!payrollRef) return showToast('Ingresa un número de referencia.', 'error');

    setIsProcessing(true);
    try {
      if (pendingClasses.length > 0) {
        const classIds = pendingClasses.map((c) => c.id);
        await supabase.from('live_sessions').update({ is_paid_out: true }).in('id', classIds);
      }

      if (pendingShifts.length > 0) {
        const shiftIds = pendingShifts.map((s) => s.id);
        await supabase.from('teacher_shifts').update({ is_paid_out: true }).in('id', shiftIds);
      }

      await supabase.from('financial_logs').insert({
        student_id: userData.id,
        type: 'payroll_payout',
        description: `Teacher Payout - Cadence: ${payrollCadence} | Ref: ${payrollRef} | Bonus: $${
          manualBonus || 0
        } | Deduct: $${manualDeduction || 0}`,
        amount: finalTotalPayroll,
      });

      showToast('¡Nómina liquidada exitosamente!', 'success');
      setPayrollRef('');
      setManualBonus('');
      setManualDeduction('');
      fetchTeacherPayroll();
    } catch (err) {
      console.error(err);
      showToast('Hubo un error liquidando la nómina.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Radar Calculations
  const totalEvals = evaluations.length;
  let radarData = [
    { subject: 'Actitud', A: 100 },
    { subject: 'Claridad', A: 100 },
    { subject: 'Participación', A: 100 },
    { subject: 'Contenido', A: 100 },
    { subject: 'Tiempo', A: 100 },
  ];
  let globalRating = '5.0';

  if (totalEvals > 0) {
    const sum = (key) => evaluations.filter((e) => e[key] === true).length;
    radarData = [
      { subject: 'Actitud', A: (sum('q_demeanor') / totalEvals) * 100 },
      { subject: 'Claridad', A: (sum('q_clarity') / totalEvals) * 100 },
      { subject: 'Participación', A: (sum('q_facilitation') / totalEvals) * 100 },
      { subject: 'Contenido', A: (sum('q_content') / totalEvals) * 100 },
      { subject: 'Tiempo', A: (sum('q_time') / totalEvals) * 100 },
    ];
    const totalPositives =
      sum('q_demeanor') + sum('q_clarity') + sum('q_facilitation') + sum('q_content') + sum('q_time');
    globalRating = ((totalPositives / (totalEvals * 5)) * 5).toFixed(1);
  } else if (userData?.total_rating_questions > 0) {
    globalRating = ((userData.total_positive_ratings / userData.total_rating_questions) * 5).toFixed(1);
  }

  // ==========================================
  // ACADEMIC & PDF ACTIONS
  // ==========================================
  const handleGenerateReport = async () => {
    if (!reportRef.current) return;
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(
        `OutLoud_Report_${userData.first_name || 'Student'}_${new Date().toISOString().split('T')[0]}.pdf`
      );
      showToast('Reporte PDF descargado.', 'success');
    } catch (error) {
      console.error('PDF Generation Error:', error);
      showToast('Error generando el reporte PDF.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveOverrides = async () => {
    setIsProcessing(true);
    try {
      if (String(userData?.id).startsWith('mock')) {
        if (onSuccess) onSuccess();
        return;
      }
      const { error } = await supabase
        .from('profiles')
        .update({ level: getBaseLevel(levelOverride), unit: unitOverride })
        .eq('id', userData.id);
      if (error) throw error;
      showToast('Overrides académicos guardados.', 'success');
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(error);
      showToast('Error guardando los overrides.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // ==========================================
  // FINANCIAL ACTIONS (STUDENTS)
  // ==========================================
  const handlePayTypeChange = (e) => {
    const newType = e.target.value;
    setPayType(newType);
    updatePrice(newType, levelOverride);
  };

  const calculateProration = (targetCohort, price) => {
    const today = new Date();
    const nextBilling = new Date(today.getFullYear(), today.getMonth(), targetCohort);
    if (today.getDate() >= targetCohort) nextBilling.setMonth(nextBilling.getMonth() + 1);
    const daysLeft = Math.max(0, Math.ceil((nextBilling - today) / (1000 * 60 * 60 * 24)));
    return ((price / 30) * daysLeft).toFixed(2);
  };

  const proratedDue = calculateProration(cohort, MONTHLY_PRICES[getBaseLevel(levelOverride)] || 20);

  const handleSaveCohort = async () => {
    setIsProcessing(true);
    try {
      if (String(userData?.id).startsWith('mock')) {
        if (onSuccess) onSuccess();
        return;
      }
      const today = new Date();
      const nextBilling = new Date(today.getFullYear(), today.getMonth(), cohort);
      if (today.getDate() >= cohort) nextBilling.setMonth(nextBilling.getMonth() + 1);

      const { error } = await supabase
        .from('profiles')
        .update({
          cohort: cohort,
          next_billing_date: nextBilling.toISOString().split('T')[0],
        })
        .eq('id', userData.id);

      if (error) throw error;
      showToast(`Cohorte día ${cohort} guardada. Prorrateo: $${proratedDue}`, 'success');
      if (onSuccess) onSuccess();
    } catch (e) {
      console.error(e);
      showToast('Error actualizando la cohorte.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRefund = async () => {
    const newCredits = credits + 1;
    setCredits(newCredits);
    if (String(userData?.id).startsWith('mock')) return;
    try {
      await supabase.from('profiles').update({ available_credits: newCredits }).eq('id', userData.id);
      await supabase.from('financial_logs').insert({
        student_id: userData.id,
        type: 'refund',
        description: '+1 Credit (Academy Fault)',
        amount: 0,
      });
      showToast('+1 crédito reembolsado correctamente.', 'success');
      if (onSuccess) onSuccess();
    } catch (e) {
      console.error(e);
      showToast('Error procesando el reembolso.', 'error');
    }
  };

  const calculateNextBillingDate = () => {
    const d = new Date();
    let nextMonth = new Date(d.getFullYear(), d.getMonth() + 1, cohort);
    if (cohort === 30 && nextMonth.getMonth() !== (d.getMonth() + 1) % 12) {
      nextMonth = new Date(d.getFullYear(), d.getMonth() + 2, 0);
    }
    return nextMonth.toISOString().split('T')[0];
  };

  const handleProcessRenewal = async (e) => {
    e.preventDefault();
    if (!payRef) return showToast('Incluye un número de referencia de pago.', 'error');

    setIsProcessing(true);
    try {
      if (String(userData?.id).startsWith('mock')) {
        showToast('Simulación de renovación exitosa.', 'success');
        setIsProcessing(false);
        return;
      }

      const currentBase = getBaseLevel(levelOverride);
      const nextLevelInfo = {
        A1: { level: 'A2: Básico 2', unit: 13 },
        A2: { level: 'B1: Intermedio 1', unit: 25 },
        B1: { level: 'B2: Intermedio 2', unit: 37 },
        B2: { level: 'C1: Avanzado 1', unit: 49 },
        C1: { level: 'C2: Avanzado 2', unit: 71 },
        C2: { level: 'C2: Avanzado 2', unit: 92 },
      }[currentBase] || { level: 'A2: Básico 2', unit: 13 };

      const { error: ledgerError } = await supabase.from('student_payments').insert({
        student_id: userData.id,
        amount: payAmount,
        reference_number: payRef,
        status: 'verified',
      });
      if (ledgerError) throw ledgerError;

      const newCredits = 4;
      const updates = {
        available_credits: newCredits,
        level_completed: false,
        level: getBaseLevel(nextLevelInfo.level),
        unit: nextLevelInfo.unit,
        next_billing_date: calculateNextBillingDate(),
        payment_status: 'good_standing',
        status: 'active',
      };

      const { error: profileError } = await supabase.from('profiles').update(updates).eq('id', userData.id);
      if (profileError) throw profileError;

      setCredits(newCredits);
      setLevelOverride(nextLevelInfo.level);
      setUnitOverride(nextLevelInfo.unit);

      showToast(`Promovido a ${nextLevelInfo.level} (U${nextLevelInfo.unit}) + 4 créditos.`, 'success');
      setPayRef('');
      fetchPaymentHistory();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Renewal Error:', error);
      showToast('Error procesando la renovación en BD.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyPendingPayment = async (payment) => {
    setIsProcessing(true);
    try {
      await supabase.from('student_payments').update({ status: 'verified' }).eq('id', payment.id);

      const newCredits = 4;
      const updates = {
        available_credits: newCredits,
        next_billing_date: calculateNextBillingDate(),
        payment_status: 'good_standing',
        status: 'active',
      };

      await supabase.from('profiles').update(updates).eq('id', userData.id);

      setCredits(newCredits);
      setAccountStatus('active');
      showToast('Pago verificado. Cuenta reactivada + 4 créditos.', 'success');

      fetchPaymentHistory();
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Verification error:', err);
      showToast('Error verificando el pago.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!payRef) return showToast('Incluye un número de referencia de pago.', 'error');

    setIsProcessing(true);
    try {
      if (String(userData?.id).startsWith('mock')) {
        showToast('Simulación de pago exitosa.', 'success');
        setIsProcessing(false);
        return;
      }

      const { error: ledgerError } = await supabase.from('student_payments').insert({
        student_id: userData.id,
        amount: payAmount,
        reference_number: payRef,
        status: 'verified',
      });
      if (ledgerError) throw ledgerError;

      const newCredits = payType === 'Mensualidad' ? 4 : credits + 2;
      const updates = { available_credits: newCredits };

      if (payType === 'Mensualidad') {
        updates.next_billing_date = calculateNextBillingDate();
        updates.payment_status = 'good_standing';
        updates.status = 'active';
      }

      const { error: profileError } = await supabase.from('profiles').update(updates).eq('id', userData.id);
      if (profileError) throw profileError;

      setCredits(newCredits);
      showToast('Pago registrado y créditos aplicados.', 'success');
      setPayRef('');
      fetchPaymentHistory();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Payment Error:', error);
      showToast('Error procesando el pago en BD.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // ==========================================
  // ACCOUNT CONTROL ACTIONS
  // ==========================================
  const handleProvisionAccount = async () => {
    if (!provEmail || !provPassword || !provFirstName || !provLastName) {
      return showToast('Nombres, apellidos, correo y contraseña son obligatorios.', 'error');
    }
    if (userRole === 'Student' && !provPayRef) {
      return showToast('Incluye la referencia de pago de inscripción ($10).', 'error');
    }

    setIsProcessing(true);
    try {
      if (String(userData?.id).startsWith('mock')) {
        showToast('Cuenta simulada aprovisionada.', 'success');
        if (onSuccess) onSuccess();
        onClose();
        return;
      }

      const cleanEmail = provEmail.trim().toLowerCase();

      const { data, error: invokeError } = await supabase.functions.invoke('provision-user', {
        body: {
          email: cleanEmail,
          password: provPassword,
          firstName: provFirstName.trim(),
          lastName: provLastName.trim(),
          role: userData.role || 'Student',
          level: userRole === 'Student' ? getBaseLevel(levelOverride) : 'Staff',
          unit: userRole === 'Student' ? unitOverride : 1,
        },
      });

      if (invokeError) throw new Error(`Fallo de Conexión: ${invokeError.message}`);
      if (data?.error) throw new Error(`Error de Autenticación: ${data.error}`);

      const newUserId = data?.user?.id;
      if (!newUserId) throw new Error('No se pudo obtener el ID del usuario desde la función.');

      const updates = {
        email: cleanEmail,
        first_name: provFirstName.trim(),
        last_name: provLastName.trim(),
        whatsapp: provPhone || null,
        avatar_url: provAvatarUrl.trim() || null,
        assigned_password: provPassword,
        status: userRole === 'Student' ? 'pending_activation' : 'active',
        role: userData.role || 'Student',
      };

      if (userRole === 'Student') {
        updates.cohort = cohort;
        updates.available_credits = 0;
        updates.payment_status = 'pending_first_month';
        updates.level = getBaseLevel(levelOverride);
        updates.unit = unitOverride;
      }

      const { error: profileError } = await supabase.from('profiles').update(updates).eq('id', newUserId);
      if (profileError) throw new Error(`Fallo actualizando perfil en BD: ${profileError.message}`);

      await supabase.from('registrations').update({ status: 'approved' }).eq('id', userData.id);

      if (userRole === 'Student' && provPayRef) {
        await supabase.from('student_payments').insert({
          student_id: newUserId,
          payment_type: 'Onboarding Fee',
          amount: 10.0,
          reference_number: provPayRef,
          status: 'verified',
        });
      }

      alert(`Cuenta de ${userRole} aprovisionada exitosamente. El usuario ya está activo en el directorio.`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Provisioning Fatal Error:', error);
      alert(`Error Crítico:\n\n${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteLead = async () => {
    const isConfirm = window.confirm(
      '¿Estás seguro de que deseas eliminar permanentemente a este prospecto? Esta acción no se puede deshacer.'
    );
    if (!isConfirm) return;

    setIsProcessing(true);
    try {
      if (String(userData?.id).startsWith('mock')) {
        onClose();
        return;
      }

      const { error } = await supabase.from('registrations').delete().eq('id', userData.id);
      if (error) throw error;

      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Error deleting lead:', error);
      showToast('Error al intentar eliminar el registro.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateCredentials = async () => {
    if (!editEmail || !editPassword) {
      return showToast('El correo y contraseña no pueden estar vacíos.', 'error');
    }

    setIsProcessing(true);
    try {
      if (String(userData?.id).startsWith('mock')) {
        setIsEditingCreds(false);
        setIsProcessing(false);
        return;
      }

      const { error: authError } = await supabase.functions.invoke('manage-credentials', {
        body: { userId: userData.id, email: editEmail, password: editPassword },
      });
      if (authError) throw authError;

      const updates = { email: editEmail, assigned_password: editPassword };
      if (editAvatarUrl.trim() !== '') {
        updates.avatar_url = editAvatarUrl.trim();
      }

      const { error: profileError } = await supabase.from('profiles').update(updates).eq('id', userData.id);
      if (profileError) throw profileError;

      showToast('Credenciales actualizadas correctamente.', 'success');
      setIsEditingCreds(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Credential Update Error:', error);
      showToast(`Error al actualizar: ${error.message}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKillSwitch = async (newStatus) => {
    const isConfirm = window.confirm(
      newStatus === 'suspended'
        ? `¿Estás seguro de que deseas SUSPENDER el acceso de este ${userRole}?`
        : `¿Deseas REACTIVAR el acceso de este ${userRole}?`
    );
    if (!isConfirm) return;

    setIsProcessing(true);
    try {
      if (String(userData?.id).startsWith('mock')) {
        setAccountStatus(newStatus);
        setIsProcessing(false);
        return;
      }

      const { error } = await supabase.from('profiles').update({ status: newStatus }).eq('id', userData.id);
      if (error) throw error;
      setAccountStatus(newStatus);
      showToast(`Estado actualizado a: ${newStatus}`, 'info');
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Kill Switch Error:', error);
      showToast('Error al cambiar el estado del usuario.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const getTabsForRole = () => {
    if (userRole === 'Admin') {
      return [{ id: 'INFO_PERSONAL', label: 'Info Personal & Control' }];
    }
    if (userRole === 'Teacher') {
      return [
        { id: 'INFO_PERSONAL', label: 'Info Personal' },
        { id: 'PAYROLL', label: 'Nómina & Desglose' },
        { id: 'TEACHER_STATS', label: 'Estadísticas' },
      ];
    }
    return [
      { id: 'INFO_PERSONAL', label: 'Info Personal' },
      { id: 'FINANZAS', label: 'Finanzas & Créditos' },
      { id: 'ESTADISTICAS', label: 'Estadísticas' },
    ];
  };

  const activeTabs = getTabsForRole();

  if (!isOpen || !userData) return null;

  const isPastDue = userData.next_billing_date && new Date(userData.next_billing_date) < new Date();

  return (
    <div
      id="modal-overlay"
      onClick={(e) => e.target.id === 'modal-overlay' && onClose()}
      className="fixed inset-0 z-[300] flex items-end md:items-center justify-center p-0 md:p-4 bg-[#1e2246]/55 backdrop-blur-xl font-montserrat text-[#1e2246]"
    >
      <style>{`
        .ola-smm-phone .PhoneInput { display: flex; align-items: center; width: 100%; }
        .ola-smm-phone .PhoneInputInput {
          background: transparent !important;
          color: #1e2246 !important;
          outline: none !important;
          border: none !important;
          font-size: 0.85rem !important;
          font-weight: 600 !important;
          margin-left: 0.65rem !important;
          min-width: 0;
        }
        .ola-smm-phone .PhoneInputCountry { margin-right: 0.4rem; }
        .ola-smm-phone .PhoneInputCountrySelectArrow { color: #454d82; }
        .ola-smm-phone .PhoneInputCountrySelect { color: #1e2246; background: #ffffff; }
      `}</style>

      {/* TOAST */}
      {modalToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9500] px-5 py-3 rounded-full bg-[#1e2246] text-white border-2 border-[#ffc749] shadow-2xl flex items-center gap-2.5 text-xs font-bold max-w-[92vw]">
          <span
            className={`w-2.5 h-2.5 rounded-full shrink-0 ${
              modalToast.tone === 'error'
                ? 'bg-[#ee665b]'
                : modalToast.tone === 'info'
                ? 'bg-[#ffc749]'
                : 'bg-[#16a37f]'
            }`}
          />
          <span>{modalToast.message}</span>
        </div>
      )}

      <div className="bg-gradient-to-br from-white/95 to-[#f2f4fd]/90 backdrop-blur-2xl border-2 border-white shadow-[0_24px_54px_-16px_rgba(30,34,70,0.34),inset_0_2px_2px_#ffffff] relative w-full max-w-4xl max-h-[92vh] rounded-t-[2.25rem] md:rounded-[2.5rem] flex flex-col overflow-hidden">
        {/* TOP IDENTITY HEADER */}
        <div className="relative z-10 flex items-start justify-between p-5 sm:p-7 border-b border-[#626a9f]/15 bg-white/80 shrink-0">
          <div className="flex items-center gap-4 overflow-hidden w-full pr-4">
            <div className="relative shrink-0">
              <img
                src={
                  userData.avatar_url ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    userData.first_name || userData.full_name || 'U'
                  )}&background=626a9f&color=fff`
                }
                alt="Profile Avatar"
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 shadow-sm ${
                  isPending
                    ? 'border-[#ffc749]'
                    : accountStatus === 'suspended'
                    ? 'border-[#ee665b] opacity-55 grayscale'
                    : 'border-[#1e2246]'
                }`}
              />
              {isPending && (
                <span className="absolute -bottom-2 -right-2 bg-[#ffc749] text-[#1e2246] border border-[#1e2246] text-[8.5px] font-extrabold uppercase px-2 py-0.5 rounded-full shadow-sm">
                  Lead
                </span>
              )}
              {accountStatus === 'suspended' && (
                <span className="absolute -bottom-2 -right-2 bg-[#ee665b] text-white text-[8.5px] font-extrabold uppercase px-2 py-0.5 rounded-full shadow-sm">
                  Suspended
                </span>
              )}
            </div>

            <div className="flex flex-col overflow-hidden w-full">
              <h2
                className={`text-lg sm:text-2xl font-extrabold tracking-tight truncate ${
                  accountStatus === 'suspended' ? 'text-[#626a9f]' : 'text-[#1e2246]'
                }`}
              >
                {userData.full_name || `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || 'Sin Nombre'}
              </h2>
              <p className="text-xs text-[#4c5384] font-semibold mt-0.5 truncate">
                {userData.email} {userData.whatsapp ? `• ${userData.whatsapp}` : ''}
              </p>

              <div className="flex flex-wrap items-center gap-2 mt-2">
                {!isPending && userRole === 'Student' && (
                  <>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider bg-[#1e2246] text-[#ffc749] px-2.5 py-0.5 rounded-full">
                      Nivel {getBaseLevel(levelOverride)} • U{unitOverride}
                    </span>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider bg-[#fff3d1] text-[#1e2246] border border-[#ffc749] px-2.5 py-0.5 rounded-full">
                      {credits} Créditos
                    </span>
                    {userData.level_completed && (
                      <span className="text-[10px] font-extrabold uppercase tracking-wider bg-[#16a37f] text-white px-2.5 py-0.5 rounded-full animate-pulse">
                        Nivel Completado • Renovar
                      </span>
                    )}
                  </>
                )}

                {!isPending && userRole !== 'Student' && (
                  <>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider bg-[#5b64a0] text-white px-2.5 py-0.5 rounded-full">
                      {userRole}
                    </span>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider bg-[#e7faf3] text-[#128063] px-2.5 py-0.5 rounded-full">
                      Desde {new Date(userData.created_at || Date.now()).toLocaleDateString('es-ES')}
                    </span>
                  </>
                )}

                {!isPending && onImpersonate && userRole === 'Student' && (
                  <button
                    type="button"
                    onClick={() => onImpersonate(userData)}
                    className="inline-flex items-center gap-1.5 bg-white hover:bg-[#ffc749] text-[#1e2246] border border-[#1e2246]/35 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>Ver como Alumno</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="w-9 h-9 rounded-full bg-white hover:bg-[#ffc749] border-2 border-[#1e2246] flex items-center justify-center text-[#1e2246] font-bold transition-all active:scale-90 shrink-0 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* FLOATING PILL TAB SWITCHER */}
        <div className="relative z-10 px-5 sm:px-7 py-3 bg-white/55 border-b border-[#626a9f]/15 shrink-0">
          <div className="flex gap-1 bg-[#e8eaf7] p-1 rounded-full border border-white">
            {activeTabs.map((tab) => (
              <button
                type="button"
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2.5 px-3 rounded-full text-[10.5px] sm:text-xs font-extrabold uppercase tracking-wider cursor-pointer transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#1e2246] text-[#ffc749] shadow-sm'
                    : 'text-[#454d82] hover:text-[#1e2246]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* BODY CONTENT */}
        <div className="relative z-10 flex-grow overflow-y-auto custom-scrollbar p-5 sm:p-7">
          {/* ==========================================
              TAB 1: INFO PERSONAL
          ========================================== */}
          {activeTab === 'INFO_PERSONAL' && (
            <div className="space-y-6">
              {isPending && (
                <div className="bg-gradient-to-br from-[#fff9e8] to-[#ffe69e] border-2 border-white shadow-sm rounded-3xl p-5 sm:p-6">
                  <div className="border-b border-[#1e2246]/15 pb-3.5 mb-5">
                    <span className="inline-block text-[9.5px] font-extrabold uppercase tracking-widest bg-[#1e2246] text-[#ffc749] px-2.5 py-0.5 rounded-full mb-1.5">
                      Solicitud Pendiente
                    </span>
                    <h4 className="text-[#1e2246] font-extrabold text-base uppercase">
                      Aprobación de Cuenta ({userRole})
                    </h4>
                    <p className="text-xs text-[#4c5384] font-medium mt-0.5">
                      Verifica los datos del prospecto y asigna sus credenciales para activar el acceso.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 items-center bg-white/85 border border-white p-4 rounded-2xl mb-5">
                    <div className="w-16 h-16 rounded-2xl border-2 border-[#1e2246] overflow-hidden bg-white flex items-center justify-center shrink-0">
                      {provAvatarUrl ? (
                        <img src={provAvatarUrl} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl font-bold text-[#626a9f]">+</span>
                      )}
                    </div>
                    <div className="flex-1 w-full">
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] text-[#454d82] font-bold uppercase">
                          URL Foto de Perfil (Opcional)
                        </label>
                        {provAvatarUrl && (
                          <button
                            type="button"
                            onClick={() => setProvAvatarUrl('')}
                            className="text-[9.5px] text-[#c93f34] font-bold uppercase cursor-pointer"
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={provAvatarUrl}
                        onChange={(e) => setProvAvatarUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-white border border-[#dfe2f2] focus:border-[#454d82] rounded-xl px-3.5 py-2.5 text-[#1e2246] text-xs font-semibold outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-[#454d82] font-bold uppercase mb-1">Nombres</label>
                      <input
                        type="text"
                        value={provFirstName}
                        onChange={(e) => setProvFirstName(e.target.value)}
                        className="w-full bg-white border-2 border-white focus:border-[#454d82] rounded-xl px-3.5 py-2.5 text-[#1e2246] text-sm font-semibold outline-none shadow-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-[#454d82] font-bold uppercase mb-1">Apellidos</label>
                      <input
                        type="text"
                        value={provLastName}
                        onChange={(e) => setProvLastName(e.target.value)}
                        className="w-full bg-white border-2 border-white focus:border-[#454d82] rounded-xl px-3.5 py-2.5 text-[#1e2246] text-sm font-semibold outline-none shadow-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-[#454d82] font-bold uppercase mb-1">
                        Email Registrado
                      </label>
                      <input
                        type="email"
                        value={provEmail}
                        onChange={(e) => setProvEmail(e.target.value)}
                        className="w-full bg-white border-2 border-white focus:border-[#454d82] rounded-xl px-3.5 py-2.5 text-[#1e2246] text-sm font-semibold outline-none shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-[#454d82] font-bold uppercase mb-1">
                        Contraseña Asignada
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: OlaStudent.2026"
                        value={provPassword}
                        onChange={(e) => setProvPassword(e.target.value)}
                        className="w-full bg-white border-2 border-white focus:border-[#454d82] rounded-xl px-3.5 py-2.5 text-[#1e2246] text-sm font-semibold outline-none shadow-sm"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] text-[#454d82] font-bold uppercase mb-1">
                        Teléfono (WhatsApp)
                      </label>
                      <div className="ola-smm-phone w-full rounded-xl px-3.5 py-2 bg-white border-2 border-white focus-within:border-[#454d82] shadow-sm">
                        <PhoneInput
                          defaultCountry="VE"
                          international
                          value={provPhone}
                          onChange={(value) => setProvPhone(value)}
                        />
                      </div>
                    </div>
                  </div>

                  {userRole === 'Student' && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5 pt-5 border-t border-[#1e2246]/15">
                      <div>
                        <label className="block text-[10px] text-[#454d82] font-bold uppercase mb-1">
                          Nivel Inicial
                        </label>
                        <select
                          value={levelOverride}
                          onChange={(e) => setLevelOverride(e.target.value)}
                          className="w-full bg-white border-2 border-white focus:border-[#454d82] rounded-xl px-3 py-2.5 text-[#1e2246] text-xs font-bold outline-none cursor-pointer"
                        >
                          {LEVEL_OPTIONS.map((l) => (
                            <option key={l} value={l}>
                              {l.split(':')[0]}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-[#454d82] font-bold uppercase mb-1">Unidad</label>
                        <input
                          type="number"
                          min="1"
                          max="92"
                          value={unitOverride}
                          onChange={(e) => setUnitOverride(parseInt(e.target.value, 10) || 1)}
                          className="w-full bg-white border-2 border-white focus:border-[#454d82] rounded-xl px-3 py-2.5 text-[#1e2246] text-xs font-bold outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-[#454d82] font-bold uppercase mb-1">
                          Día de Corte
                        </label>
                        <select
                          value={cohort}
                          onChange={(e) => setCohort(parseInt(e.target.value, 10))}
                          className="w-full bg-white border-2 border-white focus:border-[#454d82] rounded-xl px-3 py-2.5 text-[#1e2246] text-xs font-bold outline-none cursor-pointer"
                        >
                          <option value={15}>Día 15</option>
                          <option value={30}>Día 30</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-[#454d82] font-bold uppercase mb-1">
                          Ref. Inscripción ($10)
                        </label>
                        <input
                          type="text"
                          placeholder="Zinli / PayPal / Binance"
                          value={provPayRef}
                          onChange={(e) => setProvPayRef(e.target.value)}
                          className="w-full bg-white border-2 border-white focus:border-[#454d82] rounded-xl px-3 py-2.5 text-[#1e2246] text-xs font-semibold outline-none"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 mt-6">
                    <button
                      type="button"
                      onClick={handleDeleteLead}
                      disabled={isProcessing}
                      className="w-1/3 py-3.5 bg-[#ee665b] text-white border-2 border-[#1e2246] shadow-[0_4px_0_#1e2246] font-extrabold tracking-widest text-xs uppercase rounded-full disabled:opacity-50 cursor-pointer"
                    >
                      Descartar
                    </button>
                    <button
                      type="button"
                      onClick={handleProvisionAccount}
                      disabled={isProcessing}
                      className="w-2/3 py-3.5 bg-gradient-to-b from-[#ffd66b] to-[#ffc749] text-[#1e2246] border-2 border-[#1e2246] shadow-[0_4px_0_#1e2246] hover:-translate-y-0.5 font-extrabold tracking-widest text-xs uppercase rounded-full disabled:opacity-50 cursor-pointer transition-all"
                    >
                      {isProcessing ? 'Procesando...' : 'Confirmar y Activar ✓'}
                    </button>
                  </div>
                </div>
              )}

              {/* ACADEMIC OVERRIDES (GOD MODE) */}
              {!isPending && userRole === 'Student' && (
                <div className="bg-[#f4f6fc] border border-white rounded-3xl p-5 shadow-inner">
                  <div className="flex flex-wrap justify-between items-center gap-3 mb-4 border-b border-[#626a9f]/15 pb-3">
                    <div>
                      <h4 className="text-xs font-extrabold text-[#454d82] uppercase tracking-widest">
                        Academic Overrides (God Mode)
                      </h4>
                      <p className="text-[11px] text-[#50567d] font-medium">
                        Ajusta manualmente el nivel CEFR o la unidad activa del estudiante.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleSaveOverrides}
                      disabled={isProcessing}
                      className="bg-gradient-to-b from-[#ffd66b] to-[#ffc749] text-[#1e2246] border-2 border-[#1e2246] shadow-[0_3px_0_#1e2246] text-[10.5px] uppercase font-extrabold px-4 py-2 rounded-full disabled:opacity-50 cursor-pointer"
                    >
                      Guardar Overrides
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-[#454d82] font-bold uppercase mb-1.5">
                        Override Nivel
                      </label>
                      <select
                        value={levelOverride}
                        onChange={(e) => setLevelOverride(e.target.value)}
                        className="w-full bg-white border-2 border-[#dfe2f2] focus:border-[#454d82] rounded-xl px-3.5 py-2.5 text-[#1e2246] text-xs font-bold outline-none cursor-pointer"
                      >
                        {LEVEL_OPTIONS.map((l) => (
                          <option key={l} value={l}>
                            {l}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-[#454d82] font-bold uppercase mb-1.5">
                        Override Unidad (1–92)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="92"
                        value={unitOverride}
                        onChange={(e) => setUnitOverride(parseInt(e.target.value, 10) || 1)}
                        className="w-full bg-white border-2 border-[#dfe2f2] focus:border-[#454d82] rounded-xl px-3.5 py-2.5 text-[#1e2246] text-xs font-bold outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* CREDENTIALS & KILL SWITCH */}
              {!isPending && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="md:col-span-2 bg-[#f4f6fc] border border-white rounded-3xl p-5 shadow-inner">
                    <div className="flex justify-between items-center mb-4 border-b border-[#626a9f]/15 pb-3">
                      <h4 className="text-xs font-extrabold text-[#454d82] uppercase tracking-widest">
                        Credenciales &amp; Perfil
                      </h4>
                      {!isEditingCreds ? (
                        <button
                          type="button"
                          onClick={() => setIsEditingCreds(true)}
                          className="text-[10.5px] uppercase font-extrabold text-[#454d82] hover:text-[#1e2246] bg-white hover:bg-[#ffc749] border border-[#dfe2f2] px-3.5 py-1.5 rounded-full transition-colors cursor-pointer"
                        >
                          Editar
                        </button>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setIsEditingCreds(false)}
                            className="text-[10.5px] uppercase font-bold text-[#50567d] bg-white border border-[#dfe2f2] px-3 py-1.5 rounded-full cursor-pointer"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={handleUpdateCredentials}
                            disabled={isProcessing}
                            className="bg-[#ffc749] text-[#1e2246] border-2 border-[#1e2246] text-[10.5px] uppercase font-extrabold px-3.5 py-1.5 rounded-full disabled:opacity-50 cursor-pointer"
                          >
                            {isProcessing ? '...' : 'Guardar'}
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="overflow-hidden">
                        <label className="block text-[10px] text-[#626a9f] font-bold uppercase mb-1">Email</label>
                        {!isEditingCreds ? (
                          <p className="text-sm text-[#1e2246] font-semibold py-1.5 truncate">{editEmail}</p>
                        ) : (
                          <input
                            type="text"
                            value={editEmail}
                            onChange={(e) => setEditEmail(e.target.value)}
                            className="w-full bg-white border-2 border-[#454d82] rounded-xl px-3 py-2 text-[#1e2246] text-xs font-semibold outline-none"
                          />
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <label className="block text-[10px] text-[#626a9f] font-bold uppercase mb-1">Contraseña</label>
                        {!isEditingCreds ? (
                          <p className="text-sm text-[#1e2246] font-semibold py-1.5 tracking-wider truncate">
                            {editPassword || '••••••••'}
                          </p>
                        ) : (
                          <input
                            type="text"
                            value={editPassword}
                            onChange={(e) => setEditPassword(e.target.value)}
                            className="w-full bg-white border-2 border-[#454d82] rounded-xl px-3 py-2 text-[#1e2246] text-xs font-semibold outline-none"
                          />
                        )}
                      </div>

                      {isEditingCreds && (
                        <div className="sm:col-span-2">
                          <label className="block text-[10px] text-[#626a9f] font-bold uppercase mb-1">
                            URL Avatar de Perfil
                          </label>
                          <input
                            type="text"
                            value={editAvatarUrl}
                            onChange={(e) => setEditAvatarUrl(e.target.value)}
                            placeholder="https://..."
                            className="w-full bg-white border-2 border-[#454d82] rounded-xl px-3 py-2 text-[#1e2246] text-xs font-semibold outline-none"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-[#f4f6fc] border border-white rounded-3xl p-5 flex flex-col justify-between items-center text-center shadow-inner">
                    <div>
                      <h4 className="text-[10px] font-bold text-[#626a9f] uppercase tracking-widest mb-1">
                        Estado de Cuenta
                      </h4>
                      <p
                        className={`text-xl font-extrabold uppercase tracking-tight ${
                          accountStatus === 'active' ? 'text-[#128063]' : 'text-[#c93f34]'
                        }`}
                      >
                        {accountStatus}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleKillSwitch(accountStatus === 'active' ? 'suspended' : 'active')}
                      disabled={isProcessing}
                      className={`w-full mt-4 py-3 rounded-full text-[10.5px] font-extrabold uppercase tracking-widest transition-all border-2 border-[#1e2246] shadow-[0_3px_0_#1e2246] disabled:opacity-50 cursor-pointer ${
                        accountStatus === 'active'
                          ? 'bg-[#ee665b] text-white'
                          : 'bg-gradient-to-b from-[#ffd66b] to-[#ffc749] text-[#1e2246]'
                      }`}
                    >
                      {accountStatus === 'active' ? 'Suspender Acceso' : 'Reactivar Acceso'}
                    </button>
                  </div>
                </div>
              )}

              {/* REGISTRATION ANSWERS */}
              {userRole === 'Student' && (
                <div>
                  <h3 className="text-xs font-extrabold text-[#454d82] uppercase tracking-widest mb-3 border-b border-[#626a9f]/15 pb-2">
                    Respuestas de Registro
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="bg-[#f4f6fc] border border-white rounded-2xl p-4 shadow-inner">
                      <p className="text-[10px] text-[#626a9f] font-bold uppercase mb-1">Motivo del Curso</p>
                      <p className="text-sm text-[#1e2246] font-semibold truncate">
                        {userData.reason || 'No especificado'}
                      </p>
                    </div>
                    <div className="bg-[#f4f6fc] border border-white rounded-2xl p-4 shadow-inner">
                      <p className="text-[10px] text-[#626a9f] font-bold uppercase mb-1">Meta de Fluidez</p>
                      <p className="text-sm text-[#1e2246] font-semibold truncate">
                        {userData.fluent_time || 'No especificado'}
                      </p>
                    </div>
                    <div className="bg-[#f4f6fc] border border-white rounded-2xl p-4 shadow-inner">
                      <p className="text-[10px] text-[#626a9f] font-bold uppercase mb-1">Categoría de Interés</p>
                      <p className="text-sm text-[#1e2246] font-semibold truncate">
                        {userData.interest || 'No especificado'}
                      </p>
                    </div>
                    <div className="bg-[#f4f6fc] border border-white rounded-2xl p-4 shadow-inner">
                      <p className="text-[10px] text-[#626a9f] font-bold uppercase mb-1">Fecha de Registro</p>
                      <p className="text-sm text-[#1e2246] font-semibold truncate">
                        {new Date(userData.created_at || Date.now()).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==========================================
              TAB 2: FINANZAS (Students)
          ========================================== */}
          {activeTab === 'FINANZAS' && userRole === 'Student' && (
            <div className="space-y-6">
              {!isPending ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* COHORT & PRORATION */}
                    <div className="bg-[#f4f6fc] border border-white rounded-3xl p-5 shadow-inner">
                      <div className="flex justify-between items-center mb-4 border-b border-[#626a9f]/15 pb-3">
                        <h4 className="text-xs font-extrabold text-[#454d82] uppercase tracking-widest">
                          Billing &amp; Cohort
                        </h4>
                        <button
                          type="button"
                          onClick={handleSaveCohort}
                          disabled={isProcessing}
                          className="bg-white hover:bg-[#fff3d1] text-[#1e2246] border-2 border-[#1e2246] text-[10px] uppercase font-extrabold px-3.5 py-1.5 rounded-full cursor-pointer disabled:opacity-50"
                        >
                          Guardar Corte
                        </button>
                      </div>
                      <div className="flex gap-3 items-end">
                        <div className="flex-1">
                          <label className="block text-[10px] text-[#626a9f] font-bold uppercase mb-1.5">
                            Cohorte Mensual
                          </label>
                          <select
                            value={cohort}
                            onChange={(e) => setCohort(parseInt(e.target.value, 10))}
                            className="w-full bg-white border-2 border-[#dfe2f2] focus:border-[#454d82] rounded-xl px-3 py-2.5 text-[#1e2246] text-xs font-bold outline-none cursor-pointer"
                          >
                            <option value={15}>Día 15 del mes</option>
                            <option value={30}>Día 30 del mes</option>
                          </select>
                        </div>
                        <div className="flex-1 bg-[#fff3d1] border-2 border-[#ffc749] rounded-xl p-2.5 flex flex-col justify-center items-center text-center">
                          <span className="text-[9px] text-[#454d82] uppercase font-bold">Prorrateo Hoy</span>
                          <span className="text-lg font-extrabold text-[#1e2246] leading-tight">${proratedDue}</span>
                        </div>
                      </div>
                    </div>

                    {/* CREDITS & REFUND */}
                    <div className="bg-[#f4f6fc] border border-white rounded-3xl p-5 flex flex-col justify-center shadow-inner">
                      <div className="flex justify-between items-center gap-2 mb-2.5">
                        <h3 className="text-[#1e2246] font-extrabold text-lg">
                          Créditos: <span className="text-[#454d82]">{credits}</span>
                        </h3>
                        <button
                          type="button"
                          onClick={handleRefund}
                          className="bg-gradient-to-b from-[#ffd66b] to-[#ffc749] text-[#1e2246] border-2 border-[#1e2246] shadow-[0_3px_0_#1e2246] font-extrabold text-[10px] uppercase tracking-wider px-3.5 py-2 rounded-full cursor-pointer shrink-0"
                        >
                          +1 Credit (Refund)
                        </button>
                      </div>
                      <p className="text-[11px] text-[#50567d] leading-relaxed font-medium">
                        Recibe <strong className="text-[#1e2246]">4 créditos</strong> por mensualidad (no acumulativos al corte). Usa el reembolso solo por fallas de la academia.
                      </p>
                    </div>
                  </div>

                  {/* SUBSCRIPTION SUMMARY */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white border border-[#dfe2f2] rounded-2xl p-4 text-center shadow-sm">
                      <p className="text-[10px] text-[#626a9f] font-bold uppercase tracking-widest mb-1">
                        Tarifa Mensual ({getBaseLevel(levelOverride)})
                      </p>
                      <p className="text-3xl text-[#1e2246] font-extrabold">
                        ${MONTHLY_PRICES[getBaseLevel(levelOverride)] || 20}{' '}
                        <span className="text-xs text-[#626a9f]">USD</span>
                      </p>
                    </div>
                    <div
                      className={`border-2 rounded-2xl p-4 text-center shadow-sm ${
                        isPastDue ? 'bg-[#fff2f1] border-[#ee665b]' : 'bg-white border-[#dfe2f2]'
                      }`}
                    >
                      <p className="text-[10px] text-[#626a9f] font-bold uppercase tracking-widest mb-1">
                        Próximo Corte
                      </p>
                      <p className={`text-xl font-extrabold ${isPastDue ? 'text-[#c93f34]' : 'text-[#1e2246]'}`}>
                        {userData.next_billing_date
                          ? new Date(userData.next_billing_date).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric',
                            })
                          : 'No asignada'}
                      </p>
                      {isPastDue && (
                        <p className="text-[9.5px] text-[#c93f34] font-extrabold uppercase mt-1 animate-pulse">
                          Vencido • Créditos en 0
                        </p>
                      )}
                    </div>
                  </div>

                  {/* MANUAL PAYMENT OR LEVEL RENEWAL FORM */}
                  <div
                    className={`rounded-3xl p-5 sm:p-6 border-2 ${
                      userData.level_completed
                        ? 'bg-gradient-to-br from-[#fff9e8] to-[#ffe69e] border-[#ffc749]'
                        : 'bg-gradient-to-br from-[#ebfcf6] to-[#d1f4e8] border-[#16a37f]/45'
                    }`}
                  >
                    {userData.level_completed ? (
                      <>
                        <h3 className="text-[#1e2246] font-extrabold uppercase text-sm tracking-wider mb-1">
                          Procesar Renovación de Nivel ($10 + Mensualidad)
                        </h3>
                        <p className="text-xs text-[#4c5384] mb-5 font-medium">
                          El estudiante aprobó {getBaseLevel(levelOverride)}. Registra el pago para promoverlo al siguiente nivel y recargar 4 créditos.
                        </p>

                        <form onSubmit={handleProcessRenewal} className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] text-[#454d82] font-bold uppercase mb-1">
                                Monto Total (USD)
                              </label>
                              <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#626a9f] font-bold">
                                  $
                                </span>
                                <input
                                  type="number"
                                  value={payAmount}
                                  onChange={(e) => setPayAmount(e.target.value)}
                                  className="w-full bg-white border-2 border-white focus:border-[#454d82] rounded-xl pl-8 pr-4 py-2.5 text-sm font-bold text-[#1e2246] outline-none"
                                  required
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-[10px] text-[#454d82] font-bold uppercase mb-1">
                                Referencia (Zinli / PayPal / Binance / Local)
                              </label>
                              <input
                                type="text"
                                value={payRef}
                                onChange={(e) => setPayRef(e.target.value)}
                                placeholder="Ej: Zinli #923847"
                                className="w-full bg-white border-2 border-white focus:border-[#454d82] rounded-xl px-3.5 py-2.5 text-[#1e2246] text-xs font-semibold outline-none"
                                required
                              />
                            </div>
                          </div>

                          <button
                            type="submit"
                            disabled={isProcessing}
                            className="w-full py-3.5 bg-gradient-to-b from-[#ffd66b] to-[#ffc749] text-[#1e2246] border-2 border-[#1e2246] shadow-[0_4px_0_#1e2246] font-extrabold tracking-widest text-xs uppercase rounded-full disabled:opacity-50 cursor-pointer"
                          >
                            {isProcessing ? 'Procesando...' : `Renovar Nivel y Confirmar $${payAmount}`}
                          </button>
                        </form>
                      </>
                    ) : (
                      <>
                        <h3 className="text-[#128063] font-extrabold uppercase text-sm tracking-wider mb-1">
                          Registrar Pago Manual
                        </h3>
                        <p className="text-xs text-[#3b4170] mb-5 font-medium">
                          Registra una mensualidad (+4 créditos) o un Bundle de 2 Extra Créditos ($12 aparte).
                        </p>

                        <form onSubmit={handlePaymentSubmit} className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] text-[#454d82] font-bold uppercase mb-1">
                                Tipo de Compra
                              </label>
                              <select
                                value={payType}
                                onChange={handlePayTypeChange}
                                className="w-full bg-white border-2 border-white focus:border-[#454d82] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#1e2246] outline-none cursor-pointer"
                              >
                                <option value="Mensualidad">Suscripción Mensual (+4 Créditos)</option>
                                <option value="Extra">Bundle Extra (+2 Créditos por $12)</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[10px] text-[#454d82] font-bold uppercase mb-1">
                                Monto a Verificar (USD)
                              </label>
                              <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#626a9f] font-bold">
                                  $
                                </span>
                                <input
                                  type="number"
                                  value={payAmount}
                                  onChange={(e) => setPayAmount(e.target.value)}
                                  className="w-full bg-white border-2 border-white focus:border-[#454d82] rounded-xl pl-8 pr-4 py-2.5 text-sm font-bold text-[#1e2246] outline-none"
                                  required
                                />
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] text-[#454d82] font-bold uppercase mb-1">
                              Número de Referencia (Zinli / PayPal / Binance / Moneda Local)
                            </label>
                            <input
                              type="text"
                              value={payRef}
                              onChange={(e) => setPayRef(e.target.value)}
                              placeholder="Ej: Binance #923847"
                              className="w-full bg-white border-2 border-white focus:border-[#454d82] rounded-xl px-3.5 py-2.5 text-[#1e2246] text-xs font-semibold outline-none"
                              required
                            />
                          </div>

                          <button
                            type="submit"
                            disabled={isProcessing}
                            className="w-full py-3.5 bg-gradient-to-b from-[#ffd66b] to-[#ffc749] text-[#1e2246] border-2 border-[#1e2246] shadow-[0_4px_0_#1e2246] font-extrabold tracking-widest text-xs uppercase rounded-full disabled:opacity-50 cursor-pointer"
                          >
                            {isProcessing ? 'Verificando...' : `Confirmar Pago de $${payAmount}`}
                          </button>
                        </form>
                      </>
                    )}
                  </div>

                  {/* PAYMENT HISTORY LEDGER */}
                  <div>
                    <h3 className="text-xs font-extrabold text-[#454d82] uppercase tracking-widest mb-3 border-b border-[#626a9f]/15 pb-2">
                      Historial de Pagos
                    </h3>
                    <div className="bg-[#f4f6fc] border border-white rounded-2xl p-4 shadow-inner">
                      {isLoadingPayments ? (
                        <div className="py-8 flex justify-center">
                          <div className="w-6 h-6 border-2 border-[#626a9f] border-t-[#ffc749] rounded-full animate-spin" />
                        </div>
                      ) : paymentHistory.length === 0 ? (
                        <p className="text-center text-[#626a9f] font-bold text-xs uppercase tracking-widest py-5">
                          No hay pagos registrados.
                        </p>
                      ) : (
                        <div className="space-y-2.5 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                          {paymentHistory.map((payment) => (
                            <div
                              key={payment.id}
                              className="flex justify-between items-center bg-white border border-[#dfe2f2] p-3.5 rounded-2xl shadow-sm"
                            >
                              <div>
                                <p className="text-[#1e2246] font-extrabold text-sm">
                                  {payment.payment_type || 'Mensualidad'}
                                </p>
                                <p className="text-[10.5px] text-[#50567d] font-semibold mt-0.5">
                                  Ref: <strong className="text-[#454d82]">{payment.reference_number}</strong> •{' '}
                                  {new Date(payment.created_at).toLocaleDateString('es-ES')}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-[#128063] font-extrabold text-base">${payment.amount}</p>
                                {payment.status === 'processing' ? (
                                  <button
                                    type="button"
                                    onClick={() => handleVerifyPendingPayment(payment)}
                                    disabled={isProcessing}
                                    className="mt-1 px-3 py-1 rounded-full bg-[#ffc749] border border-[#1e2246] text-[#1e2246] text-[9.5px] font-extrabold uppercase cursor-pointer disabled:opacity-50"
                                  >
                                    Verificar
                                  </button>
                                ) : (
                                  <span className="text-[9.5px] text-[#128063] uppercase font-extrabold">
                                    {payment.status}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-12 text-center text-xs font-bold text-[#626a9f] uppercase tracking-widest bg-[#f4f6fc] rounded-2xl border border-white">
                  El estudiante debe estar activo para registrar pagos.
                </div>
              )}
            </div>
          )}

          {/* ==========================================
              TAB 3: ESTADISTICAS (Students)
          ========================================== */}
          {activeTab === 'ESTADISTICAS' && userRole === 'Student' && (
            <div className="space-y-6">
              {!isPending ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white border border-[#dfe2f2] rounded-2xl p-4 shadow-sm text-center">
                      <p className="text-[10px] text-[#626a9f] font-bold uppercase mb-1">Unidad Actual</p>
                      <p className="text-2xl text-[#1e2246] font-extrabold">Unit {userData.unit || 1}</p>
                    </div>
                    <div className="bg-[#fff3d1] border-2 border-[#ffc749] rounded-2xl p-4 shadow-sm text-center">
                      <p className="text-[10px] text-[#454d82] font-bold uppercase mb-1">Puntaje Promedio</p>
                      <p className="text-2xl text-[#1e2246] font-extrabold">{userData.lesson_score || '0'} / 100</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                      <div>
                        <h3 className="text-base font-extrabold text-[#1e2246] uppercase tracking-tight">
                          Historial Académico
                        </h3>
                        <p className="text-xs text-[#50567d] font-medium">
                          Auditoría permanente de clases, notas y evaluaciones.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleGenerateReport}
                        disabled={isGenerating || academicHistory.length === 0}
                        className="px-5 py-2.5 bg-white hover:bg-[#fff3d1] text-[#1e2246] border-2 border-[#1e2246] shadow-[0_3px_0_rgba(30,34,70,0.16)] text-[11px] font-extrabold uppercase tracking-wider rounded-full flex items-center gap-2 disabled:opacity-45 cursor-pointer"
                      >
                        <svg className="w-4 h-4 text-[#454d82]" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>{isGenerating ? 'Generando PDF...' : 'Exportar Reporte'}</span>
                      </button>
                    </div>

                    {isLoadingHistory ? (
                      <div className="py-12 flex justify-center">
                        <div className="w-8 h-8 border-4 border-[#626a9f] border-t-[#ffc749] rounded-full animate-spin" />
                      </div>
                    ) : academicHistory.length === 0 ? (
                      <div className="py-10 text-center text-xs font-bold text-[#626a9f] uppercase tracking-widest bg-[#f4f6fc] rounded-2xl border border-white">
                        El estudiante aún no tiene registros académicos.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {academicHistory.map((record) => (
                          <div
                            key={record.id}
                            className="bg-white border border-[#dfe2f2] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
                          >
                            <div className="flex items-center gap-3.5">
                              <div
                                className={`w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-sm shrink-0 ${
                                  record.score_percentage >= 75
                                    ? 'bg-[#e7faf3] text-[#128063] border border-[#16a37f]/45'
                                    : 'bg-[#fff2f1] text-[#c93f34] border border-[#ee665b]/45'
                                }`}
                              >
                                {Math.round(record.score_percentage)}%
                              </div>
                              <div>
                                <span className="font-extrabold text-[#1e2246] text-sm uppercase block">
                                  {record.activity_type}
                                </span>
                                <span className="text-[11px] text-[#50567d] font-medium">
                                  Unidad {record.unit} • {new Date(record.created_at).toLocaleDateString('es-ES')}
                                </span>
                              </div>
                            </div>
                            <div className="sm:text-right">
                              <span className="text-[9.5px] font-bold text-[#626a9f] uppercase block">Evaluador</span>
                              <span className="text-xs font-bold text-[#1e2246]">
                                {record.teacher
                                  ? `${record.teacher.first_name} ${record.teacher.last_name}`
                                  : 'Sistema (Auto-Grader)'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="py-12 text-center text-xs font-bold text-[#626a9f] uppercase tracking-widest bg-[#f4f6fc] rounded-2xl border border-white">
                  Las estadísticas se generarán una vez que la cuenta esté activa.
                </div>
              )}
            </div>
          )}

          {/* ==========================================
              TAB 4: PAYROLL (Teachers)
          ========================================== */}
          {activeTab === 'PAYROLL' && userRole === 'Teacher' && (
            <div className="space-y-5">
              <div className="flex flex-wrap justify-between items-center gap-3 border-b border-[#626a9f]/15 pb-3">
                <h3 className="text-xs font-extrabold text-[#454d82] uppercase tracking-widest">
                  Nómina y Compensación
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-[10.5px] text-[#626a9f] uppercase font-bold">Frecuencia:</span>
                  <select
                    value={payrollCadence}
                    onChange={(e) => handleSaveCadence(e.target.value)}
                    className="bg-white border-2 border-[#dfe2f2] rounded-full px-3.5 py-1.5 text-xs font-bold text-[#1e2246] outline-none cursor-pointer"
                  >
                    <option value="Weekly">Semanal</option>
                    <option value="Bi-Weekly">Quincenal</option>
                    <option value="Monthly">Mensual</option>
                  </select>
                </div>
              </div>

              {isFetchingPayroll ? (
                <div className="py-12 flex justify-center">
                  <div className="w-8 h-8 border-4 border-[#626a9f] border-t-[#ffc749] rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="bg-gradient-to-br from-[#fff9e8] to-[#ffe69e] border-2 border-white shadow-sm rounded-3xl p-5 flex flex-col justify-center items-center text-center">
                      <span className="text-[10px] text-[#454d82] uppercase font-bold tracking-widest mb-1">
                        Monto a Pagar
                      </span>
                      <span className="text-4xl font-extrabold text-[#1e2246]">${finalTotalPayroll.toFixed(2)}</span>
                      <span className="text-[9.5px] text-[#4c5384] uppercase mt-1.5 font-bold">Ciclo Pendiente</span>
                    </div>

                    <div className="md:col-span-2 bg-[#f4f6fc] border border-white rounded-3xl p-5 shadow-inner flex flex-col justify-center">
                      <h4 className="text-[10px] text-[#454d82] uppercase font-bold tracking-widest mb-3 border-b border-[#626a9f]/15 pb-2">
                        Desglose de Horas &amp; Guardias
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex justify-between items-center bg-white px-3.5 py-2.5 rounded-xl border border-[#dfe2f2]">
                          <span className="text-xs text-[#3b4170] font-bold">Día ($3/hr)</span>
                          <span className="text-sm font-extrabold text-[#1e2246]">{dayClassesCount}</span>
                        </div>
                        <div className="flex justify-between items-center bg-[#e7faf3] px-3.5 py-2.5 rounded-xl border border-[#16a37f]/30">
                          <span className="text-xs text-[#128063] font-bold">Noche ($4/hr)</span>
                          <span className="text-sm font-extrabold text-[#128063]">{nightClassesCount}</span>
                        </div>
                        <div className="flex justify-between items-center bg-[#fff3d1] px-3.5 py-2.5 rounded-xl border border-[#ffc749]">
                          <span className="text-xs text-[#1e2246] font-bold">No-Shows ($2)</span>
                          <span className="text-sm font-extrabold text-[#1e2246]">{noShowCount}</span>
                        </div>
                        <div className="flex justify-between items-center bg-[#e8eaf7] px-3.5 py-2.5 rounded-xl border border-[#626a9f]/25">
                          <span className="text-xs text-[#454d82] font-bold">Guardias ($2)</span>
                          <span className="text-sm font-extrabold text-[#454d82]">{shiftCount}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-[#ebfcf6] to-[#d1f4e8] border-2 border-[#16a37f]/45 rounded-3xl p-5 sm:p-6">
                    <h4 className="text-[#128063] font-extrabold uppercase text-sm tracking-wider mb-1">
                      Liquidar Ciclo
                    </h4>
                    <p className="text-xs text-[#3b4170] mb-4 font-medium">
                      Añade bonos o deducciones opcionales e ingresa la referencia para asentar el pago en el registro contable.
                    </p>
                    <form onSubmit={handleMarkAsPaid} className="flex flex-col gap-3.5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="number"
                          value={manualBonus}
                          onChange={(e) => setManualBonus(e.target.value)}
                          placeholder="Bono Extra ($)"
                          className="bg-white border-2 border-white focus:border-[#16a37f] rounded-xl px-4 py-2.5 text-[#128063] text-sm font-bold outline-none"
                          min="0"
                          step="0.01"
                        />
                        <input
                          type="number"
                          value={manualDeduction}
                          onChange={(e) => setManualDeduction(e.target.value)}
                          placeholder="Deducción ($)"
                          className="bg-white border-2 border-white focus:border-[#ee665b] rounded-xl px-4 py-2.5 text-[#c93f34] text-sm font-bold outline-none"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <input
                          type="text"
                          value={payrollRef}
                          onChange={(e) => setPayrollRef(e.target.value)}
                          placeholder="N° de Referencia (Zinli / PayPal / Binance / Local)"
                          className="flex-1 bg-white border-2 border-white focus:border-[#454d82] rounded-xl px-4 py-3 text-[#1e2246] text-sm font-semibold outline-none"
                          required
                        />
                        <button
                          type="submit"
                          disabled={isProcessing || finalTotalPayroll === 0}
                          className="px-7 py-3 rounded-full font-extrabold text-xs uppercase tracking-widest text-[#1e2246] bg-gradient-to-b from-[#ffd66b] to-[#ffc749] border-2 border-[#1e2246] shadow-[0_4px_0_#1e2246] cursor-pointer disabled:opacity-45 shrink-0"
                        >
                          Marcar como Pagado ✓
                        </button>
                      </div>
                    </form>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ==========================================
              TAB 5: TEACHER_STATS (Teachers)
          ========================================== */}
          {activeTab === 'TEACHER_STATS' && userRole === 'Teacher' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-[#f4f6fc] border border-white rounded-3xl p-5 shadow-inner flex flex-col items-center">
                  <p className="text-[10px] font-bold text-[#626a9f] uppercase tracking-widest mb-1">
                    Calificación Pedagógica
                  </p>
                  <div className="flex items-baseline gap-1.5 mb-3">
                    <span className="text-5xl font-extrabold text-[#1e2246]">{globalRating}</span>
                    <span className="text-xl font-bold text-[#626a9f]">/ 5.0</span>
                  </div>
                  <div className="w-full h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                        <PolarGrid stroke="rgba(98,106,159,0.25)" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#3b4170', fontSize: 10.5, fontWeight: 700 }} />
                        <Radar name="Pedagogical" dataKey="A" stroke="#454d82" strokeWidth={2.5} fill="#ffc749" fillOpacity={0.55} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-[#f4f6fc] border border-white rounded-3xl p-5 shadow-inner flex flex-col items-center">
                  <p className="text-[10px] font-bold text-[#626a9f] uppercase tracking-widest mb-1">
                    Cumplimiento Operativo
                  </p>
                  <div className="flex items-baseline gap-1.5 mb-3">
                    <span className="text-5xl font-extrabold text-[#454d82]">{opScore || 0}</span>
                    <span className="text-xl font-bold text-[#626a9f]">/ 100</span>
                  </div>
                  <div className="w-full h-[250px]">
                    {opMetrics ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={opMetrics}>
                          <PolarGrid stroke="rgba(98,106,159,0.25)" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#3b4170', fontSize: 10.5, fontWeight: 700 }} />
                          <Radar name="Operational" dataKey="score" stroke="#16a37f" strokeWidth={2.5} fill="#16a37f" fillOpacity={0.35} />
                        </RadarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#626a9f] text-xs font-bold uppercase">
                        Cargando métricas...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ==========================================
          HIDDEN PDF REPORT TEMPLATE (OutLoud A4)
      ========================================== */}
      <div className="absolute -left-[9999px] top-0 pointer-events-none">
        <div ref={reportRef} className="w-[800px] min-h-[1131px] bg-white text-[#1e2246] p-12 font-montserrat flex flex-col">
          <div className="flex justify-between items-end border-b-4 border-[#ffc749] pb-6 mb-8">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-[#454d82]">OutLoud</h1>
              <p className="text-xs font-bold tracking-widest uppercase text-[#626a9f] mt-1">Language Academy</p>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-extrabold uppercase text-[#1e2246]">
                {userData.full_name || `${userData.first_name} ${userData.last_name}`}
              </h2>
              <p className="text-xs font-bold text-[#626a9f] uppercase tracking-widest mt-1">
                Nivel Actual: {getBaseLevel(levelOverride)} • Unidad {userData.unit || 1}
              </p>
            </div>
          </div>

          <h3 className="text-sm font-extrabold uppercase tracking-widest bg-[#454d82] text-white px-4 py-2.5 rounded-lg mb-6">
            Resumen Académico
          </h3>
          <div className="grid grid-cols-3 gap-6 mb-10">
            <div className="border-l-4 border-[#ffc749] pl-4">
              <p className="text-[10px] font-bold uppercase text-[#626a9f] tracking-widest">Puntaje Promedio</p>
              <p className="text-3xl font-extrabold text-[#1e2246]">{userData.lesson_score || 0}%</p>
            </div>
            <div className="border-l-4 border-[#16a37f] pl-4">
              <p className="text-[10px] font-bold uppercase text-[#626a9f] tracking-widest">Estado</p>
              <p className="text-xl font-extrabold mt-2 text-[#128063]">Activo</p>
            </div>
            <div className="border-l-4 border-[#626a9f] pl-4">
              <p className="text-[10px] font-bold uppercase text-[#626a9f] tracking-widest">Fecha de Emisión</p>
              <p className="text-sm font-bold mt-2 text-[#1e2246]">
                {new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          <h3 className="text-sm font-extrabold uppercase tracking-widest bg-[#454d82] text-white px-4 py-2.5 rounded-lg mb-6">
            Registro de Evaluaciones (Clases en Vivo)
          </h3>
          {academicHistory.length === 0 ? (
            <p className="text-sm font-bold text-[#626a9f] italic">
              No hay registros de evaluaciones disponibles para este periodo.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {academicHistory.map((record) => {
                const notasTraducidas = (record.teacher_notes || 'Sin observaciones.')
                  .replace('Deductions:', 'Deducciones:')
                  .replace('None', 'Ninguna')
                  .replace('Minor Grammatical Slips', 'Errores Gramaticales Menores')
                  .replace('Pronunciation / L1 Interference', 'Pronunciación / Interferencia L1')
                  .replace('Over-reliance on Fillers (Uh/Um)', 'Uso Excesivo de Muletillas')
                  .replace('Hesitation / Pacing Issues', 'Dudas / Problemas de Ritmo')
                  .replace('Incomplete Task Fulfillment', 'Tarea Incompleta')
                  .replace('Severe Lexical Range Deficit', 'Déficit Léxico Severo');

                const tipoActividad =
                  record.activity_type === 'Live Class'
                    ? 'Clase en Vivo'
                    : record.activity_type === 'Workbook'
                    ? 'Libro de Práctica'
                    : record.activity_type === 'Lesson'
                    ? 'Lección Multimedia'
                    : record.activity_type;

                return (
                  <div key={record.id} className="border border-[#dfe2f2] rounded-xl p-5 bg-[#f6f7fc]">
                    <div className="flex justify-between items-center border-b border-[#dfe2f2] pb-3 mb-3">
                      <span className="font-extrabold uppercase text-[#1e2246] text-xs">
                        Unidad {record.unit} • {tipoActividad} •{' '}
                        {new Date(record.created_at).toLocaleDateString('es-ES')}
                      </span>
                      <span
                        className={`font-extrabold px-3 py-1 rounded-full text-xs ${
                          record.score_percentage >= 75
                            ? 'bg-[#e7faf3] text-[#128063]'
                            : 'bg-[#fff2f1] text-[#c93f34]'
                        }`}
                      >
                        Calificación: {Math.round(record.score_percentage)} / 100
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="col-span-1">
                        <span className="block text-[10px] font-bold uppercase text-[#626a9f] tracking-widest">
                          Evaluador
                        </span>
                        <span className="text-sm font-bold text-[#1e2246]">
                          {record.teacher
                            ? `${record.teacher.first_name} ${record.teacher.last_name}`
                            : 'Sistema Automático'}
                        </span>
                      </div>
                      <div className="col-span-3">
                        <span className="block text-[10px] font-bold uppercase text-[#626a9f] tracking-widest">
                          Notas del Profesor &amp; Deducciones
                        </span>
                        <span className="text-sm font-medium text-[#3b4170] leading-relaxed">
                          {notasTraducidas}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-auto pt-8 border-t-2 border-[#dfe2f2] text-center">
            <p className="text-[10px] font-bold text-[#626a9f] uppercase tracking-widest">
              Documento oficial generado automáticamente por OutLoud Language Academy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentManagerModal;