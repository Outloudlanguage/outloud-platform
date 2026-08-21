import React, { useState, useEffect, useRef } from 'react';

const CommunityPanel = ({ isOpen, onClose, initialTab = 'CHAT', userProfile, supabase }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [messages, setMessages] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) setActiveTab(initialTab);
  }, [isOpen, initialTab]);

  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      const [msgRes, annRes] = await Promise.all([
        supabase.from('messages').select('*').order('created_at', { ascending: true }).limit(100),
        supabase.from('announcements').select('*').order('created_at', { ascending: false }).limit(20)
      ]);
      if (msgRes.data) setMessages(msgRes.data);
      if (annRes.data) setAnnouncements(annRes.data);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    fetchData();

    // Live Listeners
    const messageChannel = supabase.channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
        setMessages(prev => [...prev, payload.new]);
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, payload => {
         setMessages(prev => prev.map(m => m.id === payload.new.id ? payload.new : m));
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'messages' }, payload => {
        setMessages(prev => prev.filter(m => m.id !== payload.old.id));
      }).subscribe();

    const announcementChannel = supabase.channel('public:announcements')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'announcements' }, payload => {
        setAnnouncements(prev => [payload.new, ...prev]);
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'announcements' }, payload => {
        setAnnouncements(prev => prev.filter(a => a.id !== payload.old.id));
      }).subscribe();

    return () => {
      supabase.removeChannel(messageChannel);
      supabase.removeChannel(announcementChannel);
    };
  }, [isOpen, supabase]);

  // THE CONTENT GATEKEEPER
  const validateContent = (text) => {
    if (/(?:[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/.test(text)) return "No se permiten correos electrónicos.";
    if (/(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/.test(text)) return "No se permiten números de teléfono.";
    if (/(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/i.test(text)) return "No se permiten enlaces (URLs).";
    if (/(facebook|instagram|whatsapp|wa\.me|tiktok|twitter|\bx\b|snapchat)/i.test(text)) return "No se permiten menciones a redes sociales.";
    
    const badWords = ['fuck', 'shit', 'bitch', 'asshole', 'puta', 'mierda', 'cabron', 'pendejo', 'coño', 'marico', 'verga', 'dick', 'cock', 'pene', 'culo', 'zorra'];
    const badWordsRegex = new RegExp(`\\b(${badWords.join('|')})\\b`, 'i');
    if (badWordsRegex.test(text)) return "El mensaje contiene lenguaje inapropiado.";
    
    return null;
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !userProfile) return;

    const warning = validateContent(chatInput);
    if (warning) {
      alert(`⚠️ Mensaje Bloqueado: ${warning}`);
      return;
    }

    setIsSending(true);
    try {
      await supabase.from('messages').insert({
        sender_id: userProfile.id,
        sender_name: `${userProfile.first_name} ${userProfile.last_name}`,
        sender_role: userProfile.role,
        content: chatInput.trim()
      });
      setChatInput('');
    } catch (error) {
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  const handleReportMessage = async (msgId) => {
    if(!window.confirm("¿Seguro que deseas reportar este mensaje a los moderadores?")) return;
    try {
      await supabase.from('messages').update({ is_reported: true }).eq('id', msgId);
      alert("Mensaje reportado a administración exitosamente.");
    } catch (error) {
      console.error(error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in font-montserrat">
      <div className="w-full md:w-[400px] h-full bg-[#070b19] border-l border-white/20 shadow-2xl flex flex-col animate-slide-left relative overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5 shrink-0 z-10">
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-widest">Campus Digital</h2>
            <p className="text-[10px] text-white/50 uppercase tracking-widest mt-1">Reglas de convivencia activas</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all">✕</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10 bg-black/20 shrink-0 z-10">
          <button onClick={() => setActiveTab('CHAT')} className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-colors ${activeTab === 'CHAT' ? 'bg-white/10 text-[#fcd34d] border-b-2 border-[#fcd34d]' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}>Chat Room</button>
          <button onClick={() => setActiveTab('BOARD')} className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-colors ${activeTab === 'BOARD' ? 'bg-white/10 text-emerald-400 border-b-2 border-emerald-400' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}>Info Board</button>
        </div>

        {/* Chat Area */}
        {activeTab === 'CHAT' && (
          <div className="flex-1 flex flex-col overflow-hidden relative z-10">
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {messages.length === 0 ? (
                <div className="text-center text-xs text-white/40 font-bold uppercase py-10">El chat está silencioso...</div>
              ) : (
                messages.map(msg => {
                  const isMe = msg.sender_id === userProfile?.id;
                  const isAdmin = msg.sender_role.includes('Admin');
                  const isTeacher = msg.sender_role === 'Teacher';
                  
                  return (
                    <div key={msg.id} className={`flex flex-col group ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        {!isMe && <span className={`text-[10px] font-black uppercase tracking-widest ${isAdmin ? 'text-[#fcd34d]' : isTeacher ? 'text-emerald-400' : 'text-white/60'}`}>{msg.sender_name}</span>}
                        <span className="text-[8px] text-white/30">{new Date(msg.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute:'2-digit' })}</span>
                      </div>
                      <div className={`text-sm py-2 px-3 rounded-xl w-fit max-w-[90%] relative ${isMe ? 'bg-indigo-500 text-white rounded-br-none' : isAdmin ? 'bg-[#fcd34d]/20 text-[#fcd34d] border border-[#fcd34d]/30 rounded-bl-none' : isTeacher ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded-bl-none' : 'bg-white/10 text-white/90 border border-white/5 rounded-bl-none'}`}>
                        {msg.is_reported ? <span className="italic opacity-50">Mensaje oculto (Bajo Revisión)</span> : msg.content}
                      </div>
                      {!isMe && !msg.is_reported && (
                        <button onClick={() => handleReportMessage(msg.id)} className="text-[9px] text-red-500 opacity-0 group-hover:opacity-100 transition-opacity mt-1 hover:underline">Reportar (Spam / Abuso)</button>
                      )}
                    </div>
                  )
                })
              )}
              <div ref={chatEndRef} />
            </div>
            
            <form onSubmit={handleSendMessage} className="p-4 bg-black/40 border-t border-white/10 shrink-0">
              <div className="flex gap-2">
                <input type="text" placeholder="Escribe un mensaje..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} disabled={isSending} className="flex-1 bg-[#070b19] border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-400 disabled:opacity-50" />
                <button type="submit" disabled={isSending || !chatInput.trim()} className="px-5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Announcements Area */}
        {activeTab === 'BOARD' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar relative z-10">
             {announcements.length === 0 ? (
                 <p className="text-xs text-white/40 font-bold uppercase tracking-widest text-center py-10">No hay anuncios activos</p>
              ) : (
                announcements.map(ann => (
                  <div key={ann.id} className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5 relative">
                    <h4 className="text-emerald-400 font-black tracking-wide text-lg">{ann.title}</h4>
                    <p className="text-sm text-white/80 mt-2 font-medium leading-relaxed">{ann.content}</p>
                    <p className="text-[9px] text-emerald-500/50 font-bold uppercase tracking-widest mt-4 border-t border-emerald-500/20 pt-2">{new Date(ann.created_at).toLocaleString('es-ES')}</p>
                  </div>
                ))
              )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityPanel;