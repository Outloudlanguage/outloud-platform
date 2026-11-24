import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from './SupabaseClient';
import { validateContent } from './utils/ContentFilter';
import { OutLoudIcon } from './components/OutLoudBrand';

// =========================================================================
// BUILT-IN VISUAL DICTIONARY (Zero-dependency emoji palette for immersion)
// =========================================================================
const EMOJI_CATEGORIES = {
  Expressions: ['😀','😃','😄','😁','😆','😅','😂','🤣','😊','😇','🙂','🙃','😉','😌','😍','🥰','😘','😗','😙','😚','😋','😛','😝','😜','🤪','🤨','🧐','🤓','😎','🤩','🥳','😏','😒','😞','😔','😟','😕','🙁','😣','😖','😫','😩','🥺','😢','😭','😤','😠','😡','🤯','😳','😱','😨','😰','😥','😓','🤗','🤔','🤭','🤫','🤥','😶','😐','😑','😬','🙄','😯','😦','😧','😮','😲','🥱','😴','🤤','😪','😵','🤐','🤢','🤮','🤧','😷','🤒','🤕','🤑','🤠','😈','👻','💀','👽','🤖','🎃','😺','😸','😹','😻','😼','😽','🙀','😿','😾'],
  People: ['👋','🤚','🖐️','✋','🖖','👌','✌️','🤞','🤟','🤘','🤙','👈','👉','👆','👇','☝️','👍','👎','✊','👊','🤛','🤜','👏','🙌','👐','🤲','🤝','🙏','✍️','💅','🤳','💪','👂','👃','🧠','👀','👅','👄','👶','🧒','👦','👧','🧑','👨','🧔','👩','🧓','👴','👵','🙍','🙎','🙅','🙆','💁','🙋','🙇','🤦','🤷','👮','🕵️','💂','👷','🤴','👸','👳','👲','🧕','🤵','👰','🤰','🤱','👼','🎅','🤶','🦸','🦹','🧙','🧚','🧛','🧜','🧝','🧞','🧟','💆','💇','🚶','🏃','💃','🕺','👯','🧖','🧗','🤺','🏇','⛷️','🏂','🏌️','🏄','🚣','🏊','⛹️','🏋️','🚴','🚵','🤸','🤼','🤽','🤾','🤹','🧘'],
  Animals: ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐽','🐸','🐵','🙈','🙉','🙊','🐒','🐔','🐧','🐦','🐤','🐣','🐥','🦆','🦅','🦉','🦇','🐺','🐗','🐴','🦄','🐝','🐛','🦋','🐌','🐞','🐜','🦟','🦗','🕷️','🦂','🐢','🐍','🦎','🦖','🦕','🐙','🦑','🦐','🦞','🦀','🐡','🐠','🐟','🐬','🐳','🐋','🦈','🐊','🐅','🐆','🦓','🦍','🐘','🦏','🐪','🐫','🦒','🐃','🐂','🐄','🐎','🐖','🐏','🐑','🐐','🦌','🐕','🐩','🐈','🐓','🦃','🦚','🦜','🦢','🕊️','🐇','🦝','🦨','🦡','🐁','🐀','🐿️','🦔','🐾','🐉','🐲','🌵','🎄','🌲','🌳','🌴','🌱','🌿','☘️','🍀','🎍','🎋','🍃','🍂','🍁','🍄','🐚','🌾','💐','🌷','🌹','🥀','🌺','🌸','🌼','🌻','🌞','🌝','🌛','🌜','🌚','🌕','🌖','🌗','🌘','🌑','🌒','🌓','🌔','🌙','🌎','🌍','🌏','🪐','💫','⭐️','🌟','✨','⚡️','☄️','💥','🔥','🌪️','🌈','☀️','🌤️','⛅️','🌥️','☁️','🌦️','🌧️','⛈️','🌩️','🌨️','❄️','☃️','⛄️','🌬️','💨','💧','💦','☔️','☂️','🌊','🌫️'],
  Food: ['🍏','🍎','🍐','🍊','🍋','🍌','🍉','🍇','🍓','🍈','🍒','🍑','🍍','🥥','🥝','🍅','🍆','🥑','🥦','🥬','🥒','🌶️','🌽','🥕','🥔','🍠','🥐','🍞','🥖','🥨','🧀','🥚','🍳','🥞','🥓','🥩','🍗','🍖','🌭','🍔','🍟','🍕','🥪','🥙','🌮','🌯','🥗','🥘','🥫','🍝','🍜','🍲','🍛','🍣','🍱','🥟','🍤','🍙','🍚','🍘','🍥','🥠','🍢','🍡','🍧','🍨','🍦','🥧','🍰','🎂','🍮','🍭','🍬','🍫','🍿','🍩','🍪','🌰','🥜','🍯','🥛','🍼','☕️','🍵','🥤','🍶','🍺','🍻','🥂','🍷','🥃','🍸','🍹','🍾','🥄','🍴','🍽️','🥣','🥡','🥢','🧂'],
  Places: ['🚗','🚕','🚙','🚌','🚎','🏎️','🚓','🚑','🚒','🚐','🚚','🚛','🚜','🛴','🚲','🛵','🏍️','🚨','🚔','🚍','🚘','🚖','🚡','🚠','🚟','🚃','🚋','🚞','🚝','🚄','🚅','🚈','🚂','🚆','🚇','🚊','🚉','✈️','🛫','🛬','🛩️','💺','🛰️','🚀','🛸','🚁','🛶','⛵️','🛥️','🛳️','⛴️','🚢','⚓️','⛽️','🚧','🚦','🚥','🚏','🗺️','🗿','🗽','🗼','🏰','🏯','🏟️','🎡','🎢','🎠','⛲️','⛱️','🏖️','🏝️','🏜️','🌋','⛰️','🏔️','🗻','🏕️','⛺️','🏠','🏡','🏘️','🏚️','🏗️','🏭','🏢','🏬','🏣','🏤','🏥','🏦','🏨','🏪','🏫','🏩','💒','🏛️','⛪️','🕌','🕍','🕋'],
  Objects: ['⌚️','📱','📲','💻','⌨️','🖥️','🖨️','🖱️','🖲️','🕹️','💽','💾','💿','📀','📼','📷','📸','📹','🎥','📽️','🎞️','📞','☎️','📟','📠','📺','📻','🎙️','🎚️','🎛️','🧭','⏱️','⏲️','⏰','🕰️','⌛️','⏳','📡','🔌','💡','🔦','🕯️','💸','💵','💴','💶','💷','💰','💳','💎','⚖️','🔧','🔨','⚒️','🛠️','⛏️','🔩','⚙️','🧱','⛓️','🧲','🧨','🔪','🗡️','⚔️','🛡️','🔮','📿','💈','⚗️','🔭','🔬','🕳️','💊','💉','🧬','🦠','🧫','🧪','🌡️','🧹','🧻','🚽','🚰','🚿','🛁','🛀','🧼','🧽','🚪','🔑','🛏️','🧸','🖼️','🛍️','🛒','🎁','🎈','🎏','🎀','🎊','🎉','🎎','🏮','🎐','🧧','✉️','📩','📨','📧','💌','📥','📤','📦','🏷️','📪','📫','📬','📭','📮','📯','📜','📃','📄','📑','🧾','📊','📈','📉','🗒️','🗓️','📆','📅','🗑️','📇','🗃️','🗳️','🗄️','📋','📁','📂','🗂️','🗞️','📰','📓','📔','📒','📕','📗','📘','📙','📚','📖','🔖','🔗','📎','🖇️','📐','📏','🧮','📌','📍','✂️','🖊️','🖋️','✒️','🖌️','🖍️','📝','✏️','🔍','🔎','🔏','🔐','🔒','🔓'],
  Symbols: ['❤️','🧡','💛','💚','💙','💜','🖤','💔','❣️','💕','💞','💓','💗','💖','💘','💝','💟','☮️','✝️','☪️','🕉️','☸️','✡️','🔯','🕎','☯️','☦️','🛐','⛎','♈️','♉️','♊️','♋️','♌️','♍️','♎️','♏️','♐️','♑️','♒️','♓️','🆔','⚛️','🉑','☢️','☣️','📴','📳','🈶','🈚️','🈸','🈺','🈷️','✴️','🆚','💮','🉐','㊙️','㊗️','🈴','🈵','🈹','🈲','🅰️','🅱️','🆎','🆑','🅾️','🆘','❌','⭕️','🛑','⛔️','📛','🚫','💯','💢','♨️','🚷','🚯','🚳','🚱','🔞','📵','🚭','❗️','❕','❓','❔','‼️','⁉️','🔅','🔆','〽️','⚠️','🚸','🔱','⚜️','🔰','♻️','✅','🈯️','💹','❇️','✳️','❎','🌐','💠','Ⓜ️','🌀','💤','🏧','🚾','♿️','🅿️','🈳','🈂️','🛂','🛃','🛄','🛅','🚹','🚺','🚼','⚧️','🚻','🚮','🎦','📶','🈁','🔣','ℹ️','🔤','🔡','🔠','🆖','🆗','🆙','🆒','🆕','🆓','0️⃣','1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟','🔢','#️⃣','*️⃣','⏏️','▶️','⏸️','⏯️','⏹️','⏺️','⏭️','⏮️','⏩','⏪','⏫','⏬','◀️','🔼','🔽','➡️','⬅️','⬆️','⬇️','↗️','↘️','↙️','↖️','↕️','↔️','↪️','↩️','⤴️','⤵️','🔀','🔁','🔂','🔄','🔃','🎵','🎶','➕','➖','➗','✖️','💲','💱','™️','©️','®️','〰️','➰','➿','🔚','🔙','🔛','🔝','🔜','✔️','☑️','🔘','🔴','🟠','🟡','🟢','🔵','🟣','⚫️','⚪️','🔺','🔻','🔸','🔹','🔶','🔷','🔳','🔲','▪️','▫️','◾️','◽️','◼️','◻️','⬛️','⬜️','🔈','🔇','🔉','🔊','🔔','🔕','📣','📢','💬','💭','🗯️','♠️','♣️','♥️','♦️','🃏','🎴','🀄️'],
};

