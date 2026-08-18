import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './SupabaseClient';
import AdminCalendar from './AdminCalendar';
import { LEVEL_UNIT_MAP, LEVEL_OPTIONS, LESSON_TOOLS, WORKBOOK_TOOLS, RESIZE_HANDLES } from './constants/adminConfigs';
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
  // Application State
  const [activeTab, setActiveTab] = useState('CONTENT_EDITING');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [contentType, setContentType] = useState('Lesson');
  
  // Dropdown States
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');
  
  // Canvas & Blueprint State
  const [lessonScreens, setLessonScreens] = useState([1]); 
  const [workbookScreens, setWorkbookScreens] = useState(1); 
  const [canvasElements, setCanvasElements] = useState([]);
  const [canvasHistory, setCanvasHistory] = useState([]);
  const [activeScreenId, setActiveScreenId] = useState(1);

  const saveSnapshot = (elements = canvasElements) => {
    setCanvasHistory(prev => [...prev.slice(-29), JSON.parse(JSON.stringify(elements))]);
  };

  // Tool Modals State
  const [activeModal, setActiveModal] = useState(null); 
  const [editingElementId, setEditingElementId] = useState(null);
  const [mediaUrlInput, setMediaUrlInput] = useState('');

  // Universal Selection State
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [multiSelectedIds, setMultiSelectedIds] = useState([]);
  const [menuOpenId, setMenuOpenId] = useState(null);

  // Drag, Resize, and ROTATE Engine State
  const [draggingId, setDraggingId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const [resizingId, setResizingId] = useState(null);
  const [resizeStart, setResizeStart] = useState({ mouseX: 0, mouseY: 0, elX: 0, elY: 0, elW: 0, elH: 0, elImgX: 0, elImgY: 0, elImgW: 0, elImgH: 0, handle: '' });

  const [rotatingId, setRotatingId] = useState(null);
  const [rotationStart, setRotationStart] = useState({ centerX: 0, centerY: 0, initialMouseAngle: 0, initialRotation: 0 });

  // Inline Editing Engine State
  const [editingTextId, setEditingTextId] = useState(null);
  const [textDropdown, setTextDropdown] = useState(null); 

  // --- SMART SCORING & INTERACTION STATE ENGINE ---
  const [rcStates, setRcStates] = useState({}); 
  const [rcCycles, setRcCycles] = useState({}); 
  const rcRecorders = useRef({}); 
  const rcChunks = useRef({});    
  const rcPlayers = useRef({});   

  // Shared Input Tracking
  const [studentAnswers, setStudentAnswers] = useState({});
  const [totalLessonBlanks, setTotalLessonBlanks] = useState(0);

  // Drag & Drop tracking
  const [totalDndItems, setTotalDndItems] = useState(0); 
  const [dndAnswers, setDndAnswers] = useState({}); 
  const [draggedItem, setDraggedItem] = useState(null);
  const [touchDragState, setTouchDragState] = useState({ isDragging: false, text: '', x: 0, y: 0, sourceElId: null });

  const [screensPassed, setScreensPassed] = useState(new Set()); 

  // Global Preview Scores
  const [previewScores, setPreviewScores] = useState({
    listeningSpeaking: 100,
    grammar: 100,
    comprehension: 100,
    reading: 100
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (!isPreviewMode && !editingTextId) {
          e.preventDefault();
          document.getElementById('undo-btn')?.click(); 
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPreviewMode, editingTextId]);

  // Height Synchronization for Drag and Drop Grids
  useEffect(() => {
    const syncAllDnd = () => {
      canvasElements.filter(e => e.type === 'drag_and_drop').forEach(el => {
        const nodes = Array.from(document.querySelectorAll(`.dnd-sync-${el.id}`));
        if (!nodes.length) return;
        nodes.forEach(n => { n.style.height = 'auto'; n.style.minHeight = '48px'; });
        let maxH = 48;
        nodes.forEach(n => { if (n.offsetHeight > maxH) maxH = n.offsetHeight; });
        nodes.forEach(n => { n.style.height = `${maxH}px`; });
      });
    };
    syncAllDnd();
    window.addEventListener('resize', syncAllDnd);
    return () => window.removeEventListener('resize', syncAllDnd);
  }, [canvasElements, dndAnswers, isPreviewMode]);

  // Reset selected unit if the level changes
  useEffect(() => {
    setSelectedUnit('');
  }, [selectedLevel]);

  // Handle Preview Mode Toggling (Calculate Proportions & Reset Memory)
  useEffect(() => {
    if (!isPreviewMode) {
      Object.values(rcRecorders.current).forEach(rec => {
        if (rec && rec.state !== 'inactive') rec.stop();
      });
      Object.values(rcPlayers.current).forEach(player => {
        if (player) {
          player.pause();
          player.currentTime = 0;
        }
      });
      setRcStates({});
      setEditingTextId(null);
    } else {
      setPreviewScores({ listeningSpeaking: 100, grammar: 100, comprehension: 100, reading: 100 });
      setRcCycles({});
      setStudentAnswers({});
      setDndAnswers({});
      setDraggedItem(null);
      setTouchDragState({ isDragging: false, text: '', x: 0, y: 0, sourceElId: null });
      setScreensPassed(new Set());
      setEditingTextId(null);
      setSelectedElementId(null);
      
      let countedBlanks = 0;
      let countedDnd = 0;
      
      canvasElements.forEach(el => {
        if (el.type === 'fill_in_the_blank' && el.data?.templateText) {
          const lines = el.data.templateText.split('\n');
          lines.forEach(line => {
            const parts = line.split(/(_+)/);
            parts.forEach(part => {
              if (part.startsWith('_')) countedBlanks++;
            });
          });
        }
        if (el.type === 'short_answer' && el.data?.targetAnswer) countedBlanks++;
        if (el.type === 'crossword' && el.data?.grid) {
           el.data.grid.forEach(row => {
             row.forEach(cell => { if(cell && cell.char) countedBlanks++; });
           });
        }
        
        if (el.type === 'drag_and_drop' && el.data?.items) {
          el.data.items.forEach(item => { if (item.imageUrl && item.targetText) countedDnd++; });
        }
      });
      setTotalLessonBlanks(countedBlanks);
      setTotalDndItems(countedDnd);
    }
  }, [isPreviewMode, canvasElements]);

  useEffect(() => {
    if (!editingTextId) setTextDropdown(null);
  }, [editingTextId]);

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
    else console.log(`Tool selected: ${tool}`); 
  };

  const spawnInteractiveElement = (type) => {
    let newElement = {
      id: `${type}_${Date.now()}`, type: type, screenId: activeScreenId,
      x: 50, y: 50, width: 200, height: 100, rotation: 0, layer: 10 
    };

    if (type === 'record_compare') {
      newElement.width = 100; newElement.height = 100; newElement.url = '';
    } else if (type === 'text') {
      newElement.width = 350; newElement.height = 80;
      newElement.htmlContent = `<span style="font-family: Montserrat; font-size: 24px; color: #08203e;">Type your text here...</span>`;
    } else if (type === 'nav_button') { 
      newElement.width = 250; newElement.height = 60; 
    }
    
    setCanvasElements([...canvasElements, newElement]);
    if (type === 'text') setTimeout(() => setEditingTextId(newElement.id), 50);
  };

  const handleDuplicateElement = (id) => {
    const elementToDuplicate = canvasElements.find(el => el.id === id);
    if (!elementToDuplicate) return;
    
    // Safety check to grab live typed text if state hasn't synced yet
    let latestHtml = elementToDuplicate.htmlContent;
    if (elementToDuplicate.type === 'text') {
      const liveNode = document.querySelector(`#element-${id} .rich-text-content`);
      if (liveNode) latestHtml = liveNode.innerHTML;
    }

    saveSnapshot();
    const newElement = {
      ...elementToDuplicate,
      id: `${elementToDuplicate.type}_${Date.now()}`,
      x: elementToDuplicate.x + 30,
      y: elementToDuplicate.y + 30,
      layer: (elementToDuplicate.layer || 10) + 1,
      data: elementToDuplicate.data ? JSON.parse(JSON.stringify(elementToDuplicate.data)) : undefined,
      htmlContent: latestHtml || ''
    };
    
    setCanvasElements(prev => [...prev, newElement]);
  };

  const handleAddMedia = () => {
    if (!mediaUrlInput) return;
    let defaultWidth = 640; let defaultHeight = 360;
    if (activeModal === 'image') { defaultWidth = 400; defaultHeight = 400; } 
    else if (activeModal === 'audio') { defaultWidth = 350; defaultHeight = 80; }

    const newElement = {
      id: `${activeModal}_${Date.now()}`, type: activeModal, url: mediaUrlInput,
      screenId: activeScreenId, 
      x: 50, y: 50, width: defaultWidth, height: defaultHeight, rotation: 0, layer: 10,
      imgX: 0, imgY: 0, imgW: defaultWidth, imgH: defaultHeight
    };

    setCanvasElements([...canvasElements, newElement]);
    setActiveModal(null); setMediaUrlInput(''); 
  };

  const handleSaveFillInTheBlank = (data) => {
    if (editingElementId) { 
      setCanvasElements(prev => prev.map(el => el.id === editingElementId ? { ...el, data } : el)); 
    } else {
      const newElement = { 
        id: `fill_in_the_blank_${Date.now()}`, 
        type: 'fill_in_the_blank', 
        screenId: activeScreenId,
        x: 50, y: 50, width: 400, height: 150, rotation: 0, layer: 10, data: data 
      };
      setCanvasElements([...canvasElements, newElement]);
    }
    setActiveModal(null); 
    setEditingElementId(null);
  };

  const handleSaveShape = (data) => {
    if (editingElementId) { 
      setCanvasElements(prev => prev.map(el => el.id === editingElementId ? { ...el, data } : el)); 
    } else {
      const newElement = { 
        id: `shape_${Date.now()}`, 
        type: 'shape', 
        screenId: activeScreenId,
        x: 50, y: 50, width: 150, height: 150, rotation: 0, layer: 10, data: data 
      };
      setCanvasElements([...canvasElements, newElement]);
    }
    setActiveModal(null); 
    setEditingElementId(null);
  };

  const handleSaveDragAndDrop = (data) => {
    if (editingElementId) { setCanvasElements(prev => prev.map(el => el.id === editingElementId ? { ...el, data } : el)); } 
    else {
      const validItems = data.items.filter(i => i.imageUrl).length || 1;
      const newElement = { id: `drag_and_drop_${Date.now()}`, type: 'drag_and_drop', screenId: activeScreenId, x: 50, y: 50, width: Math.max(300, validItems * 200 + 40), height: 380, rotation: 0, layer: 10, data: data };
      setCanvasElements([...canvasElements, newElement]);
    }
    setActiveModal(null); setEditingElementId(null);
  };

  const handleSaveShortAnswer = (data) => {
    if (editingElementId) { setCanvasElements(prev => prev.map(el => el.id === editingElementId ? { ...el, data } : el)); } 
    else {
      const newElement = { id: `short_answer_${Date.now()}`, type: 'short_answer', screenId: activeScreenId, x: 50, y: 50, width: 400, height: 120, rotation: 0, layer: 10, data: data };
      setCanvasElements([...canvasElements, newElement]);
    }
    setActiveModal(null); setEditingElementId(null);
  };

  const handleSaveMultipleSelection = (data) => {
    if (editingElementId) { setCanvasElements(prev => prev.map(el => el.id === editingElementId ? { ...el, data } : el)); } 
    else {
      const newElement = { id: `multiple_selection_${Date.now()}`, type: 'multiple_selection', screenId: activeScreenId, x: 50, y: 50, width: 450, height: 250, rotation: 0, layer: 10, data: data };
      setCanvasElements([...canvasElements, newElement]);
    }
    setActiveModal(null); setEditingElementId(null);
  };

  const handleSaveSliderBar = (data) => {
    if (editingElementId) { setCanvasElements(prev => prev.map(el => el.id === editingElementId ? { ...el, data } : el)); } 
    else {
      const isVert = data.orientation === 'vertical';
      const newElement = { id: `slider_bar_${Date.now()}`, type: 'slider_bar', screenId: activeScreenId, x: 50, y: 50, width: isVert ? 100 : 300, height: isVert ? 300 : 100, rotation: 0, layer: 10, data: data };
      setCanvasElements([...canvasElements, newElement]);
    }
    setActiveModal(null); setEditingElementId(null);
  };

  const handleSaveCrossword = (data) => {
     const generatedData = { ...data, ...generateCrosswordLayout(data.items) };
     if (editingElementId) {
        setCanvasElements(prev => prev.map(el => el.id === editingElementId ? { ...el, data: generatedData } : el));
     } else {
        const newElement = { 
           id: `crossword_${Date.now()}`, type: 'crossword', screenId: activeScreenId, 
           x: 50, y: 50, width: 600, height: 400, rotation: 0, layer: 10, data: generatedData 
        };
        setCanvasElements([...canvasElements, newElement]);
     }
     setActiveModal(null); setEditingElementId(null);
  };

  const handleSaveWordSearch = (data) => {
     const generatedData = { ...data, ...generateWordSearchGrid(data.words) };
     if (editingElementId) {
        setCanvasElements(prev => prev.map(el => el.id === editingElementId ? { ...el, data: generatedData } : el));
     } else {
        const newElement = { 
           id: `word_search_${Date.now()}`, type: 'word_search', screenId: activeScreenId, 
           x: 50, y: 50, width: 600, height: 400, rotation: 0, layer: 10, data: generatedData 
        };
        setCanvasElements([...canvasElements, newElement]);
     }
     setActiveModal(null); setEditingElementId(null);
  };

  const handleSaveNavButton = (data) => {
    if (editingElementId) {
      setCanvasElements(prev => prev.map(el => el.id === editingElementId ? { ...el, data } : el));
    }
    setActiveModal(null); 
    setEditingElementId(null);
  };

  const handleGroupItems = () => {
    if (multiSelectedIds.length < 2) return;
    saveSnapshot();
    const newGroupId = `group_${Date.now()}`;
    setCanvasElements(prev => prev.map(el => multiSelectedIds.includes(el.id) ? { ...el, groupId: newGroupId } : el));
    setMultiSelectedIds([]);
    setMenuOpenId(null);
  };

  const handleSeparateItems = (groupId) => {
    saveSnapshot();
    setCanvasElements(prev => prev.map(el => el.groupId === groupId ? { ...el, groupId: null } : el));
    setMenuOpenId(null);
  };

  const handleDeleteElement = (id) => {
    saveSnapshot();
    setCanvasElements(canvasElements.filter(el => el.id !== id));
  };

  // --- PROPORTIONAL BATCH EVALUATION (TRIGGERED ON CONTINUE) ---
  const handlePreviewContinue = (currentScreenId, nextScreenId) => {
    if (!screensPassed.has(currentScreenId)) {
      let newLsScore = previewScores.listeningSpeaking;
      let newGrammarScore = previewScores.grammar;
      let newComprehensionScore = previewScores.comprehension;
      let newReadingScore = previewScores.reading;

      const blankPointWeight = totalLessonBlanks > 0 ? (100 / totalLessonBlanks) : 0;
      const dndPointWeight = totalDndItems > 0 ? (100 / totalDndItems) : 0;

      // 1. Evaluate Record & Compare
      const rcElementsOnScreen = canvasElements.filter(e => e.screenId === currentScreenId && e.type === 'record_compare');
      rcElementsOnScreen.forEach(rc => {
        if (!rcCycles[rc.id] || rcCycles[rc.id] === 0) {
          newLsScore = Math.max(0, newLsScore - 30); 
        }
      });

      // 2. Evaluate Fill in the Blank & Crossword (Grammar)
      const fitbElementsOnScreen = canvasElements.filter(e => e.screenId === currentScreenId && e.type === 'fill_in_the_blank');
      fitbElementsOnScreen.forEach(el => {
        const expectedAnswers = el.data?.answerText ? el.data.answerText.match(/"([^"]*)"/g)?.map(m => m.replace(/"/g, '')) || [] : [];
        let globalBlankIndex = 0; 
        
        const lines = el.data?.templateText?.split('\n') || [];
        lines.forEach(line => {
          const parts = line.split(/(_+)/);
          parts.forEach(part => {
            if (part.startsWith('_')) {
               const studentAns = studentAnswers[`${el.id}_${globalBlankIndex}`] || '';
               const expectedAns = expectedAnswers[globalBlankIndex] || '';
               if (studentAns !== expectedAns) newGrammarScore = Math.max(0, newGrammarScore - blankPointWeight);
               globalBlankIndex++;
            }
          });
        });
      });

      const cwElementsOnScreen = canvasElements.filter(e => e.screenId === currentScreenId && e.type === 'crossword');
      cwElementsOnScreen.forEach(el => {
         if (el.data?.grid) {
            el.data.grid.forEach((row, rIdx) => {
               row.forEach((cell, cIdx) => {
                  if (cell && cell.char) {
                     const studentAns = studentAnswers[`${el.id}_${rIdx}_${cIdx}`] || '';
                     if (studentAns.toUpperCase() !== cell.char.toUpperCase()) {
                        newGrammarScore = Math.max(0, newGrammarScore - blankPointWeight);
                     }
                  }
               });
            });
         }
      });

      // 3. Evaluate Short Answer (Grammar)
      const saElementsOnScreen = canvasElements.filter(e => e.screenId === currentScreenId && e.type === 'short_answer');
      saElementsOnScreen.forEach(el => {
        if (el.data?.targetAnswer) {
           const studentAns = studentAnswers[el.id] || '';
           const expectedAns = el.data.targetAnswer;
           if (studentAns.replace(/,/g, '').trim() !== expectedAns.replace(/,/g, '').trim()) {
              newGrammarScore = Math.max(0, newGrammarScore - blankPointWeight);
           }
        }
      });

      // 4. Evaluate Drag and Drop (Comprehension)
      const dndElementsOnScreen = canvasElements.filter(e => e.screenId === currentScreenId && e.type === 'drag_and_drop');
      dndElementsOnScreen.forEach(el => {
        el.data.items.forEach((item, index) => {
           if (item.imageUrl && item.targetText) {
             const studentAns = dndAnswers[`${el.id}_${index}`] || '';
             if (studentAns.trim() !== item.targetText.trim()) {
                newComprehensionScore = Math.max(0, newComprehensionScore - dndPointWeight);
             }
           }
        });
      });

      // 5. Evaluate Multiple Selection & Word Search (Reading)
      const msElementsOnScreen = canvasElements.filter(e => e.screenId === currentScreenId && e.type === 'multiple_selection');
      msElementsOnScreen.forEach(el => {
        if (el.data?.options) {
           el.data.options.forEach(opt => {
              const isSelected = studentAnswers[`${el.id}_${opt.id}`] || false;
              if (isSelected && !opt.isCorrect) {
                 newReadingScore = Math.max(0, newReadingScore - 10);
                 newComprehensionScore = Math.max(0, newComprehensionScore - 10);
              }
           });
        }
      });

      const wsElementsOnScreen = canvasElements.filter(e => e.screenId === currentScreenId && e.type === 'word_search');
      wsElementsOnScreen.forEach(el => {
         const selectedCells = studentAnswers[`${el.id}_cells`] || [];
         if (selectedCells.length === 0) {
            newReadingScore = Math.max(0, newReadingScore - 20); // Penalty for skipping word search
         }
      });

      // 6. Evaluate Slider Bar (Comprehension)
      const sbElementsOnScreen = canvasElements.filter(e => e.screenId === currentScreenId && e.type === 'slider_bar');
      sbElementsOnScreen.forEach(el => {
         if (el.data?.options) {
            const defaultIndex = Math.floor((el.data.options.length - 1) / 2);
            const selectedIdx = studentAnswers[el.id] !== undefined ? parseInt(studentAnswers[el.id]) : defaultIndex;
            if (!el.data.options[selectedIdx]?.isCorrect) {
               newComprehensionScore = Math.max(0, newComprehensionScore - 20);
            }
         }
      });

      setPreviewScores({
        listeningSpeaking: newLsScore,
        grammar: Math.round(newGrammarScore),
        comprehension: Math.round(newComprehensionScore),
        reading: Math.round(newReadingScore)
      });
      
      setScreensPassed(new Set([...screensPassed, currentScreenId]));
    }

    if (nextScreenId) {
      document.getElementById(`preview-screen-${nextScreenId}`)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // --- RECORD & COMPARE CLICK HANDLER ---
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
      } catch (err) { alert("Microphone access is required to use this tool."); }
    } 
    else if (currentState === 'RECORDING') {
      if (rcRecorders.current[id] && rcRecorders.current[id].state !== 'inactive') rcRecorders.current[id].stop();
    } 
    else if (currentState === 'HAS_RECORDING') {
      const audio = new Audio(rcStates[id].url);
      rcPlayers.current[id] = audio;
      audio.onended = () => {
        setRcStates(prev => ({ ...prev, [id]: { ...prev[id], phase: 'RETRY' } }));
        setRcCycles(prev => {
          const newCount = (prev[id] || 0) + 1;
          if (newCount > 2) setPreviewScores(s => ({ ...s, listeningSpeaking: Math.max(0, s.listeningSpeaking - 20) }));
          return { ...prev, [id]: newCount };
        });
      };
      audio.play();
      setRcStates(prev => ({ ...prev, [id]: { ...prev[id], phase: 'PLAYING' } }));
    }
    else if (currentState === 'PLAYING') {
      if (rcPlayers.current[id]) rcPlayers.current[id].pause();
      setRcStates(prev => ({ ...prev, [id]: { ...prev[id], phase: 'RETRY' } }));
      setRcCycles(prev => {
        const newCount = (prev[id] || 0) + 1;
        if (newCount > 2) setPreviewScores(s => ({ ...s, listeningSpeaking: Math.max(0, s.listeningSpeaking - 20) }));
        return { ...prev, [id]: newCount };
      });
    }
  };

  // --- RICH TEXT INLINE FORMATTER ENGINE ---
  const handleTextFormat = (command, value = null) => {
    if (command === 'fontSizePx') {
      document.execCommand('fontSize', false, '7');
      const fonts = document.querySelectorAll('font[size="7"]');
      fonts.forEach(f => { f.removeAttribute('size'); f.style.fontSize = `${value}px`; });
    } else {
      document.execCommand(command, false, value);
    }
  };

  const handleTextBlurSave = (id, newHtml) => {
    saveSnapshot();
    setCanvasElements(prev => prev.map(el => el.id === id ? { ...el, htmlContent: newHtml } : el));
  };

  // --- DRAG, RESIZE, AND ROTATE INIT ---
  const handleDragStart = (e, id, currentX, currentY) => {
    if (isPreviewMode || editingTextId) return;
    e.stopPropagation();
    saveSnapshot();
    const targetEl = canvasElements.find(el => el.id === id);
    let groupIds = [id];
    if (targetEl?.groupId) {
      groupIds = canvasElements.filter(el => el.groupId === targetEl.groupId).map(el => el.id);
    } else if (multiSelectedIds.includes(id)) {
      groupIds = multiSelectedIds;
    } else {
      setMultiSelectedIds([]);
    }

    setSelectedElementId(id);
    setMenuOpenId(null);
    setDraggingId(id);
    setDragOffset({ 
      startX: e.clientX, 
      startY: e.clientY, 
      items: canvasElements.filter(el => groupIds.includes(el.id)).map(el => ({ id: el.id, initX: el.x, initY: el.y }))
    });
  };

  const handleResizeStart = (e, el, handleDirection) => {
    if (isPreviewMode || editingTextId) return;
    e.stopPropagation();
    saveSnapshot();
    setSelectedElementId(el.id);
    setResizingId(el.id);
    setResizeStart({ 
      mouseX: e.clientX, mouseY: e.clientY, elX: el.x, elY: el.y, elW: el.width, elH: el.height, elImgX: el.imgX ?? 0, elImgY: el.imgY ?? 0, elImgW: el.imgW ?? el.width, elImgH: el.imgH ?? el.height, handle: handleDirection 
    });
  };

  const handleRotateStart = (e, el) => {
    if (isPreviewMode || editingTextId) return;
    e.stopPropagation();
    saveSnapshot();
    setSelectedElementId(el.id);
    const rect = document.getElementById(`element-${el.id}`).getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const initialMouseAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
    setRotatingId(el.id);
    setRotationStart({ centerX, centerY, initialMouseAngle, initialRotation: el.rotation || 0 });
  };

  // --- GLOBAL MATH ENGINE ---
  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      if (isPreviewMode) return;
      
     if (draggingId) {
        const deltaX = e.clientX - dragOffset.startX;
        const deltaY = e.clientY - dragOffset.startY;
        setCanvasElements(prev => prev.map(el => {
          const movingItem = dragOffset.items?.find(i => i.id === el.id);
          if (movingItem) {
            return { ...el, x: Math.max(0, movingItem.initX + deltaX), y: Math.max(0, movingItem.initY + deltaY) };
          }
          return el;
        }));
      }
      else if (resizingId) {
        const deltaX = e.clientX - resizeStart.mouseX;
        const deltaY = e.clientY - resizeStart.mouseY;
        
        setCanvasElements(prev => prev.map(el => {
          if (el.id === resizingId) {
            let { elX, elY, elW, elH, elImgX, elImgY, elImgW, elImgH, handle } = resizeStart;
            let newX = elX; let newY = elY; let newW = elW; let newH = elH; let newImgX = elImgX; let newImgY = elImgY; let newImgW = elImgW; let newImgH = elImgH;

            if (handle === 'e') { newW = elW + deltaX; } 
            else if (handle === 'w') { newW = elW - deltaX; newX = elX + deltaX; newImgX = elImgX - deltaX; } 
            else if (handle === 's') { newH = elH + deltaY; } 
            else if (handle === 'n') { newH = elH - deltaY; newY = elY + deltaY; newImgY = elImgY - deltaY; } 
            else {
              if (handle.includes('e')) newW = elW + deltaX;
              if (handle.includes('w')) { newW = elW - deltaX; newX = elX + deltaX; }
              if (handle.includes('s')) newH = elH + deltaY;
              if (handle.includes('n')) { newH = elH - deltaY; newY = elY + deltaY; }
              const scaleX = newW / elW; const scaleY = newH / elH;
              newImgW = elImgW * scaleX; newImgH = elImgH * scaleY; newImgX = elImgX * scaleX; newImgY = elImgY * scaleY;
            }

            if (el.type === 'record_compare') { newH = newW; }
            if (el.type === 'shape' && el.data?.shapeType === 'circle') { if (e.shiftKey) { const minMax = Math.max(newW, newH); newW = minMax; newH = minMax; } }

            const minW = el.type === 'audio' ? 250 : (el.type === 'record_compare' ? 80 : (el.type === 'fill_in_the_blank' ? 200 : (el.type === 'drag_and_drop' ? 300 : (el.type === 'short_answer' ? 250 : (el.type === 'multiple_selection' ? 300 : (el.type === 'slider_bar' ? 100 : (el.type === 'crossword' ? 300 : (el.type === 'word_search' ? 300 : 20))))))));
            const minH = el.type === 'audio' ? 80 : (el.type === 'record_compare' ? 80 : (el.type === 'fill_in_the_blank' ? 80 : (el.type === 'drag_and_drop' ? 150 : (el.type === 'short_answer' ? 80 : (el.type === 'multiple_selection' ? 150 : (el.type === 'slider_bar' ? 100 : (el.type === 'crossword' ? 300 : (el.type === 'word_search' ? 300 : 20))))))));

            if (newW < minW) { 
              if (handle.includes('w')) { const diff = elW - minW; newX = elX + diff; if (handle === 'w') newImgX = elImgX - diff; }
              newW = minW; 
              if (['nw', 'ne', 'sw', 'se'].includes(handle)) { const correctedScaleX = newW / elW; newImgW = elImgW * correctedScaleX; newImgX = elImgX * correctedScaleX; }
            }
            if (newH < minH) { 
              if (handle.includes('n')) { const diff = elH - minH; newY = elY + diff; if (handle === 'n') newImgY = elImgY - diff; }
              newH = minH; 
              if (['nw', 'ne', 'sw', 'se'].includes(handle)) { const correctedScaleY = newH / elH; newImgH = elImgH * correctedScaleY; newImgY = elImgY * correctedScaleY; }
            }

            return { ...el, x: newX, y: newY, width: newW, height: newH, imgX: newImgX, imgY: newImgY, imgW: newImgW, imgH: newImgH };
          }
          return el;
        }));
      }
      else if (rotatingId) {
        const { centerX, centerY, initialMouseAngle, initialRotation } = rotationStart;
        const currentMouseAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
        let angleDiff = currentMouseAngle - initialMouseAngle;
        let newRotation = initialRotation + (angleDiff * (180 / Math.PI));
        if (e.shiftKey) { newRotation = Math.round(newRotation / 45) * 45; }
        setCanvasElements(prev => prev.map(el => el.id === rotatingId ? { ...el, rotation: newRotation } : el));
      }
    };

    const handleGlobalMouseUp = () => { setDraggingId(null); setResizingId(null); setRotatingId(null); };

    if (draggingId || resizingId || rotatingId) {
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [draggingId, resizingId, rotatingId, dragOffset, resizeStart, rotationStart, isPreviewMode]);

  // --- MOBILE TOUCH DRAG ENGINE ---
  useEffect(() => {
    const handleTouchMove = (e) => {
      if (!touchDragState.isDragging) return;
      e.preventDefault(); 
      const touch = e.touches[0];
      setTouchDragState(prev => ({ ...prev, x: touch.clientX, y: touch.clientY }));
    };
    
    const handleTouchEnd = (e) => {
      if (!touchDragState.isDragging) return;
      const touch = e.changedTouches[0];
      const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);
      const zone = dropTarget?.closest('[data-dnd-zone]');
      
      if (zone) {
        const zoneId = zone.getAttribute('data-dnd-zone');
        setDndAnswers(prev => ({...prev, [zoneId]: touchDragState.text}));
      }
      setTouchDragState({ isDragging: false, text: '', x: 0, y: 0, sourceElId: null });
      document.body.style.overflow = ''; 
    };

    if (touchDragState.isDragging) {
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
    }
    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [touchDragState.isDragging, touchDragState.text]);

  const handleExpandWorkspace = () => {
    if (contentType === 'Lesson') setLessonScreens(prev => [...prev, prev.length + 1]);
    else setWorkbookScreens(prev => prev + 1);
  };

  const handleUndoWorkspace = () => {
    if (canvasHistory.length > 0) {
      const previousState = canvasHistory[canvasHistory.length - 1];
      setCanvasHistory(prev => prev.slice(0, -1));
      setCanvasElements(previousState);
    } else {
      if (contentType === 'Lesson' && lessonScreens.length > 1) setLessonScreens(prev => prev.slice(0, -1));
      else if (workbookScreens > 1) setWorkbookScreens(prev => prev - 1);
    }
  };

  const handleDuplicateScreen = () => {
    const newScreenId = (contentType === 'Lesson' ? lessonScreens.length : workbookScreens) + 1;
    
    if (contentType === 'Lesson') {
      setLessonScreens(prev => [...prev, newScreenId]);
    } else {
      setWorkbookScreens(prev => prev + 1);
    }

    const elementsToClone = canvasElements.filter(el => el.screenId === activeScreenId);
    const clonedElements = elementsToClone.map(el => ({
      ...el,
      id: `${el.type}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      screenId: newScreenId,
      data: el.data ? JSON.parse(JSON.stringify(el.data)) : undefined,
      htmlContent: el.htmlContent || ''
    }));

    setCanvasElements(prev => [...prev, ...clonedElements]);
    setActiveScreenId(newScreenId);
    setTimeout(() => {
      document.getElementById(`preview-screen-${newScreenId}`)?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  useEffect(() => {
    // If all dropdowns aren't selected yet, do nothing
    if (!selectedLevel || !selectedUnit || !contentType) {
      setCanvasElements([]);
      return;
    }

    const loadContent = async () => {
      // 1. Query Supabase for this specific master lesson
      const { data, error } = await supabase
        .from('content_blueprints')
        .select('*')
        .eq('level', selectedLevel)
        .eq('unit', selectedUnit)
        .eq('content_type', contentType)
        .maybeSingle();

      // 2. If it exists, load the data onto the canvas
      if (data && data.blueprint_data) {
        setCanvasElements(data.blueprint_data.elements || []);
        if (contentType === 'Lesson') setLessonScreens(data.screens || [1]);
        else setWorkbookScreens(data.screens || 1);
      } 
      // 3. If it doesn't exist, clear the canvas and show the message
      else {
        setCanvasElements([]);
        setLessonScreens([1]);
        setWorkbookScreens(1);
        window.alert("This file is still empty, ready to start working on it?");
      }
    };

    loadContent();
  }, [selectedLevel, selectedUnit, contentType]);

  const handleConfirmSave = async () => {
    if (!selectedLevel || !selectedUnit || !contentType) return alert("Please select a Level, Unit, and Content Type before saving.");
    setIsSaving(true);

    // 1. Force sync all live text directly from the screen into memory
    const syncedElements = canvasElements.map(el => {
      if (el.type === 'text') {
        const liveNode = document.querySelector(`#element-${el.id} .rich-text-content`);
        if (liveNode) {
          return { ...el, htmlContent: liveNode.innerHTML };
        }
      }
      return el;
    });

    // 2. Update the visual canvas just to be safe
    setCanvasElements(syncedElements);

    // 3. Send the fully synced elements to Supabase
    const payload = { 
      level: selectedLevel, 
      unit: selectedUnit, 
      content_type: contentType, 
      screens: contentType === 'Lesson' ? lessonScreens : workbookScreens, 
      blueprint_data: { elements: syncedElements }, 
      updated_at: new Date().toISOString() 
    };

    try {
      const { error } = await supabase.from('content_blueprints').upsert(payload, { onConflict: 'level,unit,content_type' });
      if (error) { alert("Failed to push changes. Check the console for details."); } 
      else { alert("Changes saved and pushed live successfully!"); }
    } catch (err) { 
      console.error(err); 
    } finally { 
      setIsSaving(false); 
      setIsSaveModalOpen(false); 
    }
  };

  // Helper for rendering Fill in the Blank parsed text
  const renderFormattedText = (el, isPreview) => {
    const data = el.data;
    if (!data || !data.templateText) return null;
    let globalBlankIndex = 0; 
    const lines = data.templateText.split('\n');

    return lines.map((line, lineIdx) => {
      const parts = line.split(/(_+)/);
      return (
        <div key={lineIdx} className="flex items-center flex-wrap gap-1 mb-2" style={{ minHeight: `${data.t_fontSize || 16}px` }}>
          {parts.map((part, partIdx) => {
            if (part.startsWith('_')) {
              const currentBlankIndex = globalBlankIndex++;
              return (
                <input key={partIdx} type="text" disabled={!isPreview} value={isPreview ? (studentAnswers[`${el.id}_${currentBlankIndex}`] || '') : ''} onChange={(e) => isPreview && setStudentAnswers(prev => ({...prev, [`${el.id}_${currentBlankIndex}`]: e.target.value}))} className="inline-block text-center focus:outline-none focus:ring-2 focus:ring-student-yellow transition mx-1" style={{ backgroundColor: data.a_boxColor, borderColor: data.a_lineColor, borderWidth: '2px', borderStyle: 'solid', borderRadius: `${data.a_borderRadius}px`, width: `${Math.max(part.length * 20, 40)}px`, fontSize: `${data.a_fontSize}px`, color: data.a_textColor, fontWeight: data.a_isBold ? 'bold' : 'normal', fontStyle: data.a_isItalic ? 'italic' : 'normal', textDecoration: data.a_isUnderline ? 'underline' : 'none', fontFamily: data.a_fontFamily }} />
              );
            }
            return <span key={partIdx} style={{ fontSize: `${data.t_fontSize}px`, color: data.t_textColor, fontWeight: data.t_isBold ? 'bold' : 'normal', fontStyle: data.t_isItalic ? 'italic' : 'normal', textDecoration: data.t_isUnderline ? 'underline' : 'none', fontFamily: data.t_fontFamily }}>{part}</span>;
          })}
        </div>
      );
    });
  };

  // Helper for generating custom Canvas shapes without SVG scaling distortion
  const renderShapeSVG = (data, width, height) => {
    const sw = parseInt(data.strokeWidth) || 0;
    const rd = parseInt(data.roundness) || 0;
    const w = Math.max(1, width); const h = Math.max(1, height);
    const effectiveStroke = data.strokeColor === 'transparent' && rd > 0 ? data.fillColor : data.strokeColor;
    const effectiveSW = data.strokeColor === 'transparent' && rd > 0 ? rd : sw;
    const commonProps = { fill: data.fillColor === 'transparent' ? 'none' : data.fillColor, stroke: effectiveStroke === 'transparent' ? 'none' : effectiveStroke, strokeWidth: effectiveSW, strokeLinejoin: rd > 0 ? 'round' : 'miter' };

    switch(data.shapeType) {
      case 'rect': return <rect x={sw/2} y={sw/2} width={Math.max(0, w - sw)} height={Math.max(0, h - sw)} rx={rd} {...commonProps} />;
      case 'circle': return <ellipse cx={w/2} cy={h/2} rx={Math.max(0, w/2 - sw/2)} ry={Math.max(0, h/2 - sw/2)} {...commonProps} />;
      case 'triangle': {
        const p = sw/2;
        if (rd > 0) {
           const r = Math.min(rd, w/3, h/3); const topX = w/2; const topY = p; const brX = w-p; const brY = h-p; const blX = p; const blY = h-p;
           const dx = w/2 - p; const dy = h - 2*p; const hyp = Math.sqrt(dx*dx + dy*dy); const prop = hyp > 0 ? r / hyp : 0;
           const A1x = topX - dx * prop; const A1y = topY + dy * prop; const A2x = topX + dx * prop; const A2y = topY + dy * prop; const B1x = brX - dx * prop; const B1y = brY - dy * prop; const B2x = brX - r; const B2y = brY; const C1x = blX + r; const C1y = blY; const C2x = blX + dx * prop; const C2y = blY - dy * prop;
           return ( <path d={`M ${A1x},${A1y} Q ${topX},${topY} ${A2x},${A2y} L ${B1x},${B1y} Q ${brX},${brY} ${B2x},${B2y} L ${C1x},${C1y} Q ${blX},${blY} ${C2x},${C2y} Z`} {...commonProps} /> );
        } else { return <polygon points={`${w/2},${p} ${w-p},${h-p} ${p},${h-p}`} {...commonProps} />; }
      }
      case 'arrow': return <polygon points={`${sw/2},${h*0.35} ${w*0.6},${h*0.35} ${w*0.6},${sw/2} ${w-sw/2},${h/2} ${w*0.6},${h-sw/2} ${w*0.6},${h*0.65} ${sw/2},${h*0.65}`} {...commonProps} />;
      case 'line': return <line x1={0} y1={h/2} x2={w} y2={h/2} stroke={data.strokeColor === 'transparent' ? data.fillColor : data.strokeColor} strokeWidth={sw} strokeLinecap={rd > 0 ? 'round' : 'square'} />;
      default: return null;
    }
  };

  const renderDndPillStyle = (data) => ({ backgroundColor: data.boxColor, borderColor: data.lineColor, borderWidth: '2px', borderStyle: 'solid', borderRadius: `${data.borderRadius}px`, fontSize: `${data.fontSize}px`, color: data.textColor, fontWeight: data.isBold ? 'bold' : 'normal', fontStyle: data.isItalic ? 'italic' : 'normal', textDecoration: data.isUnderline ? 'underline' : 'none', fontFamily: data.fontFamily, padding: '8px 12px', cursor: isPreviewMode ? 'grab' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', userSelect: 'none', touchAction: 'none', wordBreak: 'break-word', whiteSpace: 'normal', lineHeight: '1.2' });

  return (
    <div className={`relative min-h-screen w-full font-sans bg-[#eef5fc] overflow-y-auto overflow-x-hidden flex flex-col ${draggingId || resizingId || rotatingId ? 'select-none' : ''}`}>
      
      <style>{`
        .workspace-grid { background-image: linear-gradient(to right, rgba(8, 32, 62, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(8, 32, 62, 0.08) 1px, transparent 1px); background-size: 30px 30px; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; } .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #08203e; border-radius: 10px; } .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #eab308; }
        .element-drag-handle { cursor: grab; } .element-drag-handle:active { cursor: grabbing; }
        @keyframes subtle-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } } .animate-recording-blink { animation: subtle-blink 1.5s infinite ease-in-out; }
        .rich-text-content:focus { outline: 2px dashed rgba(234, 179, 8, 0.6); outline-offset: 4px; }
        input[type=range].custom-slider::-webkit-slider-thumb { -webkit-appearance: none; height: 24px; width: 24px; border-radius: 50%; background: var(--thumb-color); cursor: pointer; margin-top: -12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2); border: 2px solid white; }
        input[type=range].custom-slider::-moz-range-thumb { height: 24px; width: 24px; border-radius: 50%; background: var(--thumb-color); cursor: pointer; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2); border: 2px solid white; }
      `}</style>

      <div className="fixed inset-0 z-0 pointer-events-none">
        <img src="https://i.postimg.cc/PJbrcZdF/Agregar-un-subtitulo-(5).png" alt="Bubble Background" className="w-full h-full object-cover opacity-80" />
      </div>

      <FillInTheBlankModal isOpen={activeModal === 'fill_in_the_blank'} initialData={editingElementId ? canvasElements.find(e => e.id === editingElementId)?.data : {}} onSave={(d) => { saveSnapshot(); handleSaveFillInTheBlank(d); }} onCancel={() => { setActiveModal(null); setEditingElementId(null); }} />
      <ShapeConfigModal isOpen={activeModal === 'shape'} initialData={editingElementId ? canvasElements.find(e => e.id === editingElementId)?.data : {}} onSave={(d) => { saveSnapshot(); handleSaveShape(d); }} onCancel={() => { setActiveModal(null); setEditingElementId(null); }} />
      <DragAndDropModal isOpen={activeModal === 'drag_and_drop'} initialData={editingElementId ? canvasElements.find(e => e.id === editingElementId)?.data : {}} onSave={(d) => { saveSnapshot(); handleSaveDragAndDrop(d); }} onCancel={() => { setActiveModal(null); setEditingElementId(null); }} />
      <ShortAnswerModal isOpen={activeModal === 'short_answer'} initialData={editingElementId ? canvasElements.find(e => e.id === editingElementId)?.data : {}} onSave={(d) => { saveSnapshot(); handleSaveShortAnswer(d); }} onCancel={() => { setActiveModal(null); setEditingElementId(null); }} />
      <MultipleSelectionModal isOpen={activeModal === 'multiple_selection'} initialData={editingElementId ? canvasElements.find(e => e.id === editingElementId)?.data : {}} onSave={(d) => { saveSnapshot(); handleSaveMultipleSelection(d); }} onCancel={() => { setActiveModal(null); setEditingElementId(null); }} />
      <SliderBarModal isOpen={activeModal === 'slider_bar'} initialData={editingElementId ? canvasElements.find(e => e.id === editingElementId)?.data : {}} onSave={(d) => { saveSnapshot(); handleSaveSliderBar(d); }} onCancel={() => { setActiveModal(null); setEditingElementId(null); }} />
      <CrosswordModal isOpen={activeModal === 'crossword'} initialData={editingElementId ? canvasElements.find(e => e.id === editingElementId)?.data : {}} onSave={(d) => { saveSnapshot(); handleSaveCrossword(d); }} onCancel={() => { setActiveModal(null); setEditingElementId(null); }} />
      <WordSearchModal isOpen={activeModal === 'word_search'} initialData={editingElementId ? canvasElements.find(e => e.id === editingElementId)?.data : {}} onSave={(d) => { saveSnapshot(); handleSaveWordSearch(d); }} onCancel={() => { setActiveModal(null); setEditingElementId(null); }} />
      <NavButtonModal isOpen={activeModal === 'nav_button'} initialData={editingElementId ? canvasElements.find(e => e.id === editingElementId)?.data : {}} onSave={(d) => { saveSnapshot(); handleSaveNavButton(d); }} onCancel={() => { setActiveModal(null); setEditingElementId(null); }} />

      {isSaveModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-outloud-blue/20 backdrop-blur-sm px-4">
          <div className="bg-white/95 backdrop-blur-md rounded-[2rem] p-8 md:p-12 max-w-md w-full shadow-2xl border border-white/60 flex flex-col items-center text-center animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-black text-outloud-blue font-montserrat uppercase tracking-wide mb-4">COMMIT?</h2>
            <p className="text-gray-700 font-sans mb-8">Are you sure you want to save these changes and push this version live?</p>
            <div className="flex flex-row space-x-4 w-full justify-center">
              <button onClick={() => !isSaving && setIsSaveModalOpen(false)} disabled={isSaving} className="bg-transparent border-2 border-gray-300 text-gray-500 font-bold px-6 py-3 rounded-full text-xs md:text-sm uppercase tracking-wide transition-colors w-1/2 hover:border-gray-400 hover:text-gray-600 disabled:opacity-50">CANCEL</button>
              <button onClick={handleConfirmSave} disabled={isSaving} className="bg-outloud-blue text-white font-black px-6 py-3 rounded-full shadow-md text-xs md:text-sm uppercase tracking-wide transition-colors w-1/2 flex justify-center items-center hover:bg-[#06182e] disabled:opacity-70">{isSaving ? 'SAVING...' : 'PUSH LIVE'}</button>
            </div>
          </div>
        </div>
      )}

      {(activeModal === 'video' || activeModal === 'image' || activeModal === 'audio') && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-outloud-blue/30 backdrop-blur-md px-4">
          <div className="bg-white rounded-[2rem] p-8 max-w-lg w-full shadow-2xl border border-white/60 flex flex-col items-center animate-fade-in">
            <h2 className="text-2xl font-black text-outloud-blue font-montserrat uppercase tracking-wide mb-2">ADD {activeModal.toUpperCase()}</h2>
            <p className="text-sm text-gray-500 font-sans mb-6 text-center">Paste the secure URL below to generate the {activeModal} player/container on the canvas.</p>
            <input type="text" placeholder={`https://example.com/your-${activeModal}-file...`} value={mediaUrlInput} onChange={(e) => setMediaUrlInput(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-outloud-blue font-semibold focus:outline-none focus:ring-2 focus:ring-student-yellow transition-all mb-8" />
            <div className="flex flex-row space-x-4 w-full justify-center">
              <button onClick={() => { setActiveModal(null); setMediaUrlInput(''); }} className="bg-transparent border-2 border-gray-300 text-gray-500 font-bold px-6 py-3 rounded-full text-xs uppercase tracking-wide transition-colors w-1/2 hover:border-gray-400 hover:text-gray-600">CANCEL</button>
              <button onClick={handleAddMedia} className="bg-student-yellow text-outloud-blue font-black px-6 py-3 rounded-full shadow-md text-xs uppercase tracking-wide transition-colors w-1/2 hover:scale-105 active:scale-95">ADD TO CANVAS</button>
            </div>
          </div>
        </div>
      )}

      {isPreviewMode && (
        <>
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-white/95 backdrop-blur-md px-6 py-3 rounded-full shadow-2xl border border-gray-200 flex items-center gap-4 md:gap-6 animate-fade-in">
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">List/Speak</span>
              <span className={`text-lg font-black font-montserrat ${previewScores.listeningSpeaking === 100 ? 'text-green-500' : previewScores.listeningSpeaking < 50 ? 'text-red-500' : 'text-student-yellow'}`}>{previewScores.listeningSpeaking}%</span>
            </div>
            <div className="w-[1px] h-8 bg-gray-300"></div>
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Grammar</span>
              <span className={`text-lg font-black font-montserrat ${previewScores.grammar === 100 ? 'text-green-500' : previewScores.grammar < 50 ? 'text-red-500' : 'text-student-yellow'}`}>{previewScores.grammar}%</span>
            </div>
            <div className="w-[1px] h-8 bg-gray-300"></div>
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Comp.</span>
              <span className={`text-lg font-black font-montserrat ${previewScores.comprehension === 100 ? 'text-green-500' : previewScores.comprehension < 50 ? 'text-red-500' : 'text-student-yellow'}`}>{previewScores.comprehension}%</span>
            </div>
            <div className="w-[1px] h-8 bg-gray-300"></div>
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Reading</span>
              <span className={`text-lg font-black font-montserrat ${previewScores.reading === 100 ? 'text-green-500' : previewScores.reading < 50 ? 'text-red-500' : 'text-student-yellow'}`}>{previewScores.reading}%</span>
            </div>
          </div>
          <button onClick={() => setIsPreviewMode(false)} className="fixed top-6 right-6 z-[100] bg-red-600 text-white font-black font-montserrat px-6 py-3 rounded-full shadow-2xl hover:bg-red-700 transition-transform hover:scale-105 uppercase tracking-widest text-xs animate-fade-in">EXIT PREVIEW</button>
        </>
      )}

      {/* MOBILE GHOST DRAG ELEMENT */}
      {touchDragState.isDragging && (
         <div className="fixed z-[9999] pointer-events-none transform -translate-x-1/2 -translate-y-1/2 opacity-90 scale-105" style={{ left: touchDragState.x, top: touchDragState.y }}>
            <div style={renderDndPillStyle(canvasElements.find(c => c.id === touchDragState.sourceElId)?.data || {})}>{touchDragState.text}</div>
         </div>
      )}

      {!isPreviewMode && (
        <div className="relative z-20 w-full flex flex-col items-center pt-4 md:pt-8 px-4 md:px-8 bg-white/50 backdrop-blur-md border-b border-white/50 pb-8 shadow-[0_10px_30px_rgba(0,0,0,0.03)]">
          <div className="flex flex-row justify-between items-center w-full max-w-[90rem] mb-8">
            <div className="flex items-center">
              <img src="https://i.postimg.cc/fyvnv4XT/Diseno-sin-titulo-(14).png" alt="Outloud Logo" className="h-10 lg:h-12 object-contain" />
              <div className="mx-4 h-8 w-[2px] bg-outloud-blue opacity-40"></div>
              <span className="text-base lg:text-xl font-light text-outloud-blue font-montserrat whitespace-nowrap">Online Platform</span>
            </div>
          </div>

          <div className="w-full max-w-6xl flex flex-col space-y-10">
            <div className="bg-white/95 rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.05)] p-6 md:p-8 flex flex-col items-center w-full border border-white/60">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-outloud-blue font-montserrat uppercase tracking-wide mb-8 text-center">ADMIN EDITING HUB</h2>
              
              <div className="flex flex-col md:flex-row items-center justify-center w-full gap-4 md:gap-6">
                <button 
                  onClick={() => setActiveTab('CONTENT_EDITING')}
                  className={`flex-1 max-w-[280px] w-full py-3 px-2 rounded-full text-xs md:text-sm uppercase tracking-wide transition-all text-center truncate ${activeTab === 'CONTENT_EDITING' ? 'bg-student-yellow text-outloud-blue font-black border-none shadow-md active:scale-95' : 'bg-transparent border-[1.5px] border-dashed border-outloud-blue text-outloud-blue font-bold hover:bg-[#e6f0f9]'}`}
                >
                  CONTENT EDITING TOOLS
                </button>
                <button 
                  onClick={() => setActiveTab('CUSTOMER_MANAGEMENT')}
                  className={`flex-1 max-w-[280px] w-full py-3 px-2 rounded-full text-xs md:text-sm uppercase tracking-wide transition-all text-center truncate ${activeTab === 'CUSTOMER_MANAGEMENT' ? 'bg-student-yellow text-outloud-blue font-black border-none shadow-md active:scale-95' : 'bg-transparent border-[1.5px] border-dashed border-outloud-blue text-outloud-blue font-bold hover:bg-[#e6f0f9]'}`}
                >
                  CUSTOMER MANAGEMENT
                </button>
                <button 
                  onClick={() => setActiveTab('MASTER_SETTINGS')}
                  className={`flex-1 max-w-[280px] w-full py-3 px-2 rounded-full text-xs md:text-sm uppercase tracking-wide transition-all text-center truncate ${activeTab === 'MASTER_SETTINGS' ? 'bg-student-yellow text-outloud-blue font-black border-none shadow-md active:scale-95' : 'bg-transparent border-[1.5px] border-dashed border-outloud-blue text-outloud-blue font-bold hover:bg-[#e6f0f9]'}`}
                >
                  MASTER SETTINGS
                </button>
                <button 
                  onClick={() => setActiveTab('CALENDAR')}
                  className={`flex-1 max-w-[280px] w-full py-3 px-2 rounded-full text-xs md:text-sm uppercase tracking-wide transition-all text-center truncate ${activeTab === 'CALENDAR' ? 'bg-student-yellow text-outloud-blue font-black border-none shadow-md active:scale-95' : 'bg-transparent border-[1.5px] border-dashed border-outloud-blue text-outloud-blue font-bold hover:bg-[#e6f0f9]'}`}
                >
                  SESSION CALENDAR
                </button>
              </div>
            </div>

            {activeTab === 'CUSTOMER_MANAGEMENT' && <CustomerManagement supabase={supabase} />}
            {activeTab === 'MASTER_SETTINGS' && <MasterSettings supabase={supabase} />}
            {activeTab === 'CALENDAR' && <AdminCalendar supabase={supabase}/>}
          </div>
        </div>
      )}

      {activeTab === 'CONTENT_EDITING' && (
        <>
          <div className="relative z-10 flex flex-col items-center w-full flex-grow">
                        {activeTab === 'CONTENT_EDITING' && (
            <div className="fixed top-0 left-0 w-full z-[150] bg-white/95 backdrop-blur-md pt-6 pb-4 border-b border-gray-200 shadow-md">
                <h3 className="text-lg md:text-xl font-black text-outloud-blue font-montserrat uppercase mb-6 tracking-wide">CONTENT MANAGEMENT</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                  <AdminDropdown placeholder="Select Level" options={LEVEL_OPTIONS} value={selectedLevel} onChange={setSelectedLevel} />
                  <AdminDropdown placeholder={selectedLevel ? "Select Unit" : "Select Level First"} options={unitOptions} value={selectedUnit} onChange={setSelectedUnit} />
                  <AdminDropdown placeholder="Content type" options={['Lesson', 'Workbook']} value={contentType} onChange={setContentType} />
                  <AdminDropdown placeholder="Tools" options={toolOptions} value="" onChange={handleToolSelect} />
                </div>

                <div className="flex flex-row justify-center items-center w-full mt-8 gap-8 md:gap-12">
                  <div className="flex items-center gap-8 md:gap-16">
                    <button onClick={() => setIsSaveModalOpen(true)} className="text-outloud-blue font-black tracking-widest uppercase hover:opacity-70 transition-opacity">SAVE</button>
                  <button id="undo-btn" onClick={handleUndoWorkspace} className="text-outloud-blue font-black tracking-widest uppercase hover:opacity-70 transition-opacity" title="Undo Last Action (Ctrl+Z)">UNDO</button>
                    <button onClick={handleDuplicateScreen} className="text-outloud-blue font-black tracking-widest uppercase hover:opacity-70 transition-opacity" title="Duplicate current active screen">DUPLICATE</button>
                    <button onClick={() => setIsPreviewMode(true)} className="text-outloud-blue font-black tracking-widest uppercase hover:opacity-70 transition-opacity">PREVIEW</button>
                  </div>
                  <div className="h-6 w-[2px] bg-outloud-blue opacity-20"></div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => { if(selectedElementId) setCanvasElements(prev => prev.map(el => el.id === selectedElementId ? {...el, layer: (el.layer || 10) + 1} : el)); }} disabled={!selectedElementId} className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-outloud-blue hover:bg-student-yellow transition disabled:opacity-50 disabled:shadow-none" title="Bring Forward">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>
                    </button>
                    <button onClick={() => { if(selectedElementId) setCanvasElements(prev => prev.map(el => el.id === selectedElementId ? {...el, layer: (el.layer || 10) - 1} : el)); }} disabled={!selectedElementId} className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-outloud-blue hover:bg-student-yellow transition disabled:opacity-50 disabled:shadow-none" title="Send Backward">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            )}
            

<div className="w-full h-[220px] shrink-0 pointer-events-none"></div>
            {(contentType === 'Lesson' ? lessonScreens : workbookScreens > 0 ? Array.from({length: workbookScreens}, (_, i) => i + 1) : []).map((screenId, index) => (
              <React.Fragment key={screenId}>
                {index > 0 && !isPreviewMode && (
                  <div className="w-full flex items-center justify-center py-6 bg-[#eef5fc] z-20 relative shadow-inner">
                    <div className="px-8 py-2 bg-outloud-blue/10 border border-outloud-blue/20 rounded-xl text-outloud-blue font-black tracking-widest uppercase text-sm">
                      --- SCREEN {screenId} ---
                    </div>
                  </div>
                )}

<div 
                  id={`preview-screen-${screenId}`}
                  onClick={() => setActiveScreenId(screenId)}
                  onPointerDown={(e) => { if (e.target.id === `preview-screen-${screenId}`) setSelectedElementId(null); }}
                  className={`w-full relative overflow-hidden flex flex-col ${isPreviewMode ? '' : 'workspace-grid border-b-2 border-outloud-blue/20'}`}
                  style={{ minHeight: '100vh' }}
                >
                  {!isPreviewMode && index > 0 && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteScreen(screenId); }}
                      className="absolute top-6 right-6 z-[60] w-12 h-12 bg-red-50 hover:bg-red-100 border-2 border-red-200 rounded-full flex items-center justify-center text-red-500 hover:text-red-600 transition shadow-sm cursor-pointer"
                      title="Delete Screen"
                    >
                      <svg className="w-6 h-6 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  )}
                  <div className="flex-grow relative pointer-events-none" style={{ pointerEvents: 'auto' }}>
                    {canvasElements.filter(el => el.screenId === screenId).map(el => {
                      
                      const rcPhase = rcStates[el.id]?.phase || 'IDLE';
                      let rcText = 'RECORD'; let rcTextColor = 'text-outloud-blue'; let rcAnimation = '';
                      if (rcPhase === 'RECORDING') { rcText = 'RECORDING'; rcTextColor = 'text-red-600'; rcAnimation = 'animate-recording-blink'; } 
                      else if (rcPhase === 'HAS_RECORDING') { rcText = 'COMPARE'; } 
                      else if (rcPhase === 'PLAYING') { rcText = 'COMPARING'; rcTextColor = 'text-green-500'; } 
                      else if (rcPhase === 'RETRY') { rcText = 'RETRY'; }

                    const isTool = !['fill_in_the_blank', 'shape', 'text', 'drag_and_drop', 'short_answer', 'multiple_selection', 'slider_bar', 'crossword', 'word_search', 'nav_button'].includes(el.type);

                      return (
                        <div 
                          id={`element-${el.id}`} key={el.id}
                         onMouseDown={(e) => {
                            if (!isPreviewMode) {
                              if (e.shiftKey) { setMultiSelectedIds(prev => prev.includes(el.id) ? prev.filter(id => id !== el.id) : [...prev, el.id]); } 
                              else { setSelectedElementId(el.id); if (!multiSelectedIds.includes(el.id)) setMultiSelectedIds([]); setMenuOpenId(null); }
                            }
                          }}
                          style={{ position: 'absolute', left: `${el.x}px`, top: `${el.y}px`, width: `${el.width}px`, height: `${el.height}px`, transform: `rotate(${el.rotation || 0}deg)`, zIndex: (editingTextId === el.id || draggingId === el.id || resizingId === el.id || rotatingId === el.id || menuOpenId === el.id) ? 999 : (el.layer || 10) }}
                          className={`group ${!isPreviewMode && isTool ? (selectedElementId === el.id || multiSelectedIds.includes(el.id) ? 'ring-4 ring-student-yellow shadow-xl rounded-2xl' : 'hover:ring-4 ring-student-yellow ring-opacity-50 rounded-2xl transition-shadow') : ''}`}
                        >
                          {/* Standard Drag Handle */}
                          {!isPreviewMode && isTool && (
                            <div className={`absolute top-0 left-0 w-full bg-outloud-blue/90 backdrop-blur-sm text-white rounded-t-xl h-10 flex justify-between items-center px-4 element-drag-handle ${selectedElementId === el.id ? 'opacity-100' : 'group-hover:opacity-100 opacity-0'} transition-opacity shadow-lg z-[60]`} onPointerDown={(e) => handleDragStart(e, el.x, el.y)}>
                              <span className="text-[10px] font-bold font-montserrat tracking-widest">DRAG TO MOVE</span>
                              <div className="flex items-center gap-2">
                                 {!['video', 'audio'].includes(el.type) && <button onPointerDown={(e) => { e.stopPropagation(); handleDuplicateElement(el.id); }} className="bg-white/20 hover:bg-white/30 p-1.5 rounded-md transition-colors cursor-pointer" title="Duplicate"><span role="img" aria-label="duplicate" className="text-xs pointer-events-none">📋</span></button>}
                                 <button onPointerDown={(e) => { e.stopPropagation(); handleDeleteElement(el.id); }} className="bg-red-500 hover:bg-red-600 p-1.5 rounded-md transition-colors cursor-pointer" title="Delete"><svg className="w-3 h-3 text-white pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg></button>
                              </div>
                            </div>
                          )}
                          
                          {el.type === 'video' && <div className={`w-full h-full bg-black rounded-2xl overflow-hidden shadow-2xl border-4 ${!isPreviewMode ? 'border-outloud-blue/20' : 'border-transparent'}`}><video src={el.url} controls className="w-full h-full object-cover" preload="metadata" /></div>}
                          {el.type === 'image' && <div className={`w-full h-full bg-transparent overflow-hidden ${!isPreviewMode ? 'border-4 border-outloud-blue/20' : ''}`} style={{ borderRadius: '1rem', position: 'relative' }}><img src={el.url} alt="Canvas element" draggable={false} style={{ position: 'absolute', left: `${el.imgX ?? 0}px`, top: `${el.imgY ?? 0}px`, width: `${el.imgW ?? el.width}px`, height: `${el.imgH ?? el.height}px`, maxWidth: 'none', maxHeight: 'none' }} /></div>}
                          {el.type === 'audio' && <div className={`w-full h-full bg-white/80 backdrop-blur-md rounded-2xl shadow-xl flex items-center justify-center px-4 border-4 ${!isPreviewMode ? 'border-outloud-blue/20' : 'border-white/50'}`}><audio src={el.url} controls className="w-full" preload="metadata" /></div>}

                          {el.type === 'record_compare' && (
                            <div className={`w-full h-full flex flex-col items-center justify-center transition-all ${isPreviewMode ? 'cursor-pointer hover:scale-105 active:scale-95' : 'opacity-80'}`} onClick={() => isPreviewMode && handleRcClick(el.id)}>
                              <div className={`w-full h-full rounded-full shadow-2xl flex items-center justify-center transition-colors duration-300 border-4 ${rcPhase === 'RECORDING' ? 'bg-red-600 border-red-300' : rcPhase === 'PLAYING' ? 'bg-green-500 border-green-300' : 'bg-outloud-blue border-transparent'}`}>
                                {(rcPhase === 'IDLE' || rcPhase === 'RECORDING') && (<svg className="w-1/2 h-1/2 text-white pointer-events-none" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>)}
                                {(rcPhase === 'HAS_RECORDING' || rcPhase === 'PLAYING') && (<svg className="w-1/2 h-1/2 text-white pointer-events-none" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/></svg>)}
                                {rcPhase === 'RETRY' && (<svg className="w-1/2 h-1/2 text-white pointer-events-none" fill="currentColor" viewBox="0 0 24 24"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>)}
                              </div>
                              <span className={`absolute -bottom-8 font-montserrat font-black tracking-widest text-xs whitespace-nowrap ${rcTextColor} ${rcAnimation}`}>{rcText}</span>
                            </div>
                          )}

                          {el.type === 'shape' && (
                            <div className={`w-full h-full relative ${selectedElementId === el.id && !isPreviewMode ? 'ring-2 ring-student-yellow' : ''}`} style={{ opacity: (el.data.opacity || 100) / 100 }}>
                              <svg width={el.width} height={el.height} style={{overflow: 'visible'}}>
                                {renderShapeSVG(el.data, el.width, el.height)}
                              </svg>
                            </div>
                          )}

                          {el.type === 'fill_in_the_blank' && (
                            <div className={`w-full h-full p-4 relative ${selectedElementId === el.id && !isPreviewMode ? 'ring-2 ring-student-yellow rounded-xl' : ''}`} style={{ backgroundColor: el.data.t_boxColor, borderColor: el.data.t_lineColor, borderWidth: '2px', borderStyle: 'solid', borderRadius: `${el.data.t_borderRadius}px` }}>
                              {renderFormattedText(el, isPreviewMode)}
                            </div>
                          )}

                          {el.type === 'short_answer' && el.data && (
                            <div className={`w-full h-full p-4 flex flex-col gap-3 relative ${selectedElementId === el.id && !isPreviewMode ? 'ring-2 ring-student-yellow rounded-xl' : ''}`}>
                               <div dangerouslySetInnerHTML={{ __html: el.data.questionHtml }} className="w-full whitespace-pre-wrap word-break" />
                               <input type="text" disabled={!isPreviewMode} placeholder={isPreviewMode ? "" : "Student answer box..."} value={isPreviewMode ? (studentAnswers[el.id] || '') : ''} onChange={(e) => isPreviewMode && setStudentAnswers(prev => ({...prev, [el.id]: e.target.value}))} style={{ backgroundColor: el.data.boxColor === 'transparent' ? 'transparent' : el.data.boxColor, borderColor: el.data.lineColor === 'transparent' ? 'transparent' : el.data.lineColor, borderWidth: el.data.lineColor === 'transparent' ? '0px' : '2px', borderStyle: 'solid', borderRadius: `${el.data.borderRadius}px`, color: el.data.textColor, fontSize: `${el.data.fontSize}px`, fontFamily: el.data.fontFamily, padding: '8px 12px', width: '100%', outline: 'none' }} className={!isPreviewMode ? 'pointer-events-none' : 'focus:ring-2 focus:ring-student-yellow transition'} />
                            </div>
                          )}

                          {el.type === 'multiple_selection' && el.data && (
                            <div className={`w-full h-full flex flex-col p-4 relative ${selectedElementId === el.id && !isPreviewMode ? 'ring-2 ring-student-yellow rounded-xl' : ''}`} style={{ backgroundColor: 'transparent' }}>
                               <div className="mb-6 flex-shrink-0 flex justify-center items-center w-full">
                                  {el.data.promptType === 'image' && el.data.promptUrl ? (
                                     <div className="w-full max-h-48 overflow-hidden flex justify-center rounded-xl shadow-sm border border-gray-200"><img src={el.data.promptUrl} alt="Prompt" className="w-full h-full object-contain bg-white" /></div>
                                  ) : <div dangerouslySetInnerHTML={{ __html: el.data.promptHtml }} className="w-full whitespace-pre-wrap break-words text-center" />}
                               </div>
                               <div className="flex-grow grid grid-cols-2 gap-4 auto-rows-fr">
                                  {el.data.options.map((opt) => {
                                     const isSelected = isPreviewMode && (studentAnswers[`${el.id}_${opt.id}`] === true);
                                     return (
                                        <div key={opt.id} onClick={() => { if (isPreviewMode) { setStudentAnswers(prev => ({ ...prev, [`${el.id}_${opt.id}`]: !prev[`${el.id}_${opt.id}`] })); } }} style={{ backgroundColor: isSelected ? '#eab308' : (el.data.optBoxColor === 'transparent' ? 'transparent' : el.data.optBoxColor), borderColor: isSelected ? '#ca8a04' : (el.data.optLineColor === 'transparent' ? 'transparent' : el.data.optLineColor), borderWidth: (el.data.optLineColor === 'transparent' && !isSelected) ? '0px' : '2px', borderStyle: 'solid', borderRadius: `${el.data.optBorderRadius}px`, cursor: isPreviewMode ? 'pointer' : 'default', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }} className={`transition-all ${isPreviewMode ? 'hover:scale-[1.02] active:scale-95 shadow-sm' : ''}`}>
                                           <div dangerouslySetInnerHTML={{ __html: opt.html }} className="pointer-events-none w-full whitespace-pre-wrap break-words" />
                                        </div>
                                     )
                                  })}
                               </div>
                            </div>
                          )}

                          {el.type === 'slider_bar' && el.data && (() => {
                             const isVert = el.data.orientation === 'vertical';
                             const opts = el.data.options || [];
                             const maxIdx = Math.max(0, opts.length - 1);
                             const defaultIdx = Math.floor(maxIdx / 2);
                             const currentIdx = studentAnswers[el.id] !== undefined ? parseInt(studentAnswers[el.id]) : defaultIdx;
                             const activeOpt = opts[currentIdx] || {};
                             const pct = maxIdx === 0 ? 50 : (currentIdx / maxIdx) * 100;

                             return (
                               <div className={`w-full h-full relative flex items-center justify-center pointer-events-none ${selectedElementId === el.id && !isPreviewMode ? 'ring-2 ring-student-yellow rounded-xl' : ''}`}>
                                  <div className="absolute flex items-center justify-center rounded-full shadow-inner overflow-hidden" style={{ backgroundColor: el.data.barColor, width: isVert ? `${el.data.barThickness}px` : '100%', height: isVert ? '100%' : `${el.data.barThickness}px`, opacity: 1 }}>
                                     {el.data.barText && <span className="absolute font-bold text-xs uppercase tracking-widest whitespace-nowrap opacity-100" style={{ color: el.data.barTextColor, transform: isVert ? 'rotate(-90deg)' : 'none' }}>{el.data.barText}</span>}
                                  </div>
                                  <input type="range" min="0" max={maxIdx} step="1" disabled={!isPreviewMode} value={currentIdx} onChange={(e) => isPreviewMode && setStudentAnswers(prev => ({...prev, [el.id]: e.target.value}))} className="absolute custom-slider w-full h-full pointer-events-auto" style={{ '--thumb-color': el.data.handleColor, transform: isVert ? 'rotate(-90deg)' : 'none', WebkitAppearance: 'none', background: 'transparent' }} />
                                  { !isVert && (
                                     <div className="absolute flex flex-col items-center transition-all duration-200 pointer-events-none z-50" style={{ left: `${pct}%`, bottom: 'calc(50% + 18px)', transform: 'translateX(-50%)' }}>
                                        <div className="bg-white/95 backdrop-blur px-4 py-2 rounded-xl shadow-lg border border-gray-200 whitespace-nowrap animate-fade-in" style={{ color: el.data.textColor, fontSize: `${el.data.fontSize}px`, fontFamily: el.data.fontFamily, fontWeight: 'bold' }}>{activeOpt.text}</div>
                                        <div className="w-0 h-0 border-solid" style={{ borderWidth: '8px 6px 0 6px', borderColor: 'rgba(255,255,255,0.95) transparent transparent transparent' }} />
                                     </div>
                                  )}
                                  { isVert && (
                                     <div className="absolute flex items-center transition-all duration-200 pointer-events-none z-50" style={{ bottom: `${pct}%`, right: 'calc(50% + 18px)', transform: 'translateY(50%)' }}>
                                        <div className="bg-white/95 backdrop-blur px-4 py-2 rounded-xl shadow-lg border border-gray-200 whitespace-nowrap animate-fade-in" style={{ color: el.data.textColor, fontSize: `${el.data.fontSize}px`, fontFamily: el.data.fontFamily, fontWeight: 'bold' }}>{activeOpt.text}</div>
                                        <div className="w-0 h-0 border-solid" style={{ borderWidth: '6px 0 6px 8px', borderColor: 'transparent transparent transparent rgba(255,255,255,0.95)' }} />
                                     </div>
                                  )}
                               </div>
                             );
                          })()}

                          {/* --- CROSSWORD RENDERER --- */}
                          {el.type === 'crossword' && el.data && (
                            <div className={`w-full h-full p-4 flex flex-row gap-6 relative bg-white/80 backdrop-blur rounded-2xl shadow-sm border border-gray-200 ${selectedElementId === el.id && !isPreviewMode ? 'ring-2 ring-student-yellow' : ''}`}>
                               <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
                                  <h3 className="font-bold text-outloud-blue text-sm uppercase">Prompts</h3>
                                  <div className="flex gap-4">
                                    <div className="flex-1 flex flex-col gap-2">
                                      <h4 className="text-xs font-bold text-gray-500 uppercase border-b border-gray-200 pb-1">Across</h4>
                                      {el.data.across?.map((a) => (
                                        <div key={`a-${a.num}`} className="text-xs text-gray-700 flex gap-2"><span className="font-bold">{a.num}.</span><span>{a.prompt}</span></div>
                                      ))}
                                    </div>
                                    <div className="flex-1 flex flex-col gap-2">
                                      <h4 className="text-xs font-bold text-gray-500 uppercase border-b border-gray-200 pb-1">Down</h4>
                                      {el.data.down?.map((d) => (
                                        <div key={`d-${d.num}`} className="text-xs text-gray-700 flex gap-2"><span className="font-bold">{d.num}.</span><span>{d.prompt}</span></div>
                                      ))}
                                    </div>
                                  </div>
                               </div>

                               <div className="flex-[2] flex items-center justify-center bg-gray-50 rounded-xl border border-gray-200 p-2 overflow-auto custom-scrollbar">
                                  <div 
                                    style={{
                                      display: 'grid',
                                      gridTemplateColumns: `repeat(${el.data.grid[0]?.length || 1}, minmax(30px, 1fr))`,
                                      gap: '2px',
                                      width: 'fit-content'
                                    }}
                                  >
                                    {el.data.grid.map((row, rIdx) => 
                                      row.map((cell, cIdx) => (
                                        <div key={`${rIdx}-${cIdx}`} className="relative aspect-square w-8 md:w-10">
                                          {cell ? (
                                            <div className="w-full h-full relative">
                                              {cell.num && <span className="absolute top-0.5 left-1 text-[8px] font-bold text-gray-400 z-10 pointer-events-none">{cell.num}</span>}
                                              <input 
                                                type="text" 
                                                maxLength={1}
                                                disabled={!isPreviewMode}
                                                value={isPreviewMode ? (studentAnswers[`${el.id}_${rIdx}_${cIdx}`] || '') : cell.char}
                                                onChange={(e) => {
                                                  if(isPreviewMode) {
                                                    const val = e.target.value.toUpperCase().replace(/[^A-Z]/g, '');
                                                    setStudentAnswers(prev => ({...prev, [`${el.id}_${rIdx}_${cIdx}`]: val}));
                                                  }
                                                }}
                                                style={{
                                                  backgroundColor: el.data.cellColor, borderColor: el.data.lineColor, color: el.data.textColor, fontSize: `${el.data.fontSize}px`, fontFamily: el.data.fontFamily, fontWeight: el.data.isBold ? 'bold' : 'normal'
                                                }}
                                                className="w-full h-full text-center uppercase border focus:outline-none focus:ring-2 focus:ring-student-yellow transition"
                                              />
                                            </div>
                                          ) : (
                                            <div className="w-full h-full bg-transparent" />
                                          )}
                                        </div>
                                      ))
                                    )}
                                  </div>
                               </div>
                            </div>
                          )}

                          {/* --- WORD SEARCH RENDERER --- */}
                          {el.type === 'word_search' && el.data && (() => {
                             const targetWords = el.data.targetWords || [];
                             const half = Math.ceil(targetWords.length / 2);
                             const col1 = targetWords.slice(0, half);
                             const col2 = targetWords.slice(half);

                             return (
                               <div className={`w-full h-full p-4 flex flex-row gap-6 relative bg-white/80 backdrop-blur rounded-2xl shadow-sm border border-gray-200 ${selectedElementId === el.id && !isPreviewMode ? 'ring-2 ring-student-yellow' : ''}`}>
                                  <div className="flex-[1.5] flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
                                     <div dangerouslySetInnerHTML={{ __html: el.data.promptHtml }} className="w-full whitespace-pre-wrap break-words border-b border-gray-200 pb-2 mb-2" />
                                     <div className="flex gap-4">
                                       <ul className="flex-1 flex flex-col gap-1 list-disc pl-4">
                                         {col1.map((w, i) => <li key={`w1-${i}`} className="text-xs font-bold text-gray-700 tracking-wider">{w}</li>)}
                                       </ul>
                                       <ul className="flex-1 flex flex-col gap-1 list-disc pl-4">
                                         {col2.map((w, i) => <li key={`w2-${i}`} className="text-xs font-bold text-gray-700 tracking-wider">{w}</li>)}
                                       </ul>
                                     </div>
                                  </div>

                                  <div className="flex-[2] flex items-center justify-center p-2">
                                     <div 
                                       style={{
                                         display: 'grid',
                                         gridTemplateColumns: `repeat(${el.data.size || 10}, 1fr)`,
                                         borderWidth: '2px', borderStyle: 'solid', borderColor: el.data.lineColor, backgroundColor: el.data.cellColor
                                       }}
                                       className="shadow-sm max-w-full max-h-full aspect-square w-full"
                                     >
                                       {el.data.grid?.map((row, rIdx) => 
                                         row.map((char, cIdx) => {
                                            const cellId = `${el.id}_${rIdx}_${cIdx}`;
                                            const isSelected = isPreviewMode && (studentAnswers[`${el.id}_cells`] || []).includes(cellId);
                                            return (
                                              <div 
                                                key={cellId} 
                                                onClick={() => {
                                                  if (isPreviewMode) {
                                                     setStudentAnswers(prev => {
                                                       const currentCells = prev[`${el.id}_cells`] || [];
                                                       const newCells = currentCells.includes(cellId) ? currentCells.filter(c => c !== cellId) : [...currentCells, cellId];
                                                       return { ...prev, [`${el.id}_cells`]: newCells };
                                                     });
                                                  }
                                                }}
                                                style={{
                                                  color: el.data.textColor, fontSize: `${el.data.fontSize}px`, fontFamily: el.data.fontFamily, fontWeight: el.data.isBold ? 'bold' : 'normal',
                                                  borderRight: cIdx < (el.data.size - 1) ? `1px solid ${el.data.lineColor}` : 'none',
                                                  borderBottom: rIdx < (el.data.size - 1) ? `1px solid ${el.data.lineColor}` : 'none',
                                                  backgroundColor: isSelected ? 'rgba(234, 179, 8, 0.4)' : 'transparent',
                                                  cursor: isPreviewMode ? 'pointer' : 'default'
                                                }}
                                                className={`flex items-center justify-center transition-colors ${isPreviewMode ? 'hover:bg-yellow-500/20' : ''}`}
                                              >
                                                {char}
                                              </div>
                                            )
                                         })
                                       )}
                                     </div>
                                  </div>
                               </div>
                             );
                          })()}

                          {el.type === 'text' && (
                            <div className={`w-full h-full relative ${editingTextId === el.id || (selectedElementId === el.id && !isPreviewMode) ? 'ring-2 ring-student-yellow rounded bg-white shadow-xl' : ''}`}>
                              {editingTextId === el.id && (
                                <div className="absolute -top-14 left-0 bg-white shadow-xl rounded-xl border border-gray-200 p-1.5 flex gap-2 z-[100] items-center animate-fade-in">
                                  <div className="flex border border-gray-200 rounded overflow-hidden">
                                    <button onMouseDown={(e)=>{e.preventDefault(); handleTextFormat('bold');}} className="w-8 h-8 font-bold text-gray-700 hover:bg-gray-100 hover:text-outloud-blue">B</button>
                                    <button onMouseDown={(e)=>{e.preventDefault(); handleTextFormat('italic');}} className="w-8 h-8 italic text-gray-700 hover:bg-gray-100 hover:text-outloud-blue border-l border-gray-200">I</button>
                                    <button onMouseDown={(e)=>{e.preventDefault(); handleTextFormat('underline');}} className="w-8 h-8 underline text-gray-700 hover:bg-gray-100 hover:text-outloud-blue border-l border-gray-200">U</button>
                                  </div>
                                  <input type="color" onMouseDown={(e)=>e.preventDefault()} onChange={(e) => handleTextFormat('foreColor', e.target.value)} className="w-8 h-8 rounded cursor-pointer border border-gray-200" title="Text Color" />
                                  <div className="relative">
                                    <button onMouseDown={(e)=>e.preventDefault()} onClick={() => setTextDropdown(textDropdown === 'size' ? null : 'size')} className="p-1.5 px-2 border border-gray-200 rounded text-xs font-semibold focus:outline-none cursor-pointer flex items-center gap-1 bg-white hover:bg-gray-50">Size... <span className="text-[10px]">▼</span></button>
                                    {textDropdown === 'size' && (
                                      <div className="absolute top-full left-0 mt-1 w-16 max-h-40 overflow-y-auto bg-white border border-gray-200 rounded shadow-lg z-[200] custom-scrollbar">
                                        {[8,10,12,14,16,18,20,24,28,32,36,42,48,60,72].map(sz => <div key={sz} onMouseDown={(e) => e.preventDefault()} onClick={() => { handleTextFormat('fontSizePx', sz); setTextDropdown(null); }} className="px-2 py-1 hover:bg-gray-100 cursor-pointer text-xs text-center">{sz}px</div>)}
                                      </div>
                                    )}
                                  </div>
                                  <div className="relative">
                                    <button onMouseDown={(e)=>e.preventDefault()} onClick={() => setTextDropdown(textDropdown === 'font' ? null : 'font')} className="p-1.5 px-2 border border-gray-200 rounded text-xs font-semibold focus:outline-none cursor-pointer flex items-center gap-1 bg-white w-24 justify-between hover:bg-gray-50">Font... <span className="text-[10px]">▼</span></button>
                                    {textDropdown === 'font' && (
                                      <div className="absolute top-full left-0 mt-1 w-36 max-h-40 overflow-y-auto bg-white border border-gray-200 rounded shadow-lg z-[200] custom-scrollbar">
                                        {[{ name: 'Montserrat', family: 'Montserrat, sans-serif' }, { name: 'Tabarra', family: 'Tabarra, sans-serif' }, { name: 'Arial', family: 'Arial, sans-serif' }, { name: 'Times New Roman', family: '"Times New Roman", serif' }, { name: 'Courier New', family: '"Courier New", monospace' }, { name: 'Comic Sans MS', family: '"Comic Sans MS", cursive, sans-serif' }, { name: 'Impact', family: 'Impact, sans-serif' }].map(f => <div key={f.name} onMouseDown={(e) => e.preventDefault()} onClick={() => { handleTextFormat('fontName', f.family); setTextDropdown(null); }} className="px-2 py-1.5 hover:bg-gray-100 cursor-pointer text-xs" style={{fontFamily: f.family}}>{f.name}</div>)}
                                      </div>
                                    )}
                                  </div>
                                  <div className="w-[1px] h-6 bg-gray-200 mx-1"></div>
                                  <button onMouseDown={(e)=>{e.preventDefault(); setEditingTextId(null);}} className="text-[10px] font-bold uppercase tracking-wider bg-student-yellow text-outloud-blue px-3 py-1.5 rounded shadow-sm hover:scale-105 active:scale-95">DONE</button>
                                </div>
                              )}
                              <div contentEditable={editingTextId === el.id} dangerouslySetInnerHTML={{__html: el.htmlContent}} onDoubleClick={() => !isPreviewMode && setEditingTextId(el.id)} onBlur={(e) => handleTextBlurSave(el.id, e.target.innerHTML)} suppressContentEditableWarning className={`w-full h-full rich-text-content ${editingTextId === el.id ? 'cursor-text p-2' : 'cursor-default pointer-events-none'}`} style={{ minHeight: '40px', overflowWrap: 'break-word' }} />
                            </div>
                          )}

                          {/* --- DRAG AND DROP RENDERER WITH TOUCH SUPPORT AND SYNCED GRID --- */}
                          {el.type === 'drag_and_drop' && el.data && (() => {
                             const validItemsCount = el.data.items.filter(i => i.imageUrl).length || 1;
                             const gridStyle = { display: 'grid', gridTemplateColumns: `repeat(${validItemsCount}, 1fr)`, gap: '1.5rem', width: '100%', justifyItems: 'stretch' };

                             return (
                              <div className={`w-full h-full flex flex-col justify-between p-4 bg-white/60 backdrop-blur rounded-2xl border-4 border-dashed border-gray-300 ${selectedElementId === el.id && !isPreviewMode ? 'ring-2 ring-student-yellow' : ''}`}>
                                 <div style={gridStyle}>
                                   {el.data.items.map((item, idx) => item.imageUrl ? (
                                     <div key={idx} className="flex flex-col items-center gap-4 w-full">
                                       <div className="w-full aspect-square bg-gray-100 rounded-xl overflow-hidden shadow-sm border border-gray-200"><img src={item.imageUrl} alt={`Target ${idx}`} className="w-full h-full object-cover" draggable={false} /></div>
                                       <div data-dnd-zone={`${el.id}_${idx}`} className={`dnd-sync-${el.id} w-full flex items-center justify-center transition-colors relative`} onDragOver={(e) => isPreviewMode && e.preventDefault()} onDrop={(e) => { if (isPreviewMode) { e.preventDefault(); const droppedText = e.dataTransfer.getData('text/plain'); setDndAnswers(prev => ({...prev, [`${el.id}_${idx}`]: droppedText})); } }}>
                                          {dndAnswers[`${el.id}_${idx}`] ? (
                                             <div style={{...renderDndPillStyle(el.data), width: '100%', height: '100%'}} className="flex items-center justify-center shadow-sm">{dndAnswers[`${el.id}_${idx}`]}</div>
                                          ) : (
                                             <div className="w-full h-full rounded-xl border-2 border-dashed border-gray-400 flex items-center justify-center bg-white/50 absolute inset-0"><span className="text-gray-300 text-[10px] font-bold uppercase tracking-widest pointer-events-none p-2 text-center break-words leading-tight">Drop Here</span></div>
                                          )}
                                       </div>
                                     </div>
                                   ) : null)}
                                 </div>
                                 <div className="w-full bg-white p-4 rounded-xl shadow-inner border border-gray-200 mt-4">
                                   <div className="text-center font-bold text-gray-400 text-[10px] uppercase tracking-widest mb-3">Word Bank</div>
                                   <div style={gridStyle}>
                                     {el.data.items.map((item, idx) => {
                                        if (!item.studentViewText) return null;
                                        const isDropped = Object.values(dndAnswers).includes(item.studentViewText);
                                        return (
                                          <div key={`pill-${idx}`} className={`dnd-sync-${el.id} w-full flex items-center justify-center ${isDropped && isPreviewMode ? 'opacity-0 pointer-events-none' : ''}`}>
                                            <div draggable={isPreviewMode} onDragStart={(e) => { if (isPreviewMode) { e.dataTransfer.setData('text/plain', item.studentViewText); setDraggedItem(item.studentViewText); } }} onDragEnd={() => setDraggedItem(null)} onTouchStart={(e) => { if (isPreviewMode) { const touch = e.touches[0]; setTouchDragState({ isDragging: true, text: item.studentViewText, x: touch.clientX, y: touch.clientY, sourceElId: el.id }); document.body.style.overflow = 'hidden'; } }} style={{...renderDndPillStyle(el.data), width: '100%', height: '100%'}} className={`flex items-center justify-center shadow-sm hover:scale-[1.02] active:scale-95 transition-transform ${draggedItem === item.studentViewText || touchDragState.text === item.studentViewText ? 'opacity-50' : 'opacity-100'}`}>{item.studentViewText}</div>
                                          </div>
                                        );
                                     })}
                                   </div>
                                 </div>
                              </div>
                             );
                          })()}

{el.type === 'nav_button' && (
  <div 
    className={`w-full h-full flex items-center justify-center rounded-full shadow-lg transition-transform ${
      isPreviewMode ? 'bg-outloud-blue text-white cursor-pointer hover:scale-[1.02] active:scale-95 shadow-xl' : 'bg-gray-200 text-gray-500 border-2 border-dashed border-gray-400'
    }`}
    onClick={() => {
      if (isPreviewMode) {
        const nextId = (contentType === 'Lesson' ? lessonScreens : Array.from({length: workbookScreens}, (_, i) => i + 1))[index + 1];
        handlePreviewContinue(screenId, nextId);
      }
    }}
  >
    {(!el.data || !el.data.buttonStyle || el.data.buttonStyle === 'continue_pill') && <span className="font-black uppercase tracking-widest text-sm">CONTINUE ⬇</span>}
    {el.data?.buttonStyle === 'finish_pill' && <span className="font-black uppercase tracking-widest text-sm">FINISH</span>}
    {el.data?.buttonStyle === 'arrow_icon' && <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>}
  </div>
)}
                          {/* --- SHARED ADVANCED UI EDITING OVERLAYS --- */}
                          {!isPreviewMode && !isTool && editingTextId !== el.id && (
                            <div className={`absolute inset-0 pointer-events-none ${el.type === 'text' ? 'hover:ring-2 hover:ring-student-yellow hover:bg-yellow-50/10' : ''}`} style={{ pointerEvents: editingTextId === el.id ? 'none' : 'auto' }}>
                              <div className="absolute -left-1.5 -top-1.5 w-3 h-3 bg-student-yellow border-2 border-outloud-blue rounded-sm cursor-nw-resize z-50" onPointerDown={(e) => handleResizeStart(e, el, 'nw')} />
                              <div className="absolute -right-1.5 -top-1.5 w-3 h-3 bg-student-yellow border-2 border-outloud-blue rounded-sm cursor-ne-resize z-50" onPointerDown={(e) => handleResizeStart(e, el, 'ne')} />
                              <div className="absolute -left-1.5 -bottom-1.5 w-3 h-3 bg-student-yellow border-2 border-outloud-blue rounded-sm cursor-sw-resize z-50" onPointerDown={(e) => handleResizeStart(e, el, 'sw')} />
                              <div className="absolute -right-1.5 -bottom-1.5 w-3 h-3 bg-student-yellow border-2 border-outloud-blue rounded-sm cursor-se-resize z-50" onPointerDown={(e) => handleResizeStart(e, el, 'se')} />
                              <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-5 bg-student-yellow border-2 border-outloud-blue rounded-sm cursor-w-resize z-50" onPointerDown={(e) => handleResizeStart(e, el, 'w')} />
                              <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-5 bg-student-yellow border-2 border-outloud-blue rounded-sm cursor-e-resize z-50" onPointerDown={(e) => handleResizeStart(e, el, 'e')} />

                             <div className={`absolute -right-10 top-0 flex flex-col gap-1.5 z-[80] ${selectedElementId === el.id || multiSelectedIds.includes(el.id) || menuOpenId === el.id ? 'opacity-100' : 'group-hover:opacity-100 opacity-0'} transition-opacity`}>
                                <button onMouseDown={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === el.id ? null : el.id); }} className={`w-7 h-7 rounded-full shadow flex items-center justify-center transition border border-gray-200 ${menuOpenId === el.id ? 'bg-student-yellow text-outloud-blue' : 'bg-white hover:bg-gray-100'}`} title="Menu"><span className="font-black pb-2 pointer-events-none">...</span></button>
                                <button onMouseDown={(e) => handleRotateStart(e, el)} className="w-7 h-7 bg-white rounded-full shadow flex items-center justify-center cursor-alias hover:bg-gray-100 transition border border-gray-200" title="Rotate"><span role="img" aria-label="rotate" className="text-sm pointer-events-none">🔄</span></button>
                                <button onMouseDown={(e) => handleDragStart(e, el.id, el.x, el.y)} className="w-7 h-7 bg-white rounded-full shadow flex items-center justify-center cursor-grab active:cursor-grabbing hover:bg-gray-100 transition border border-gray-200" title="Move"><span role="img" aria-label="move" className="text-sm pointer-events-none">🖐️</span></button>

                                {menuOpenId === el.id && (
                                  <div className="absolute top-0 left-10 bg-white shadow-xl rounded-xl border border-gray-200 py-2 w-36 flex flex-col z-[100] animate-fade-in">
                                    {el.type !== 'text' && <div onMouseDown={(e) => { e.stopPropagation(); setEditingElementId(el.id); setActiveModal(el.type); setMenuOpenId(null); }} className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 hover:text-outloud-blue cursor-pointer">✏️ Edit Settings</div>}
                                    {el.type === 'text' && <div onMouseDown={(e) => { e.stopPropagation(); setEditingTextId(el.id); setMenuOpenId(null); }} className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 hover:text-outloud-blue cursor-pointer">✏️ Edit Text</div>}
                                    <div onMouseDown={(e) => { e.stopPropagation(); handleDuplicateElement(el.id); setMenuOpenId(null); }} className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 hover:text-outloud-blue cursor-pointer">📋 Duplicate</div>
                                    
                                    {multiSelectedIds.length > 1 && !el.groupId && <div onMouseDown={(e) => { e.stopPropagation(); handleGroupItems(); }} className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 hover:text-outloud-blue cursor-pointer">🔗 Group Items</div>}
                                    {el.groupId && <div onMouseDown={(e) => { e.stopPropagation(); handleSeparateItems(el.groupId); }} className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 hover:text-outloud-blue cursor-pointer">✂️ Separate</div>}
                                    
                                    <div className="w-full h-px bg-gray-100 my-1"></div>
                                    <div onMouseDown={(e) => { e.stopPropagation(); handleDeleteElement(el.id); setMenuOpenId(null); }} className="px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 cursor-pointer">🗑️ Delete</div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Standard Resize Handles for Image */}
                          {!isPreviewMode && isTool && (
                            <>
                              {el.type === 'image' && <div className={`absolute -top-10 left-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full shadow-lg border border-gray-200 ${selectedElementId === el.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-all z-[70] flex items-center justify-center cursor-alias hover:scale-110 hover:bg-gray-50`} onPointerDown={(e) => handleRotateStart(e, el)} title="Hold Shift to snap to 45° increments"><span role="img" aria-label="rotate" className="text-xs pointer-events-none">🔄</span></div>}
                              {el.type === 'image' && RESIZE_HANDLES.map(handle => <div key={handle.id} className={`absolute w-6 h-6 bg-student-yellow rounded-full shadow-lg border-4 border-white ${selectedElementId === el.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity z-[70] hover:scale-110 flex items-center justify-center ${handle.classes}`} onPointerDown={(e) => handleResizeStart(e, el, handle.id)}><div className="w-1.5 h-1.5 bg-outloud-blue rounded-full opacity-50 pointer-events-none"></div></div>)}
                              {el.type !== 'image' && <div className={`absolute -bottom-3 -right-3 w-6 h-6 bg-student-yellow rounded-full cursor-se-resize shadow-lg border-4 border-white ${selectedElementId === el.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity z-[70] flex items-center justify-center hover:scale-110`} onPointerDown={(e) => handleResizeStart(e, el, 'se')}><svg className="w-3 h-3 text-outloud-blue opacity-50 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg></div>}
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>


                </div>
              </React.Fragment>
            ))}
          </div>

          {!isPreviewMode && (
            <div className="w-full flex flex-col items-center py-12 bg-[#eef5fc] z-20 border-t border-white/50 shadow-[0_-15px_30px_rgba(0,0,0,0.03)]">
              <svg onClick={handleExpandWorkspace} className="w-12 h-12 text-outloud-blue cursor-pointer hover:scale-110 transition-transform animate-bounce" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              <span className="text-[10px] font-bold text-outloud-blue font-montserrat uppercase tracking-widest mt-2">ADD NEW SCREEN</span>
            </div>
          )}
        </>
      )}

    </div>
  );
};

export default AdminHub;