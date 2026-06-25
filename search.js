const fs = require('fs');
const path = require('path');

function searchFiles(dir, query) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === 'node_modules' || file === '.git' || file === '.next' || file === 'dist') continue;
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      searchFiles(filePath, query);
    } else {
      if (filePath.endsWith('.ts') || filePath.endsWith('.tsx') || filePath.endsWith('.json') || filePath.endsWith('.js')) {
        const content = fs.readFileSync(filePath, 'utf8');
        if (content.toLowerCase().includes(query.toLowerCase())) {
          console.log('Found in:', filePath);
        }
      }
    }
  }
}

console.log('Searching for "gemini"...');
searchFiles('c:/Users/HP/Desktop/SALON/salon/backend', 'gemini');
searchFiles('c:/Users/HP/Desktop/SALON/salon/frontend', 'gemini');
searchFiles('c:/Users/HP/Desktop/SALON/salon/super-admin', 'gemini');
console.log('Done.');