// =========================================================================
// OUTLOUD LANDING-GRAMMAR STYLES & FLAT DUOTONE VECTOR ART
// =========================================================================
const SeminarStyles = () => (
  <style>{`
    .ola-sem-canvas {
      background: linear-gradient(125deg, #fdebc0 0%, #f6eff5 44%, #e5e8fa 76%, #d9dff8 100%);
    }
    .ola-sem-card-pearl {
      background: linear-gradient(160deg, rgba(255, 255, 255, 0.94) 0%, rgba(242, 244, 253, 0.84) 100%);
      backdrop-filter: blur(22px) saturate(175%);
      -webkit-backdrop-filter: blur(22px) saturate(175%);
      border: 2px solid #ffffff;
      box-shadow: 0 20px 42px -18px rgba(55, 63, 118, 0.22), inset 0 2px 2px #ffffff;
    }
    .ola-sem-bubble-mine {
      background: linear-gradient(160deg, #747db8 0%, #5b64a0 100%);
      border: 2px solid rgba(255, 255, 255, 0.45);
      box-shadow: 0 10px 22px -10px rgba(45, 51, 96, 0.38);
    }
    .ola-sem-btn-yellow {
      background: linear-gradient(180deg, #ffd66b 0%, #ffc749 100%);
      color: #1e2246;
      border: 2px solid #1e2246;
      box-shadow: 0 4px 0 #1e2246, 0 10px 22px -6px rgba(255, 199, 73, 0.55);
      transition: transform 0.14s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.14s ease, filter 0.14s ease;
    }
    .ola-sem-btn-yellow:hover {
      filter: brightness(1.04);
      transform: translateY(-2px);
      box-shadow: 0 6px 0 #1e2246, 0 14px 26px -6px rgba(255, 199, 73, 0.72);
    }
    .ola-sem-btn-yellow:active {
      transform: translateY(3px) scale(0.99);
      box-shadow: 0 1px 0 #1e2246;
    }
    .ola-sem-btn-outline {
      background: rgba(255, 255, 255, 0.94);
      color: #1e2246;
      border: 2px solid #1e2246;
      box-shadow: 0 3px 0 rgba(30, 34, 70, 0.16);
      transition: transform 0.14s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.14s ease, background 0.14s ease;
    }
    .ola-sem-btn-outline:hover {
      background: #ffffff;
      transform: translateY(-1.5px);
      box-shadow: 0 5px 0 #626a9f;
    }
    .ola-sem-btn-outline:active {
      transform: translateY(2px) scale(0.98);
      box-shadow: 0 1px 0 rgba(30, 34, 70, 0.2);
    }
    @keyframes olaSemPop {
      0% { opacity: 0; transform: translateY(8px) scale(0.98); }
      100% { opacity: 1; transform: translateY(0) scale(1); }
    }
    .ola-sem-pop { animation: olaSemPop 0.2s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
  `}</style>
);

