import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './SupabaseClient';
import AdminCalendar from './components/AdminHub/Tabs/AdminCalendar';
import { LEVEL_UNIT_MAP, LEVEL_OPTIONS, LESSON_TOOLS, WORKBOOK_TOOLS } from './constants/adminConfigs';
import { generateCrosswordLayout } from './utils/crosswordGenerator';
import { generateWordSearchGrid } from './utils/wordSearchGenerator';
import FillInTheBlankModal from './components/AdminHub/Modals/FillInTheBlankModal';
import ShapeConfigModal from './components/AdminHub/Modals/ShapeConfigModal';
import DragAndDropModal from './components/AdminHub/Modals/DragAndDropModal';
import ShortAnswerModal from './components/AdminHub/Modals/ShortAnswerModal';
import MultipleSelectionModal from './components/AdminHub/Modals/MultipleSelectionModal';
import SliderBarModal from './components/AdminHub/Modals/SliderBarModal';
import CrosswordModal from './components/AdminHub/Modals/CrosswordModal';
import WordSearchModal from './components/AdminHub/Modals/WordSearchModal';
import NavButtonModal from './components/AdminHub/Modals/NavButtonModal';
import CustomerManagement from './components/AdminHub/Tabs/CustomerManagement';
import MasterSettings from './components/AdminHub/Tabs/MasterSettings';
import AdminDropdown from './components/ui/AdminDropdown';

