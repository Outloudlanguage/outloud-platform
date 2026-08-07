import React, { useState } from 'react';

const AdminHub = ({ onLogout }) => {
  const [contentType, setContentType] = useState('Lesson');
  const [showGrid, setShowGrid] = useState(true);

  return (
    <div className="flex min-h-screen flex-col bg-focus-white font-sans">
      
      {/* Top Header */}
      <div className="flex items-center justify-between bg-white p-6 shadow-sm z-10">
        <div className="flex items-center space-x-4">
           <div className="text-3xl text-outloud-blue">🎓</div>
           <div>
             <h1 className="text-xl font-bold text-outloud-blue">Outloud | <span className="font-light">Online Platform</span></h1>
             <p className="text-xs font-semibold tracking-widest text-outloud-blue">LANGUAGE ACADEMY</p>
           </div>
        </div>
        <button onClick={onLogout} className="flex items-center space-x-2 font-bold text-outloud-blue hover:text-blue-800">
          <span>&lt; Return Home</span>
          <span className="text-xl">🏠</span>
        </button>
      </div>

      {/* Admin Navigation */}
      <div className="p-8 pb-4">
        <h2 className="mb-6 text-center text-2xl font-bold text-outloud-blue">ADMIN EDITING HUB</h2>
        <div className="mx-auto flex w-full max-w-4xl justify-center gap-4">
          <button className="flex-1 rounded-md bg-outloud-blue px-4 py-3 text-sm font-bold text-white shadow-md">
            CONTENT EDITING TOOLS
          </button>
          <button className="flex-1 rounded-md bg-white px-4 py-3 text-sm font-bold text-gray-500 shadow-sm transition hover:bg-gray-50">
            DESIGN EDITING TOOLS
          </button>
          <button className="flex-1 rounded-md bg-white px-4 py-3 text-sm font-bold text-gray-500 shadow-sm transition hover:bg-gray-50">
            CUSTOMER MANAGEMENT
          </button>
        </div>
      </div>

      {/* Tool Filters */}
      <div className="mx-auto flex w-full max-w-5xl justify-between gap-4 p-4 z-10">
        {['Select Level', 'Select Unit'].map((placeholder, idx) => (
          <select key={idx} className="w-1/4 cursor-pointer appearance-none rounded-md bg-student-yellow p-3 text-sm font-bold text-outloud-blue shadow-sm outline-none">
            <option>{placeholder}</option>
            <option>Option 1</option>
            <option>Option 2</option>
          </select>
        ))}
        
        <select 
          value={contentType}
          onChange={(e) => setContentType(e.target.value)}
          className="w-1/4 cursor-pointer appearance-none rounded-md bg-student-yellow p-3 text-sm font-bold text-outloud-blue shadow-sm outline-none"
        >
          <option value="Lesson">Lesson</option>
          <option value="Workbook">Workbook</option>
        </select>

        <select className="w-1/4 cursor-pointer appearance-none rounded-md bg-student-yellow p-3 text-sm font-bold text-outloud-blue shadow-sm outline-none">
          <option>Tools</option>
          <option>Fill in blank</option>
          <option>Multiple selection</option>
          {contentType !== 'Workbook' && <option>Video Upload</option>}
          {contentType !== 'Workbook' && <option>Audio Upload</option>}
        </select>
      </div>

      {/* Infinite Editing Canvas with Decimal Grid */}
      <div className="flex-grow p-8">
        <div className="mb-4 flex justify-end">
           <button 
             onClick={() => setShowGrid(!showGrid)}
             className="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
           >
             {showGrid ? 'Hide Grid' : 'Show Grid'}
           </button>
        </div>
        
        {/* The Actual Canvas Area */}
        <div 
          className={`relative mx-auto min-h-[800px] w-full max-w-5xl rounded-lg border-2 border-dashed border-gray-300 bg-white shadow-inner ${showGrid ? 'bg-decimal-grid bg-decimal-grid-size' : ''}`}
        >
          {/* Placeholder for draggable Lego blocks */}
          <div className="absolute top-10 left-10 p-4 border border-blue-400 bg-blue-50 text-outloud-blue shadow cursor-move rounded">
            Drag me (Future Module)
          </div>
        </div>
      </div>

    </div>
  );
};

export default AdminHub;