const SeminarEmptyIllustration = () => (
  <svg className="w-40 h-28" viewBox="0 0 180 120" fill="none">
    <path d="M24 28 L26.5 34 L32.5 36.5 L26.5 39 L24 45 L21.5 39 L15.5 36.5 L21.5 34 Z" fill="#626a9f" />
    <path d="M152 24 L154 29 L159 31 L154 33 L152 38 L150 33 L145 31 L150 29 Z" fill="#16a37f" />
    <circle cx="28" cy="88" r="4" fill="#ee665b" opacity="0.75" />

    {/* Back Indigo Speech Bubble */}
    <rect x="32" y="20" width="84" height="50" rx="16" fill="#626a9f" stroke="#1e2246" strokeWidth="2.4" />
    <circle cx="58" cy="45" r="4" fill="#ffc749" />
    <circle cx="74" cy="45" r="4" fill="#ffffff" />
    <circle cx="90" cy="45" r="4" fill="#ffffff" />

    {/* Front Butter-Gold Speech Bubble */}
    <rect x="66" y="48" width="84" height="50" rx="16" fill="#ffc749" stroke="#1e2246" strokeWidth="2.4" />
    <rect x="82" y="65" width="48" height="5.5" rx="2.75" fill="#1e2246" />
    <rect x="82" y="77" width="32" height="5.5" rx="2.75" fill="#1e2246" opacity="0.45" />
  </svg>
);

const DualScopeToggle = ({ internalScope, onSwitchScope, compact = false }) => (
  <div
    className={`inline-flex bg-white/95 border-2 border-white rounded-full p-1 shadow-[0_8px_22px_-8px_rgba(69,77,130,0.25)] ${
      compact ? 'gap-0.5' : 'gap-1'
    }`}
  >
    <button
      type="button"
      onClick={() => onSwitchScope('students')}
      className={`rounded-full font-extrabold uppercase tracking-wider transition-colors cursor-pointer ${
        compact ? 'px-3 py-1 text-[9.5px]' : 'px-4 py-1.5 text-[10.5px]'
      } ${
        internalScope === 'students'
          ? 'bg-[#1e2246] text-[#ffc749] shadow-sm'
          : 'text-[#454d82] hover:text-[#1e2246] hover:bg-[#f2f4fc]'
      }`}
    >
      Student Hub
    </button>
    <button
      type="button"
      onClick={() => onSwitchScope('staff')}
      className={`rounded-full font-extrabold uppercase tracking-wider transition-colors cursor-pointer ${
        compact ? 'px-3 py-1 text-[9.5px]' : 'px-4 py-1.5 text-[10.5px]'
      } ${
        internalScope === 'staff'
          ? 'bg-[#1e2246] text-[#ffc749] shadow-sm'
          : 'text-[#454d82] hover:text-[#1e2246] hover:bg-[#f2f4fc]'
      }`}
    >
      Staff Hub
    </button>
  </div>
);