// PAN & ZOOM IMAGE COMPONENT (No Corner Dragging)
const PanZoomImage = ({ src, data, onSave, isPreview, wrapperClass = "w-full h-64" }) => {
  const [zoom, setZoom] = useState(data?.zoom || 1);
  const [pan, setPan] = useState({ x: data?.panX || 0, y: data?.panY || 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setZoom(data?.zoom || 1);
    setPan({ x: data?.panX || 0, y: data?.panY || 0 });
  }, [data?.zoom, data?.panX, data?.panY]);

  const handleWheel = (e) => {
    if (isPreview) return;
    e.preventDefault();
    const newZoom = Math.max(1, Math.min(zoom + (e.deltaY < 0 ? 0.1 : -0.1), 5));
    setZoom(newZoom);
    if (onSave) onSave({ zoom: newZoom, panX: pan.x, panY: pan.y });
  };

  const handlePointerDown = (e) => {
    if (isPreview) return;
    setIsDragging(true);
    setStartPos({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    e.target.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDragging || isPreview) return;
    setPan({ x: e.clientX - startPos.x, y: e.clientY - startPos.y });
  };

  const handlePointerUp = (e) => {
    if (isPreview) return;
    setIsDragging(false);
    if (onSave) onSave({ zoom, panX: pan.x, panY: pan.y });
    e.target.releasePointerCapture(e.pointerId);
  };

  return (
    <div className={`overflow-hidden relative bg-black/20 ${wrapperClass}`} onWheel={handleWheel}>
      <img 
        src={src} 
        alt="media" 
        draggable="false"
        onContextMenu={(e) => e.preventDefault()}
        className={`w-full h-full object-cover ${isPreview ? '' : 'cursor-move'} touch-none`}
        onPointerDown={handlePointerDown} 
        onPointerMove={handlePointerMove} 
        onPointerUp={handlePointerUp} 
        onPointerCancel={handlePointerUp}
        style={{ transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)` }} 
      />
      {!isPreview && (
        <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-md text-white text-[9px] font-black px-3 py-1.5 rounded-md pointer-events-none uppercase tracking-widest shadow-md">
          Scroll: Zoom | Drag: Pan
        </div>
      )}
    </div>
  );
};

const AdminHub = () => {
  const [activeTab, setActiveTab] = useState('CONTENT_EDITING');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [contentType, setContentType] = useState('Lesson');
  
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');
  
  const [lessonScreens, setLessonScreens] = useState([Date.now()]); 
  const [workbookScreens, setWorkbookScreens] = useState([Date.now() + 1]); 
  const [canvasElements, setCanvasElements] = useState([]);
  const [canvasHistory, setCanvasHistory] = useState([]);
  const [activeScreenId, setActiveScreenId] = useState(null);

  const saveSnapshot = (elements = canvasElements) => {
    setCanvasHistory(prev => [...prev.slice(-29), JSON.parse(JSON.stringify(elements))]);
  };

  const [activeModal, setActiveModal] = useState(null); 
  const [editingElementId, setEditingElementId] = useState(null);
  
  const [mediaTarget, setMediaTarget] = useState({ id: null, type: 'image' });
  const [mediaUrlInput, setMediaUrlInput] = useState('');

  const [focusedTextId, setFocusedTextId] = useState(null);

  const [rcStates, setRcStates] = useState({}); 
  const rcRecorders = useRef({}); 
  const rcChunks = useRef({});    
  const rcPlayers = useRef({});   

  const [studentAnswers, setStudentAnswers] = useState({});
  const [dndAnswers, setDndAnswers] = useState({}); 
  const [touchDragState, setTouchDragState] = useState({ isDragging: false, text: '', x: 0, y: 0, sourceElId: null });

  useEffect(() => { setSelectedUnit(''); }, [selectedLevel]);

  useEffect(() => {
    if (contentType === 'Lesson') setActiveScreenId(lessonScreens[0]);
    else setActiveScreenId(workbookScreens[0]);
  }, [contentType, lessonScreens, workbookScreens]);

  const unitOptions = selectedLevel && LEVEL_UNIT_MAP[selectedLevel] 
    ? Array.from({ length: LEVEL_UNIT_MAP[selectedLevel].end - LEVEL_UNIT_MAP[selectedLevel].start + 1 }, (_, i) => `Unit ${LEVEL_UNIT_MAP[selectedLevel].start + i}`)
    : [];

  const toolOptions = contentType === 'Lesson' ? LESSON_TOOLS : WORKBOOK_TOOLS;

  const handleToolSelect = (tool) => {
    if (tool === 'Video') setActiveModal('video');
    else if (tool === 'Image') { setMediaTarget({ id: null, type: 'image' }); setActiveModal('media_upload'); }
    else if (tool === 'Audio') { setMediaTarget({ id: null, type: 'audio' }); setActiveModal('media_upload'); }
    else if (tool === 'Record & Compare') spawnInteractiveElement('record_compare');
    else if (tool === 'Text') spawnInteractiveElement('text');
    else if (tool === 'Fill in the blank') { setEditingElementId(null); setActiveModal('fill_in_the_blank'); }
    else if (tool === 'Shape') { setEditingElementId(null); setActiveModal('shape'); }
    else if (tool === 'Drag and drop') { setEditingElementId(null); setActiveModal('drag_and_drop'); }
    else if (tool === 'Short answer') { setEditingElementId(null); setActiveModal('short_answer'); }
    else if (tool === 'Multiple selection') { setEditingElementId(null); setActiveModal('multiple_selection'); }
    else if (tool === 'Slider bar') { setEditingElementId(null); setActiveModal('slider_bar'); }
    else if (tool === 'Crossword') { setEditingElementId(null); setActiveModal('crossword'); }
    else if (tool === 'Word search') { setEditingElementId(null); setActiveModal('word_search'); }
    else if (tool === 'Next Screen Button') spawnInteractiveElement('nav_button');
  };

  const spawnInteractiveElement = (type) => {
    let newElement = { id: `${type}_${Date.now()}`, type: type, screenId: activeScreenId, data: {} };

    if (type === 'text') {
      newElement.htmlContent = `<div style="text-align: center;"><span style="font-family: Montserrat; font-size: 28px; font-weight: 900; color: #ffffff; text-transform: uppercase;">A1-U1: ACTIVITY TITLE</span><br/><span style="font-family: Montserrat; font-size: 14px; font-weight: 500; color: #e2e8f0;">Type your descriptor here. This text box auto resizes for height.</span></div>`;
    }
    
    setCanvasElements([...canvasElements, newElement]);
  };

  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
    if (focusedTextId) {
      const liveNode = document.querySelector(`#element-${focusedTextId} .rich-text-content`);
      if (liveNode) {
        setCanvasElements(prev => prev.map(p => p.id === focusedTextId ? {...p, htmlContent: liveNode.innerHTML} : p));
      }
    }
  };

  const handleDeleteScreen = (screenIdToDelete) => {
    saveSnapshot();
    if (contentType === 'Lesson') {
      if (lessonScreens.length <= 1) return alert("Cannot delete the only screen.");
      setLessonScreens(prev => prev.filter(id => id !== screenIdToDelete));
    } else {
      if (workbookScreens.length <= 1) return alert("Cannot delete the only screen.");
      setWorkbookScreens(prev => prev.filter(id => id !== screenIdToDelete));
    }
    setCanvasElements(prev => prev.filter(el => el.screenId !== screenIdToDelete));
  };

  const handleDeleteElement = (id) => {
    saveSnapshot();
    setCanvasElements(canvasElements.filter(el => el.id !== id));
  };

  const handleAddMedia = () => {
    if (!mediaUrlInput) return;
    saveSnapshot();
    if (mediaTarget.id) {
      setCanvasElements(prev => prev.map(el => {
        if (el.id === mediaTarget.id) {
          const newData = { ...el.data };
          if (mediaTarget.type === 'image') newData.imageUrl = mediaUrlInput;
          if (mediaTarget.type === 'audio') newData.audioUrl = mediaUrlInput;
          return { ...el, data: newData };
        }
        return el;
      }));
    } else {
      const newElement = { id: `${mediaTarget.type}_${Date.now()}`, type: mediaTarget.type, url: mediaUrlInput, screenId: activeScreenId };
      setCanvasElements([...canvasElements, newElement]);
    }
    setActiveModal(null); setMediaUrlInput(''); setMediaTarget({ id: null, type: 'image' });
  };

  const handleRemoveMedia = (elId, mediaType) => {
    saveSnapshot();
    setCanvasElements(prev => prev.map(el => {
      if (el.id === elId) {
        const newData = { ...el.data };
        if (mediaType === 'image') delete newData.imageUrl;
        if (mediaType === 'audio') delete newData.audioUrl;
        return { ...el, data: newData };
      }
      return el;
    }));
  };

  const handleSaveData = (id, newData) => {
    saveSnapshot();
    setCanvasElements(prev => prev.map(el => el.id === id ? { ...el, data: newData } : el));
  };

  const handleSaveModal = (type, data) => {
    saveSnapshot();
    if (editingElementId) { 
      setCanvasElements(prev => prev.map(el => el.id === editingElementId ? { ...el, data: { ...el.data, ...data } } : el)); 
    } else {
      const newElement = { id: `${type}_${Date.now()}`, type: type, screenId: activeScreenId, data: data };
      setCanvasElements([...canvasElements, newElement]);
    }
    setActiveModal(null); setEditingElementId(null);
  };

  const handleExpandWorkspace = () => {
    saveSnapshot();
    const newId = Date.now();
    if (contentType === 'Lesson') setLessonScreens(prev => [...prev, newId]);
    else setWorkbookScreens(prev => [...prev, newId]);
  };

  const handleDuplicateScreen = () => {
    saveSnapshot();
    const newScreenId = Date.now();
    if (contentType === 'Lesson') setLessonScreens([...lessonScreens, newScreenId]);
    else setWorkbookScreens([...workbookScreens, newScreenId]);

    const elementsToClone = canvasElements.filter(el => el.screenId === activeScreenId);
    const clonedElements = elementsToClone.map(el => ({
      ...el, id: `${el.type}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`, screenId: newScreenId,
      data: el.data ? JSON.parse(JSON.stringify(el.data)) : undefined, htmlContent: el.htmlContent || ''
    }));
    setCanvasElements(prev => [...prev, ...clonedElements]);
  };

  const handleUndoWorkspace = () => {
    if (canvasHistory.length > 0) {
      const previousState = canvasHistory[canvasHistory.length - 1];
      setCanvasHistory(prev => prev.slice(0, -1));
      setCanvasElements(previousState);
    }
  };

  const handleRcClick = async (id) => {
    const currentState = rcStates[id]?.phase || 'IDLE';

    if (currentState === 'IDLE' || currentState === 'RETRY') {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        rcRecorders.current[id] = recorder;
        rcChunks.current[id] = [];
        recorder.ondataavailable = (e) => { if (e.data.size > 0) rcChunks.current[id].push(e.data); };
        recorder.onstop = () => {
          const audioBlob = new Blob(rcChunks.current[id], { type: 'audio/webm' });
          setRcStates(prev => ({ ...prev, [id]: { phase: 'HAS_RECORDING', url: URL.createObjectURL(audioBlob) } }));
          stream.getTracks().forEach(track => track.stop());
        };
        recorder.start();
        setRcStates(prev => ({ ...prev, [id]: { phase: 'RECORDING', url: null } }));
      } catch (err) { alert("Microphone access is required."); }
    } 
    else if (currentState === 'RECORDING') {
      if (rcRecorders.current[id] && rcRecorders.current[id].state !== 'inactive') rcRecorders.current[id].stop();
    } 
    else if (currentState === 'HAS_RECORDING') {
      const audio = new Audio(rcStates[id].url);
      rcPlayers.current[id] = audio;
      audio.onended = () => setRcStates(prev => ({ ...prev, [id]: { ...prev[id], phase: 'RETRY' } }));
      audio.play();
      setRcStates(prev => ({ ...prev, [id]: { ...prev[id], phase: 'PLAYING' } }));
    }
    else if (currentState === 'PLAYING') {
      if (rcPlayers.current[id]) rcPlayers.current[id].pause();
      setRcStates(prev => ({ ...prev, [id]: { ...prev[id], phase: 'RETRY' } }));
    }
  };

  useEffect(() => {
    if (!selectedLevel || !selectedUnit || !contentType) { setCanvasElements([]); return; }
    const loadContent = async () => {
      const { data } = await supabase.from('content_blueprints').select('*').eq('level', selectedLevel).eq('unit', selectedUnit).eq('content_type', contentType).maybeSingle();
      if (data && data.blueprint_data) {
        setCanvasElements(data.blueprint_data.elements || []);
        if (contentType === 'Lesson') setLessonScreens(data.screens || [Date.now()]);
        else setWorkbookScreens(data.screens || [Date.now() + 1]);
      } else {
        setCanvasElements([]); 
        if (contentType === 'Lesson') setLessonScreens([Date.now()]);
        else setWorkbookScreens([Date.now() + 1]);
      }
    };
    loadContent();
  }, [selectedLevel, selectedUnit, contentType]);

  const handleConfirmSave = async () => {
    if (!selectedLevel || !selectedUnit || !contentType) return;
    setIsSaving(true);
    const syncedElements = canvasElements.map(el => {
      if (el.type === 'text') {
        const liveNode = document.querySelector(`#element-${el.id} .rich-text-content`);
        if (liveNode) return { ...el, htmlContent: liveNode.innerHTML };
      }
      return el;
    });
    setCanvasElements(syncedElements);
    const payload = { 
      level: selectedLevel, unit: selectedUnit, content_type: contentType, 
      screens: contentType === 'Lesson' ? lessonScreens : workbookScreens, 
      blueprint_data: { elements: syncedElements }, updated_at: new Date().toISOString() 
    };
    try {
      await supabase.from('content_blueprints').upsert(payload, { onConflict: 'level,unit,content_type' });
      alert("Changes saved and pushed live successfully!");
    } catch (err) { console.error(err); } finally { setIsSaving(false); setIsSaveModalOpen(false); }
  };

  const renderFormattedText = (el, isPreview) => {
    const data = el.data || {};
    if (!data.templateText) return null;
    let globalBlankIndex = 0; 
    const lines = data.templateText.split('\n');
    return lines.map((line, lineIdx) => {
      const parts = line.split(/(_+)/);
      return (
        <div key={lineIdx} className="flex items-center flex-wrap gap-1 mb-2">
          {parts.map((part, partIdx) => {
            if (part.startsWith('_')) {
              const currentBlankIndex = globalBlankIndex++;
              return (
                <input key={partIdx} type="text" disabled={!isPreview} value={isPreview ? (studentAnswers[`${el.id}_${currentBlankIndex}`] || '') : ''} onChange={(e) => isPreview && setStudentAnswers(prev => ({...prev, [`${el.id}_${currentBlankIndex}`]: e.target.value}))} className="inline-block text-center focus:outline-none focus:ring-2 focus:ring-[#fcd34d] transition mx-1 shadow-inner" style={{ backgroundColor: data.a_boxColor, borderColor: data.a_lineColor, borderWidth: '2px', borderStyle: 'solid', borderRadius: `${data.a_borderRadius}px`, width: `${Math.max(part.length * 20, 40)}px`, fontSize: `${data.a_fontSize}px`, color: data.a_textColor, fontWeight: data.a_isBold ? 'bold' : 'normal' }} />
              );
            }
            return <span key={partIdx} style={{ fontSize: `${data.t_fontSize}px`, color: data.t_textColor, fontWeight: data.t_isBold ? 'bold' : 'normal' }}>{part}</span>;
          })}
        </div>
      );
    });
  };

  const activeScreenArray = contentType === 'Lesson' ? lessonScreens : workbookScreens;

  return (
    <div className="relative min-h-screen w-full font-montserrat bg-[#070b19] text-white overflow-y-auto overflow-x-hidden flex flex-col">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; } 
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } 
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 10px; } 
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #fcd34d; }
        .zoom-container { touch-action: pan-x pan-y pinch-zoom; overflow: auto; overscroll-behavior: contain; }
        video::-internal-media-controls-download-button { display: none !important; }
        audio::-internal-media-controls-download-button { display: none !important; }
        video::-webkit-media-controls-enclosure { overflow: hidden; }
        video::-webkit-media-controls-panel { width: calc(100% + 30px); }
      `}</style>

      {isPreviewMode && (
        <button onClick={() => setIsPreviewMode(false)} className="fixed top-6 right-6 z-[9999] bg-red-600/90 text-white font-black px-8 py-4 rounded-full shadow-[0_0_20px_rgba(220,38,38,0.6)] uppercase tracking-widest text-sm hover:scale-105 border border-red-500/50 backdrop-blur-md transition-all animate-fade-in">
          EXIT PREVIEW
        </button>
      )}

      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-900/20 blur-[120px] rounded-full mix-blend-screen"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#fcd34d]/10 blur-[100px] rounded-full mix-blend-screen"></div>
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10 Q 25 20, 50 10 T 100 10' stroke='%23ffffff' fill='none' stroke-width='0.5'/%3E%3C/svg%3E")`, backgroundSize: '100px 20px' }}></div>
      </div>

      <FillInTheBlankModal isOpen={activeModal === 'fill_in_the_blank'} initialData={editingElementId ? canvasElements.find(e => e.id === editingElementId)?.data : {}} onSave={(d) => { handleSaveModal('fill_in_the_blank', d); }} onCancel={() => { setActiveModal(null); setEditingElementId(null); }} />
      <ShapeConfigModal isOpen={activeModal === 'shape'} initialData={editingElementId ? canvasElements.find(e => e.id === editingElementId)?.data : {}} onSave={(d) => { handleSaveModal('shape', d); }} onCancel={() => { setActiveModal(null); setEditingElementId(null); }} />
      <DragAndDropModal isOpen={activeModal === 'drag_and_drop'} initialData={editingElementId ? canvasElements.find(e => e.id === editingElementId)?.data : {}} onSave={(d) => { handleSaveModal('drag_and_drop', d); }} onCancel={() => { setActiveModal(null); setEditingElementId(null); }} />
      <ShortAnswerModal isOpen={activeModal === 'short_answer'} initialData={editingElementId ? canvasElements.find(e => e.id === editingElementId)?.data : {}} onSave={(d) => { handleSaveModal('short_answer', d); }} onCancel={() => { setActiveModal(null); setEditingElementId(null); }} />
      <MultipleSelectionModal isOpen={activeModal === 'multiple_selection'} initialData={editingElementId ? canvasElements.find(e => e.id === editingElementId)?.data : {}} onSave={(d) => { handleSaveModal('multiple_selection', d); }} onCancel={() => { setActiveModal(null); setEditingElementId(null); }} />
      <SliderBarModal isOpen={activeModal === 'slider_bar'} initialData={editingElementId ? canvasElements.find(e => e.id === editingElementId)?.data : {}} onSave={(d) => { handleSaveModal('slider_bar', d); }} onCancel={() => { setActiveModal(null); setEditingElementId(null); }} />
      <CrosswordModal isOpen={activeModal === 'crossword'} initialData={editingElementId ? canvasElements.find(e => e.id === editingElementId)?.data : {}} onSave={(d) => { handleSaveModal('crossword', { ...d, ...generateCrosswordLayout(d.items) }); }} onCancel={() => { setActiveModal(null); setEditingElementId(null); }} />
      <WordSearchModal isOpen={activeModal === 'word_search'} initialData={editingElementId ? canvasElements.find(e => e.id === editingElementId)?.data : {}} onSave={(d) => { handleSaveModal('word_search', { ...d, ...generateWordSearchGrid(d.words) }); }} onCancel={() => { setActiveModal(null); setEditingElementId(null); }} />
      <NavButtonModal isOpen={activeModal === 'nav_button'} initialData={editingElementId ? canvasElements.find(e => e.id === editingElementId)?.data : {}} onSave={(d) => { handleSaveModal('nav_button', d); }} onCancel={() => { setActiveModal(null); setEditingElementId(null); }} />

      {isSaveModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#070b19]/80 backdrop-blur-md px-4">
          <div className="bg-[#070b19]/40 backdrop-blur-xl rounded-[30px] p-8 max-w-md w-full shadow-2xl border border-white/20 flex flex-col items-center text-center animate-fade-in">
            <h2 className="text-3xl font-black text-white uppercase tracking-widest mb-4 drop-shadow-md">COMMIT?</h2>
            <div className="flex flex-row space-x-4 w-full justify-center">
              <button onClick={() => !isSaving && setIsSaveModalOpen(false)} className="bg-white/5 border border-white/20 text-white/80 font-bold px-6 py-3 rounded-full text-xs transition-all w-1/2 hover:bg-white/10">CANCEL</button>
              <button onClick={handleConfirmSave} className="bg-[#fcd34d] text-[#08203e] font-black px-6 py-3 rounded-full shadow-[0_0_15px_rgba(252,211,77,0.4)] text-xs w-1/2 hover:scale-105 transition-transform">{isSaving ? 'SAVING...' : 'PUSH LIVE'}</button>
            </div>
          </div>
        </div>
      )}

      {(activeModal === 'video' || activeModal === 'media_upload') && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#070b19]/80 backdrop-blur-md px-4">
          <div className="bg-[#070b19]/40 backdrop-blur-xl rounded-[30px] p-8 max-w-lg w-full shadow-2xl border border-white/20 flex flex-col items-center animate-fade-in">
            <h2 className="text-xl font-black text-white uppercase tracking-widest mb-6">ADD {mediaTarget.type.toUpperCase()}</h2>
            <input type="text" placeholder="Paste URL here..." value={mediaUrlInput} onChange={(e) => setMediaUrlInput(e.target.value)} className="w-full bg-[#070b19] border border-white/20 rounded-xl px-5 py-4 text-sm text-white focus:outline-none focus:border-[#fcd34d] mb-8" />
            <div className="flex flex-row space-x-4 w-full justify-center">
              <button onClick={() => { setActiveModal(null); setMediaUrlInput(''); setMediaTarget({id: null, type: 'image'}); }} className="bg-white/5 border border-white/20 text-white/80 font-bold px-6 py-3 rounded-full text-xs w-1/2 hover:bg-white/10">CANCEL</button>
              <button onClick={handleAddMedia} className="bg-[#fcd34d] text-[#08203e] font-black px-6 py-3 rounded-full text-xs w-1/2 hover:scale-105">ADD MEDIA</button>
            </div>
          </div>
        </div>
      )}

      {!isPreviewMode && (
        <div className="relative z-20 w-full flex flex-col items-center pt-6 md:pt-10 px-4 md:px-8 pb-10">
          <div className="w-full max-w-[90rem] flex flex-col space-y-12">
            <div className="bg-white/5 backdrop-blur-xl rounded-[30px] shadow-2xl p-6 md:p-10 flex flex-col items-center w-full border border-white/10">
              <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-widest mb-10 text-center drop-shadow-md">ADMIN EDITING HUB</h2>
              <div className="flex flex-col md:flex-row items-center justify-center w-full gap-4 md:gap-6">
                {['CONTENT_EDITING', 'CUSTOMER_MANAGEMENT', 'MASTER_SETTINGS', 'CALENDAR'].map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 max-w-[280px] w-full py-4 px-2 rounded-full text-[10px] md:text-xs uppercase tracking-widest transition-all text-center ${activeTab === tab ? 'bg-[#fcd34d] text-[#08203e] font-black shadow-[0_0_15px_rgba(252,211,77,0.4)] scale-105' : 'bg-transparent border border-white/20 text-white/70 font-bold hover:bg-white/10 hover:text-white'}`}>
                    {tab.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
            {activeTab === 'CUSTOMER_MANAGEMENT' && <CustomerManagement supabase={supabase} />}
            {activeTab === 'MASTER_SETTINGS' && <MasterSettings supabase={supabase} />}
            {activeTab === 'CALENDAR' && <AdminCalendar supabase={supabase}/>}
          </div>
        </div>
      )}

      {activeTab === 'CONTENT_EDITING' && (
        <div className="relative z-10 flex flex-col items-center w-full flex-grow">
          {!isPreviewMode && (
            <div className="fixed top-0 left-0 w-full z-[150] bg-[#070b19]/90 backdrop-blur-xl pt-6 pb-6 border-b border-white/10 shadow-2xl">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5 w-full px-6 max-w-[90rem] mx-auto">
                <AdminDropdown placeholder="Select Level" options={LEVEL_OPTIONS} value={selectedLevel} onChange={setSelectedLevel} />
                <AdminDropdown placeholder="Select Unit" options={unitOptions} value={selectedUnit} onChange={setSelectedUnit} />
                <AdminDropdown placeholder="Content type" options={['Lesson', 'Workbook']} value={contentType} onChange={setContentType} />
                <AdminDropdown placeholder="Tools" options={toolOptions} value="" onChange={handleToolSelect} />
              </div>
              <div className="flex flex-row justify-center items-center w-full mt-6 gap-8">
                <button onClick={() => setIsSaveModalOpen(true)} className="text-[#fcd34d] font-black tracking-widest uppercase hover:text-white transition-all text-xs">SAVE</button>
                <button onClick={handleUndoWorkspace} className="text-[#fcd34d] font-black tracking-widest uppercase hover:text-white transition-all text-xs">UNDO</button>
                <button onClick={handleDuplicateScreen} className="text-[#fcd34d] font-black tracking-widest uppercase hover:text-white transition-all text-xs">DUPLICATE</button>
                <button onClick={() => setIsPreviewMode(true)} className="text-[#fcd34d] font-black tracking-widest uppercase hover:text-white transition-all text-xs">PREVIEW</button>
              </div>
            </div>
          )}
            
          <div className="w-full h-[180px] shrink-0 pointer-events-none"></div>
            
          {activeScreenArray.map((screenId, index) => {
            const screenElements = canvasElements.filter(el => el.screenId === screenId);
            const contentElements = screenElements.filter(el => !['nav_button'].includes(el.type));
            const dockElements = screenElements.filter(el => ['nav_button', 'record_compare'].includes(el.type));

            return (
              <React.Fragment key={screenId}>
                {!isPreviewMode && (
                  <div className="w-full flex items-center justify-center py-8 z-20 relative bg-[#070b19]">
                    <div className="px-10 py-3 bg-white/5 border border-white/10 rounded-2xl text-white/50 font-black tracking-widest uppercase text-xs">
                      --- SCREEN {index + 1} ---
                    </div>
                  </div>
                )}

                <div 
                  id={`preview-screen-${screenId}`}
                  onClick={() => setActiveScreenId(screenId)}
                  className={`w-full relative flex flex-col p-6 mx-auto ${isPreviewMode ? 'max-w-[100rem]' : 'max-w-[100rem] border-x border-b-2 border-white/10 bg-white/5 rounded-b-3xl'}`}
                  style={{ minHeight: '100vh' }}
                >
                  {!isPreviewMode && (
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteScreen(screenId); }} className="absolute top-4 right-4 z-[60] w-10 h-10 bg-red-500/10 hover:bg-red-500 border border-red-500/30 rounded-full flex items-center justify-center text-red-400 hover:text-white transition-all shadow-md">
                      <svg className="w-5 h-5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  )}
                  
                  {/* Container for content */}
                  <div className="flex flex-wrap justify-center gap-6 w-full relative z-10 flex-grow content-start pointer-events-auto">
                    
                    {/* MEDIA STANDALONE BLOCK */}
                    {contentElements.filter(el => ['video', 'image', 'audio'].includes(el.type)).length > 0 && (
                      <div className="w-full flex flex-col items-center gap-6 mb-6">
                        {contentElements.filter(el => ['video', 'image', 'audio'].includes(el.type)).map(el => (
                           <div key={el.id} className={`w-full ${el.type === 'video' ? 'max-w-3xl' : 'max-w-2xl'} bg-black/40 rounded-3xl overflow-hidden border border-white/20 shadow-2xl animate-fade-in relative`}>
                              {!isPreviewMode && <button onClick={() => handleDeleteElement(el.id)} className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-xs shadow-md z-50">✕</button>}
                              
                              {el.type === 'video' && <video src={el.url} controls controlsList="nodownload" onContextMenu={(e) => e.preventDefault()} className="w-full aspect-video object-contain" />}
                              
                              {el.type === 'image' && <PanZoomImage src={el.url} data={el.data} onSave={(d) => handleSaveData(el.id, { ...el.data, ...d })} isPreview={isPreviewMode} wrapperClass="w-full h-64 md:h-96 rounded-3xl" />}
                              
                              {el.type === 'audio' && (
                                 <div className="p-6 w-full flex flex-col items-center">
                                    {!isPreviewMode && !el.data?.imageUrl && (
                                       <div onClick={() => { setMediaTarget({ id: el.id, type: 'image' }); setActiveModal('media_upload'); }} className="w-full h-16 bg-white/10 border-2 border-dashed border-white/20 rounded-xl flex items-center justify-center text-white/50 cursor-pointer hover:bg-white/20 hover:text-white transition-all mb-4">
                                         <span className="text-[10px] font-bold uppercase tracking-widest">+ Add Image (Optional)</span>
                                       </div>
                                    )}
                                    {el.data?.imageUrl && (
                                       <div className="w-full relative mb-4">
                                         <PanZoomImage src={el.data.imageUrl} data={el.data} onSave={(d) => handleSaveData(el.id, { ...el.data, ...d })} isPreview={isPreviewMode} wrapperClass="w-full h-64 rounded-2xl" />
                                         {!isPreviewMode && <button onClick={() => handleRemoveMedia(el.id, 'image')} className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-xs shadow-md z-50">✕</button>}
                                       </div>
                                    )}
                                    <audio src={el.url} controls controlsList="nodownload" onContextMenu={(e) => e.preventDefault()} className="w-full" />
                                 </div>
                              )}
                           </div>
                        ))}
                      </div>
                    )}

                    {contentElements.filter(el => !['video', 'image', 'audio'].includes(el.type)).map(el => {
                      const isCard = ['short_answer', 'multiple_selection', 'slider_bar', 'fill_in_the_blank', 'record_compare'].includes(el.type);
                      
                      return (
                        <div key={el.id} className={`relative flex flex-col group ${isCard ? 'w-full md:w-[calc(50%-12px)]' : 'w-full flex-col items-center'}`}>
                          
                          {/* Admin Overlay Actions */}
                          {!isPreviewMode && (
                             <div className="absolute -top-4 -right-4 z-50 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                               {el.type !== 'text' && <button onClick={() => { setEditingElementId(el.id); setActiveModal(el.type); }} className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg text-xs">✏️</button>}
                               <button onClick={() => handleDeleteElement(el.id)} className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg text-xs">🗑️</button>
                             </div>
                          )}

                          {/* TEXT / HEADER & CUSTOM INLINE EDITOR */}
                          {el.type === 'text' && (
                            <div className={`w-full bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 shadow-xl text-center mb-4 relative ${focusedTextId === el.id ? 'z-[100]' : 'z-10'}`} onFocus={() => setFocusedTextId(el.id)}>
                               {!isPreviewMode && focusedTextId === el.id && (
                                 <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-[#070b19]/95 backdrop-blur-xl border border-white/20 rounded-xl p-2 flex items-center gap-2 shadow-2xl whitespace-nowrap text-white z-[100]">
                                    <button onMouseDown={(e)=>{e.preventDefault(); formatText('bold')}} className="px-3 py-1 font-bold hover:bg-white/10 rounded">B</button>
                                    <button onMouseDown={(e)=>{e.preventDefault(); formatText('italic')}} className="px-3 py-1 italic hover:bg-white/10 rounded">I</button>
                                    <button onMouseDown={(e)=>{e.preventDefault(); formatText('underline')}} className="px-3 py-1 underline hover:bg-white/10 rounded">U</button>
                                    <div className="w-px h-5 bg-white/20 my-auto mx-1"></div>
                                    <input type="color" onInput={(e)=>formatText('foreColor', e.target.value)} className="w-6 h-6 rounded cursor-pointer bg-transparent border-0 p-0" />
                                    <select onChange={(e)=>formatText('fontName', e.target.value)} className="bg-[#070b19] border border-white/20 rounded px-2 py-1 text-xs outline-none ml-1">
                                       <option value="Montserrat" className="text-white">Montserrat</option>
                                       <option value="Arial" className="text-white">Arial</option>
                                       <option value="Times New Roman" className="text-white">Times New Roman</option>
                                    </select>
                                    <select onChange={(e)=>formatText('fontSize', e.target.value)} className="bg-[#070b19] border border-white/20 rounded px-2 py-1 text-xs outline-none ml-1">
                                       <option value="3" className="text-white">Normal</option>
                                       <option value="5" className="text-white">Large</option>
                                       <option value="7" className="text-white">Huge</option>
                                    </select>
                                 </div>
                               )}
                               <div id={`element-${el.id}`} contentEditable={!isPreviewMode} dangerouslySetInnerHTML={{__html: el.htmlContent}} onBlur={(e) => !isPreviewMode && saveSnapshot() && setCanvasElements(prev => prev.map(p => p.id === el.id ? {...p, htmlContent: e.target.innerHTML} : p))} className="rich-text-content focus:outline-none" />
                            </div>
                          )}

                          {/* CARDS */}
                          {isCard && (
                            <div className="w-full bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 flex flex-col gap-4 shadow-xl h-full justify-between hover:bg-white/10 transition-colors">
                               
                               {/* Universal Image Uploader for Cards */}
                               {!isPreviewMode && !el.data?.imageUrl && (
                                  <div onClick={() => { setMediaTarget({ id: el.id, type: 'image' }); setActiveModal('media_upload'); }} className="w-full h-32 bg-white/10 border-2 border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center text-white/50 cursor-pointer hover:bg-white/20 hover:text-white transition-all mb-2">
                                    <span className="text-4xl mb-1">+</span>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-center px-4">Click to add an image</span>
                                  </div>
                               )}
                               {el.data?.imageUrl && (
                                  <div className="relative mx-auto w-full mb-6 group">
                                    <PanZoomImage src={el.data.imageUrl} data={el.data} onSave={(d) => handleSaveData(el.id, { ...el.data, ...d })} isPreview={isPreviewMode} wrapperClass="w-full h-64 rounded-2xl" />
                                    {!isPreviewMode && <button onClick={() => handleRemoveMedia(el.id, 'image')} className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs shadow-md z-50">✕</button>}
                                  </div>
                               )}

                               {/* Record & Compare Audio Slot */}
                               {el.type === 'record_compare' && (
                                 <>
                                   {!isPreviewMode && !el.data?.audioUrl && (
                                      <div onClick={() => { setMediaTarget({ id: el.id, type: 'audio' }); setActiveModal('media_upload'); }} className="w-full h-16 bg-white/10 border-2 border-dashed border-white/20 rounded-xl flex items-center justify-center text-white/50 cursor-pointer hover:bg-white/20 hover:text-white transition-all mb-2">
                                        <span className="text-[10px] font-bold uppercase tracking-widest">+ Add Target Audio</span>
                                      </div>
                                   )}
                                   {el.data?.audioUrl && (
                                      <div className="relative group w-full mb-2">
                                        <audio src={el.data.audioUrl} controls controlsList="nodownload" onContextMenu={(e) => e.preventDefault()} className="w-full rounded-xl" />
                                        {!isPreviewMode && <button onClick={() => handleRemoveMedia(el.id, 'audio')} className="absolute -top-3 -right-3 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs shadow-md z-50">✕</button>}
                                      </div>
                                   )}
                                 </>
                               )}

                               {el.type === 'record_compare' && !isPreviewMode && (
                                  <div className="text-center text-white/40 text-[10px] uppercase font-bold tracking-widest mt-auto border-t border-white/10 pt-4">
                                    (Record Button renders in Bottom Dock)
                                  </div>
                               )}
                               
                               {el.type === 'short_answer' && el.data && (
                                  <>
                                    <div dangerouslySetInnerHTML={{ __html: el.data.questionHtml }} className="w-full break-words text-white mt-2" />
                                    <input type="text" disabled={!isPreviewMode} placeholder={isPreviewMode ? "Your answer..." : "Student answers here"} value={studentAnswers[el.id] || ''} onChange={(e) => setStudentAnswers(prev => ({...prev, [el.id]: e.target.value}))} className="w-full p-4 mt-auto bg-black/40 border border-white/20 rounded-xl text-white focus:ring-1 focus:ring-[#fcd34d] transition-all shadow-inner placeholder-white/30" />
                                  </>
                               )}

                               {el.type === 'fill_in_the_blank' && el.data && (
                                  <div className="w-full h-full flex flex-col justify-end mt-2">
                                     {renderFormattedText(el, isPreviewMode)}
                                  </div>
                               )}

                               {el.type === 'multiple_selection' && el.data && (
                                  <>
                                    {el.data.promptHtml && <div dangerouslySetInnerHTML={{ __html: el.data.promptHtml }} className="mb-4 mt-2" />}
                                    <div className="flex flex-col gap-2 mt-auto">
                                       {el.data.options?.map((opt) => {
                                          const isSelected = studentAnswers[`${el.id}_${opt.id}`] === true;
                                          return (
                                            <button key={opt.id} onClick={() => isPreviewMode && setStudentAnswers(prev => ({ ...prev, [`${el.id}_${opt.id}`]: !prev[`${el.id}_${opt.id}`] }))} style={{ backgroundColor: isSelected ? '#fcd34d' : el.data.optBoxColor, borderColor: isSelected ? '#ca8a04' : el.data.optLineColor, borderWidth: (el.data.optLineColor === 'transparent' && !isSelected) ? '0px' : '2px', borderStyle: 'solid', borderRadius: `${el.data.optBorderRadius}px` }} className="w-full p-4 text-left transition-all hover:scale-[1.02] active:scale-95 flex items-center">
                                               <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center shrink-0 ${isSelected ? 'border-[#08203e]' : 'border-white/40'}`}>
                                                 {isSelected && <div className="w-2.5 h-2.5 bg-[#08203e] rounded-full"></div>}
                                               </div>
                                               <div dangerouslySetInnerHTML={{__html: opt.html}} className="pointer-events-none" style={{ color: isSelected ? '#08203e' : 'inherit' }} />
                                            </button>
                                          )
                                       })}
                                    </div>
                                  </>
                               )}

                               {el.type === 'slider_bar' && el.data && (() => {
                                  const isVert = el.data.orientation === 'vertical';
                                  const opts = el.data.options || [];
                                  const maxIdx = Math.max(0, opts.length - 1);
                                  const currentIdx = studentAnswers[el.id] !== undefined ? parseInt(studentAnswers[el.id]) : Math.floor(maxIdx / 2);
                                  const activeOpt = opts[currentIdx] || {};
                                  const pct = maxIdx === 0 ? 50 : (currentIdx / maxIdx) * 100;
                                  return (
                                    <div className="w-full flex flex-col h-full min-h-[150px] justify-end relative pb-6 mt-4">
                                       <div className="absolute w-full h-full flex flex-col items-center justify-center">
                                         <div className="absolute flex items-center justify-center rounded-full shadow-inner overflow-hidden" style={{ backgroundColor: el.data.barColor, width: isVert ? `${el.data.barThickness}px` : '100%', height: isVert ? '100%' : `${el.data.barThickness}px` }}></div>
                                         <input type="range" min="0" max={maxIdx} step="1" disabled={!isPreviewMode} value={currentIdx} onChange={(e) => setStudentAnswers(prev => ({...prev, [el.id]: e.target.value}))} className="absolute custom-slider w-full h-full z-10" style={{ '--thumb-color': el.data.handleColor, transform: isVert ? 'rotate(-90deg)' : 'none', WebkitAppearance: 'none', background: 'transparent' }} />
                                         { !isVert && (
                                            <div className="absolute flex flex-col items-center transition-all duration-200 pointer-events-none z-0" style={{ left: `${pct}%`, bottom: 'calc(50% + 20px)', transform: 'translateX(-50%)' }}>
                                               <div className="bg-white text-[#08203e] px-5 py-2.5 rounded-xl shadow-xl font-black text-sm">{activeOpt.text}</div>
                                               <div className="w-0 h-0 border-solid" style={{ borderWidth: '8px 6px 0 6px', borderColor: 'white transparent transparent transparent' }} />
                                            </div>
                                         )}
                                       </div>
                                    </div>
                                  );
                               })()}
                            </div>
                          )}

                          {/* DRAG AND DROP - Upgraded to Glassmorphism */}
                          {el.type === 'drag_and_drop' && el.data && (
                            <div className="w-full max-w-7xl bg-white/5 backdrop-blur-xl rounded-3xl border border-white/20 p-6 md:p-8 flex flex-col gap-8 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                               <div className={`grid grid-cols-2 lg:grid-cols-${Math.min(el.data.items.filter(i=>i.imageUrl).length, 4)} gap-6 w-full`}>
                                 {el.data.items.map((item, idx) => item.imageUrl && (
                                   <div key={idx} className="flex flex-col items-center gap-4">
                                     <div className="w-full rounded-2xl overflow-hidden relative group">
                                       <PanZoomImage src={item.imageUrl} data={item} onSave={(d) => {
                                          if (isPreviewMode) return;
                                          const newItems = [...el.data.items];
                                          newItems[idx] = { ...newItems[idx], ...d };
                                          handleSaveData(el.id, { ...el.data, items: newItems });
                                       }} isPreview={isPreviewMode} wrapperClass="w-full aspect-[4/5] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)]" />
                                     </div>
                                     <div data-dnd-zone={`${el.id}_${idx}`} className="w-full min-h-[60px] border-2 border-dashed border-white/40 rounded-xl bg-white/5 backdrop-blur-md flex items-center justify-center transition-colors shadow-inner">
                                        {dndAnswers[`${el.id}_${idx}`] ? (
                                          <div onClick={() => setDndAnswers(prev => { const copy = {...prev}; delete copy[`${el.id}_${idx}`]; return copy; })} className="px-4 py-3 bg-[#fcd34d] text-[#08203e] rounded-xl font-bold text-sm shadow-md cursor-pointer w-full text-center hover:scale-105 active:scale-95 transition-transform truncate">
                                            {dndAnswers[`${el.id}_${idx}`]}
                                          </div>
                                        ) : <span className="text-white/40 text-[10px] uppercase font-bold tracking-widest">DROP HERE</span>}
                                     </div>
                                   </div>
                                 ))}
                               </div>
                               <div className="w-full bg-white/10 backdrop-blur-2xl p-6 md:p-8 rounded-3xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                                  <div className="text-center font-bold text-[#fcd34d] text-[10px] uppercase tracking-widest mb-4 drop-shadow-md">Word Bank</div>
                                  <div className="flex flex-wrap justify-center gap-4">
                                    {el.data.items.map((item, idx) => {
                                      if (!item.studentViewText) return null;
                                      const isUsed = Object.values(dndAnswers).includes(item.studentViewText);
                                      if (isUsed) return null;
                                      return (
                                        <div key={`bank-${idx}`} onPointerDown={(e) => { e.preventDefault(); setTouchDragState({ isDragging: true, text: item.studentViewText, x: e.clientX || (e.touches && e.touches[0].clientX), y: e.clientY || (e.touches && e.touches[0].clientY), sourceElId: el.id }); }} className="px-6 py-3.5 bg-white/10 hover:bg-[#fcd34d] hover:text-[#08203e] border border-white/20 rounded-xl text-white font-bold text-sm shadow-lg cursor-grab active:cursor-grabbing transition-colors touch-none">
                                          {item.studentViewText}
                                        </div>
                                      );
                                    })}
                                    {Object.keys(dndAnswers).length === el.data.items.filter(i=>i.imageUrl).length && <span className="text-green-400 font-bold text-sm tracking-widest uppercase py-3">All items placed!</span>}
                                  </div>
                               </div>
                            </div>
                          )}

                          {/* PUZZLES - Fully Playable in Editor */}
                          {(el.type === 'crossword' || el.type === 'word_search') && el.data && (
                             <div className="w-full max-w-7xl bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 flex flex-col md:flex-row gap-8 shadow-xl">
                                <div className="flex-1 flex flex-col gap-6 max-h-[400px] overflow-y-auto custom-scrollbar pr-4">
                                  {el.type === 'crossword' && (
                                    <>
                                      <h3 className="font-black text-[#fcd34d] text-lg uppercase tracking-widest border-b border-white/10 pb-3 drop-shadow-md">Prompts</h3>
                                      <div className="flex gap-8">
                                        <div className="flex-1 flex flex-col gap-4">
                                          <h4 className="text-[10px] font-bold text-white/50 uppercase tracking-widest border-b border-white/10 pb-1">Across</h4>
                                          {el.data.across?.map(a => <div key={`a-${a.num}`} className="text-sm text-white flex gap-3"><span className="font-black text-[#fcd34d]">{a.num}.</span><span className="font-medium opacity-90">{a.prompt}</span></div>)}
                                        </div>
                                        <div className="flex-1 flex flex-col gap-4">
                                          <h4 className="text-[10px] font-bold text-white/50 uppercase tracking-widest border-b border-white/10 pb-1">Down</h4>
                                          {el.data.down?.map(d => <div key={`d-${d.num}`} className="text-sm text-white flex gap-3"><span className="font-black text-[#fcd34d]">{d.num}.</span><span className="font-medium opacity-90">{d.prompt}</span></div>)}
                                        </div>
                                      </div>
                                    </>
                                  )}
                                  {el.type === 'word_search' && (
                                    <>
                                      <div dangerouslySetInnerHTML={{ __html: el.data.promptHtml }} className="w-full whitespace-pre-wrap break-words border-b border-white/10 pb-4 mb-2 drop-shadow-md text-lg" />
                                      <div className="flex gap-4">
                                        <ul className="flex-1 flex flex-col gap-3 list-none pl-2">
                                          {el.data.targetWords?.slice(0, Math.ceil(el.data.targetWords.length / 2)).map((w, i) => <li key={`w1-${i}`} className="text-sm font-bold text-white/90 tracking-widest flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-[#fcd34d] shadow-[0_0_8px_#fcd34d]"></span>{w}</li>)}
                                        </ul>
                                        <ul className="flex-1 flex flex-col gap-3 list-none pl-2">
                                          {el.data.targetWords?.slice(Math.ceil(el.data.targetWords.length / 2)).map((w, i) => <li key={`w2-${i}`} className="text-sm font-bold text-white/90 tracking-widest flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-[#fcd34d] shadow-[0_0_8px_#fcd34d]"></span>{w}</li>)}
                                        </ul>
                                      </div>
                                    </>
                                  )}
                                </div>
                                
                                <div className="flex-[2] bg-black/40 rounded-3xl border border-white/10 p-4 zoom-container flex justify-center items-center min-h-[400px] shadow-inner relative">
                                   {el.type === 'crossword' && (
                                     <div style={{ display: 'grid', gridTemplateColumns: `repeat(${el.data.grid[0]?.length || 1}, minmax(35px, 1fr))`, gap: '2px', width: 'fit-content', position: 'relative', zIndex: 10 }}>
                                        {el.data.grid.map((row, rIdx) => 
                                          row.map((cell, cIdx) => (
                                            <div key={`${rIdx}-${cIdx}`} className="relative aspect-square w-10 md:w-12">
                                              {cell ? (
                                                <div className="w-full h-full relative">
                                                  {cell.num && <span className="absolute top-1 left-1 text-[9px] font-black text-white/90 z-10 pointer-events-none drop-shadow-md">{cell.num}</span>}
                                                  <input 
                                                    type="text" maxLength={1} 
                                                    value={studentAnswers[`${el.id}_${rIdx}_${cIdx}`] || ''}
                                                    onChange={(e) => setStudentAnswers(prev => ({...prev, [`${el.id}_${rIdx}_${cIdx}`]: e.target.value.toUpperCase().replace(/[^A-Z]/g, '')}))}
                                                    style={{ color: el.data.textColor, fontSize: `${el.data.fontSize}px`, fontFamily: el.data.fontFamily, fontWeight: el.data.isBold ? 'bold' : 'normal' }}
                                                    className="w-full h-full text-center uppercase focus:outline-none focus:ring-4 focus:ring-[#fcd34d] transition shadow-inner rounded-sm bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold"
                                                  />
                                                </div>
                                              ) : <div className="w-full h-full bg-transparent" />}
                                            </div>
                                          ))
                                        )}
                                     </div>
                                   )}

                                   {el.type === 'word_search' && (
                                     <div style={{ display: 'grid', gridTemplateColumns: `repeat(${el.data.size || 10}, 1fr)`, borderWidth: '3px', borderStyle: 'solid', borderColor: el.data.lineColor, backgroundColor: el.data.cellColor }} className="shadow-2xl max-w-full max-h-full aspect-square w-full rounded-xl overflow-hidden relative z-10">
                                       {el.data.grid?.map((row, rIdx) => 
                                         row.map((char, cIdx) => {
                                            const cellId = `${el.id}_${rIdx}_${cIdx}`;
                                            const isSelected = (studentAnswers[`${el.id}_cells`] || []).includes(cellId);
                                            return (
                                              <div 
                                                key={cellId} 
                                                onClick={() => setStudentAnswers(prev => {
                                                   const current = prev[`${el.id}_cells`] || [];
                                                   return { ...prev, [`${el.id}_cells`]: current.includes(cellId) ? current.filter(c => c !== cellId) : [...current, cellId] };
                                                })}
                                                style={{ color: el.data.textColor, fontSize: `${el.data.fontSize}px`, fontFamily: el.data.fontFamily, fontWeight: el.data.isBold ? 'bold' : 'normal', borderRight: cIdx < (el.data.size - 1) ? `1px solid ${el.data.lineColor}` : 'none', borderBottom: rIdx < (el.data.size - 1) ? `1px solid ${el.data.lineColor}` : 'none', backgroundColor: isSelected ? 'rgba(252, 211, 77, 0.6)' : 'transparent', cursor: 'pointer' }}
                                                className="flex items-center justify-center transition-colors hover:bg-white/20 select-none"
                                              >
                                                {char}
                                              </div>
                                            )
                                         })
                                       )}
                                     </div>
                                   )}
                                </div>
                             </div>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {/* BOTTOM ACTION DOCK (Auto-Centered, Side-by-Side) */}
                  <div className="w-full mt-auto pt-16 pb-8 flex justify-center items-center gap-6 relative z-50 pointer-events-auto">
                    {dockElements.map(el => {
                      if (el.type === 'record_compare') return (
                         <div key={el.id} className="relative group">
                            {!isPreviewMode && <button onClick={() => handleDeleteElement(el.id)} className="absolute -top-3 -right-3 w-6 h-6 bg-red-500 text-white rounded-full text-[10px] opacity-0 group-hover:opacity-100 transition-opacity z-50">✕</button>}
                            <div onClick={() => handleRcClick(el.id)} className="bg-white/10 backdrop-blur-md border border-white/20 text-white font-black px-8 py-4 rounded-full shadow-xl flex items-center gap-3 cursor-pointer hover:bg-white/20 transition-all uppercase tracking-widest text-sm">
                               <div className={`w-3 h-3 rounded-full ${rcStates[el.id]?.phase === 'RECORDING' ? 'bg-red-500 animate-pulse' : 'bg-white'}`}></div>
                               {rcStates[el.id]?.phase === 'RECORDING' ? 'RECORDING' : rcStates[el.id]?.phase === 'HAS_RECORDING' ? 'COMPARE' : rcStates[el.id]?.phase === 'PLAYING' ? 'COMPARING' : 'RECORD'}
                            </div>
                         </div>
                      );
                      if (el.type === 'nav_button') return (
                         <div key={el.id} className="relative group">
                            {!isPreviewMode && <button onClick={() => { setEditingElementId(el.id); setActiveModal(el.type); }} className="absolute -top-3 -right-3 w-6 h-6 bg-blue-500 text-white rounded-full text-[10px] opacity-0 group-hover:opacity-100 transition-opacity z-50">✏️</button>}
                            <button className="bg-[#fcd34d] text-[#08203e] font-black px-10 py-4 rounded-full shadow-[0_0_20px_rgba(252,211,77,0.4)] uppercase tracking-widest hover:scale-105 active:scale-95 transition-transform text-sm">
                               {el.data?.buttonStyle === 'finish_pill' ? 'FINISH' : 'CONTINUE ⬇'}
                            </button>
                         </div>
                      );
                      return null;
                    })}
                  </div>

                </div>
              </React.Fragment>
            )
          })}
          
          {!isPreviewMode && (
            <div className="w-full flex flex-col items-center py-16 z-20 border-t border-white/10 mt-10">
              <button onClick={handleExpandWorkspace} className="w-16 h-16 rounded-full bg-white/5 border border-white/20 text-white flex items-center justify-center cursor-pointer hover:bg-[#fcd34d] hover:text-[#08203e] hover:border-transparent hover:scale-110 transition-all shadow-lg animate-bounce hover:animate-none">
                 <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </button>
              <span className="text-[10px] font-black text-white/50 font-montserrat uppercase tracking-widest mt-4 drop-shadow-md">ADD NEW SCREEN</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminHub;