import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from './SupabaseClient';
import { validateContent } from './utils/ContentFilter';
import { OutLoudIcon } from './components/OutLoudBrand';

const EMOJI_CATEGORIES = {
  Expressions: ['😀','😃','😄','😁','😆','😅','😂','🤣','😊','😇','🙂','🙃','😉','😌','😍','🥰','😘','😗','😙','😚','😋','😛','😝','😜','🤪','🤨','🧐','🤓','😎','🤩','🥳','😏','😒','😞','😔','😟','😕','🙁','😣','😖','😫','😩','🥺','😢','😭','😤','😠','😡','🤯','😳','😱','😨','😰','😥','😓','🤗','🤔','🤭','🤫','🤥','😶','😐','😑','😬','🙄','😯','😦','😧','😮','😲','🥱','😴','🤤','😪','😵','🤐','🤢','🤮','🤧','😷','🤒','🤕','🤑','🤠','😈','👻','💀','👽','🤖','🎃','😺','😸','😹','😻','😼','😽','🙀','😿','😾'],
  People: ['👋','🤚','🖐️','✋','🖖','👌','✌️','🤞','🤟','🤘','🤙','👈','👉','👆','👇','☝️','👍','👎','✊','👊','🤛','🤜','👏','🙌','👐','🤲','🤝','🙏','✍️','💅','🤳','💪','👂','👃','🧠','👀','👅','👄','👶','🧒','👦','👧','🧑','👨','🧔','👩','🧓','👴','👵','🙍','🙎','🙅','🙆','💁','🙋','🙇','🤦','🤷','👮','🕵️','💂','👷','🤴','👸','👳','👲','🧕','🤵','👰','🤰','🤱','👼','🎅','🤶','🦸','🦹','🧙','🧚','🧛','🧜','🧝','🧞','🧟','💆','💇','🚶','🏃','💃','🕺','👯','🧖','🧗','🤺','🏇','⛷️','🏂','🏌️','🏄','🚣','🏊','⛹️','🏋️','🚴','🚵','🤸','🤼','🤽','🤾','🤹','🧘'],
  Animals: ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐽','🐸','🐵','🙈','🙉','🙊','🐒','🐔','🐧','🐦','🐤','🐣','🐥','🦆','🦅','🦉','🦇','🐺','🐗','🐴','🦄','🐝','🐛','🦋','🐌','🐞','🐜','🦟','🦗','🕷️','🦂','🐢','🐍','🦎','🦖','🦕','🐙','🦑','🦐','🦞','🦀','🐡','🐠','🐟','🐬','🐳','🐋','🦈','🐊','🐅','🐆','🦓','🦍','🐘','🦏','🐪','🐫','🦒','🐃','🐂','🐄','🐎','🐖','🐏','🐑','🐐','🦌','🐕','🐩','🐈','🐓','🦃','🦚','🦜','🦢','🕊️','🐇','🦝','🦨','🦡','🐁','🐀','🐿️','🦔','🐾','🐉','🐲','🌵','🎄','🌲','🌳','🌴','🌱','🌿','☘️','🍀','🎍','🎋','🍃','🍂','🍁','🍄','🐚','🌾','💐','🌷','🌹','🥀','🌺','🌸','🌼','🌻','🌞','🌝','🌛','🌜','🌚','🌕','🌖','🌗','🌘','🌑','🌒','🌓','🌔','🌙','🌎','🌍','🌏','🪐','💫','⭐️','🌟','✨','⚡️','☄️','💥','🔥','🌪️','🌈','☀️','🌤️','⛅️','🌥️','☁️','🌦️','🌧️','⛈️','🌩️','🌨️','❄️','☃️','⛄️','🌬️','💨','💧','💦','☔️','☂️','🌊','🌫️'],
  Food: ['🍏','🍎','🍐','🍊','🍋','🍌','🍉','🍇','🍓','🍈','🍒','🍑','🍍','🥥','🥝','🍅','🍆','🥑','🥦','🥬','🥒','🌶️','🌽','🥕','🥔','🍠','🥐','🍞','🥖','🥨','🧀','🥚','🍳','🥞','🥓','🥩','🍗','🍖','🌭','🍔','🍟','🍕','🥪','🥙','🌮','🌯','🥗','🥘','🥫','🍝','🍜','🍲','🍛','🍣','🍱','🥟','🍤','🍙','🍚','🍘','🍥','🥠','🍢','🍡','🍧','🍨','🍦','🥧','🍰','🎂','🍮','🍭','🍬','🍫','🍿','🍩','🍪','🌰','🥜','🍯','🥛','🍼','☕️','🍵','🥤','🍶','🍺','🍻','🥂','🍷','🥃','🍸','🍹','🍾','🥄','🍴','🍽️','🥣','🥡','🥢','🧂'],
  Places: ['🚗','🚕','🚙','🚌','🚎','🏎️','🚓','🚑','🚒','🚐','🚚','🚛','🚜','🛴','🚲','🛵','🏍️','🚨','🚔','🚍','🚘','🚖','🚡','🚠','🚟','🚃','🚋','🚞','🚝','🚄','🚅','🚈','🚂','🚆','🚇','🚊','🚉','✈️','🛫','🛬','🛩️','💺','🛰️','🚀','🛸','🚁','🛶','⛵️','🛥️','🛳️','⛴️','🚢','⚓️','⛽️','🚧','🚦','🚥','🚏','🗺️','🗿','🗽','🗼','🏰','🏯','🏟️','🎡','🎢','🎠','⛲️','⛱️','🏖️','🏝️','🏜️','🌋','⛰️','🏔️','🗻','🏕️','⛺️','🏠','🏡','🏘️','🏚️','🏗️','🏭','🏢','🏬','🏣','🏤','🏥','🏦','🏨','🏪','🏫','🏩','💒','🏛️','⛪️','🕌','🕍','🕋'],
  Objects: ['⌚️','📱','📲','💻','⌨️','🖥️','🖨️','🖱️','🖲️','🕹️','💽','💾','💿','📀','📼','📷','📸','📹','🎥','📽️','🎞️','📞','☎️','📟','📠','📺','📻','🎙️','🎚️','🎛️','🧭','⏱️','⏲️','⏰','🕰️','⌛️','⏳','📡','🔌','💡','🔦','🕯️','💸','💵','💴','💶','💷','💰','💳','💎','⚖️','🔧','🔨','⚒️','🛠️','⛏️','🔩','⚙️','🧱','⛓️','🧲','🧨','🔪','🗡️','⚔️','🛡️','🔮','📿','💈','⚗️','🔭','🔬','🕳️','💊','💉','🧬','🦠','🧫','🧪','🌡️','🧹','🧻','🚽','🚰','🚿','🛁','🛀','🧼','🧽','🚪','🔑','🛏️','🧸','🖼️','🛍️','🛒','🎁','🎈','🎏','🎀','🎊','🎉','🎎','🏮','🎐','🧧','✉️','📩','📨','📧','💌','📥','📤','📦','🏷️','📪','📫','📬','📭','📮','📯','📜','📃','📄','📑','🧾','📊','📈','📉','🗒️','🗓️','📆','📅','🗑️','📇','🗃️','🗳️','🗄️','📋','📁','📂','🗂️','🗞️','📰','📓','📔','📒','📕','📗','📘','📙','📚','📖','🔖','🔗','📎','🖇️','📐','📏','🧮','📌','📍','✂️','🖊️','🖋️','✒️','🖌️','🖍️','📝','✏️','🔍','🔎','🔏','🔐','🔒','🔓'],
  Symbols: ['❤️','🧡','💛','💚','💙','💜','🖤','💔','❣️','💕','💞','💓','💗','💖','💘','💝','💟','☮️','✝️','☪️','🕉️','☸️','✡️','🔯','🕎','☯️','☦️','🛐','⛎','♈️','♉️','♊️','♋️','♌️','♍️','♎️','♏️','♐️','♑️','♒️','♓️','🆔','⚛️','🉑','☢️','☣️','📴','📳','🈶','🈚️','🈸','🈺','🈷️','✴️','🆚','💮','🉐','㊙️','㊗️','🈴','🈵','🈹','🈲','🅰️','🅱️','🆎','🆑','🅾️','🆘','❌','⭕️','🛑','⛔️','📛','🚫','💯','💢','♨️','🚷','🚯','🚳','🚱','🔞','📵','🚭','❗️','❕','❓','❔','‼️','⁉️','🔅','🔆','〽️','⚠️','🚸','🔱','⚜️','🔰','♻️','✅','🈯️','💹','❇️','✳️','❎','🌐','💠','Ⓜ️','🌀','💤','🏧','🚾','♿️','🅿️','🈳','🈂️','🛂','🛃','🛄','🛅','🚹','🚺','🚼','⚧️','🚻','🚮','🎦','📶','🈁','🔣','ℹ️','🔤','🔡','🔠','🆖','🆗','🆙','🆒','🆕','🆓','0️⃣','1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟','🔢','#️⃣','*️⃣','⏏️','▶️','⏸️','⏯️','⏹️','⏺️','⏭️','⏮️','⏩','⏪','⏫','⏬','◀️','🔼','🔽','➡️','⬅️','⬆️','⬇️','↗️','↘️','↙️','↖️','↕️','↔️','↪️','↩️','⤴️','⤵️','🔀','🔁','🔂','🔄','🔃','🎵','🎶','➕','➖','➗','✖️','💲','💱','™️','©️','®️','〰️','➰','➿','🔚','🔙','🔛','🔝','🔜','✔️','☑️','🔘','🔴','🟠','🟡','🟢','🔵','🟣','⚫️','⚪️','🔺','🔻','🔸','🔹','🔶','🔷','🔳','🔲','▪️','▫️','◾️','◽️','◼️','◻️','⬛️','⬜️','🔈','🔇','🔉','🔊','🔔','🔕','📣','📢','💬','💭','🗯️','♠️','♣️','♥️','♦️','🃏','🎴','🀄️'],
};

