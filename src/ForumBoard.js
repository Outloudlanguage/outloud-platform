import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './SupabaseClient';
import { validateContent } from './utils/ContentFilter';

export default function ForumBoard({ currentUser, onClose }) {
  const [channels, setChannels] = useState([]);
  const [activeChannel, setActiveChannel] = useState(null);
  const [posts, setPosts] = useState([]);
  const [activePost, setActivePost] = useState(null);
  const [replies, setReplies] = useState([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  
  // Forms
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newReplyContent, setNewReplyContent] = useState('');
  
  // Admin Forms
  const [showChannelForm, setShowChannelForm] = useState(false);
  const [newChannelTitle, setNewChannelTitle] = useState('');
  const [newChannelDesc, setNewChannelDesc] = useState('');
  const [newChannelType, setNewChannelType] = useState('qa');
  const [newChannelLevel, setNewChannelLevel] = useState('ALL');

  const messagesEndRef = useRef(null);

  const normalizedRole = currentUser?.role?.toLowerCase() || 'student';
  const isAdmin = normalizedRole === 'admin';
  const isModerator = normalizedRole === 'admin' || normalizedRole === 'teacher';
  const normalizedLevel = currentUser?.level ? currentUser.level.split(':')[0].trim() : 'A1';

  // =========================================================================
  // 1. DATA FETCHING
  // =========================================================================
  useEffect(() => {
    fetchChannels();
  }, []);

  const fetchChannels = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('forum_channels').select('*').eq('is_active', true).order('created_at', { ascending: true });
    
    if (data) {
      // Filter channels visually based on role
      const visibleChannels = data.filter(c => {
        if (isModerator) return true;
        if (c.target_level === 'STAFF') return false;
        if (c.target_level === 'ALL') return true;
        return c.target_level === normalizedLevel;
      });
      setChannels(visibleChannels);
      if (visibleChannels.length > 0 && !activeChannel) {
        setActiveChannel(visibleChannels[0]);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (activeChannel && !activePost) {
      fetchPosts(activeChannel.id);
    }
  }, [activeChannel, activePost]);

  const fetchPosts = async (channelId) => {
    const { data } = await supabase
      .from('forum_posts')
      .select('*, author:profiles!author_id(first_name, last_name, role, level, avatar_url)')
      .eq('channel_id', channelId)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });
    
    if (data) setPosts(data);
  };

  useEffect(() => {
    if (activePost) {
      fetchReplies(activePost.id);
    }
  }, [activePost]);

  const fetchReplies = async (postId) => {
    const { data } = await supabase
      .from('forum_replies')
      .select('*, author:profiles!author_id(first_name, last_name, role, level, avatar_url)')
      .eq('post_id', postId)
      .order('is_teacher_approved', { ascending: false }) // Golden apples float to top
      .order('created_at', { ascending: true });
    
    if (data) {
      setReplies(data);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  // =========================================================================
  // 2. SUBMISSION LOGIC (With Content Filter Engine)
  // =========================================================================
  const handleCreatePost = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!newPostTitle.trim() || !newPostContent.trim()) return;

    // 1. Run through automated bouncer
    const isDebate = activeChannel.channel_type === 'debate';
    const { isValid, error } = validateContent(newPostContent, isDebate);
    
    if (!isValid) {
      setFormError(error);
      return;
    }

    setIsSubmitting(true);
    const { error: dbError } = await supabase.from('forum_posts').insert({
      channel_id: activeChannel.id,
      author_id: currentUser.id,
      title: newPostTitle.trim(),
      content: newPostContent.trim()
    });

    if (dbError) {
      setFormError("Database rejected the post. Check your permissions.");
    } else {
      setNewPostTitle('');
      setNewPostContent('');
      fetchPosts(activeChannel.id);
    }
    setIsSubmitting(false);
  };

  const handleCreateReply = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!newReplyContent.trim()) return;

    const isDebate = activeChannel.channel_type === 'debate';
    const { isValid, error } = validateContent(newReplyContent, isDebate);
    
    if (!isValid) {
      setFormError(error);
      return;
    }

    setIsSubmitting(true);
    const { error: dbError } = await supabase.from('forum_replies').insert({
      post_id: activePost.id,
      author_id: currentUser.id,
      content: newReplyContent.trim()
    });

    if (dbError) {
      setFormError("Database rejected the reply.");
    } else {
      setNewReplyContent('');
      fetchReplies(activePost.id);
    }
    setIsSubmitting(false);
  };

  const handleCreateChannel = async (e) => {
    e.preventDefault();
    if (!isAdmin || !newChannelTitle.trim()) return;
    
    setIsSubmitting(true);
    await supabase.from('forum_channels').insert({
      title: newChannelTitle.trim(),
      description: newChannelDesc.trim(),
      channel_type: newChannelType,
      target_level: newChannelLevel,
      created_by: currentUser.id
    });
    
    setNewChannelTitle('');
    setNewChannelDesc('');
    setShowChannelForm(false);
    fetchChannels();
    setIsSubmitting(false);
  };

  // =========================================================================
  // 3. MICRO-INTERACTIONS & MODERATION
  // =========================================================================
  const handleUpvote = async (itemId, type) => {
    // 1. Try to insert unique vote record
    const { error } = await supabase.from('forum_upvotes').insert({ 
      user_id: currentUser.id, 
      [type === 'post' ? 'post_id' : 'reply_id']: itemId 
    });
    
    // 2. If no error (not a duplicate vote), increment the counter visually & in DB
    if (!error) {
      const table = type === 'post' ? 'forum_posts' : 'forum_replies';
      const targetArray = type === 'post' ? posts : replies;
      const item = targetArray.find(i => i.id === itemId);
      
      await supabase.from(table).update({ upvote_count: item.upvote_count + 1 }).eq('id', itemId);
      
      if (type === 'post') fetchPosts(activeChannel.id);
      if (type === 'reply') fetchReplies(activePost.id);
    }
  };

  const handleGoldenApple = async (replyId, currentStatus) => {
    if (!isModerator) return;
    await supabase.from('forum_replies').update({ is_teacher_approved: !currentStatus }).eq('id', replyId);
    fetchReplies(activePost.id);
  };

  const handleDelete = async (itemId, type) => {
    if (!window.confirm("Are you sure you want to delete this?")) return;
    const table = type === 'post' ? 'forum_posts' : 'forum_replies';
    await supabase.from(table).delete().eq('id', itemId);
    
    if (type === 'post') {
      setActivePost(null);
      fetchPosts(activeChannel.id);
    }
    if (type === 'reply') fetchReplies(activePost.id);
  };

  const getRoleBadge = (role, level) => {
    if (role === 'admin') return <span className="text-[9px] font-black uppercase tracking-wider bg-red-500/20 text-red-300 border border-red-500/40 px-1.5 py-0.5 rounded">MOD</span>;
    if (role === 'teacher') return <span className="text-[9px] font-black uppercase tracking-wider bg-[#fcd34d]/20 text-[#fcd34d] border border-[#fcd34d]/40 px-1.5 py-0.5 rounded">TEACHER</span>;
    return <span className="text-[9px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/40 px-1.5 py-0.5 rounded">{level || 'A1'}</span>;
  };

  const canPostHere = isModerator || activeChannel?.channel_type === 'qa';

  // =========================================================================
  // RENDER HELPERS
  // =========================================================================
  const renderAuthorBlock = (author, dateStr) => (
    <div className="flex items-center gap-2 mb-2">
      <div className="w-6 h-6 rounded-full bg-[#070b19] border border-white/20 overflow-hidden shrink-0">
        {author?.avatar_url ? (
          <img src={author.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-white/50">{author?.first_name?.[0] || 'U'}</div>
        )}
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-white/90">{author?.first_name} {author?.last_name}</span>
          {getRoleBadge(author?.role, author?.level)}
        </div>
        <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest">{new Date(dateStr).toLocaleString()}</span>
      </div>
    </div>
  );

  // =========================================================================
  // MAIN COMPONENT RENDER
  // =========================================================================
  if (isLoading) {
    return <div className="absolute inset-0 rounded-[2.5rem] z-[700] bg-[#070b19]/10 backdrop-blur-3xl flex items-center justify-center border border-white/10"><div className="w-10 h-10 border-4 border-[#fcd34d] border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="absolute inset-0 rounded-[2.5rem] z-[700] bg-[#070b19]/30 backdrop-blur-2xl font-montserrat flex flex-col md:flex-row overflow-hidden text-white select-none shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 animate-fade-in">
      
      {/* ----------------------------------------------------------------- */}
      {/* LEFT PANE: CHANNEL DIRECTORY */}
      {/* ----------------------------------------------------------------- */}
      <div className={`${activePost ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-64 lg:w-72 border-r border-white/10 bg-black/20 shrink-0 h-full`}>
        <div className="h-16 md:h-20 border-b border-white/10 flex items-center justify-between px-6 shrink-0 bg-white/5">
          <h2 className="text-sm font-black uppercase tracking-widest text-[#fcd34d]">Discussion Boards</h2>
          {/* Mobile exit button when seeing channels */}
          <button onClick={onClose} className="md:hidden w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
          
          {/* Channel Group: Q&A */}
          <div>
            <h3 className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-3 px-2 flex items-center gap-2">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Student Q&A
            </h3>
            <div className="space-y-1">
              {channels.filter(c => c.channel_type === 'qa').map(c => (
                <button 
                  key={c.id} onClick={() => { setActiveChannel(c); setActivePost(null); setFormError(''); }}
                  className={`w-full text-left p-3 rounded-xl transition-all group flex flex-col gap-1 ${activeChannel?.id === c.id ? 'bg-white/10 shadow-inner border border-white/10' : 'hover:bg-white/5 border border-transparent'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-black uppercase tracking-wider truncate ${activeChannel?.id === c.id ? 'text-[#fcd34d]' : 'text-white/80 group-hover:text-white'}`}># {c.title}</span>
                    {c.target_level !== 'ALL' && <span className="text-[8px] bg-white/10 px-1.5 py-0.5 rounded font-bold text-white/60">{c.target_level}</span>}
                  </div>
                  {c.description && <span className="text-[9px] text-white/40 font-medium truncate">{c.description}</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Channel Group: Debates */}
          <div>
            <h3 className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-3 px-2 flex items-center gap-2">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
              Teacher Debates
            </h3>
            <div className="space-y-1">
              {channels.filter(c => c.channel_type === 'debate').map(c => (
                <button 
                  key={c.id} onClick={() => { setActiveChannel(c); setActivePost(null); setFormError(''); }}
                  className={`w-full text-left p-3 rounded-xl transition-all group flex flex-col gap-1 ${activeChannel?.id === c.id ? 'bg-white/10 shadow-inner border border-white/10' : 'hover:bg-white/5 border border-transparent'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-black uppercase tracking-wider truncate ${activeChannel?.id === c.id ? 'text-red-400' : 'text-white/80 group-hover:text-white'}`}># {c.title}</span>
                    {c.target_level !== 'ALL' && <span className="text-[8px] bg-white/10 px-1.5 py-0.5 rounded font-bold text-white/60">{c.target_level}</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Admin Form Toggle */}
        {isAdmin && (
          <div className="p-4 border-t border-white/10 bg-black/30 shrink-0">
            {showChannelForm ? (
              <form onSubmit={handleCreateChannel} className="flex flex-col gap-2 animate-fade-in">
                <input type="text" value={newChannelTitle} onChange={e => setNewChannelTitle(e.target.value)} placeholder="Channel Name" className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-[#fcd34d]" required />
                <input type="text" value={newChannelDesc} onChange={e => setNewChannelDesc(e.target.value)} placeholder="Description (Optional)" className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-[#fcd34d]" />
                <div className="flex gap-2">
                  <select value={newChannelType} onChange={e => setNewChannelType(e.target.value)} className="flex-1 bg-white/5 border border-white/20 rounded-lg px-2 py-2 text-[10px] font-bold text-white outline-none">
                    <option value="qa" className="bg-[#0f172a]">Q&A (Bilingual)</option>
                    <option value="debate" className="bg-[#0f172a]">Debate (English Only)</option>
                  </select>
                  <select value={newChannelLevel} onChange={e => setNewChannelLevel(e.target.value)} className="flex-1 bg-white/5 border border-white/20 rounded-lg px-2 py-2 text-[10px] font-bold text-white outline-none">
                    <option value="ALL" className="bg-[#0f172a]">ALL Levels</option>
                    <option value="STAFF" className="bg-[#0f172a]">STAFF Only</option>
                    <option value="A1" className="bg-[#0f172a]">Level A1</option>
                    <option value="A2" className="bg-[#0f172a]">Level A2</option>
                    <option value="B1" className="bg-[#0f172a]">Level B1</option>
                    <option value="B2" className="bg-[#0f172a]">Level B2</option>
                    <option value="C1" className="bg-[#0f172a]">Level C1</option>
                    <option value="C2" className="bg-[#0f172a]">Level C2</option>
                  </select>
                </div>
                <div className="flex gap-2 mt-1">
                  <button type="button" onClick={() => setShowChannelForm(false)} className="flex-1 py-2 text-[10px] font-bold text-white/50 hover:bg-white/5 rounded-lg transition-colors">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 py-2 bg-[#fcd34d] text-[#08203e] text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-white transition-colors disabled:opacity-50">Create</button>
                </div>
              </form>
            ) : (
              <button onClick={() => setShowChannelForm(true)} className="w-full py-2.5 border border-dashed border-white/30 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/50 hover:bg-white/5 hover:text-white hover:border-[#fcd34d] transition-all flex items-center justify-center gap-2">
                <span>+</span> Create Channel
              </button>
            )}
          </div>
        )}
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* RIGHT PANE: FEED / THREAD */}
      {/* ----------------------------------------------------------------- */}
      <div className={`flex-1 flex flex-col h-full relative z-10 ${!activePost ? 'hidden md:flex' : 'flex'}`}>
        
        {/* Top Navbar */}
        <div className="h-16 md:h-20 border-b border-white/10 bg-black/20 backdrop-blur-xl px-4 md:px-8 flex items-center justify-between shrink-0 relative z-20">
          <div className="flex items-center gap-3">
            {/* Back Button (Mobile feed -> channels, OR Thread -> Feed) */}
            <button 
              onClick={() => activePost ? setActivePost(null) : onClose()} 
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white transition-colors shrink-0"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </button>
            <div className="flex flex-col">
              <h1 className="text-sm md:text-base font-black uppercase tracking-wider text-white flex items-center gap-2">
                {activeChannel?.title || 'Forum'}
                {activeChannel?.channel_type === 'debate' && <span className="text-[8px] bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded uppercase tracking-widest hidden sm:inline">English Only</span>}
              </h1>
              <p className="text-[9px] text-white/50 font-bold tracking-widest uppercase">
                {activePost ? 'Viewing Thread' : activeChannel?.description || 'Community Board'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="hidden md:flex w-10 h-10 items-center justify-center bg-white/10 hover:bg-red-500 border border-white/20 rounded-xl text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {formError && (
          <div className="bg-red-500/20 border-b border-red-500/40 text-red-200 text-[10px] md:text-xs font-bold px-6 py-3 shrink-0 flex items-center gap-3 shadow-inner z-20">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <span className="leading-tight">{formError}</span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
          {!activeChannel ? (
            <div className="h-full flex items-center justify-center text-white/30 font-bold uppercase tracking-widest text-xs">Select a channel</div>
          ) : !activePost ? (
            
            // ================== FEED VIEW ==================
            <div className="p-4 md:p-8 space-y-6 max-w-4xl mx-auto w-full">
              {/* CREATE POST BOX */}
              {canPostHere ? (
                <div className="bg-white/5 border border-white/10 rounded-3xl p-5 shadow-lg relative overflow-hidden group focus-within:border-[#fcd34d]/50 transition-colors">
                  <form onSubmit={handleCreatePost} className="flex flex-col gap-3 relative z-10">
                    <input 
                      type="text" value={newPostTitle} onChange={e => setNewPostTitle(e.target.value)} 
                      placeholder="Give your post a title..." 
                      className="w-full bg-transparent border-b border-white/10 px-2 py-2 text-sm font-black text-white outline-none placeholder-white/30 focus:border-[#fcd34d] transition-colors"
                      maxLength={100}
                    />
                    <textarea 
                      value={newPostContent} onChange={e => setNewPostContent(e.target.value)} 
                      placeholder={activeChannel.channel_type === 'debate' ? "Start a debate (English only)..." : "Ask a question about the language..."}
                      className="w-full bg-transparent px-2 py-2 text-xs font-medium text-white/90 outline-none placeholder-white/30 resize-none min-h-[80px]"
                    />
                    <div className="flex justify-end pt-2">
                      <button type="submit" disabled={isSubmitting || !newPostTitle || !newPostContent} className="px-6 py-2.5 bg-[#fcd34d] text-[#08203e] hover:bg-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(252,211,77,0.3)] transition-all disabled:opacity-40 active:scale-95">
                        {isSubmitting ? 'Posting...' : 'Post to Channel'}
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center shadow-inner">
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                    This is a Teacher-led Debate channel. Students can reply to existing topics, but cannot start new ones.
                  </p>
                </div>
              )}

              {/* POSTS LIST */}
              <div className="space-y-4">
                {posts.length === 0 ? (
                  <div className="text-center py-10 text-white/30 font-bold uppercase tracking-widest text-xs">No posts here yet. Be the first!</div>
                ) : (
                  posts.map(post => (
                    <div key={post.id} className="bg-black/40 hover:bg-white/5 border border-white/10 hover:border-white/30 rounded-2xl p-1 flex shadow-md transition-all cursor-pointer group" onClick={() => { setActivePost(post); setFormError(''); }}>
                      
                      {/* Upvote Column */}
                      <div className="w-12 md:w-16 shrink-0 flex flex-col items-center justify-start pt-4 gap-1 border-r border-white/5">
                        <button onClick={(e) => { e.stopPropagation(); handleUpvote(post.id, 'post'); }} className="w-8 h-8 rounded-full flex items-center justify-center text-white/30 hover:bg-white/10 hover:text-[#fcd34d] transition-colors active:scale-90">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7" /></svg>
                        </button>
                        <span className="text-[10px] font-black text-white/70">{post.upvote_count}</span>
                      </div>

                      {/* Content Column */}
                      <div className="flex-1 p-3 md:p-4 min-w-0">
                        {renderAuthorBlock(post.author, post.created_at)}
                        <h3 className="text-sm md:text-base font-black text-white mb-2 group-hover:text-[#fcd34d] transition-colors truncate">{post.title}</h3>
                        <p className="text-xs text-white/60 font-medium line-clamp-2 leading-relaxed">{post.content}</p>
                        
                        <div className="flex items-center gap-4 mt-4">
                          <span className="text-[10px] font-bold text-white/40 flex items-center gap-1.5 hover:text-white transition-colors">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                            View Thread
                          </span>
                          {(post.author_id === currentUser.id || isModerator) && (
                            <button onClick={(e) => { e.stopPropagation(); handleDelete(post.id, 'post'); }} className="text-[10px] font-bold text-red-400/50 hover:text-red-400 uppercase tracking-widest transition-colors">Delete</button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          ) : (
            
            // ================== THREAD VIEW ==================
            <div className="p-4 md:p-8 max-w-4xl mx-auto w-full flex flex-col gap-6">
              
              {/* ORIGINAL POST (Big Card) */}
              <div className="bg-black/60 border border-white/20 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#fcd34d]"></div>
                {renderAuthorBlock(activePost.author, activePost.created_at)}
                <h2 className="text-xl md:text-2xl font-black text-white mt-4 mb-4 leading-tight">{activePost.title}</h2>
                <p className="text-sm text-white/90 leading-loose whitespace-pre-wrap">{activePost.content}</p>
                <div className="flex items-center gap-6 mt-8 pt-4 border-t border-white/10">
                  <button onClick={() => handleUpvote(activePost.id, 'post')} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-white/70 hover:text-[#fcd34d] transition-all border border-white/10 active:scale-95">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7" /></svg>
                    <span className="text-xs font-black">{activePost.upvote_count} Upvotes</span>
                  </button>
                </div>
              </div>

              {/* REPLIES LIST */}
              <div className="space-y-4 pl-4 md:pl-8 border-l-2 border-white/5">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-6">{replies.length} Replies</h3>
                {replies.map(reply => (
                  <div key={reply.id} className={`bg-white/5 border rounded-2xl p-4 md:p-5 shadow-md relative transition-all ${reply.is_teacher_approved ? 'border-[#fcd34d] bg-[#fcd34d]/5 shadow-[0_0_20px_rgba(252,211,77,0.1)]' : 'border-white/10'}`}>
                    
                    {/* Golden Apple Badge */}
                    {reply.is_teacher_approved && (
                      <div className="absolute -top-3 -right-3 md:top-4 md:right-4 bg-[#fcd34d] text-[#08203e] text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 z-10 border-2 border-[#070b19]">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                        Teacher Approved
                      </div>
                    )}

                    <div className="flex gap-4">
                      {/* Upvote Column Mini */}
                      <div className="flex flex-col items-center shrink-0">
                        <button onClick={() => handleUpvote(reply.id, 'reply')} className="w-6 h-6 rounded-full flex items-center justify-center text-white/30 hover:bg-white/10 hover:text-[#fcd34d] transition-colors active:scale-90">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7" /></svg>
                        </button>
                        <span className="text-[9px] font-black text-white/50 mt-1">{reply.upvote_count}</span>
                      </div>

                      <div className="flex-1 min-w-0">
                        {renderAuthorBlock(reply.author, reply.created_at)}
                        <p className="text-xs md:text-sm text-white/90 leading-relaxed whitespace-pre-wrap mt-2">{reply.content}</p>
                        
                        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-white/5">
                          {isModerator && (
                            <button onClick={() => handleGoldenApple(reply.id, reply.is_teacher_approved)} className={`text-[9px] font-black uppercase tracking-widest transition-colors flex items-center gap-1 ${reply.is_teacher_approved ? 'text-[#fcd34d]/70 hover:text-[#fcd34d]' : 'text-emerald-400/50 hover:text-emerald-400'}`}>
                              {reply.is_teacher_approved ? 'Revoke Apple' : 'Grant Golden Apple'}
                            </button>
                          )}
                          {(reply.author_id === currentUser.id || isModerator) && (
                            <button onClick={() => handleDelete(reply.id, 'reply')} className="text-[9px] font-black text-red-400/50 hover:text-red-400 uppercase tracking-widest transition-colors">Delete</button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} className="h-4"></div>
              </div>

              {/* REPLY INPUT BAR */}
              <div className="sticky bottom-4 md:bottom-8 bg-[#0e2a47] border border-[#fcd34d]/30 rounded-3xl p-2 shadow-[0_10px_40px_rgba(0,0,0,0.6)] flex items-end gap-2 mt-auto">
                <textarea 
                  value={newReplyContent} onChange={e => setNewReplyContent(e.target.value)}
                  placeholder={activeChannel?.channel_type === 'debate' ? "Add to the debate (English only)..." : "Write a helpful reply..."}
                  className="flex-1 bg-transparent text-xs font-medium text-white px-4 py-3 outline-none resize-none max-h-32 custom-scrollbar placeholder-white/40"
                  rows="1"
                  onInput={(e) => {
                    e.target.style.height = 'auto';
                    e.target.style.height = (e.target.scrollHeight) + 'px';
                  }}
                />
                <button 
                  onClick={handleCreateReply} disabled={isSubmitting || !newReplyContent.trim()}
                  className="w-10 h-10 shrink-0 bg-[#fcd34d] text-[#08203e] hover:bg-white rounded-2xl flex items-center justify-center transition-all disabled:opacity-40 active:scale-95 m-1"
                >
                  <svg className="w-4 h-4 translate-x-0.5" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                </button>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}