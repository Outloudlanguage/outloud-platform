import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './SupabaseClient';

// =========================================================================
// BUILT-IN VISUAL DICTIONARY (Zero-dependency emoji palette for language immersion)
// =========================================================================
const EMOJI_CATEGORIES = {
  Expressions: ['😀','😃','😄','😁','😆','😅','😂','🤣','🥲','☺️','😊','😇','🙂','🙃','😉','😌','😍','🥰','😘','😗','😙','😚','😋','😛','😝','😜','🤪','🤨','🧐','🤓','😎','🥸','🤩','🥳','😏','😒','😞','😔','😟','😕','🙁','☹️','😣','😖','😫','😩','🥺','😢','😭','😤','😠','😡','🤬','🤯','😳','🥵','🥶','😱','😨','😰','😥','😓','🤗','🤔','🫣','🤭','🫢','🫡','🤫','🫠','🤥','😶','🫥','😐','🫤','😑','😬','🙄','😯','😦','😧','😮','😲','🥱','😴','🤤','😪','😮‍💨','😵','😵‍💫','🤐','🥴','🤢','🤮','🤧','😷','🤒','🤕','🤑','🤠','😈','👿','👹','👺','🤡','💩','👻','💀','☠️','👽','👾','🤖','🎃','😺','😸','😹','😻','😼','😽','🙀','😿','😾'],
  People: ['👋','🤚','🖐','✋','🖖','👌','🤌','🤏','✌️','🤞','🫰','🤟','🤘','🤙','👈','👉','👆','🖕','👇','☝️','🫵','👍','👎','✊','👊','🤛','🤜','👏','🙌','🫶','👐','🤲','🤝','🙏','✍️','💅','🤳','💪','🦾','🦿','🦵','🦶','👂','🦻','👃','🧠','🫀','🫁','🦷','🦴','👀','👁','👅','👄','👶','🧒','👦','👧','🧑','👱','👨','🧔','👨‍🦰','👨‍🦱','👨‍🦳','👨‍🦲','👩','👩‍🦰','🧑‍🦰','👩‍🦱','🧑‍🦱','👩‍🦳','🧑‍🦳','👩‍‍🦲','🧑‍🦲','👱‍♀️','👱‍♂️','🧓','👴','👵','🙍','🙍‍♂️','🙍‍♀️','🙎','🙎‍♂️','🙎‍♀️','🙅','🙅‍♂️','🙅‍♀️','🙆','🙆‍♂️','🙆‍♀️','💁','💁‍♂️','💁‍♀️','🙋','🙋‍♂️','🙋‍♀️','🧏','🧏‍♂️','🧏‍♀️','🙇','🙇‍♂️️','🙇‍♀️','🤦','🤦‍♂️','🤦‍♀️','🤷','🤷‍♂️','🤷‍♀️','🧑‍⚕️','👨‍⚕️','👩‍⚕️','🧑‍🎓','👨‍🎓','👩‍🎓','🧑‍🏫','👨‍🏫','👩‍🏫','🧑‍⚖️','👨‍⚖️','👩‍⚖️','🧑‍🌾','👨‍🌾','👩‍🌾','🧑‍🍳','👨‍🍳','👩‍🍳','🧑‍🔧','👨‍🔧','👩‍🔧','🧑‍🏭','👨‍🏭','👩‍🏭','🧑‍💼','👨‍💼','👩‍💼','🧑‍🔬','👨‍🔬','👩‍🔬','🧑‍💻','👨‍💻','👩‍💻','🧑‍🎤','👨‍🎤','👩‍🎤','🧑‍🎨','👨‍🎨','👩‍🎨','🧑‍✈️','👨‍✈️','👩‍✈️','🧑‍🚀','👨‍🚀','👩‍🚀','🧑‍🚒','👨‍🚒','👩‍🚒','👮','👮‍♂️','👮‍♀️','🕵','🕵️‍♂️','🕵️‍♀️','💂','💂‍♂️','💂‍♀️','🥷','👷','👷‍♂️','👷‍♀️','🫅','🤴','👸','👳','👳‍♂️','👳‍♀️','👲','🧕','🤵','🤵‍♂️','🤵‍♀️','👰','👰‍♂️','👰‍♀️','🤰','🫃','🫄','🤱','👩‍🍼','👨‍🍼','🧑‍🍼','👼','🎅','🤶','🧑‍🎄','🦸','🦸‍♂️','🦸‍♀️','🦹','🦹‍♂️️','🦹‍♀️','🧙','🧙‍♂️','🧙‍♀️','🧚','🧚‍♂️','🧚‍♀️','🧛','🧛‍♂️','🧛‍♀️','🧜','🧜‍♂️','🧜‍♀️','🧝','🧝‍♂️','🧝‍♀️','🧞','🧞‍♂️','🧞‍♀️','🧟','🧟‍♂️','🧟‍♀️','💆','💆‍♂️️','💆‍♀️','💇','💇‍♂️','💇‍♀️','🚶','🚶‍♂️','🚶‍♀️','🧍','🧍‍♂️','🧍‍♀️','🧎','🧎‍♂️','🧎‍♀️','🧑‍🦯','👨‍🦯','👩‍🦯','🧑‍🦼','👨‍‍🦼','👩‍🦼','🧑‍🦽','👨‍🦽','👩‍🦽','🏃','🏃‍♂️','🏃‍♀️','💃','🕺','🕴','👯','👯‍♂️','👯‍♀️','🧖','🧖‍♂️','🧖‍♀️','🧗','🧗‍♂️','🧗‍♀️','🤺','🏇','⛷','🏂','🏌','🏌️‍♂️','🏌️‍♀️','🏄','🏄‍♂️','🏄‍♀️','🚣','🚣‍♂️','🚣‍♀️','🏊','🏊‍♂️','🏊‍♀️','⛹','⛹️‍♂️','⛹️‍♀️','🏋','🏋️‍♂️','🏋️‍♀️','🚴','🚴‍♂️','🚴‍♀️','🚵','🚵‍♂️','🚵‍♀️','🤸','🤸‍♂️','🤸‍♀️','🤼','🤼‍♂️','🤼‍♀️','🤽','🤽‍♂️','🤽‍♀️','🤾','🤾‍♂️','🤾‍♀️','🤹','🤹‍♂️','🤹‍♀️','🧘','🧘‍♂️','🧘‍♀️'],
  Animals: ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐻‍❄️','🐨','🐯','🦁','🐮','🐷','🐽','🐸','🐵','🙈','🙉','🙊','🐒','🐔','🐧','🐦','🐤','🐣','🐥','🦆','🦅','🦉','🦇','🐺','🐗','🐴','🦄','🐝','🪱','🐛','🦋','🐌','🐞','🐜','🪰','🪲','🪳','🦟','🦗','🕷','🕸','🦂','🐢','🐍','🦎','🦖','🦕','🐙','🦑','🦐','🦞','🦀','🐡','🐠','🐟','🐬','🐳','🐋','🦈','🦭','🐊','🐅','🐆','🦓','🦍','🦧','🦣','🐘','🦛','🦏','🐪','🐫','🦒','🦘','🦬','🐃','🐂','🐄','🐎','🐖','🐏','🐑','🦙','🐐','🦌','🐕','🐩','🦮','🐕‍🦺','🐈','🐈‍⬛','🪶','🐓','🦃','🦤','🦚','🦜','🦢','🦩','🕊','🐇','🦝','🦨','🦡','🦫','🦦','🦥','🐁','🐀','🐿','🦔','🐾','🐉','🐲','🌵','🎄','🌲','🌳','🌴','🪵','🌱','🌿','☘️','🍀','🎍','🪴','🎋','🍃','🍂','🍁','🍄','🐚','🪨','🌾','💐','🌷','🌹','🥀','🪷','🌺','🌸','🌼','🌻','🌞','🌝','🌛','🌜','🌚','🌕','🌖','🌗','🌘','🌑','🌒','🌓','🌔','🌙','🌎','🌍','🌏','🪐','💫','⭐️','🌟','✨','⚡️','☄️','💥','🔥','🌪','🌈','☀️️','🌤','⛅️','🌥','☁️','🌦','🌧','⛈','🌩','🌨','❄️','☃️','⛄️','🌬','💨','💧','💦','☔️','☂️','🌊','🌫'],
  Food: ['🍏','🍎','🍐','🍊','🍋','🍌','🍉','🍇','🍓','🫐','🍈','🍒','🍑','🥭','🍍','🥥','🥝','🍅','🍆','🥑','🥦','🥬','🥒','🌶','🫑','🌽','🥕','🫒','🧄','🧅','🥔','🍠','🥐','🥯','🍞','🥖','🥨','🧀','🥚','🍳','🧈','🥞','🧇','🥓','🥩','🍗','🍖','🦴','🌭','🍔','🍟','🍕','🫓','🥪','🥙','🧆','🌮','🌯','🫔','🥗','🥘','🫕','🥫','🍝','🍜','🍲','🍛','🍣','🍱','🥟','🦪','🍤','🍙','🍚','🍘','🍥','🥠','🥮','🍢','🍡','🍧','🍨','🍦','🥧','🧁','🍰','🎂','🍮','🍭','🍬','🍫','🍿','🍩','🍪','🌰','🥜','🍯','🥛','🍼','🫖','☕️','🍵','🧃','🥤','🧋','🍶','🍺','🍻','🥂','🍷','🥃','🍸','🍹','🧉','🍾','🧊','🥄','🍴','🍽','🥣','🥡','🥢','🧂'],
  Places: ['🚗','🚕','🚙','🚌','🚎','🏎','🚓','🚑','🚒','🚐','🛻','🚚','🚛','🚜','🦯','🦽','🦼','🛴','🚲','🛵','🏍','🛺','🚨','🚔','🚍','🚘','🚖','🚡','🚠','🚟','🚃','🚋','🚞','🚝','🚄','🚅','🚈','🚂','🚆','🚇','🚊','🚉','✈️','🛫','🛬','🛩','💺','🛰','🚀','🛸','🚁','🛶','⛵️','🚤','🛥','🛳','⛴','🚢','⚓️','🪝','⛽️','🚧','🚦','🚥','🚏','🗺','🗿','🗽','🗼','🏰','🏯','🏟','🎡','🎢','🎠','⛲️','⛱','🏖','🏝','🏜','🌋','⛰','🏔','🗻','🏕','⛺️','🛖','🏠','🏡','🏘','🏚','🏗','🏭','🏢','🏬','🏣','🏤','🏥','🏦','🏨','🏪','🏫','🏩','💒','🏛','⛪️','🕌','🛕','🕍','⛩','🕋'],
  Objects: ['⌚️','📱','📲','💻','⌨️','🖥','🖨','🖱','🖲','🕹','🗜','💽','💾','💿','📀','📼','📷','📸','📹','🎥','📽','🎞','📞','☎️','📟','📠','📺','📻','🎙','🎚','🎛','🧭','⏱','⏲','⏰','🕰','⌛️','⏳','📡','🔋','🔌','💡','🔦','🕯','🪔','🧯','🛢','💸','💵','💴','💶','💷','🪙','💰','💳','💎','⚖️','🪜','🧰','🪛','🔧','🔨','⚒','🛠','⛏','🪚','🔩','⚙️','🪤','🧱','⛓','🧲','🔫','💣','🧨','🪓','🔪','🗡','⚔️','🛡','🚬','⚰️','🪦','⚱️','🏺','🔮','📿','🧿','💈','⚗️','🔭','🔬','🕳','🩹','🩺','💊','💉','🩸','🧬','🦠','🧫','🧪','🌡','🧹','🪠','🧺','🧻','🚽','🚰','🚿','🛁','🛀','🧼','🪥','🪒','🧽','🪣','🧴','🛎','🔑','🗝','🚪','🪑','🛋','🛏','🛌','🧸','🪆','🖼','🪞','🪟','🛍','🛒','🎁','🎈','🎏','🎀','🪄','🪅','🎊','🎉','🎎','🏮','🎐','🧧','✉️','📩','📨','📧','💌','📥','📤','📦','🏷','🪧','📪','📫','📬','📭','📮','📯','📜','📃','📄','📑','🧾','📊','📈','📉','🗒','🗓','📆','📅','🗑','📇','🗃','🗳','🗄','📋','📁','📂','🗂','🗞','📰','📓','📔','📒','📕','📗','📘','📙','📚','📖','🔖','🧷','🔗','📎','🖇','📐','📏','🧮','📌','📍','✂️','🖊','🖋','✒️','🖌','🖍','📝','✏️','🔍','🔎','🔏','🔐','🔒','🔓'],
  Symbols: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❤️‍🔥','❤️‍🩹','❣️','💕','💞','💓','💗','💖','💘','💝','💟','☮️','✝️','☪️','🕉','☸️️','✡️','🔯','🕎','☯️','☦️','🛐','⛎','♈️','♉️','♊️','♋️','♌️️','♍️','♎️','♏️','♐️','♑️','♒️','♓️','🆔','⚛️','🉑','☢️','☣️','📴','📳','🈶','🈚️','🈸','🈺','🈷️','✴️','🆚','💮','🉐','㊙️','㊗️','🈴','🈵','🈹','🈲','🅰️','🅱️','🆎','🆑','🅾️','🆘','❌','⭕️','🛑','⛔️','📛','🚫','💯','💢','♨️','🚷','🚯','🚳','🚱','🔞','📵','🚭','❗️','❕','❓','❔','‼️','⁉️','🔅','🔆','〽️','⚠️','🚸','🔱','⚜️','🔰','♻️','✅','🈯️','💹','❇️️','✳️','❎','🌐','💠','Ⓜ️','🌀','💤','🏧','🚾','♿️','🅿️','🛗','🈳','🈂️','🛂','🛃','🛄','🛅','🚹','🚺','🚼','⚧','🚻','🚮','🎦','📶','🈁','🔣','ℹ️','🔤','🔡','🔠','🆖','🆗','🆙','🆒','🆕','🆓','0️⃣','1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟','🔢','#️⃣','*️⃣','⏏️','▶️','⏸','⏯','⏹','⏺','⏭','⏮','⏩','⏪','⏫','⏬','◀️','🔼','🔽','➡️','⬅️','⬆️','⬇️','↗️','↘️','↙️','↖️','↕️','↔️','↪️','↩️','⤴️','⤵️','🔀','🔁','🔂','🔄','🔃','🎵','🎶','➕','➖','➗','✖️','♾','💲','💱','™️','©️','®️','〰️','➰','➿','🔚','🔙','🔛','🔝','🔜','✔️','☑️','🔘','🔴','🟠','🟡','🟢','🔵','🟣','⚫️','⚪️','🟤','🔺','🔻','🔸','🔹','🔶','🔷','🔳','🔲','▪️','▫️','◾️','◽️','◼️️','◻️','🟥','🟧','🟨','🟩','🟦','🟪','⬛️','⬜️','🟫','🔈','🔇','🔉','🔊','🔔','🔕','📣','📢','👁‍🗨','💬','💭','🗯','♠️️','♣️','♥️','♦️','🃏','🎴','🀄️']
};
export default function SeminarRoom({ currentUser, userRole = 'student', onClose }) {
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
  const [newRoomLevel, setNewRoomLevel] = useState('ALL');
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const normalizedLevel = currentUser?.level ? currentUser.level.split(':')[0].trim() : 'ALL';
  const isModerator = userRole === 'admin' || userRole === 'teacher';
  const isAdmin = userRole === 'admin';

  // 1. Initial Room Discovery & Lifecycle Listener
  useEffect(() => {
    fetchActiveRooms();

    // Realtime Room Channel: Listen for Admin room creation or closure
    const roomChannel = supabase
      .channel('chat_rooms_lifecycle')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_rooms' }, () => {
        fetchActiveRooms();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(roomChannel);
    };
  }, []);

  // 2. Fetch Active Rooms matching role and level
  const fetchActiveRooms = async () => {
    setIsLoading(true);
    try {
      let query = supabase.from('chat_rooms').select('*').eq('is_active', true);
      
      // Students only see rooms for their level or universal rooms
      if (userRole === 'student') {
        query = query.or(`level_target.eq.${normalizedLevel},level_target.eq.ALL`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;

      setRoomsList(data || []);
      if (data && data.length > 0) {
        // Automatically join the current or first active room
        setActiveRoom(prev => prev ? (data.find(r => r.id === prev.id) || data[0]) : data[0]);
      } else {
        setActiveRoom(null);
      }
    } catch (err) {
      console.error('Error fetching rooms:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Message Stream & Presence for the Active Room
  useEffect(() => {
    if (!activeRoom) {
      setMessages([]);
      return;
    }

    fetchMessages(activeRoom.id);

    // Realtime channel for messages and instant live presence
    const channel = supabase.channel(`room_${activeRoom.id}`, {
      config: { presence: { key: currentUser?.id || 'anon' } }
    });

    channel
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'chat_messages', 
        filter: `room_id=eq.${activeRoom.id}` 
      }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
      })
      .on('postgres_changes', { 
        event: 'DELETE', 
        schema: 'public', 
        table: 'chat_messages' 
      }, (payload) => {
        setMessages(prev => prev.filter(msg => msg.id !== payload.old.id));
      })
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
            role: userRole
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeRoom?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async (roomId) => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setMessages(data);
    }
  };

  // 4. Send Message Handler
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputText.trim() || !activeRoom || isSending) return;

    setIsSending(true);
    const content = inputText.trim();
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
        content: content
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

  // 5. Moderation: Delete individual message
  const handleDeleteMessage = async (messageId) => {
    if (!isModerator) return;
    try {
      await supabase.from('chat_messages').delete().eq('id', messageId);
    } catch (err) {
      console.error('Failed to delete message:', err);
    }
  };

  // 6. Moderation: Admin Global Room Closure (The Clean Slate)
  const handleCloseRoom = async (roomId) => {
    if (!isAdmin) return;
    if (!window.confirm('Close and wipe this live session for all participants?')) return;

    try {
      // Deleting the room cascades in PostgreSQL, erasing all messages automatically
      await supabase.from('chat_rooms').delete().eq('id', roomId);
      setActiveRoom(null);
      fetchActiveRooms();
    } catch (err) {
      console.error('Failed to close room:', err);
    }
  };

  // 7. Admin: Create New Live Room
  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!isAdmin || !newRoomTitle.trim()) return;

    try {
      const { data, error } = await supabase.from('chat_rooms').insert({
        room_name: newRoomTitle.trim(),
        level_target: newRoomLevel,
        is_active: true
      }).select().single();

      if (error) throw error;
      setNewRoomTitle('');
      setActiveRoom(data);
      fetchActiveRooms();
    } catch (err) {
      console.error('Failed to create room:', err);
    }
  };

  const handleEmojiClick = (emoji) => {
    setInputText(prev => prev + emoji);
    inputRef.current?.focus();
  };

  const getRoleBadge = (role, level) => {
    if (role === 'admin') return <span className="text-[9px] font-black uppercase tracking-wider bg-red-500/20 text-red-300 border border-red-500/40 px-1.5 py-0.5 rounded">MOD</span>;
    if (role === 'teacher') return <span className="text-[9px] font-black uppercase tracking-wider bg-[#fcd34d]/20 text-[#fcd34d] border border-[#fcd34d]/40 px-1.5 py-0.5 rounded">TEACHER</span>;
    return <span className="text-[9px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/40 px-1.5 py-0.5 rounded">{level || 'A1'}</span>;
  };

  // =========================================================================
  // CONDITIONAL VIEW: NO ACTIVE SEMINAR AVAILABLE
  // =========================================================================
  if (isLoading) {
    return <div className={`${userRole === 'admin' ? 'absolute inset-0 rounded-[2.5rem]' : 'fixed inset-0'} z-[700] bg-[#070b19]/90 backdrop-blur-2xl flex items-center justify-center`}><div className="w-10 h-10 border-4 border-[#fcd34d] border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!activeRoom) {
    return (
      <div className={`${userRole === 'admin' ? 'absolute inset-0 rounded-[2.5rem]' : 'fixed inset-0'} z-[700] bg-[#070b19]/80 backdrop-blur-3xl flex items-center justify-center p-4 md:p-6 font-montserrat text-white animate-fade-in`}>
        <div className="bg-white/10 border border-white/20 rounded-[3rem] p-10 max-w-md w-full shadow-[0_0_50px_rgba(0,0,0,0.4)] flex flex-col items-center justify-center text-center relative overflow-hidden backdrop-blur-2xl">
          <div className="w-20 h-20 rounded-full bg-[#fcd34d]/10 border border-[#fcd34d]/30 flex items-center justify-center mb-6 text-[#fcd34d] shadow-[0_0_30px_rgba(252,211,77,0.3)]">
            <svg className="w-10 h-10 translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>

          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-widest mb-4 drop-shadow-md">Live Chat Inactive</h2>
          <p className="text-sm text-white/80 font-medium leading-relaxed mb-8">
            There is no live activity available here at the moment. Please check back when a teacher or administrator initiates a seminar room.
          </p>

          {isAdmin && (
            <form onSubmit={handleCreateRoom} className="w-full mb-8 flex flex-col gap-3">
              <input 
                type="text" 
                value={newRoomTitle} 
                onChange={(e) => setNewRoomTitle(e.target.value)} 
                placeholder="New Room Title (e.g., B1 Seminar)" 
                className="w-full h-12 bg-white/5 border border-white/20 rounded-xl px-4 text-sm font-bold text-white outline-none focus:border-[#fcd34d]"
                required
              />
              <select 
                value={newRoomLevel} 
                onChange={(e) => setNewRoomLevel(e.target.value)}
                className="w-full h-12 bg-[#070b19] border border-white/20 rounded-xl px-4 text-sm font-bold text-white outline-none focus:border-[#fcd34d]"
              >
                <option value="ALL">Cohort: Everyone (ALL)</option>
                <option value="STAFF">Cohort: Internal Staff</option>
                <option value="A1">Cohort: Level A1</option>
                <option value="A2">Cohort: Level A2</option>
                <option value="B1">Cohort: Level B1</option>
                <option value="B2">Cohort: Level B2</option>
                <option value="C1">Cohort: Level C1</option>
                <option value="C2">Cohort: Level C2</option>
              </select>
              <button 
                type="submit" 
                className="w-full py-3.5 bg-[#fcd34d] hover:bg-white text-[#08203e] font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-[0_0_15px_rgba(252,211,77,0.4)]"
              >
                Launch Room As Admin
              </button>
            </form>
          )}

          <button 
            onClick={onClose} 
            className="w-full py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all"
          >
            Back To Dashboard
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // MAIN LIVE SEMINAR CANVAS (Adaptive Desktop & Mobile)
  // =========================================================================
  return (
    <div className={`${userRole === 'admin' ? 'absolute inset-0 rounded-[2.5rem]' : 'fixed inset-0'} z-[700] bg-[#070b19]/90 backdrop-blur-3xl font-montserrat flex flex-col md:flex-row overflow-hidden text-white select-none shadow-2xl`}>
      
      {/* BACKGROUND WATERMARK */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] flex items-center justify-center overflow-hidden z-0">
        <img src="https://pub-4ca81ef087364b84a5b486b76cc2b72e.r2.dev/Monogram.png" alt="Watermark" className="w-[800px] object-contain invert brightness-0" />
      </div>

      {/* --- DESKTOP ROSTER PANE (Hidden on Mobile) --- */}
      <div className="hidden md:flex flex-col w-72 lg:w-80 border-r border-white/10 bg-black/20 backdrop-blur-2xl z-10 shrink-0">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]"></div>
            <h3 className="text-xs font-black uppercase tracking-widest text-white/80">Active Roster</h3>
          </div>
          <span className="text-[10px] font-bold text-white/40 bg-white/5 px-2.5 py-1 rounded-full">{activeMembers.length} Online</span>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
          {activeMembers.map((member, idx) => (
            <div key={idx} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5">
              <div className="relative w-9 h-9 rounded-full overflow-hidden bg-[#070b19] border border-white/20 shrink-0">
                {member.avatar ? (
                  <img src={member.avatar} alt="User" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs font-black text-white/40">{member.name?.[0] || 'U'}</div>
                )}
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#070b19] rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{member.name}</p>
                <div className="mt-0.5">{getRoleBadge(member.role, member.level)}</div>
              </div>
            </div>
          ))}
        </div>

        {isAdmin && roomsList.length > 1 && (
          <div className="p-4 border-t border-white/10 bg-black/30">
            <span className="text-[9px] font-black uppercase tracking-widest text-white/40 block mb-2">Switch Active Room</span>
            <div className="space-y-1">
              {roomsList.map(r => (
                <button 
                  key={r.id} 
                  onClick={() => setActiveRoom(r)} 
                  className={`w-full text-left text-xs p-2 rounded-lg font-bold truncate transition-colors ${activeRoom.id === r.id ? 'bg-[#fcd34d] text-[#08203e]' : 'text-white/70 hover:bg-white/5'}`}
                >
                  {r.room_name} ({r.level_target})
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* --- MAIN CHAT CONTAINER --- */}
      <div className="flex-1 flex flex-col h-full relative z-10">

        {/* TOP NAVBAR */}
        <div className="h-16 md:h-20 border-b border-white/10 bg-black/30 backdrop-blur-xl px-4 md:px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 md:gap-4">
            <button 
              onClick={onClose} 
              className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm md:text-base font-black uppercase tracking-wider text-white">{activeRoom.room_name}</h1>
                <span className="text-[10px] font-bold text-[#fcd34d] bg-[#fcd34d]/10 border border-[#fcd34d]/30 px-2 py-0.5 rounded-full">{activeRoom.level_target}</span>
              </div>
              <p className="text-[10px] text-emerald-400 font-bold tracking-widest uppercase flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Seminar Session Live
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <button 
                onClick={() => handleCloseRoom(activeRoom.id)} 
                className="px-3.5 py-2 bg-red-500/20 hover:bg-red-500 text-red-200 hover:text-white border border-red-500/40 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer"
              >
                Close & Wipe Room
              </button>
            )}
            <button 
              onClick={onClose} 
              className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold text-white transition-colors cursor-pointer"
            >
              Exit
            </button>
          </div>
        </div>

        {/* PINNED ANNOUNCEMENT STRIP (If enabled by teacher/admin) */}
        {pinnedMessage && (
          <div className="bg-[#fcd34d]/10 border-b border-[#fcd34d]/30 px-6 py-2.5 flex items-center justify-between text-xs text-[#fcd34d] font-bold">
            <div className="flex items-center gap-2 truncate">
              <span>📌</span>
              <span className="truncate">{pinnedMessage}</span>
            </div>
            {isModerator && (
              <button onClick={() => setPinnedMessage(null)} className="text-[10px] uppercase font-black tracking-widest text-[#fcd34d]/70 hover:text-white ml-4">Unpin</button>
            )}
          </div>
        )}

        {/* MESSAGE STREAM (WhatsApp-Inspired Bubbles) */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-white/30">
              <span className="text-3xl mb-2">💬</span>
              <p className="text-xs font-bold uppercase tracking-widest">Seminar room opened. No messages yet.</p>
              <p className="text-[11px] text-white/20 mt-1 max-w-xs">Be the first to say hello or ask a question in English.</p>
            </div>
          ) : (
            messages.map((msg, i) => {
              const isMine = msg.user_id === currentUser.id;
              const formattedTime = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              return (
                <div 
                  key={msg.id || i} 
                  className={`flex items-end gap-2.5 group ${isMine ? 'justify-end' : 'justify-start'}`}
                >
                  {/* Incoming Avatar (Left-aligned) */}
                  {!isMine && (
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-white/10 border border-white/20 shrink-0 mb-1">
                      {msg.user_avatar ? (
                        <img src={msg.user_avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-black text-white/50">{msg.user_name?.[0] || 'U'}</div>
                      )}
                    </div>
                  )}

                  {/* Bubble Container */}
                  <div className={`relative max-w-[85%] md:max-w-md lg:max-w-lg shadow-lg transition-all ${
                    isMine 
                      ? 'bg-[#0e2a47] border border-[#fcd34d]/30 text-white rounded-2xl rounded-tr-none px-4 py-2.5' 
                      : 'bg-white/10 backdrop-blur-md border border-white/15 text-white rounded-2xl rounded-tl-none px-4 py-2.5'
                  }`}>
                    
                    {/* Header: Name & Role Badge (For peer messages) */}
                    {!isMine && (
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-white/90 truncate">{msg.user_name}</span>
                        {getRoleBadge(msg.user_role, msg.user_level)}
                      </div>
                    )}

                    {/* Message Body */}
                    <p className="text-sm leading-relaxed break-words font-medium pr-10">
                      {msg.content}
                    </p>

                    {/* Timestamp inside bubble */}
                    <span className="absolute bottom-1.5 right-2.5 text-[9px] font-semibold text-white/40 select-none">
                      {formattedTime}
                    </span>

                    {/* Moderator Quick Actions (Hover state on desktop, touchable on mobile) */}
                    {isModerator && (
                      <div className="absolute -top-3 right-0 hidden group-hover:flex items-center gap-1 bg-[#070b19] border border-white/20 rounded-lg p-1 shadow-xl">
                        <button 
                          onClick={() => setPinnedMessage(msg.content)} 
                          title="Pin message" 
                          className="w-5 h-5 flex items-center justify-center text-[10px] text-white/70 hover:text-[#fcd34d]"
                        >
                          📌
                        </button>
                        <button 
                          onClick={() => handleDeleteMessage(msg.id)} 
                          title="Delete message" 
                          className="w-5 h-5 flex items-center justify-center text-white/70 hover:text-red-400"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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

        {/* --- EMOJI PALETTE (Visual Dictionary Drawer) --- */}
        {showEmojiPicker && (
          <div className="border-t border-white/10 bg-[#070b19]/95 backdrop-blur-2xl p-4 shrink-0 shadow-2xl animate-slide-up">
            <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-3 mb-2 border-b border-white/10">
              {Object.keys(EMOJI_CATEGORIES).map(cat => (
                <button 
                  key={cat} 
                  type="button" 
                  onClick={() => setSelectedEmojiCategory(cat)} 
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors shrink-0 ${selectedEmojiCategory === cat ? 'bg-[#fcd34d] text-[#08203e]' : 'bg-white/5 text-white/60 hover:text-white'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-8 sm:grid-cols-12 md:grid-cols-16 gap-2 max-h-36 overflow-y-auto custom-scrollbar p-1">
              {EMOJI_CATEGORIES[selectedEmojiCategory].map((emoji, idx) => (
                <button 
                  key={idx} 
                  type="button" 
                  onClick={() => handleEmojiClick(emoji)} 
                  className="text-2xl hover:scale-125 transition-transform p-1 rounded hover:bg-white/5"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* --- BOTTOM INPUT BAR --- */}
        <div className="p-3 md:p-5 border-t border-white/10 bg-black/40 backdrop-blur-2xl shrink-0">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2 md:gap-3 max-w-4xl mx-auto">
            
            {/* Visual Dictionary / Emoji Trigger */}
            <button 
              type="button" 
              onClick={() => setShowEmojiPicker(prev => !prev)} 
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all shrink-0 border ${showEmojiPicker ? 'bg-[#fcd34d] border-[#fcd34d] text-[#08203e]' : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/70'}`}
              title="Semantic Symbol Palette"
            >
              <span className="text-xl">😊</span>
            </button>

            {/* Clean Input Field */}
            <input 
              ref={inputRef}
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message in English..." 
              className="flex-1 h-11 md:h-12 bg-white/5 border border-white/15 focus:border-[#fcd34d] rounded-2xl px-4 text-sm text-white placeholder-white/30 outline-none transition-all shadow-inner"
              disabled={isSending}
            />

            {/* Send Button */}
            <button 
              type="submit" 
              disabled={!inputText.trim() || isSending}
              className="w-11 h-11 md:w-12 md:h-12 rounded-2xl bg-[#fcd34d] hover:bg-white text-[#08203e] flex items-center justify-center transition-all shadow-[0_0_15px_rgba(252,211,77,0.4)] disabled:opacity-40 disabled:hover:bg-[#fcd34d] shrink-0 cursor-pointer active:scale-95"
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