const ForumStyles = () => (
  <style>{`
    .ola-forum-canvas {
      background: linear-gradient(125deg, #fdebc0 0%, #f6eff5 44%, #e5e8fa 76%, #d9dff8 100%);
    }
    .ola-forum-card-pearl {
      background: linear-gradient(160deg, rgba(255, 255, 255, 0.94) 0%, rgba(242, 244, 253, 0.84) 100%);
      backdrop-filter: blur(22px) saturate(175%);
      -webkit-backdrop-filter: blur(22px) saturate(175%);
      border: 2px solid #ffffff;
      box-shadow: 0 18px 38px -16px rgba(55, 63, 118, 0.2), inset 0 2px 2px #ffffff;
    }
    .ola-forum-card-gold {
      background: linear-gradient(160deg, #fff9e8 0%, #ffe69e 100%);
      border: 2px solid #ffc749;
      box-shadow: 0 16px 34px -16px rgba(196, 138, 12, 0.26), inset 0 2px 2px rgba(255, 255, 255, 0.96);
    }
    .ola-forum-btn-yellow {
      background: linear-gradient(180deg, #ffd66b 0%, #ffc749 100%);
      color: #1e2246;
      border: 2px solid #1e2246;
      box-shadow: 0 4px 0 #1e2246, 0 10px 22px -6px rgba(255, 199, 73, 0.55);
      transition: transform 0.14s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.14s ease, filter 0.14s ease;
    }
    .ola-forum-btn-yellow:hover {
      filter: brightness(1.04);
      transform: translateY(-2px);
      box-shadow: 0 6px 0 #1e2246, 0 14px 26px -6px rgba(255, 199, 73, 0.72);
    }
    .ola-forum-btn-yellow:active {
      transform: translateY(3px) scale(0.99);
      box-shadow: 0 1px 0 #1e2246;
    }
    @keyframes olaForumPop {
      0% { opacity: 0; transform: translateY(8px) scale(0.985); }
      100% { opacity: 1; transform: translateY(0) scale(1); }
    }
    .ola-forum-pop { animation: olaForumPop 0.2s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
  `}</style>
);

