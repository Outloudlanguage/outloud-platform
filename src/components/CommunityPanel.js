import React, { useState, useEffect, useRef } from 'react';

const CommunityPanel = ({ isOpen, onClose, initialTab = 'CHAT', userProfile, supabase }) => {
  const [activeTab, setActiveTab] = useState('CHAT');
  const [boardView, setBoardView] = useState('ANNOUNCEMENTS');
  
  // Chat States
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef(null);

  // Board States
  const [announcements, setAnnouncements] = useState([]);
  const [forumPosts, setForumPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [forumReplies, setForumReplies] = useState([]);
  const [replyInput, setReplyInput] = useState('');
  
  // Teacher-specific forum filter
  const [teacherForumLevel, setTeacherForumLevel] = useState('A1');

  const userRole = userProfile?.role || 'Student';
  const baseLevel = userProfile?.level ? userProfile.level.split(':')[0].trim() : 'A1';
  const chatChannel = userRole === 'Teacher' || userRole === 'Admin' ? 'STAFF' : baseLevel;

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setSelectedPost(null);
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    if (!isOpen || !userProfile) return;

    const fetchChat = async () => {
      const { data } = await supabase.from('messages')
        .select('*')
        .in('channel', [chatChannel, 'GLOBAL'])
        .order('created_at', { ascending: true })
        .limit(100);
      if (data) setMessages(data);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    const fetchAnnouncements = async () => {
      let audiences = ['EVERYONE_WITH_STAFF'];
      if (userRole === 'Teacher' || userRole === 'Admin') audiences.push('STAFF_ONLY');
      if (userRole === 'Student') audiences.push(`LEVEL_${baseLevel}`);

      const { data } = await supabase.from('announcements')
        .select('*')
        .in('audience', audiences)
        .order('created_at', { ascending: false });
      if (data) setAnnouncements(data);
    };

    const fetchForum = async () => {
      const target = userRole === 'Student' ? baseLevel : teacherForumLevel;
      const { data } = await supabase.from('forum_posts')
        .select('*')
        .eq('target_level', target)
        .order('created_at', { ascending: false });
      if (data) setForumPosts(data);
    };

    fetchChat();
    fetchAnnouncements();
    fetchForum();

    // Real-time Chat Subscription
    const channel = supabase.channel(`community_${chatChannel}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
        if (payload.new.channel === chatChannel || payload.new.channel === 'GLOBAL') {
          setMessages(p => [...p, payload.new]);
          setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        }
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [isOpen, userProfile, teacherForumLevel, chatChannel, baseLevel, userRole, supabase]);

  useEffect(() => {
    if (!selectedPost) return;
    const fetchReplies = async () => {
      const { data } = await supabase.from('forum_replies')
        .select('*, author:profiles!author_id(first_name, last_name, avatar_url, level, role)')
        .eq('thread_id', selectedPost.id)
        .order('created_at', { ascending: true });
      if (data) setForumReplies(data);
    };
    fetchReplies();
  }, [selectedPost, supabase]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    try {
      await supabase.from('messages').insert({
        sender_name: userProfile.first_name || 'User',
        sender_role: userRole,
        content: chatInput.trim(),
        channel: chatChannel,
        avatar_url: userProfile.avatar_url
      });
      setChatInput('');
    } catch (err) { console.error("Chat error:", err); }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyInput.trim() || !selectedPost) return;
    try {
      await supabase.from('forum_replies').insert({
        thread_id: selectedPost.id,
        content: replyInput.trim(),
        author_id: userProfile.id
      });
      setReplyInput('');
      const { data } = await supabase.from('forum_replies')
        .select('*, author:profiles!author_id(first_name, last_name, avatar_url, level, role)')
        .eq('thread_id', selectedPost.id)
        .order('created_at', { ascending: true });
      if (data) setForumReplies(data);
    } catch (err) { console.error("Reply error:", err); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in font-montserrat" onClick={onClose}>
      <div className="w-full md:w-[450px] bg-[#070b19]/95 border-l border-white/20 h-full shadow-2xl flex flex-col relative animate-slide-left" onClick={e => e.stopPropagation()}>
        
        {/* Header Tabs */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0 bg-white/5">
          <div className="flex gap-4">
            <button onClick={() => setActiveTab('CHAT')} className={`text-sm font-black uppercase tracking-widest transition-colors ${activeTab === 'CHAT' ? 'text-[#fcd34d]' : 'text-white/40 hover:text-white'}`}>Chat Room</button>
            <button onClick={() => setActiveTab('BOARD')} className={`text-sm font-black uppercase tracking-widest transition-colors ${activeTab === 'BOARD' ? 'text-[#fcd34d]' : 'text-white/40 hover:text-white'}`}>Info Board</button>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/50 hover:bg-white/20 hover:text-white transition-all">✕</button>
        </div>

        {/* ======================= CHAT VIEW ======================= */}
        {activeTab === 'CHAT' && (
          <div className="flex-1 flex flex-col min-h-0 relative">
            <div className="absolute inset-0 bg-[#08203e]/20 z-0"></div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 flex flex-col gap-4 z-10">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-white/40 text-xs font-bold uppercase tracking-widest">Send a message to start</div>
              ) : (
                messages.map(msg => {
                  const isSelf = msg.sender_name === userProfile.first_name;
                  const isAdmin = msg.sender_role?.includes('Admin');
                  return (
                    <div key={msg.id} className={`flex flex-col max-w-[85%] ${isSelf ? 'self-end items-end' : 'self-start items-start'}`}>
                      <div className="flex items-center gap-2 mb-1 px-1">
                        {!isSelf && <span className={`text-[9px] font-black uppercase tracking-widest ${isAdmin ? 'text-[#fcd34d]' : 'text-white/60'}`}>{msg.sender_name}</span>}
                        {isAdmin && <span className="bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase">Admin</span>}
                      </div>
                      <div className={`px-4 py-3 rounded-2xl text-sm font-medium leading-relaxed shadow-md ${isAdmin ? 'bg-[#fcd34d]/20 border border-[#fcd34d]/50 text-white' : isSelf ? 'bg-emerald-500/20 border border-emerald-500/30 text-white rounded-br-sm' : 'bg-white/10 border border-white/10 text-white/90 rounded-bl-sm'}`}>
                        {msg.content}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10 bg-black/40 shrink-0 z-10 relative">
              <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder={`Message ${chatChannel}...`} className="w-full bg-white/5 border border-white/20 rounded-xl pl-4 pr-12 py-3 text-sm text-white focus:outline-none focus:border-[#fcd34d] shadow-inner" />
              <button type="submit" disabled={!chatInput.trim()} className="absolute right-6 top-1/2 -translate-y-1/2 text-white/50 hover:text-[#fcd34d] transition-colors disabled:opacity-50">
                <svg className="w-5 h-5 transform rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
              </button>
            </form>
          </div>
        )}

        {/* ======================= BOARD VIEW ======================= */}
        {activeTab === 'BOARD' && (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex bg-black/40 p-2 shrink-0">
              <button onClick={() => { setBoardView('ANNOUNCEMENTS'); setSelectedPost(null); }} className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${boardView === 'ANNOUNCEMENTS' ? 'bg-white/10 text-white shadow-md' : 'text-white/40 hover:text-white'}`}>Feed</button>
              <button onClick={() => setBoardView('FORUM')} className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${boardView === 'FORUM' ? 'bg-white/10 text-white shadow-md' : 'text-white/40 hover:text-white'}`}>Forum</button>
            </div>

            {/* ANNOUNCEMENTS */}
            {boardView === 'ANNOUNCEMENTS' && (
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 flex flex-col gap-4">
                {announcements.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-white/40 text-xs font-bold uppercase tracking-widest">No announcements</div>
                ) : (
                  announcements.map(ann => (
                    <div key={ann.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-3 shadow-md">
                      {ann.image_url && <img src={ann.image_url} alt="Cover" className="w-full h-32 object-cover rounded-xl border border-white/20" />}
                      <h4 className="text-sm font-black uppercase tracking-widest text-[#fcd34d]">{ann.title}</h4>
                      <p className="text-xs text-white/80 leading-relaxed font-medium whitespace-pre-wrap">{ann.content}</p>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* FORUM (List or Active Post) */}
            {boardView === 'FORUM' && !selectedPost && (
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 flex flex-col gap-4">
                {userRole === 'Teacher' && (
                  <select value={teacherForumLevel} onChange={e => setTeacherForumLevel(e.target.value)} className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white text-xs font-black uppercase outline-none focus:border-[#fcd34d] mb-2 appearance-none">
                    {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(l => <option key={l} value={l} className="bg-[#070b19]">{l} Forum</option>)}
                  </select>
                )}
                
                {forumPosts.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center px-4">
                    <span className="text-white/40 text-xs font-bold uppercase tracking-widest">No active topics for {userRole === 'Teacher' ? teacherForumLevel : baseLevel} yet.</span>
                  </div>
                ) : (
                  forumPosts.map(post => (
                    <button key={post.id} onClick={() => setSelectedPost(post)} className="bg-white/5 border border-white/10 hover:border-[#fcd34d]/50 rounded-2xl p-5 text-left transition-all hover:bg-white/10 shadow-md group">
                      <h4 className="text-sm font-black uppercase tracking-widest text-white group-hover:text-[#fcd34d] transition-colors">{post.title}</h4>
                      <p className="text-xs text-white/50 mt-2 line-clamp-2 leading-relaxed">{post.content}</p>
                    </button>
                  ))
                )}
              </div>
            )}

            {/* ACTIVE FORUM POST & REPLIES */}
            {boardView === 'FORUM' && selectedPost && (
              <div className="flex-1 flex flex-col min-h-0 bg-black/20">
                <button onClick={() => setSelectedPost(null)} className="flex items-center gap-2 p-4 bg-white/5 hover:bg-white/10 border-b border-white/10 text-xs font-black uppercase tracking-widest text-white/70 hover:text-white transition-colors">
                  <span>← Back to Topics</span>
                </button>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 flex flex-col gap-6">
                  <div className="border-b border-white/10 pb-6 mb-2">
                    <h2 className="text-lg font-black uppercase tracking-widest text-[#fcd34d] mb-4">{selectedPost.title}</h2>
                    {selectedPost.image_url && <img src={selectedPost.image_url} alt="Topic" className="w-full h-40 object-cover rounded-xl border border-white/20 mb-4" />}
                    <p className="text-sm text-white/90 leading-relaxed font-medium">{selectedPost.content}</p>
                  </div>

                  {forumReplies.map(reply => {
                    const isStaff = reply.author?.role === 'Admin' || reply.author?.role === 'Teacher';
                    return (
                      <div key={reply.id} className="flex gap-4 bg-white/5 border border-white/10 rounded-2xl p-4 shadow-sm">
                        <img src={reply.author?.avatar_url || `https://ui-avatars.com/api/?name=${reply.author?.first_name || 'U'}&background=random&color=fff`} className={`w-10 h-10 rounded-full border-2 shrink-0 object-cover ${isStaff ? 'border-[#fcd34d]' : 'border-white/20'}`} alt="Avatar" />
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white">{reply.author?.first_name} {reply.author?.last_name}</span>
                            {isStaff ? (
                              <span className="text-[8px] font-black uppercase bg-[#fcd34d] text-[#08203e] px-1.5 py-0.5 rounded">Staff</span>
                            ) : (
                              <span className="text-[8px] font-black uppercase bg-white/20 text-white px-1.5 py-0.5 rounded">{reply.author?.level?.split(':')[0] || 'User'}</span>
                            )}
                          </div>
                          <p className="text-xs text-white/80 leading-relaxed font-medium">{reply.content}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <form onSubmit={handleSendReply} className="p-4 border-t border-white/10 bg-black/40 shrink-0">
                  <div className="relative">
                    <input type="text" value={replyInput} onChange={e => setReplyInput(e.target.value)} placeholder="Type a reply..." className="w-full bg-white/5 border border-white/20 rounded-xl pl-4 pr-12 py-3 text-sm text-white focus:outline-none focus:border-[#fcd34d] shadow-inner" />
                    <button type="submit" disabled={!replyInput.trim()} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-[#fcd34d] transition-colors disabled:opacity-50">
                      <svg className="w-5 h-5 transform rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default CommunityPanel;