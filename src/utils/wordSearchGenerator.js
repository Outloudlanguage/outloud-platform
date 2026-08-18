export const generateWordSearchGrid = (wordsInput) => {
     const cleanWords = wordsInput.map(w => w.toUpperCase().replace(/[^A-Z]/g, '')).filter(w => w.length > 0);
     if (cleanWords.length === 0) return { grid: [], targetWords: [] };

     const maxLen = Math.max(...cleanWords.map(w => w.length));
     const size = Math.max(12, maxLen + 2); // Dynamic grid sizing
     
     let grid = Array(size).fill(null).map(() => Array(size).fill(''));
     const dirs = [[1,0], [0,1], [1,1], [-1,1]]; // Horizontal, Vertical, Diagonal Down, Diagonal Up

     cleanWords.forEach(word => {
        let placed = false;
        let attempts = 0;
        while (!placed && attempts < 200) {
           const dir = dirs[Math.floor(Math.random() * dirs.length)];
           const r = Math.floor(Math.random() * size);
           const c = Math.floor(Math.random() * size);
           
           const endR = r + dir[0] * (word.length - 1);
           const endC = c + dir[1] * (word.length - 1);

           if (endR >= 0 && endR < size && endC >= 0 && endC < size) {
              let canPlace = true;
              for (let i = 0; i < word.length; i++) {
                 const charAt = grid[r + dir[0]*i][c + dir[1]*i];
                 if (charAt !== '' && charAt !== word[i]) { canPlace = false; break; }
              }
              if (canPlace) {
                 for (let i = 0; i < word.length; i++) {
                    grid[r + dir[0]*i][c + dir[1]*i] = word[i];
                 }
                 placed = true;
              }
           }
           attempts++;
        }
     });

     // Fill remaining cells with random letters
     const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
     for (let r=0; r<size; r++) {
        for (let c=0; c<size; c++) {
           if (grid[r][c] === '') grid[r][c] = alphabet[Math.floor(Math.random() * alphabet.length)];
        }
     }

     return { grid, size, targetWords: cleanWords };
};