export default function SeminarRoom({ currentUser, userRole = 'student', onClose, roomScope = 'all' }) {
  const [internalScope, setInternalScope] = useState(roomScope === 'dual' ? 'students' : roomScope);
  const [activeRoom, setActiveRoom] = useState(null);
  const [roomsList, setRoomsList] = useState([]);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedEmojiCategory, setSelectedEmojiCategory] = useState('Expressions');
  const [activeMembers, setActiveMembers] = useState([]);
  const [pinnedMessage, setPinnedMessage] = useState(null);
  const [newRoomTitle, setNewRoomTitle] = useState('');
  const [newRoomLevel, setNewRoomLevel] = useState(roomScope === 'staff' ? 'STAFF' : 'ALL');
  const [openMenuId, setOpenMenuId] = useState(null);
  const [chatError, setChatError] = useState('');
  const [showMobileRoster, setShowMobileRoster] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const normalizedLevel = currentUser?.level ? currentUser.level.split(':')[0].trim() : 'ALL';
  const isModerator = userRole === 'admin' || userRole === 'teacher';
  const isAdmin = userRole === 'admin';
  const activeRoomId = activeRoom?.id || null;

  const handleSwitchScope = (nextScope) => {
    setActiveRoom(null);
    setInternalScope(nextScope);
    setNewRoomLevel(nextScope === 'staff' ? 'STAFF' : 'ALL');
  };

  const handleModerateUser = (userId, userName, action) => {
    if (action === 'kick') alert(`Kicked ${userName} from the room.`);
    if (action === 'mute') alert(`Muted ${userName}.`);
    if (action === 'ban') alert(`Banned ${userName} from this session.`);
    setOpenMenuId(null);
  };

  const fetchActiveRooms = useCallback(async () => {
    setIsLoading(true);
    try {
      let query = supabase.from('chat_rooms').select('*').eq('is_active', true);

      if (internalScope === 'staff') {
        query = query.eq('level_target', 'STAFF');
      } else if (internalScope === 'students') {
        query = query.neq('level_target', 'STAFF');
      } else if (userRole === 'student') {
        query = query.or(`level_target.eq.${normalizedLevel},level_target.eq.ALL`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;

      setRoomsList(data || []);
      if (data && data.length > 0) {
        setActiveRoom((prev) => (prev ? data.find((r) => r.id === prev.id) || data[0] : data[0]));
      } else {
        setActiveRoom(null);
      }
    } catch (err) {
      console.error('Error fetching rooms:', err);
    } finally {
      setIsLoading(false);
    }
  }, [internalScope, userRole, normalizedLevel]);

  const fetchMessages = useCallback(async (roomId) => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setMessages(data);
    }
  }, []);

  useEffect(() => {
    fetchActiveRooms();

    const uniqueChannelName = `chat_rooms_lifecycle_${internalScope}_${Math.random()
      .toString(36)
      .substring(2, 9)}`;
    const roomChannel = supabase
      .channel(uniqueChannelName)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_rooms' }, () => {
        fetchActiveRooms();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(roomChannel);
    };
  }, [fetchActiveRooms, internalScope]);

  useEffect(() => {
    if (!activeRoomId) {
      setMessages([]);
      return;
    }

    fetchMessages(activeRoomId);

    const channel = supabase.channel(`room_${activeRoomId}`, {
      config: { presence: { key: currentUser?.id || 'anon' } },
    });

    channel
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${activeRoomId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'chat_messages',
        },
        (payload) => {
          setMessages((prev) => prev.filter((msg) => msg.id !== payload.old.id));
        }
      )
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const members = Object.values(state).flat();
        setActiveMembers(members);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            id: currentUser?.id,
            name: currentUser?.full_name || 'Participant',
            avatar: currentUser?.avatar_url,
            level: normalizedLevel,
            role: userRole,
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [
    activeRoomId,
    fetchMessages,
    currentUser?.id,
    currentUser?.full_name,
    currentUser?.avatar_url,
    normalizedLevel,
    userRole,
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    setChatError('');
    if (!inputText.trim() || !activeRoom || isSending) return;

    const content = inputText.trim();
    const { isValid, error: validationError } = validateContent(content, false);
    if (!isValid) {
      setChatError(validationError);
      return;
    }

    setIsSending(true);
    setInputText('');
    setShowEmojiPicker(false);

    try {
      const { error } = await supabase.from('chat_messages').insert({
        room_id: activeRoom.id,
        user_id: currentUser.id,
        user_name: currentUser.full_name || 'Anonymous User',
        user_avatar: currentUser.avatar_url || '',
        user_level: normalizedLevel,
        user_role: userRole,
        content: content,
      });

      if (error) throw error;
    } catch (err) {
      console.error('Error sending message:', err);
      setInputText(content);
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!isModerator) return;
    try {
      await supabase.from('chat_messages').delete().eq('id', messageId);
    } catch (err) {
      console.error('Failed to delete message:', err);
    }
  };

  const handleCloseRoom = async (roomId) => {
    if (!isModerator) return;
    if (!window.confirm('Close and wipe this live session for all participants?')) return;

    try {
      await supabase.from('chat_rooms').delete().eq('id', roomId);
      setActiveRoom(null);
      fetchActiveRooms();
    } catch (err) {
      console.error('Failed to close room:', err);
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!isModerator || !newRoomTitle.trim()) return;

    try {
      const targetLevel = internalScope === 'staff' ? 'STAFF' : newRoomLevel;
      const { data, error } = await supabase
        .from('chat_rooms')
        .insert({
          room_name: newRoomTitle.trim(),
          level_target: targetLevel,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      setNewRoomTitle('');
      setActiveRoom(data);
      fetchActiveRooms();
    } catch (err) {
      console.error('Failed to create room:', err);
    }
  };

  const handleEmojiClick = (emoji) => {
    setInputText((prev) => prev + emoji);
    inputRef.current?.focus();
  };

  const getRoleBadge = (role, level) => {
    const safeRole = String(role || '').toLowerCase();
    if (safeRole === 'admin') {
      return (
        <span className="text-[8.5px] font-extrabold uppercase tracking-wider bg-[#fff2f1] text-[#c93f34] border border-[#ee665b]/45 px-2 py-0.5 rounded-full">
          Mod
        </span>
      );
    }
    if (safeRole === 'teacher') {
      return (
        <span className="text-[8.5px] font-extrabold uppercase tracking-wider bg-[#fff3d1] text-[#1e2246] border border-[#ffc749] px-2 py-0.5 rounded-full">
          Teacher
        </span>
      );
    }
    return (
      <span className="text-[8.5px] font-extrabold uppercase tracking-wider bg-[#e8eaf7] text-[#454d82] border border-[#626a9f]/25 px-2 py-0.5 rounded-full">
        {level || 'A1'}
      </span>
    );
  };

  // =========================================================================
  // LOADING STATE
  // =========================================================================
  if (isLoading) {
    return (
      <div className="ola-sem-canvas absolute inset-0 rounded-[2rem] sm:rounded-[2.5rem] z-[700] flex flex-col items-center justify-center border-2 border-white shadow-2xl font-montserrat">
        <SeminarStyles />
        <OutLoudIcon className="w-14 h-14 animate-bounce mb-3" />
        <div className="w-8 h-8 border-4 border-[#626a9f] border-t-[#ffc749] rounded-full animate-spin" />
      </div>
    );
  }

  // =========================================================================
  // INACTIVE / LAUNCH ROOM STATE
  // =========================================================================
  if (!activeRoom) {
    return (
      <div className="ola-sem-canvas absolute inset-0 rounded-[2rem] sm:rounded-[2.5rem] z-[700] flex flex-col items-center justify-center p-4 sm:p-6 font-montserrat text-[#1e2246] shadow-2xl border-2 border-white overflow-y-auto">
        <SeminarStyles />

        <div
          className="absolute inset-0 pointer-events-none opacity-75"
          style={{
            backgroundImage: 'radial-gradient(rgba(82, 91, 146, 0.22) 1.5px, transparent 1.5px)',
            backgroundSize: '28px 28px',
          }}
        />

        {roomScope === 'dual' && (
          <div className="relative z-20 mb-5">
            <DualScopeToggle internalScope={internalScope} onSwitchScope={handleSwitchScope} />
          </div>
        )}

        <div className="ola-sem-card-pearl ola-sem-pop rounded-[2.25rem] p-6 sm:p-9 max-w-md w-full flex flex-col items-center text-center relative z-10">
          {/* Recessed Flat Duotone Vector Well */}
          <div className="w-full h-36 rounded-[1.5rem] bg-[#f4f6fc] border border-white shadow-inner flex items-center justify-center mb-5">
            <SeminarEmptyIllustration />
          </div>

          <span className="text-[10px] font-extrabold uppercase tracking-widest bg-[#1e2246] text-[#ffc749] px-3 py-1 rounded-full mb-2.5">
            OutLoud Live Chat
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            <span className="text-[#1e2246]">Seminar Room </span>
            <span className="text-[#626a9f]">
              Inactive<span className="text-[#ffc749]">.</span>
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-[#4c5384] font-medium leading-relaxed mb-6">
            There is no live seminar chat running right now. Check back when a teacher or administrator opens a room.
          </p>

          {isModerator && (
            <form onSubmit={handleCreateRoom} className="w-full mb-4 flex flex-col gap-3">
              <input
                type="text"
                value={newRoomTitle}
                onChange={(e) => setNewRoomTitle(e.target.value)}
                placeholder="Room Title (e.g., B1 Conversation Club)"
                className="w-full h-11 bg-white border-2 border-[#dfe2f2] focus:border-[#454d82] rounded-xl px-4 text-xs sm:text-sm font-semibold text-[#1e2246] outline-none shadow-sm"
                required
              />

              {internalScope === 'staff' ? (
                <div className="w-full h-11 bg-[#fff3d1] border-2 border-[#ffc749] rounded-xl px-4 flex items-center justify-center text-xs font-extrabold text-[#1e2246] tracking-wider uppercase">
                  Cohort: Internal Staff Only
                </div>
              ) : (
                <select
                  value={newRoomLevel}
                  onChange={(e) => setNewRoomLevel(e.target.value)}
                  className="w-full h-11 bg-white border-2 border-[#dfe2f2] focus:border-[#454d82] rounded-xl px-4 text-xs sm:text-sm font-bold text-[#1e2246] outline-none cursor-pointer shadow-sm"
                >
                  <option value="ALL">Cohort: Everyone (ALL)</option>
                  <option value="A1">Cohort: Level A1</option>
                  <option value="A2">Cohort: Level A2</option>
                  <option value="B1">Cohort: Level B1</option>
                  <option value="B2">Cohort: Level B2</option>
                  <option value="C1">Cohort: Level C1</option>
                  <option value="C2">Cohort: Level C2</option>
                </select>
              )}

              <button
                type="submit"
                className="ola-sem-btn-yellow w-full py-3.5 font-extrabold text-xs uppercase tracking-widest rounded-full cursor-pointer"
              >
                Launch Seminar Room →
              </button>
            </form>
          )}

          <button
            type="button"
            onClick={onClose}
            className="ola-sem-btn-outline w-full py-3 font-extrabold text-xs uppercase tracking-widest rounded-full cursor-pointer"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // ACTIVE SEMINAR ROOM WORKSPACE
  // =========================================================================
  return (
    <div className="ola-sem-canvas absolute inset-0 rounded-[2rem] sm:rounded-[2.5rem] z-[700] font-montserrat flex flex-col md:flex-row overflow-hidden text-[#1e2246] select-none shadow-2xl border-2 border-white">
      <SeminarStyles />

      {/* ARCHITECTURAL DOTTED BACKDROP */}
      <div
        className="absolute inset-0 pointer-events-none z-0 opacity-75"
        style={{
          backgroundImage: 'radial-gradient(rgba(82, 91, 146, 0.22) 1.5px, transparent 1.5px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* --- LEFT ROSTER PANE (Desktop Sidebar & Mobile Drawer) --- */}
      <aside
        className={`${
          showMobileRoster
            ? 'flex fixed inset-0 z-50 bg-[#f4f6fc]/95 backdrop-blur-2xl'
            : 'hidden'
        } md:flex md:relative flex-col w-full md:w-72 lg:w-80 border-r-2 border-white bg-white/75 backdrop-blur-2xl z-30 shrink-0 h-full`}
      >
        <div className="h-16 md:h-20 px-5 border-b border-[#626a9f]/15 bg-white/75 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <OutLoudIcon className="w-8 h-8 shrink-0" />
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#1e2246] leading-none">
                Active Roster
              </h3>
              <span className="text-[10px] font-bold text-[#128063] flex items-center gap-1.5 mt-1">
                <span className="w-2 h-2 rounded-full bg-[#16a37f] animate-pulse" />
                {activeMembers.length} online now
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowMobileRoster(false)}
            className="md:hidden w-9 h-9 rounded-full bg-white border-2 border-[#1e2246] text-[#1e2246] font-bold flex items-center justify-center cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Presence Member List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
          {activeMembers.length === 0 ? (
            <p className="text-center text-xs font-semibold text-[#626a9f] py-8">
              Connecting to live roster...
            </p>
          ) : (
            activeMembers.map((member, idx) => (
              <div
                key={member.id || idx}
                className="flex items-center gap-3 p-2.5 rounded-2xl bg-white border border-[#dfe2f2] shadow-sm"
              >
                <div className="relative w-9 h-9 rounded-full overflow-hidden bg-[#e8eaf7] border-2 border-[#1e2246]/20 shrink-0">
                  {member.avatar ? (
                    <img src={member.avatar} alt="User" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-extrabold text-[#454d82]">
                      {member.name?.[0] || 'U'}
                    </div>
                  )}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#16a37f] border-2 border-white rounded-full" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-xs font-extrabold text-[#1e2246] truncate">{member.name}</p>
                  <div className="mt-0.5">{getRoleBadge(member.role, member.level)}</div>
                </div>

                {isModerator && member.id !== currentUser?.id && (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setOpenMenuId(openMenuId === member.id ? null : member.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#e8eaf7] text-[#454d82] font-bold cursor-pointer"
                      aria-label="Moderation actions"
                    >
                      ⋮
                    </button>
                    {openMenuId === member.id && (
                      <>
                        <div className="fixed inset-0 z-[90]" onClick={() => setOpenMenuId(null)} />
                        <div className="ola-sem-pop absolute right-0 top-8 w-40 bg-white border-2 border-[#1e2246] rounded-2xl shadow-xl overflow-hidden z-[100] py-1">
                          <button
                            type="button"
                            onClick={() => handleModerateUser(member.id, member.name, 'mute')}
                            className="w-full text-left px-3.5 py-2 text-[10.5px] font-bold uppercase tracking-wider text-[#1e2246] hover:bg-[#f4f6fc] cursor-pointer"
                          >
                            Mute User
                          </button>
                          <button
                            type="button"
                            onClick={() => handleModerateUser(member.id, member.name, 'kick')}
                            className="w-full text-left px-3.5 py-2 text-[10.5px] font-bold uppercase tracking-wider text-[#1e2246] hover:bg-[#f4f6fc] cursor-pointer"
                          >
                            Kick from Room
                          </button>
                          <div className="border-t border-[#dfe2f2] my-1" />
                          <button
                            type="button"
                            onClick={() => handleModerateUser(member.id, member.name, 'ban')}
                            className="w-full text-left px-3.5 py-2 text-[10.5px] font-bold uppercase tracking-wider text-[#c93f34] hover:bg-[#fff2f1] cursor-pointer"
                          >
                            Ban User
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Room Switcher & Admin Room Creator */}
        {(roomsList.length > 1 || isAdmin) && (
          <div className="p-4 border-t border-[#626a9f]/15 bg-white/80 space-y-3 shrink-0">
            {roomsList.length > 1 && (
              <div>
                <span className="text-[9.5px] font-extrabold uppercase tracking-widest text-[#626a9f] block mb-2">
                  Available Rooms ({roomsList.length})
                </span>
                <div className="space-y-1.5 max-h-36 overflow-y-auto custom-scrollbar">
                  {roomsList.map((r) => {
                    const isCurrent = activeRoom.id === r.id;
                    return (
                      <button
                        type="button"
                        key={r.id}
                        onClick={() => {
                          setActiveRoom(r);
                          setShowMobileRoster(false);
                        }}
                        className={`w-full text-left text-xs p-2.5 rounded-xl font-bold truncate transition-colors cursor-pointer flex items-center justify-between gap-2 border ${
                          isCurrent
                            ? 'bg-[#1e2246] text-[#ffc749] border-[#1e2246] shadow-sm'
                            : 'bg-white hover:bg-[#f4f6fc] text-[#1e2246] border-[#dfe2f2]'
                        }`}
                      >
                        <span className="truncate">{r.room_name}</span>
                        <span
                          className={`text-[8.5px] font-extrabold px-2 py-0.5 rounded-full uppercase shrink-0 ${
                            isCurrent ? 'bg-white/15 text-white' : 'bg-[#e8eaf7] text-[#454d82]'
                          }`}
                        >
                          {r.level_target}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {isAdmin && (
              <form onSubmit={handleCreateRoom} className="pt-2 border-t border-[#626a9f]/15 flex flex-col gap-2">
                <span className="text-[9.5px] font-extrabold uppercase tracking-widest text-[#454d82]">
                  + Launch Another Room
                </span>
                <input
                  type="text"
                  value={newRoomTitle}
                  onChange={(e) => setNewRoomTitle(e.target.value)}
                  placeholder="Room Title..."
                  className="w-full bg-white border-2 border-[#dfe2f2] focus:border-[#454d82] rounded-xl px-3 py-2 text-xs font-semibold text-[#1e2246] outline-none"
                  required
                />
                <div className="flex gap-2">
                  <select
                    value={newRoomLevel}
                    onChange={(e) => setNewRoomLevel(e.target.value)}
                    className="flex-1 bg-white border-2 border-[#dfe2f2] rounded-xl px-2 py-1.5 text-[10.5px] font-bold text-[#1e2246] outline-none cursor-pointer"
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
                  <button
                    type="submit"
                    className="ola-sem-btn-yellow px-3.5 py-1.5 font-extrabold text-[10.5px] uppercase tracking-wider rounded-full cursor-pointer"
                  >
                    Launch
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </aside>

      {/* --- MAIN CHAT CONTAINER --- */}
      <div className="flex-1 flex flex-col h-full relative z-10 overflow-hidden">
        {/* Subtle OutLoud Smiling Headphone Watermark */}
        <div className="pointer-events-none select-none absolute inset-0 flex items-center justify-center opacity-[0.045] z-0">
          <OutLoudIcon withTile={false} className="w-[340px] h-[340px] sm:w-[460px] sm:h-[460px]" />
        </div>

        {/* TOP HEADER BAR */}
        <header className="min-h-[64px] md:h-20 border-b-2 border-white bg-white/75 backdrop-blur-2xl px-4 md:px-7 py-2.5 flex flex-wrap items-center justify-between gap-2.5 shrink-0 relative z-20 shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setShowMobileRoster((prev) => !prev)}
              className="md:hidden w-9 h-9 rounded-full bg-[#1e2246] text-[#ffc749] flex items-center justify-center cursor-pointer shrink-0 shadow-sm"
              title="Toggle Roster"
              aria-label="Toggle Roster"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm md:text-base font-extrabold uppercase tracking-tight text-[#1e2246] truncate">
                  {activeRoom.room_name}
                </h1>
                <span className="text-[9.5px] font-extrabold text-[#1e2246] bg-[#fff3d1] border border-[#ffc749] px-2.5 py-0.5 rounded-full shrink-0">
                  {activeRoom.level_target}
                </span>
              </div>
              <p className="text-[10px] text-[#128063] font-extrabold tracking-wider uppercase flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#16a37f] animate-pulse" />
                <span>Live Seminar • {activeMembers.length} Active</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {roomScope === 'dual' && (
              <div className="hidden sm:block">
                <DualScopeToggle
                  internalScope={internalScope}
                  onSwitchScope={handleSwitchScope}
                  compact
                />
              </div>
            )}

            {isModerator && (
              <button
                type="button"
                onClick={() => handleCloseRoom(activeRoom.id)}
                title="Close & Wipe Room"
                className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center bg-[#fff2f1] hover:bg-[#ee665b] text-[#c93f34] hover:text-white border-2 border-[#ee665b]/50 hover:border-[#1e2246] rounded-full transition-colors cursor-pointer shrink-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              title="Exit Room"
              aria-label="Exit Room"
              className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center bg-white hover:bg-[#ffc749] border-2 border-[#1e2246] shadow-[0_3px_0_#1e2246] rounded-full text-[#1e2246] transition-all active:translate-y-0.5 cursor-pointer shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.6" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </header>

        {/* MOBILE DUAL-SCOPE SWITCHER STRIP */}
        {roomScope === 'dual' && (
          <div className="sm:hidden flex justify-center py-2 bg-white/55 border-b border-white z-20">
            <DualScopeToggle
              internalScope={internalScope}
              onSwitchScope={handleSwitchScope}
              compact
            />
          </div>
        )}

        {/* BUTTER-GOLD PINNED ANNOUNCEMENT STRIP */}
        {pinnedMessage && (
          <div className="bg-gradient-to-r from-[#fff9e8] to-[#ffe69e] border-b-2 border-[#ffc749] px-5 py-2.5 flex items-center justify-between text-xs text-[#1e2246] font-bold z-20">
            <div className="flex items-center gap-2 truncate">
              <span className="bg-[#1e2246] text-[#ffc749] px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider shrink-0">
                Pinned
              </span>
              <span className="truncate">{pinnedMessage}</span>
            </div>
            {isModerator && (
              <button
                type="button"
                onClick={() => setPinnedMessage(null)}
                className="text-[10px] uppercase font-extrabold tracking-wider text-[#454d82] hover:text-[#c93f34] ml-4 cursor-pointer shrink-0"
              >
                Unpin
              </button>
            )}
          </div>
        )}

        {/* LIVE MESSAGE STREAM */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 space-y-3.5 relative z-10 select-text">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <div className="ola-sem-card-pearl rounded-3xl p-6 max-w-xs flex flex-col items-center">
                <OutLoudIcon className="w-12 h-12 mb-3" />
                <p className="text-xs font-extrabold uppercase tracking-wider text-[#1e2246]">
                  Seminar room is live
                </p>
                <p className="text-xs text-[#4c5384] font-medium mt-1 leading-relaxed">
                  Be the first to say hello or ask a question in English!
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg, i) => {
              const isMine = msg.user_id === currentUser?.id;
              const formattedTime = new Date(msg.created_at).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={msg.id || i}
                  className={`flex items-end gap-2.5 group ${isMine ? 'justify-end' : 'justify-start'}`}
                >
                  {!isMine && (
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-[#e8eaf7] border-2 border-white shadow-sm shrink-0 mb-0.5">
                      {msg.user_avatar ? (
                        <img src={msg.user_avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-extrabold text-[#454d82]">
                          {msg.user_name?.[0] || 'U'}
                        </div>
                      )}
                    </div>
                  )}

                  <div
                    className={`relative max-w-[84%] sm:max-w-md lg:max-w-lg transition-all ${
                      isMine
                        ? 'ola-sem-bubble-mine text-white rounded-2xl rounded-br-sm px-4 py-2.5'
                        : 'bg-white/95 text-[#1e2246] border-2 border-white rounded-2xl rounded-bl-sm px-4 py-2.5 shadow-sm'
                    }`}
                  >
                    {!isMine && (
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-extrabold text-[#1e2246] truncate">{msg.user_name}</span>
                        {getRoleBadge(msg.user_role, msg.user_level)}
                      </div>
                    )}

                    <p className="text-sm leading-relaxed break-words font-medium pr-12">{msg.content}</p>

                    <span
                      className={`absolute bottom-1.5 right-3 text-[9.5px] font-semibold select-none ${
                        isMine ? 'text-white/75' : 'text-[#626a9f]'
                      }`}
                    >
                      {formattedTime}
                    </span>

                    {isModerator && (
                      <div className="absolute -top-3 right-2 flex items-center gap-1 bg-white border-2 border-[#1e2246] rounded-full px-1.5 py-0.5 shadow-md opacity-95 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => setPinnedMessage(msg.content)}
                          title="Pin message"
                          className="w-5 h-5 flex items-center justify-center text-[10px] hover:scale-110 cursor-pointer"
                        >
                          📌
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteMessage(msg.id)}
                          title="Delete message"
                          className="w-5 h-5 flex items-center justify-center text-[#c93f34] hover:scale-110 cursor-pointer"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* EMOJI DRAWER */}
        {showEmojiPicker && (
          <div className="border-t-2 border-white bg-white/95 backdrop-blur-2xl p-4 shrink-0 shadow-lg relative z-50">
            <div className="flex gap-1.5 overflow-x-auto custom-scrollbar pb-2.5 mb-2 border-b border-[#dfe2f2]">
              {Object.keys(EMOJI_CATEGORIES).map((cat) => (
                <button
                  key={cat}
                  type="button"
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
                  key={idx}
                  type="button"
                  onClick={() => handleEmojiClick(emoji)}
                  className="text-xl hover:scale-125 transition-transform p-1 rounded-lg hover:bg-[#fff3d1] cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* BOTTOM FLOATING COMPOSER */}
        <div className="p-3 sm:p-4 border-t-2 border-white bg-white/80 backdrop-blur-2xl shrink-0 relative z-[60]">
          {chatError && (
            <div className="ola-sem-pop absolute -top-12 left-1/2 -translate-x-1/2 bg-[#ee665b] text-white text-xs font-extrabold px-5 py-2 rounded-full shadow-xl flex items-center gap-2 z-50 whitespace-nowrap border-2 border-[#1e2246]">
              <span>⚠️ {chatError}</span>
            </div>
          )}

          <form onSubmit={handleSendMessage} className="flex items-center gap-2 sm:gap-3 max-w-4xl mx-auto">
            <button
              type="button"
              onClick={() => setShowEmojiPicker((prev) => !prev)}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors shrink-0 border-2 cursor-pointer ${
                showEmojiPicker
                  ? 'bg-[#ffc749] border-[#1e2246] shadow-[0_2px_0_#1e2246]'
                  : 'bg-white border-[#dfe2f2] hover:border-[#454d82]'
              }`}
              title="Emoji Palette"
              aria-label="Emoji Palette"
            >
              <span className="text-lg">😊</span>
            </button>

            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                if (chatError) setChatError('');
              }}
              placeholder="Type your message in English..."
              className="flex-1 h-11 sm:h-12 bg-white border-2 border-[#dfe2f2] focus:border-[#1e2246] rounded-full px-5 text-sm font-semibold text-[#1e2246] placeholder-[#626a9f]/60 outline-none shadow-sm"
              disabled={isSending}
            />

            <button
              type="submit"
              disabled={!inputText.trim() || isSending}
              aria-label="Send message"
              className="ola-sem-btn-yellow w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center disabled:opacity-40 shrink-0 cursor-pointer"
            >
              <svg className="w-5 h-5 translate-x-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}