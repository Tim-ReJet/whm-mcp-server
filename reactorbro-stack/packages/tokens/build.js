
const fs = require('fs'); const path = require('path');
const tokens = JSON.parse(fs.readFileSync(path.join(__dirname,'tokens.json'),'utf8'));
function toTailwindColors(obj){ return Object.fromEntries(Object.entries(obj).map(([k,v])=>[k,v]));}
const outDir = path.join(__dirname,'build'); if(!fs.existsSync(outDir)) fs.mkdirSync(outDir);
fs.writeFileSync(path.join(outDir,'tailwind.colors.json'), JSON.stringify(tokens.color, null, 2));
fs.writeFileSync(path.join(outDir,'tailwind.spacing.json'), JSON.stringify(tokens.space, null, 2));
fs.writeFileSync(path.join(outDir,'tailwind.radii.json'), JSON.stringify(tokens.radius, null, 2));
fs.writeFileSync(path.join(outDir,'tailwind.shadows.json'), JSON.stringify(tokens.shadow, null, 2));
console.log('tokens built -> packages/tokens/build/*');
