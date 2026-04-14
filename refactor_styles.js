const fs = require('fs');
const path = require('path');

const classes = [
  { match: /style=\{\{\s*background:\s*['"]#fff['"],\s*borderRadius:\s*['"]8px['"],\s*border:\s*['"]1px\s+solid\s+#dee2e6['"]\s*\}\}/g, className: 'seccion-box' },
  { match: /style=\{\{\s*fontSize:\s*['"]0.85rem['"],\s*textTransform:\s*['"]uppercase['"],\s*letterSpacing:\s*['"]0.05em['"],\s*color:\s*['"]#555['"]\s*\}\}/g, className: 'seccion-titulo' },
  { match: /style=\{\{\s*backgroundColor:\s*['"]#f9f9f9['"]\s*\}\}/g, className: 'seccion-fondo-claro' },
  { match: /style=\{\{\s*fontSize:\s*['"]0.875rem['"]\s*\}\}/g, className: 'tabla-fuente-pequena' },
  { match: /style=\{\{\s*maxWidth:\s*['"]200px['"],\s*overflow:\s*['"]hidden['"],\s*textOverflow:\s*['"]ellipsis['"],\s*whiteSpace:\s*['"]nowrap['"]\s*\}\}/g, className: 'texto-truncado' },
  { match: /style=\{\{\s*fontSize:\s*['"]0.9rem['"]\s*\}\}/g, className: 'texto-mediano' },
  { match: /style=\{\{\s*fontSize:\s*['"]0.78rem['"]\s*\}\}/g, className: 'texto-pequeno' },
  { match: /style=\{\{\s*background:\s*['"]#fff['"],\s*borderLeft:\s*['"]4px\s+solid\s+#0d6efd['"],\s*borderRadius:\s*['"]6px['"],\s*padding:\s*['"]12px['"],\s*marginBottom:\s*['"]10px['"],\s*boxShadow:\s*['"]0\s+2px\s+4px\s+rgba\(0,0,0,0\.05\)['"]\s*\}\}/g, className: 'obs-item-box' }
];

const cssContent = `
/* Clases Refactorizadas */
.seccion-box { background: #fff; border-radius: 8px; border: 1px solid #dee2e6; }
.seccion-titulo { font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; color: #555; }
.seccion-fondo-claro { background-color: #f9f9f9; }
.tabla-fuente-pequena { font-size: 0.875rem; }
.texto-truncado { max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.texto-mediano { font-size: 0.9rem; }
.texto-pequeno { font-size: 0.78rem; }
.obs-item-box { background: #fff; border-left: 4px solid #0d6efd; border-radius: 6px; padding: 12px; margin-bottom: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
`;

const filesToProcess = [
  { jsx: './frontEnd/src/Components/UsuarioTecnico.jsx', css: './frontEnd/src/CSS/UsuarioTecnico.css' },
  { jsx: './frontEnd/src/Components/UsuarioJuridico.jsx', css: './frontEnd/src/CSS/UsuarioJuridico.css' },
  { jsx: './frontEnd/src/Components/UsuarioDirector.jsx', css: './frontEnd/src/CSS/UsuarioDirector.css' }
];

filesToProcess.forEach(({ jsx, css }) => {
  const jsxPath = path.resolve(jsx);
  const cssPath = path.resolve(css);
  if (!fs.existsSync(jsxPath)) {
      console.log("No se encuentra " + jsxPath);
      return;
  }
  
  let content = fs.readFileSync(jsxPath, 'utf8');
  let changed = false;

  classes.forEach(cls => {
    if (content.match(cls.match)) {
      content = content.replace(cls.match, (match, offset, string) => {
          const prefix = string.substring(Math.max(0, offset - 50), offset);
          if (prefix.match(/className=["'][^"']*["']\s*$/)) {
             return `__REPLACE_HINT_${cls.className}__`; 
          }
          return `className="${cls.className}"`;
      });
      changed = true;
    }
  });

  if (changed) {
     content = content.replace(/(className=["'])([^"']*)(["']\s*)__REPLACE_HINT_([A-Za-z0-9_-]+)__/g, '$1$2 $4$3');
     fs.writeFileSync(jsxPath, content);
     console.log('Updated ' + path.basename(jsxPath));
     
     if (fs.existsSync(cssPath)) {
        let cssData = fs.readFileSync(cssPath, 'utf8');
        if (!cssData.includes('.seccion-box')) {
           fs.appendFileSync(cssPath, '\n' + cssContent);
           console.log('Updated ' + path.basename(cssPath));
        }
     } else {
        fs.writeFileSync(cssPath, cssContent);
        console.log('Created ' + path.basename(cssPath));
     }
  }
});
