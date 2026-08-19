import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './SupabaseClient';
import AdminCalendar from './AdminCalendar';
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
  const [mediaUrlInput, setMediaUrlInput] = useState('');

  const [rcStates, setRcStates] = useState({}); 
  const rcRecorders = useRef({}); 
  const rcChunks = useRef({});    
  const rcPlayers = useRef({});   

  const [studentAnswers, setStudentAnswers] = useState({});
  const [dndAnswers, setDndAnswers] = useState({}); 

  const [touchDragState, setTouchDragState] = useState({ isDragging: false, text: '', x: 0, y: 0, sourceElId: null });

  useEffect(() => {
    setSelectedUnit('');
  }, [selectedLevel]);

  useEffect(() => {
    if (contentType === 'Lesson') {
      setActiveScreenId(lessonScreens[0]);
    } else {
      setActiveScreenId(workbookScreens[0]);
    }
  }, [contentType, lessonScreens, workbookScreens]);

  const unitOptions = selectedLevel && LEVEL_UNIT_MAP[selectedLevel] 
    ? Array.from({ length: LEVEL_UNIT_MAP[selectedLevel].end - LEVEL_UNIT_MAP[selectedLevel].start + 1 }, (_, i) => `Unit ${LEVEL_UNIT_MAP[selectedLevel].start + i}`)
    : [];

  const toolOptions = contentType === 'Lesson' ? LESSON_TOOLS : WORKBOOK_TOOLS;

  const handleToolSelect = (tool) => {
    if (tool === 'Video') setActiveModal('video');
    else if (tool === 'Image') setActiveModal('image');
    else if (tool === 'Audio') setActiveModal('audio');
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
    let newElement = {
      id: `${type}_${Date.now()}`, type: type, screenId: activeScreenId, data: {}
    };

    if (type === 'text') {
      newElement.htmlContent = `<span style="font-family: Montserrat; font-size: 24px; font-weight: bold; color: #ffffff;">ACTIVITY TITLE HEADER</span><br/><span style="font-family: Montserrat; font-size: 14px; color: rgba(255,255,255,0.7);">Type your descriptor here. This text box auto resizes for height.</span>`;
    }
    
    setCanvasElements([...canvasElements, newElement]);
  };

  // -------------------------------------------------------------
  // CRITICAL FIX: Explicitly Defining Screen Deletion Logic
  // -------------------------------------------------------------
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
    const newElement = {
      id: `${activeModal}_${Date.now()}`, type: activeModal, url: mediaUrlInput, screenId: activeScreenId
    };
    setCanvasElements([...canvasElements, newElement]);
    setActiveModal(null); setMediaUrlInput(''); 
  };

  const handleSaveModal = (type, data) => {
    if (editingElementId) { 
      setCanvasElements(prev => prev.map(el => el.id === editingElementId ? { ...el, data } : el)); 
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
      ...el,
      id: `${el.type}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      screenId: newScreenId,
      data: el.data ? JSON.parse(JSON.stringify(el.data)) : undefined,
      htmlContent: el.htmlContent || ''
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

  useEffect(() => {
    if (!selectedLevel || !selectedUnit || !contentType) {
      setCanvasElements([]);
      return;
    }
    const loadContent = async () => {
      const { data } = await supabase.from('content_blueprints').select('*').eq('level', selectedLevel).eq('unit', selectedUnit).eq('content_type', contentType).maybeSingle();
      if (data && data.blueprint_data) {
        setCanvasElements(data.blueprint_data.elements || []);
        if (contentType === 'Lesson') {
          setLessonScreens(data.screens || [Date.now()]);
        } else {
          setWorkbookScreens(data.screens || [Date.now() + 1]);
        }
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
      `}</style>

      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-900/20 blur-[120px] rounded-full mix-blend-screen"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#fcd34d]/10 blur-[100px] rounded-full mix-blend-screen"></div>
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10 Q 25 20, 50 10 T 100 10' stroke='%23ffffff' fill='none' stroke-width='0.5'/%3E%3C/svg%3E")`, backgroundSize: '100px 20px' }}></div>
      </div>

      <FillInTheBlankModal isOpen={activeModal === 'fill_in_the_blank'} initialData={editingElementId ? canvasElements.find(e => e.id === editingElementId)?.data : {}} onSave={(d) => { saveSnapshot(); handleSaveModal('fill_in_the_blank', d); }} onCancel={() => { setActiveModal(null); setEditingElementId(null); }} />
      <ShapeConfigModal isOpen={activeModal === 'shape'} initialData={editingElementId ? canvasElements.find(e => e.id === editingElementId)?.data : {}} onSave={(d) => { saveSnapshot(); handleSaveModal('shape', d); }} onCancel={() => { setActiveModal(null); setEditingElementId(null); }} />
      <DragAndDropModal isOpen={activeModal === 'drag_and_drop'} initialData={editingElementId ? canvasElements.find(e => e.id === editingElementId)?.data : {}} onSave={(d) => { saveSnapshot(); handleSaveModal('drag_and_drop', d); }} onCancel={() => { setActiveModal(null); setEditingElementId(null); }} />
      <ShortAnswerModal isOpen={activeModal === 'short_answer'} initialData={editingElementId ? canvasElements.find(e => e.id === editingElementId)?.data : {}} onSave={(d) => { saveSnapshot(); handleSaveModal('short_answer', d); }} onCancel={() => { setActiveModal(null); setEditingElementId(null); }} />
      <MultipleSelectionModal isOpen={activeModal === 'multiple_selection'} initialData={editingElementId ? canvasElements.find(e => e.id === editingElementId)?.data : {}} onSave={(d) => { saveSnapshot(); handleSaveModal('multiple_selection', d); }} onCancel={() => { setActiveModal(null); setEditingElementId(null); }} />
      <SliderBarModal isOpen={activeModal === 'slider_bar'} initialData={editingElementId ? canvasElements.find(e => e.id === editingElementId)?.data : {}} onSave={(d) => { saveSnapshot(); handleSaveModal('slider_bar', d); }} onCancel={() => { setActiveModal(null); setEditingElementId(null); }} />
      <CrosswordModal isOpen={activeModal === 'crossword'} initialData={editingElementId ? canvasElements.find(e => e.id === editingElementId)?.data : {}} onSave={(d) => { saveSnapshot(); handleSaveModal('crossword', { ...d, ...generateCrosswordLayout(d.items) }); }} onCancel={() => { setActiveModal(null); setEditingElementId(null); }} />
      <WordSearchModal isOpen={activeModal === 'word_search'} initialData={editingElementId ? canvasElements.find(e => e.id === editingElementId)?.data : {}} onSave={(d) => { saveSnapshot(); handleSaveModal('word_search', { ...d, ...generateWordSearchGrid(d.words) }); }} onCancel={() => { setActiveModal(null); setEditingElementId(null); }} />
      <NavButtonModal isOpen={activeModal === 'nav_button'} initialData={editingElementId ? canvasElements.find(e => e.id === editingElementId)?.data : {}} onSave={(d) => { saveSnapshot(); handleSaveModal('nav_button', d); }} onCancel={() => { setActiveModal(null); setEditingElementId(null); }} />

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

      {(activeModal === 'video' || activeModal === 'image' || activeModal === 'audio') && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#070b19]/80 backdrop-blur-md px-4">
          <div className="bg-[#070b19]/40 backdrop-blur-xl rounded-[30px] p-8 max-w-lg w-full shadow-2xl border border-white/20 flex flex-col items-center animate-fade-in">
            <h2 className="text-xl font-black text-white uppercase tracking-widest mb-6">ADD {activeModal.toUpperCase()}</h2>
            <input type="text" placeholder="Paste URL here..." value={mediaUrlInput} onChange={(e) => setMediaUrlInput(e.target.value)} className="w-full bg-[#070b19] border border-white/20 rounded-xl px-5 py-4 text-sm text-white focus:outline-none focus:border-[#fcd34d] mb-8" />
            <div className="flex flex-row space-x-4 w-full justify-center">
              <button onClick={() => { setActiveModal(null); setMediaUrlInput(''); }} className="bg-white/5 border border-white/20 text-white/80 font-bold px-6 py-3 rounded-full text-xs w-1/2 hover:bg-white/10">CANCEL</button>
              <button onClick={handleAddMedia} className="bg-[#fcd34d] text-[#08203e] font-black px-6 py-3 rounded-full text-xs w-1/2 hover:scale-105">ADD TO CANVAS</button>
            </div>
          </div>
        </div>
      )}

      {!isPreviewMode && (
        <div className="relative z-20 w-full flex flex-col items-center pt-6 md:pt-10 px-4 md:px-8 pb-10">
          <div className="w-full max-w-6xl flex flex-col space-y-12">
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5 w-full px-6 max-w-7xl mx-auto">
                <AdminDropdown placeholder="Select Level" options={LEVEL_OPTIONS} value={selectedLevel} onChange={setSelectedLevel} />
                <AdminDropdown placeholder="Select Unit" options={unitOptions} value={selectedUnit} onChange={setSelectedUnit} />
                <AdminDropdown placeholder="Content type" options={['Lesson', 'Workbook']} value={contentType} onChange={setContentType} />
                <AdminDropdown placeholder="Tools" options={toolOptions} value="" onChange={handleToolSelect} />
              </div>
              <div className="flex flex-row justify-center items-center w-full mt-6 gap-8">
                <button onClick={() => setIsSaveModalOpen(true)} className="text-[#fcd34d] font-black tracking-widest uppercase hover:text-white transition-all text-xs">SAVE</button>
                <button onClick={handleUndoWorkspace} className="text-[#fcd34d] font-black tracking-widest uppercase hover:text-white transition-all text-xs">UNDO</button>
                <button onClick={handleDuplicateScreen} className="text-[#fcd34d] font-black tracking-widest uppercase hover:text-white transition-all text-xs">DUPLICATE</button>
                <button onClick={() => setIsPreviewMode(!isPreviewMode)} className="text-[#fcd34d] font-black tracking-widest uppercase hover:text-white transition-all text-xs">PREVIEW</button>
              </div>
            </div>
          )}
            
          <div className="w-full h-[180px] shrink-0 pointer-events-none"></div>
            
          {activeScreenArray.map((screenId, index) => {
            const screenElements = canvasElements.filter(el => el.screenId === screenId);
            const contentElements = screenElements.filter(el => !['nav_button', 'record_compare'].includes(el.type));
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

                {/* THE NEW RESPONSIVE TEMPLATE GRID */}
                <div 
                  id={`preview-screen-${screenId}`}
                  onClick={() => setActiveScreenId(screenId)}
                  className={`w-full relative flex flex-col p-6 mx-auto ${isPreviewMode ? 'max-w-6xl' : 'max-w-7xl border-x border-b-2 border-white/10 bg-white/5 rounded-b-3xl'}`}
                  style={{ minHeight: 'calc(100vh - 180px)' }}
                >
                  {!isPreviewMode && (
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteScreen(screenId); }} className="absolute top-4 right-4 z-[60] w-10 h-10 bg-red-500/10 hover:bg-red-500 border border-red-500/30 rounded-full flex items-center justify-center text-red-400 hover:text-white transition-all shadow-md">
                      <svg className="w-5 h-5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  )}
                  
                  {/* Cards Flex Container (Auto-Centers Odd Items) */}
                  <div className="flex flex-wrap justify-center gap-6 w-full relative z-10 flex-grow content-start pointer-events-auto">
                    {contentElements.map(el => {
                      const isCard = ['short_answer', 'multiple_selection', 'slider_bar', 'fill_in_the_blank'].includes(el.type);
                      
                      return (
                        <div key={el.id} className={`relative flex flex-col group ${isCard ? 'w-full md:w-[calc(50%-12px)]' : 'w-full flex-col items-center'}`}>
                          
                          {/* Admin Overlay Actions */}
                          {!isPreviewMode && (
                             <div className="absolute -top-4 -right-4 z-50 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                               <button onClick={() => { setEditingElementId(el.id); setActiveModal(el.type); }} className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg text-xs">✏️</button>
                               <button onClick={() => handleDeleteElement(el.id)} className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg text-xs">🗑️</button>
                             </div>
                          )}

                          {/* TEXT / HEADER */}
                          {el.type === 'text' && (
                            <div className="w-full bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 shadow-xl text-center mb-4">
                               <div id={`element-${el.id}`} contentEditable={!isPreviewMode} dangerouslySetInnerHTML={{__html: el.htmlContent}} onBlur={(e) => !isPreviewMode && saveSnapshot() && setCanvasElements(prev => prev.map(p => p.id === el.id ? {...p, htmlContent: e.target.innerHTML} : p))} className="rich-text-content focus:outline-none" />
                            </div>
                          )}

                          {/* VIDEO & MEDIA */}
                          {(el.type === 'video' || el.type === 'image') && (
                            <div className="w-full max-w-4xl bg-black/40 rounded-3xl overflow-hidden border border-white/20 shadow-2xl aspect-[4/5] md:aspect-video mb-4">
                               {el.type === 'video' ? <video src={el.url} controls className="w-full h-full object-cover" /> : <img src={el.url} className="w-full h-full object-contain" alt="Media" />}
                            </div>
                          )}

                          {/* SHORT ANSWER & FILL IN BLANK CARDS */}
                          {isCard && el.data && (
                            <div className="w-full bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 flex flex-col gap-4 shadow-xl h-full justify-between hover:bg-white/10 transition-colors">
                               {el.type === 'short_answer' && (
                                  <>
                                    <div dangerouslySetInnerHTML={{ __html: el.data.questionHtml }} className="w-full break-words text-white" />
                                    <input type="text" disabled={!isPreviewMode} placeholder={isPreviewMode ? "Your answer..." : "Student answers here"} className="w-full p-4 mt-auto bg-black/40 border border-white/20 rounded-xl text-white focus:ring-1 focus:ring-[#fcd34d] transition-all" />
                                  </>
                               )}
                               {el.type === 'fill_in_the_blank' && (
                                  <div className="w-full h-full flex items-center flex-wrap">
                                     {renderFormattedText(el, isPreviewMode)}
                                  </div>
                               )}
                               {el.type === 'multiple_selection' && (
                                  <>
                                    {el.data.promptType === 'image' && el.data.promptUrl ? <img src={el.data.promptUrl} className="w-full h-40 object-contain rounded-xl mb-4 bg-black/20" alt="Prompt" /> : <div dangerouslySetInnerHTML={{ __html: el.data.promptHtml }} className="mb-4" />}
                                    <div className="flex flex-col gap-2 mt-auto">
                                       {el.data.options.map((opt) => (
                                          <button key={opt.id} className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-left hover:bg-[#fcd34d] hover:text-[#08203e] transition-colors"><div dangerouslySetInnerHTML={{__html: opt.html}} className="pointer-events-none" /></button>
                                       ))}
                                    </div>
                                  </>
                               )}
                               {el.type === 'slider_bar' && (
                                  <div className="w-full flex flex-col items-center justify-center mt-auto pt-8 pb-4">
                                     <input type="range" min="0" max={(el.data.options?.length || 1) - 1} className="w-full custom-slider" />
                                  </div>
                               )}
                            </div>
                          )}

                          {/* DRAG AND DROP */}
                          {el.type === 'drag_and_drop' && el.data && (
                            <div className="w-full max-w-5xl bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 flex flex-col gap-8 shadow-xl">
                               <div className={`grid grid-cols-2 md:grid-cols-${Math.min(el.data.items.filter(i=>i.imageUrl).length, 4)} gap-4 w-full`}>
                                 {el.data.items.map((item, idx) => item.imageUrl && (
                                   <div key={idx} className="flex flex-col items-center gap-4">
                                     <div className="w-full aspect-square bg-black/20 rounded-2xl overflow-hidden border border-white/10"><img src={item.imageUrl} className="w-full h-full object-cover" alt="target" /></div>
                                     <div className="w-full h-16 border-2 border-dashed border-white/30 rounded-xl bg-black/20 flex items-center justify-center text-white/30 text-[10px] uppercase font-bold">Drop Zone</div>
                                   </div>
                                 ))}
                               </div>
                               <div className="w-full bg-black/40 p-4 rounded-2xl border border-white/10">
                                  <div className="text-center font-bold text-white/50 text-[10px] uppercase tracking-widest mb-4">Word Bank</div>
                                  <div className="flex flex-wrap justify-center gap-4">
                                    {el.data.items.map((item, idx) => item.studentViewText && (
                                      <div key={`bank-${idx}`} className="px-6 py-3 bg-white/10 border border-white/20 rounded-xl text-white font-bold text-sm shadow-md cursor-grab">{item.studentViewText}</div>
                                    ))}
                                  </div>
                               </div>
                            </div>
                          )}

                          {/* PUZZLES (Zoomable container) */}
                          {(el.type === 'crossword' || el.type === 'word_search') && el.data && (
                             <div className="w-full max-w-6xl bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 flex flex-col md:flex-row gap-8 shadow-xl">
                                <div className="flex-1 flex flex-col gap-4">
                                  <h3 className="font-bold text-[#fcd34d] uppercase tracking-widest border-b border-white/10 pb-2">Prompts</h3>
                                  <div className="flex gap-4">
                                     <div className="flex flex-col gap-2 text-sm text-white/80">List rendered here...</div>
                                  </div>
                                </div>
                                <div className="flex-[2] bg-black/40 rounded-2xl border border-white/10 p-4 zoom-container flex justify-center items-center">
                                   <div className="w-64 h-64 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center text-white/50 font-bold uppercase tracking-widest text-center">Interactive Grid<br/>(Visible in Student Player)</div>
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
                            <div className="bg-white/10 backdrop-blur-md border border-white/20 text-white font-black px-8 py-4 rounded-full shadow-xl flex items-center gap-3 cursor-pointer hover:bg-white/20 transition-all uppercase tracking-widest text-sm">
                               <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div> RECORD
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