export default function ForumBoard({ currentUser, onClose }) {
  const [myReputation, setMyReputation] = useState(0);
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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedEmojiCategory, setSelectedEmojiCategory] = useState('Expressions');
  const replyInputRef = useRef(null);

  // Mobile Navigation & Admin Forms
  const [showMobileChannels, setShowMobileChannels] = useState(false);
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
  const fetchMyReputation = useCallback(async () => {
    if (!currentUser?.id) return;
    const { data } = await supabase
      .from('profiles')
      .select('forum_reputation')
      .eq('id', currentUser.id)
      .single();
    if (data) setMyReputation(data.forum_reputation || 0);
  }, [currentUser?.id]);

  const fetchChannels = useCallback(async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('forum_channels')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (data) {
      const visibleChannels = data.filter((c) => {
        if (isModerator) return true;
        if (c.target_level === 'STAFF') return false;
        if (c.target_level === 'ALL') return true;
        return c.target_level === normalizedLevel;
      });
      setChannels(visibleChannels);
      setActiveChannel((prev) => {
        if (prev && visibleChannels.some((c) => c.id === prev.id)) return prev;
        return visibleChannels.length > 0 ? visibleChannels[0] : null;
      });
    }
    setIsLoading(false);
  }, [isModerator, normalizedLevel]);

  const fetchPosts = useCallback(async (channelId) => {
    const { data } = await supabase
      .from('forum_posts')
      .select('*, author:profiles!author_id(first_name, last_name, role, level, avatar_url, forum_reputation)')
      .eq('channel_id', channelId)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (data) setPosts(data);
  }, []);

  const fetchReplies = useCallback(async (postId) => {
    const { data } = await supabase
      .from('forum_replies')
      .select('*, author:profiles!author_id(first_name, last_name, role, level, avatar_url, forum_reputation)')
      .eq('post_id', postId)
      .order('is_teacher_approved', { ascending: false })
      .order('created_at', { ascending: true });

    if (data) {
      setReplies(data);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, []);

  useEffect(() => {
    fetchChannels();
    fetchMyReputation();
  }, [fetchChannels, fetchMyReputation]);

  useEffect(() => {
    if (activeChannel?.id && !activePost) {
      fetchPosts(activeChannel.id);
    }
  }, [activeChannel?.id, activePost, fetchPosts]);

  useEffect(() => {
    if (activePost?.id) {
      fetchReplies(activePost.id);
    }
  }, [activePost?.id, fetchReplies]);

  // =========================================================================
  // 2. SUBMISSION LOGIC (With Content Filter Engine)
  // =========================================================================
  const handleCreatePost = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!newPostTitle.trim() || !newPostContent.trim() || !activeChannel) return;

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
      content: newPostContent.trim(),
    });

    if (dbError) {
      setFormError('Database rejected the post. Check your permissions.');
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
    if (!newReplyContent.trim() || !activePost) return;

    const isDebate = activeChannel?.channel_type === 'debate';
    const { isValid, error } = validateContent(newReplyContent, isDebate);

    if (!isValid) {
      setFormError(error);
      return;
    }

    setIsSubmitting(true);
    const { error: dbError } = await supabase.from('forum_replies').insert({
      post_id: activePost.id,
      author_id: currentUser.id,
      content: newReplyContent.trim(),
    });

    if (dbError) {
      setFormError('Database rejected the reply.');
    } else {
      setNewReplyContent('');
      setShowEmojiPicker(false);
      if (replyInputRef.current) replyInputRef.current.style.height = 'auto';
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
      created_by: currentUser.id,
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
    if (type === 'post') {
      setPosts((prev) => prev.map((p) => (p.id === itemId ? { ...p, upvote_count: p.upvote_count + 1 } : p)));
      if (activePost && activePost.id === itemId) {
        setActivePost((prev) => ({ ...prev, upvote_count: prev.upvote_count + 1 }));
      }
    }
    if (type === 'reply') {
      setReplies((prev) => prev.map((r) => (r.id === itemId ? { ...r, upvote_count: r.upvote_count + 1 } : r)));
    }

    const { error } = await supabase.from('forum_upvotes').insert({
      user_id: currentUser.id,
      [type === 'post' ? 'post_id' : 'reply_id']: itemId,
    });

    if (!error) {
      const table = type === 'post' ? 'forum_posts' : 'forum_replies';
      const targetArray = type === 'post' ? posts : replies;
      const item = targetArray.find((i) => i.id === itemId);
      if (item) {
        await supabase.from(table).update({ upvote_count: item.upvote_count + 1 }).eq('id', itemId);
      }
    } else {
      if (type === 'post' && activeChannel) {
        fetchPosts(activeChannel.id);
        if (activePost && activePost.id === itemId) {
          setActivePost((prev) => ({ ...prev, upvote_count: Math.max(0, prev.upvote_count - 1) }));
        }
      }
      if (type === 'reply' && activePost) fetchReplies(activePost.id);
    }
  };

  const handleGoldenApple = async (replyId, currentStatus) => {
    if (!isModerator || !activePost) return;
    await supabase.from('forum_replies').update({ is_teacher_approved: !currentStatus }).eq('id', replyId);
    fetchReplies(activePost.id);
  };

  const handleTogglePin = async (post) => {
    if (!isAdmin || !activeChannel) return;
    await supabase.from('forum_posts').update({ is_pinned: !post.is_pinned }).eq('id', post.id);
    fetchPosts(activeChannel.id);
  };

  const handleDeleteChannel = async (channelId) => {
    if (!isAdmin) return;
    if (!window.confirm('Delete this channel and all of its posts permanently?')) return;
    await supabase.from('forum_channels').delete().eq('id', channelId);
    setActiveChannel(null);
    setActivePost(null);
    fetchChannels();
  };

  const handleDelete = async (itemId, type) => {
    if (!isAdmin) return;
    if (!window.confirm('Are you sure you want to permanently delete this?')) return;
    const table = type === 'post' ? 'forum_posts' : 'forum_replies';
    await supabase.from(table).delete().eq('id', itemId);

    if (type === 'post' && activeChannel) {
      setActivePost(null);
      fetchPosts(activeChannel.id);
    }
    if (type === 'reply' && activePost) fetchReplies(activePost.id);
  };

  const getRoleBadge = (role, level) => {
    const safeRole = String(role || '').toLowerCase();
    if (safeRole === 'admin') {
      return (
        <span className="text-[9px] font-extrabold uppercase tracking-wider bg-[#fff2f1] text-[#c93f34] border border-[#ee665b]/45 px-2 py-0.5 rounded-full">
          Admin
        </span>
      );
    }
    if (safeRole === 'teacher') {
      return (
        <span className="text-[9px] font-extrabold uppercase tracking-wider bg-[#fff3d1] text-[#1e2246] border border-[#ffc749] px-2 py-0.5 rounded-full">
          Teacher
        </span>
      );
    }
    return (
      <span className="text-[9px] font-extrabold uppercase tracking-wider bg-[#e8eaf7] text-[#454d82] border border-[#626a9f]/25 px-2 py-0.5 rounded-full">
        {level ? String(level).split(':')[0] : 'A1'}
      </span>
    );
  };

  const getReputationBadge = (reputation = 0) => {
    if (reputation >= 500) {
      return (
        <span
          className="inline-flex items-center gap-1 bg-[#ffc749] text-[#1e2246] border border-[#1e2246] px-2 py-0.5 rounded-full text-[8.5px] font-extrabold uppercase tracking-wider"
          title="Scholar (500+ Rep)"
        >
          ★ Scholar
        </span>
      );
    }
    if (reputation >= 150) {
      return (
        <span
          className="inline-flex items-center gap-1 bg-[#5b64a0] text-[#ffc749] px-2 py-0.5 rounded-full text-[8.5px] font-extrabold uppercase tracking-wider"
          title="Debater (150+ Rep)"
        >
          ◆ Debater
        </span>
      );
    }
    if (reputation >= 50) {
      return (
        <span
          className="inline-flex items-center gap-1 bg-[#e7faf3] text-[#128063] border border-[#16a37f]/45 px-2 py-0.5 rounded-full text-[8.5px] font-extrabold uppercase tracking-wider"
          title="Contributor (50+ Rep)"
        >
          ● Contributor
        </span>
      );
    }
    return (
      <span
        className="inline-flex items-center gap-1 bg-[#f4f6fc] text-[#626a9f] border border-[#dfe2f2] px-2 py-0.5 rounded-full text-[8.5px] font-bold uppercase tracking-wider"
        title="Novice (0+ Rep)"
      >
        Novice
      </span>
    );
  };

  const isContributor = myReputation >= 50;
  const canPostHere =
    isModerator || activeChannel?.channel_type === 'qa' || (activeChannel?.channel_type === 'debate' && isContributor);

  const renderAuthorBlock = (author, dateStr) => {
    const isStaff =
      author?.role?.toLowerCase() === 'admin' || author?.role?.toLowerCase() === 'teacher';
    return (
      <div className="flex items-center gap-3 mb-2.5">
        <div className="w-9 h-9 rounded-full bg-[#e8eaf7] border-2 border-[#1e2246]/20 shadow-sm overflow-hidden shrink-0">
          {author?.avatar_url ? (
            <img src={author.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs font-extrabold text-[#454d82]">
              {author?.first_name?.[0] || 'U'}
            </div>
          )}
        </div>
        <div className="flex flex-col min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs sm:text-sm font-extrabold text-[#1e2246]">
              {author?.first_name} {author?.last_name}
            </span>
            {getRoleBadge(author?.role, author?.level)}
            {!isStaff && getReputationBadge(author?.forum_reputation || 0)}
          </div>
          <span className="text-[10px] font-semibold text-[#626a9f] mt-0.5">
            {new Date(dateStr).toLocaleString()}
          </span>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="ola-forum-canvas absolute inset-0 rounded-[2rem] sm:rounded-[2.5rem] z-[700] flex flex-col items-center justify-center border-2 border-white shadow-2xl font-montserrat">
        <ForumStyles />
        <OutLoudIcon className="w-14 h-14 animate-bounce mb-3" />
        <div className="w-8 h-8 border-4 border-[#626a9f] border-t-[#ffc749] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="ola-forum-canvas absolute inset-0 rounded-[2rem] sm:rounded-[2.5rem] z-[700] font-montserrat flex flex-col md:flex-row overflow-hidden text-[#1e2246] shadow-2xl border-2 border-white">
      <ForumStyles />

      {/* ARCHITECTURAL DOTTED BACKDROP */}
      <div
        className="absolute inset-0 pointer-events-none z-0 opacity-75"
        style={{
          backgroundImage: 'radial-gradient(rgba(82, 91, 146, 0.22) 1.5px, transparent 1.5px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* ----------------------------------------------------------------- */}
      {/* LEFT PANE: CHANNEL DIRECTORY (Sidebar & Mobile Drawer)            */}
      {/* ----------------------------------------------------------------- */}
      <aside
        className={`${
          showMobileChannels
            ? 'flex fixed inset-0 z-50 bg-[#f4f6fc]/95 backdrop-blur-2xl'
            : 'hidden'
        } md:flex md:relative flex-col w-full md:w-64 lg:w-72 border-r-2 border-white bg-white/75 backdrop-blur-2xl shrink-0 h-full z-20`}
      >
        <div className="h-16 md:h-20 border-b border-[#626a9f]/15 flex items-center justify-between px-5 shrink-0 bg-white/75">
          <div className="flex items-center gap-2.5">
            <OutLoudIcon className="w-8 h-8 shrink-0" />
            <div>
              <h2 className="text-xs font-extrabold uppercase tracking-widest text-[#1e2246] leading-none">
                OutLoud Forum
              </h2>
              <p className="text-[9.5px] font-bold text-[#626a9f] uppercase tracking-wider mt-0.5">
                Q&amp;A &amp; Debates
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowMobileChannels(false)}
            className="md:hidden w-9 h-9 rounded-full bg-white border-2 border-[#1e2246] flex items-center justify-center text-[#1e2246] font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
          {/* Student Q&A Channels */}
          <div>
            <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-[#626a9f] mb-2.5 px-2 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-[#454d82]" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Student Q&amp;A</span>
            </h3>
            <div className="space-y-1.5">
              {channels
                .filter((c) => c.channel_type === 'qa')
                .map((c) => {
                  const isActive = activeChannel?.id === c.id;
                  return (
                    <div
                      key={c.id}
                      onClick={() => {
                        setActiveChannel(c);
                        setActivePost(null);
                        setFormError('');
                        setShowMobileChannels(false);
                      }}
                      className={`w-full text-left p-3 rounded-2xl transition-all flex flex-col gap-0.5 cursor-pointer border-2 ${
                        isActive
                          ? 'bg-[#1e2246] text-white border-[#1e2246] shadow-md'
                          : 'bg-white hover:bg-[#fff9e8] text-[#1e2246] border-white hover:border-[#ffc749]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-xs font-extrabold uppercase tracking-wider truncate ${
                            isActive ? 'text-[#ffc749]' : 'text-[#1e2246]'
                          }`}
                        >
                          # {c.title}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {c.target_level !== 'ALL' && (
                            <span
                              className={`text-[8.5px] px-2 py-0.5 rounded-full font-extrabold ${
                                isActive ? 'bg-white/15 text-white' : 'bg-[#e8eaf7] text-[#454d82]'
                              }`}
                            >
                              {c.target_level}
                            </span>
                          )}
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteChannel(c.id);
                              }}
                              className="text-[10px] text-[#ee665b] hover:scale-110 font-bold px-1 cursor-pointer"
                              title="Delete Channel"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>
                      {c.description && (
                        <span
                          className={`text-[10px] font-medium truncate ${
                            isActive ? 'text-white/75' : 'text-[#50567d]'
                          }`}
                        >
                          {c.description}
                        </span>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Debate Channels */}
          <div>
            <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-[#626a9f] mb-2.5 px-2 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-[#c93f34]" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
              <span>Teacher Debates</span>
            </h3>
            <div className="space-y-1.5">
              {channels
                .filter((c) => c.channel_type === 'debate')
                .map((c) => {
                  const isActive = activeChannel?.id === c.id;
                  return (
                    <div
                      key={c.id}
                      onClick={() => {
                        setActiveChannel(c);
                        setActivePost(null);
                        setFormError('');
                        setShowMobileChannels(false);
                      }}
                      className={`w-full text-left p-3 rounded-2xl transition-all flex flex-col gap-0.5 cursor-pointer border-2 ${
                        isActive
                          ? 'bg-gradient-to-r from-[#747db8] to-[#5b64a0] text-white border-[#1e2246] shadow-md'
                          : 'bg-white hover:bg-[#eef0fb] text-[#1e2246] border-white hover:border-[#626a9f]/45'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-xs font-extrabold uppercase tracking-wider truncate ${
                            isActive ? 'text-[#ffc749]' : 'text-[#1e2246]'
                          }`}
                        >
                          # {c.title}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {c.target_level !== 'ALL' && (
                            <span
                              className={`text-[8.5px] px-2 py-0.5 rounded-full font-extrabold ${
                                isActive ? 'bg-white/20 text-white' : 'bg-[#e8eaf7] text-[#454d82]'
                              }`}
                            >
                              {c.target_level}
                            </span>
                          )}
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteChannel(c.id);
                              }}
                              className="text-[10px] text-[#ee665b] hover:scale-110 font-bold px-1 cursor-pointer"
                              title="Delete Channel"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>
                      {c.description && (
                        <span
                          className={`text-[10px] font-medium truncate ${
                            isActive ? 'text-white/80' : 'text-[#50567d]'
                          }`}
                        >
                          {c.description}
                        </span>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Admin Create Channel Drawer */}
        {isAdmin && (
          <div className="p-4 border-t border-[#626a9f]/15 bg-white/80 shrink-0">
            {showChannelForm ? (
              <form onSubmit={handleCreateChannel} className="flex flex-col gap-2">
                <input
                  type="text"
                  value={newChannelTitle}
                  onChange={(e) => setNewChannelTitle(e.target.value)}
                  placeholder="Channel Name"
                  className="w-full bg-white border-2 border-[#dfe2f2] focus:border-[#454d82] rounded-xl px-3 py-2 text-xs font-semibold text-[#1e2246] outline-none"
                  required
                />
                <input
                  type="text"
                  value={newChannelDesc}
                  onChange={(e) => setNewChannelDesc(e.target.value)}
                  placeholder="Description (Optional)"
                  className="w-full bg-white border-2 border-[#dfe2f2] focus:border-[#454d82] rounded-xl px-3 py-2 text-xs font-medium text-[#1e2246] outline-none"
                />
                <div className="flex gap-2">
                  <select
                    value={newChannelType}
                    onChange={(e) => setNewChannelType(e.target.value)}
                    className="flex-1 bg-white border-2 border-[#dfe2f2] rounded-xl px-2 py-2 text-[10.5px] font-bold text-[#1e2246] outline-none cursor-pointer"
                  >
                    <option value="qa">Q&amp;A (Bilingual)</option>
                    <option value="debate">Debate (EN Only)</option>
                  </select>
                  <select
                    value={newChannelLevel}
                    onChange={(e) => setNewChannelLevel(e.target.value)}
                    className="flex-1 bg-white border-2 border-[#dfe2f2] rounded-xl px-2 py-2 text-[10.5px] font-bold text-[#1e2246] outline-none cursor-pointer"
                  >
                    <option value="ALL">ALL Levels</option>
                    <option value="STAFF">STAFF Only</option>
                    <option value="A1">Level A1</option>
                    <option value="A2">Level A2</option>
                    <option value="B1">Level B1</option>
                    <option value="B2">Level B2</option>
                    <option value="C1">Level C1</option>
                    <option value="C2">Level C2</option>
                  </select>
                </div>
                <div className="flex gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setShowChannelForm(false)}
                    className="flex-1 py-2 text-[10.5px] font-bold text-[#50567d] hover:text-[#1e2246] rounded-full cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="ola-forum-btn-yellow flex-1 py-2 text-[10.5px] font-extrabold uppercase tracking-wider rounded-full cursor-pointer disabled:opacity-50"
                  >
                    Create
                  </button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setShowChannelForm(true)}
                className="w-full py-2.5 border-2 border-dashed border-[#626a9f]/45 hover:border-[#1e2246] rounded-full text-[10.5px] font-extrabold uppercase tracking-widest text-[#454d82] hover:text-[#1e2246] hover:bg-[#fff3d1] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>+</span>
                <span>Create Channel</span>
              </button>
            )}
          </div>
        )}
      </aside>

      {/* ----------------------------------------------------------------- */}
      {/* RIGHT PANE: FEED / THREAD WORKSPACE                               */}
      {/* ----------------------------------------------------------------- */}
      <div className="flex-1 flex flex-col h-full relative z-10 overflow-hidden">
        {/* Subtle OutLoud Watermark */}
        <div className="pointer-events-none select-none absolute inset-0 flex items-center justify-center opacity-[0.045] z-0">
          <OutLoudIcon withTile={false} className="w-[340px] h-[340px] sm:w-[460px] sm:h-[460px]" />
        </div>

        {/* Top Navbar */}
        <header className="h-16 md:h-20 border-b-2 border-white bg-white/75 backdrop-blur-2xl px-4 md:px-7 flex items-center justify-between gap-3 shrink-0 relative z-20 shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            {activePost ? (
              <button
                type="button"
                onClick={() => setActivePost(null)}
                className="w-10 h-10 rounded-full bg-white hover:bg-[#ffc749] border-2 border-[#1e2246] shadow-[0_3px_0_#1e2246] flex items-center justify-center text-[#1e2246] transition-all active:translate-y-0.5 shrink-0 cursor-pointer"
                title="Back to Channel Feed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.6" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowMobileChannels(true)}
                className="md:hidden px-3.5 h-10 rounded-full bg-[#1e2246] text-[#ffc749] flex items-center justify-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider shrink-0 cursor-pointer"
              >
                ☰ Boards
              </button>
            )}

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <h1 className="text-sm md:text-base font-extrabold uppercase tracking-tight text-[#1e2246] truncate">
                  # {activeChannel?.title || 'Forum'}
                </h1>
                {activeChannel?.channel_type === 'debate' && (
                  <span className="text-[9px] font-extrabold bg-[#fff2f1] text-[#c93f34] border border-[#ee665b]/45 px-2.5 py-0.5 rounded-full uppercase tracking-wider shrink-0 hidden sm:inline">
                    English Only
                  </span>
                )}
              </div>
              <p className="text-[10.5px] text-[#50567d] font-semibold truncate">
                {activePost
                  ? 'Viewing Discussion Thread'
                  : activeChannel?.description || 'Community Discussion Board'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {!isModerator && (
              <div className="hidden sm:flex items-center gap-1.5 bg-[#fff3d1] border-2 border-[#ffc749] rounded-full px-3.5 py-1.5 text-[10.5px] font-extrabold text-[#1e2246]">
                <span>★</span>
                <span>{myReputation} Rep</span>
              </div>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Forum"
              className="w-10 h-10 flex items-center justify-center bg-white hover:bg-[#ee665b] hover:text-white border-2 border-[#1e2246] shadow-[0_3px_0_#1e2246] rounded-full text-[#1e2246] transition-all active:translate-y-0.5 shrink-0 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.6" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </header>

        {/* Validation / Bouncer Alert Banner */}
        {formError && (
          <div className="bg-[#fff2f1] border-b-2 border-[#ee665b]/50 text-[#c93f34] text-xs font-extrabold px-5 py-3 shrink-0 flex items-center justify-between gap-3 z-20">
            <div className="flex items-center gap-2.5">
              <svg className="w-4 h-4 shrink-0 text-[#c93f34]" fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{formError}</span>
            </div>
            <button
              type="button"
              onClick={() => setFormError('')}
              className="text-xs font-extrabold cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* SCROLLABLE FEED OR THREAD */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
          {!activeChannel ? (
            <div className="h-full flex items-center justify-center text-[#626a9f] font-bold uppercase tracking-widest text-xs">
              Select a channel
            </div>
          ) : !activePost ? (
            /* ================== FEED VIEW ================== */
            <div className="p-4 sm:p-7 space-y-5 max-w-4xl mx-auto w-full">
              {canPostHere ? (
                <div className="ola-forum-card-pearl rounded-[2rem] p-4 sm:p-6">
                  <form onSubmit={handleCreatePost} className="flex flex-col gap-3">
                    <input
                      type="text"
                      value={newPostTitle}
                      onChange={(e) => setNewPostTitle(e.target.value)}
                      placeholder="Give your post a clear title..."
                      className="w-full bg-white border-2 border-[#dfe2f2] focus:border-[#454d82] rounded-2xl px-4 py-3 text-sm font-bold text-[#1e2246] outline-none placeholder-[#626a9f]/60 shadow-sm"
                      maxLength={100}
                    />
                    <textarea
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      placeholder={
                        activeChannel.channel_type === 'debate'
                          ? 'Start a thoughtful debate in English...'
                          : 'Ask a question about grammar, pronunciation, or vocabulary...'
                      }
                      className="w-full bg-white border-2 border-[#dfe2f2] focus:border-[#454d82] rounded-2xl px-4 py-3 text-xs sm:text-sm font-medium text-[#1e2246] outline-none placeholder-[#626a9f]/60 resize-none min-h-[88px] shadow-sm"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isSubmitting || !newPostTitle.trim() || !newPostContent.trim()}
                        className="ola-forum-btn-yellow px-6 py-2.5 rounded-full text-[11px] font-extrabold uppercase tracking-widest disabled:opacity-45 cursor-pointer"
                      >
                        {isSubmitting ? 'Posting...' : 'Post to Channel →'}
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="ola-forum-card-gold rounded-[2rem] p-6 text-center flex flex-col items-center gap-2.5">
                  <span className="w-12 h-12 rounded-2xl bg-[#1e2246] text-[#ffc749] flex items-center justify-center font-extrabold text-xl">
                    ★
                  </span>
                  <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#1e2246]">
                    Contributor Rank Required
                  </h4>
                  <p className="text-xs font-medium text-[#3b4170] max-w-md leading-relaxed">
                    Earn <strong>50 Reputation Points</strong> by helping peers in Q&amp;A channels to unlock Debate creation.
                  </p>
                  <div className="w-full max-w-xs mt-1">
                    <div className="flex justify-between text-[10px] font-extrabold text-[#1e2246] mb-1">
                      <span>Your Progress</span>
                      <span>{Math.min(myReputation, 50)} / 50 Rep</span>
                    </div>
                    <div className="h-3 bg-white/80 border border-[#1e2246]/20 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#5b64a0] to-[#16a37f]"
                        style={{ width: `${Math.min(100, Math.round((myReputation / 50) * 100))}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* POSTS LIST */}
              <div className="space-y-3.5">
                {posts.length === 0 ? (
                  <div className="ola-forum-card-pearl rounded-3xl text-center py-12 text-[#626a9f] font-bold uppercase tracking-widest text-xs">
                    No posts here yet. Start the conversation!
                  </div>
                ) : (
                  posts.map((post) => (
                    <div
                      key={post.id}
                      onClick={() => {
                        setActivePost(post);
                        setFormError('');
                      }}
                      className="ola-forum-card-pearl hover:bg-white rounded-[1.75rem] p-1 flex transition-all duration-150 hover:-translate-y-1 cursor-pointer group"
                    >
                      {/* Upvote Column */}
                      <div className="w-14 shrink-0 flex flex-col items-center justify-start pt-4 gap-1 border-r border-[#626a9f]/15">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpvote(post.id, 'post');
                          }}
                          className="w-8 h-8 rounded-full flex items-center justify-center bg-[#f4f6fc] text-[#454d82] hover:bg-[#ffc749] hover:text-[#1e2246] border border-[#dfe2f2] hover:border-[#1e2246] transition-colors active:scale-90 cursor-pointer"
                          aria-label="Upvote post"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.8" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                        <span className="text-xs font-extrabold text-[#1e2246]">{post.upvote_count}</span>
                      </div>

                      {/* Content Column */}
                      <div className="flex-1 p-3.5 sm:p-4 min-w-0">
                        {renderAuthorBlock(post.author, post.created_at)}
                        <h3 className="text-sm sm:text-base font-extrabold text-[#1e2246] mb-1.5 group-hover:text-[#5b64a0] transition-colors truncate">
                          {post.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-[#4c5384] font-medium line-clamp-2 leading-relaxed">
                          {post.content}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 mt-3.5 pt-2.5 border-t border-[#626a9f]/12">
                          <span className="text-[11px] font-extrabold text-[#454d82] flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span>Open Thread →</span>
                          </span>

                          {post.is_pinned && (
                            <span className="text-[9.5px] font-extrabold uppercase tracking-wider text-[#1e2246] bg-[#fff3d1] border border-[#ffc749] px-2.5 py-0.5 rounded-full">
                              📌 Pinned
                            </span>
                          )}

                          {isAdmin && (
                            <div className="flex items-center gap-3 ml-auto">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleTogglePin(post);
                                }}
                                className="text-[10px] font-extrabold text-[#454d82] hover:text-[#1e2246] uppercase tracking-wider cursor-pointer"
                              >
                                {post.is_pinned ? 'Unpin' : 'Pin'}
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(post.id, 'post');
                                }}
                                className="text-[10px] font-extrabold text-[#c93f34] hover:underline uppercase tracking-wider cursor-pointer"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            /* ================== THREAD VIEW ================== */
            <div className="ola-forum-pop p-4 sm:p-7 max-w-4xl mx-auto w-full flex flex-col gap-5">
              {/* ORIGINAL POST HERO CARD */}
              <div className="ola-forum-card-pearl rounded-[2rem] p-5 sm:p-7 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-[#ffc749]" />
                {renderAuthorBlock(activePost.author, activePost.created_at)}
                <h2 className="text-lg sm:text-2xl font-extrabold text-[#1e2246] mt-3 mb-3 leading-snug">
                  {activePost.title}
                </h2>
                <p className="text-sm text-[#282d57] font-medium leading-relaxed whitespace-pre-wrap">
                  {activePost.content}
                </p>

                <div className="flex items-center justify-between gap-4 mt-6 pt-4 border-t border-[#626a9f]/15">
                  <button
                    type="button"
                    onClick={() => handleUpvote(activePost.id, 'post')}
                    className="inline-flex items-center gap-2 bg-white hover:bg-[#fff3d1] px-4 py-2 rounded-full text-[#1e2246] border-2 border-[#dfe2f2] hover:border-[#1e2246] transition-colors active:scale-95 cursor-pointer shadow-sm"
                  >
                    <svg className="w-4 h-4 text-[#454d82]" fill="none" stroke="currentColor" strokeWidth="2.8" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                    </svg>
                    <span className="text-xs font-extrabold">{activePost.upvote_count} Upvotes</span>
                  </button>

                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => handleDelete(activePost.id, 'post')}
                      className="text-[11px] font-extrabold text-[#c93f34] hover:underline uppercase tracking-wider cursor-pointer"
                    >
                      Delete Thread
                    </button>
                  )}
                </div>
              </div>

              {/* REPLIES LIST */}
              <div className="space-y-3.5 pl-3 sm:pl-6 border-l-2 border-[#626a9f]/25">
                <h3 className="text-[11px] font-extrabold uppercase tracking-widest text-[#454d82]">
                  {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
                </h3>

                {replies.map((reply) => (
                  <div
                    key={reply.id}
                    className={`rounded-3xl p-4 sm:p-5 relative transition-all shadow-sm ${
                      reply.is_teacher_approved
                        ? 'ola-forum-card-gold'
                        : 'bg-white/95 border-2 border-white'
                    }`}
                  >
                    {reply.is_teacher_approved && (
                      <div
                        className="inline-flex items-center gap-1.5 bg-[#1e2246] text-[#ffc749] px-3.5 py-1 rounded-full text-[9.5px] font-extrabold uppercase tracking-wider mb-3 shadow-sm"
                        title="Teacher Approved Answer"
                      >
                        <span>🍎</span>
                        <span>Teacher Approved</span>
                      </div>
                    )}

                    <div className="flex gap-3.5">
                      <div className="flex flex-col items-center shrink-0">
                        <button
                          type="button"
                          onClick={() => handleUpvote(reply.id, 'reply')}
                          className="w-7 h-7 rounded-full flex items-center justify-center bg-[#f4f6fc] text-[#454d82] hover:bg-[#ffc749] hover:text-[#1e2246] border border-[#dfe2f2] hover:border-[#1e2246] transition-colors active:scale-90 cursor-pointer"
                          aria-label="Upvote reply"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.8" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                        <span className="text-[11px] font-extrabold text-[#1e2246] mt-1">
                          {reply.upvote_count}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        {renderAuthorBlock(reply.author, reply.created_at)}
                        <div className="text-xs sm:text-sm text-[#282d57] font-medium leading-relaxed whitespace-pre-wrap mt-1">
                          {reply.content.split('\n').map((line, i) =>
                            line.startsWith('> ') ? (
                              <span
                                key={i}
                                className="block text-[#454d82] font-bold text-[11px] bg-[#fff3d1]/90 px-3 py-1.5 rounded-xl mb-2 border-l-4 border-[#ffc749]"
                              >
                                {line.replace('> ', '')}
                              </span>
                            ) : (
                              <span key={i}>
                                {line}
                                <br />
                              </span>
                            )
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 mt-3.5 pt-3 border-t border-[#626a9f]/15">
                          <button
                            type="button"
                            onClick={() => {
                              const targetName = reply.author?.first_name || 'Member';
                              setNewReplyContent((prev) => `> Replying to @${targetName}:\n\n` + prev);
                              replyInputRef.current?.focus();
                            }}
                            className="text-[10.5px] font-extrabold uppercase tracking-wider text-[#454d82] hover:text-[#1e2246] transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                            </svg>
                            <span>Reply</span>
                          </button>

                          {isModerator && (
                            <button
                              type="button"
                              onClick={() => handleGoldenApple(reply.id, reply.is_teacher_approved)}
                              className={`text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 px-3 py-1 rounded-full border cursor-pointer transition-colors ${
                                reply.is_teacher_approved
                                  ? 'bg-white border-[#dfe2f2] text-[#50567d] hover:text-[#1e2246]'
                                  : 'bg-[#fff3d1] border-[#ffc749] text-[#1e2246] hover:bg-[#ffc749]'
                              }`}
                            >
                              <span>🍎</span>
                              <span>{reply.is_teacher_approved ? 'Revoke Apple' : 'Award Apple'}</span>
                            </button>
                          )}

                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => handleDelete(reply.id, 'reply')}
                              className="text-[10px] font-extrabold text-[#c93f34] hover:underline uppercase tracking-wider ml-auto cursor-pointer"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} className="h-3" />
              </div>
            </div>
          )}
        </div>

        {/* EMOJI PICKER DRAWER */}
        {activePost && showEmojiPicker && (
          <div className="border-t-2 border-white bg-white/95 backdrop-blur-2xl p-4 shrink-0 shadow-lg relative z-50">
            <div className="flex gap-1.5 overflow-x-auto custom-scrollbar pb-2.5 mb-2 border-b border-[#dfe2f2]">
              {Object.keys(EMOJI_CATEGORIES).map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setSelectedEmojiCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider shrink-0 cursor-pointer ${
                    selectedEmojiCategory === cat
                      ? 'bg-[#1e2246] text-[#ffc749]'
                      : 'bg-[#f4f6fc] text-[#454d82] hover:bg-[#e8eaf7]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-1.5 max-h-36 overflow-y-auto custom-scrollbar p-1">
              {EMOJI_CATEGORIES[selectedEmojiCategory].map((emoji, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => {
                    setNewReplyContent((prev) => prev + emoji);
                    replyInputRef.current?.focus();
                  }}
                  className="text-xl hover:scale-125 transition-transform p-1 rounded-lg hover:bg-[#fff3d1] cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STICKY REPLY COMPOSER BAR */}
        {activePost && (
          <div className="p-3 sm:p-4 border-t-2 border-white bg-white/80 backdrop-blur-2xl shrink-0 relative z-[60]">
            <form onSubmit={handleCreateReply} className="flex items-end gap-2 sm:gap-3 max-w-4xl mx-auto">
              <button
                type="button"
                onClick={() => setShowEmojiPicker((prev) => !prev)}
                className={`w-11 h-11 shrink-0 rounded-full flex items-center justify-center transition-colors border-2 cursor-pointer ${
                  showEmojiPicker
                    ? 'bg-[#ffc749] border-[#1e2246] shadow-[0_2px_0_#1e2246]'
                    : 'bg-white border-[#dfe2f2] hover:border-[#454d82]'
                }`}
                aria-label="Toggle emoji picker"
              >
                <span className="text-lg">😊</span>
              </button>

              <textarea
                ref={replyInputRef}
                value={newReplyContent}
                onChange={(e) => setNewReplyContent(e.target.value)}
                placeholder={
                  activeChannel?.channel_type === 'debate'
                    ? 'Add to the debate in English...'
                    : 'Write a helpful reply...'
                }
                className="flex-1 bg-white border-2 border-[#dfe2f2] focus:border-[#1e2246] rounded-2xl px-4 py-3 text-sm font-semibold text-[#1e2246] outline-none resize-none max-h-32 custom-scrollbar placeholder-[#626a9f]/60 shadow-sm"
                rows="1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleCreateReply(e);
                  }
                }}
                onInput={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }}
              />

              <button
                type="submit"
                disabled={isSubmitting || !newReplyContent.trim()}
                aria-label="Send reply"
                className="ola-forum-btn-yellow w-11 h-11 sm:w-12 sm:h-12 shrink-0 rounded-full flex items-center justify-center disabled:opacity-40 cursor-pointer"
              >
                <svg className="w-5 h-5 translate-x-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}