export const generateCrosswordLayout = (wordsInput) => {
     // Standard greedy intersecting algorithm
     const sorted = [...wordsInput].filter(w => w.word).sort((a, b) => b.word.length - a.word.length);
     if (sorted.length === 0) return { grid: [], across: [], down: [] };

     let VIRTUAL_SIZE = 30; // Max reasonable grid bounds
     let grid = Array(VIRTUAL_SIZE).fill(null).map(() => Array(VIRTUAL_SIZE).fill(null));
     let placedWords = []; // { wordObj, x, y, isHoriz }

     const canPlace = (wordStr, startX, startY, isHoriz) => {
       if (startX < 0 || startY < 0) return false;
       if (isHoriz && startX + wordStr.length >= VIRTUAL_SIZE) return false;
       if (!isHoriz && startY + wordStr.length >= VIRTUAL_SIZE) return false;

       for (let i = 0; i < wordStr.length; i++) {
         const cx = isHoriz ? startX + i : startX;
         const cy = isHoriz ? startY : startY + i;
         
         // If cell occupied, must match letter
         if (grid[cy][cx] !== null && grid[cy][cx].char !== wordStr[i]) return false;
         
         // Check adjacent cells to prevent touching in parallel
         const cellIsIntersection = grid[cy][cx] !== null;
         if (!cellIsIntersection) {
            if (isHoriz) {
               if (cy > 0 && grid[cy-1][cx] !== null) return false;
               if (cy < VIRTUAL_SIZE-1 && grid[cy+1][cx] !== null) return false;
            } else {
               if (cx > 0 && grid[cy][cx-1] !== null) return false;
               if (cx < VIRTUAL_SIZE-1 && grid[cy][cx+1] !== null) return false;
            }
         }
       }
       // Check start/end bounds
       if (isHoriz) {
         if (startX > 0 && grid[startY][startX-1] !== null) return false;
         if (startX + wordStr.length < VIRTUAL_SIZE && grid[startY][startX + wordStr.length] !== null) return false;
       } else {
         if (startY > 0 && grid[startY-1][startX] !== null) return false;
         if (startY + wordStr.length < VIRTUAL_SIZE && grid[startY + wordStr.length][startX] !== null) return false;
       }
       return true;
     };

     // 1. Place first word horizontally in middle
     const first = sorted.shift();
     const sX = Math.floor(VIRTUAL_SIZE/2 - first.word.length/2);
     const sY = Math.floor(VIRTUAL_SIZE/2);
     for(let i=0; i<first.word.length; i++) {
       grid[sY][sX + i] = { char: first.word[i] };
     }
     placedWords.push({ ...first, x: sX, y: sY, isHoriz: true });

     // 2. Greedy search for intersections for remaining words
     sorted.forEach(wordObj => {
        const wStr = wordObj.word;
        let placed = false;
        
        for (let i = 0; i < wStr.length && !placed; i++) {
           const charToMatch = wStr[i];
           // Find this char in already placed words
           for (let r = 0; r < VIRTUAL_SIZE && !placed; r++) {
             for (let c = 0; c < VIRTUAL_SIZE && !placed; c++) {
               if (grid[r][c] && grid[r][c].char === charToMatch) {
                  // Try Horizontal
                  if (canPlace(wStr, c - i, r, true)) {
                     for(let j=0; j<wStr.length; j++) {
                       if(!grid[r][c-i+j]) grid[r][c-i+j] = { char: wStr[j] };
                     }
                     placedWords.push({ ...wordObj, x: c - i, y: r, isHoriz: true });
                     placed = true;
                  }
                  // Try Vertical
                  else if (canPlace(wStr, c, r - i, false)) {
                     for(let j=0; j<wStr.length; j++) {
                       if(!grid[r-i+j][c]) grid[r-i+j][c] = { char: wStr[j] };
                     }
                     placedWords.push({ ...wordObj, x: c, y: r - i, isHoriz: false });
                     placed = true;
                  }
               }
             }
           }
        }
        // If it couldn't intersect, place it blindly at the bottom
        if (!placed) {
          let bottomY = 0;
          placedWords.forEach(pw => { if (pw.y + (pw.isHoriz?0:pw.word.length) > bottomY) bottomY = pw.y + (pw.isHoriz?0:pw.word.length); });
          const newY = bottomY + 2;
          if (canPlace(wStr, 2, newY, true)) {
             for(let j=0; j<wStr.length; j++) grid[newY][2+j] = { char: wStr[j] };
             placedWords.push({ ...wordObj, x: 2, y: newY, isHoriz: true });
          }
        }
     });

     // 3. Crop Bounding Box & Assign Numbers
     let minX = VIRTUAL_SIZE, maxX = 0, minY = VIRTUAL_SIZE, maxY = 0;
     for (let r=0; r<VIRTUAL_SIZE; r++) {
       for (let c=0; c<VIRTUAL_SIZE; c++) {
         if (grid[r][c]) {
           if(c < minX) minX = c; if(c > maxX) maxX = c;
           if(r < minY) minY = r; if(r > maxY) maxY = r;
         }
       }
     }
     
     let finalGrid = [];
     let num = 1;
     let across = [];
     let down = [];

     for (let r = minY; r <= maxY; r++) {
       let row = [];
       for (let c = minX; c <= maxX; c++) {
         if (grid[r][c]) {
            let cellObj = { char: grid[r][c].char, num: null };
            // Check if this cell is the start of a word
            const startsHoriz = placedWords.find(pw => pw.x === c && pw.y === r && pw.isHoriz);
            const startsVert = placedWords.find(pw => pw.x === c && pw.y === r && !pw.isHoriz);
            
            if (startsHoriz || startsVert) {
               cellObj.num = num;
               if (startsHoriz) across.push({ num, prompt: startsHoriz.prompt });
               if (startsVert) down.push({ num, prompt: startsVert.prompt });
               num++;
            }
            row.push(cellObj);
         } else {
            row.push(null);
         }
       }
       finalGrid.push(row);
     }

     return { grid: finalGrid, across, down };
};