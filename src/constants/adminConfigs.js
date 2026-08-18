export const LEVEL_UNIT_MAP = {
  'A1: Básico 1': { start: 1, end: 12 },
  'A2: Básico 2': { start: 13, end: 25 },
  'B1: Inter. 1': { start: 26, end: 38 },
  'B2: Inter. 2': { start: 39, end: 51 },
  'C1: Avanz. 1': { start: 52, end: 72 },
  'C2: Avanz. 2': { start: 73, end: 93 },
};

export const LEVEL_OPTIONS = Object.keys(LEVEL_UNIT_MAP);

export const LESSON_TOOLS = [
  'Text', 'Shape', 'Video', 'Audio', 'Image', 'Record & Compare', 
  'Fill in the blank', 'Drag and drop', 'Short answer', 'Multiple selection', 'Slider bar', 'Next Screen Button'
];

export const WORKBOOK_TOOLS = [
  'Text', 'Shape', 'Image', 'Record & Compare', 
  'Fill in the blank', 'Drag and drop', 'Short answer', 'Multiple selection', 'Slider bar',
  'Crossword', 'Word search', 'Next Screen Button'
];

export const RESIZE_HANDLES = [
  { id: 'nw', classes: '-top-3 -left-3 cursor-nw-resize' },
  { id: 'n', classes: '-top-3 left-1/2 -translate-x-1/2 cursor-n-resize' },
  { id: 'ne', classes: '-top-3 -right-3 cursor-ne-resize' },
  { id: 'w', classes: 'top-1/2 -left-3 -translate-y-1/2 cursor-w-resize' },
  { id: 'e', classes: 'top-1/2 -right-3 -translate-y-1/2 cursor-e-resize' },
  { id: 'sw', classes: '-bottom-3 -left-3 cursor-sw-resize' },
  { id: 's', classes: '-bottom-3 left-1/2 -translate-x-1/2 cursor-s-resize' },
  { id: 'se', classes: '-bottom-3 -right-3 cursor-se-resize' },
];