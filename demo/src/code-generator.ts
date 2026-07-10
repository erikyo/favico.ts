import { currentOptions } from './state';

export function updateCodeSnippets(valueAction?: string) {
  const esmCode = document.getElementById('code-block-esm');
  const cjsCode = document.getElementById('code-block-cjs');
  const reactCode = document.getElementById('code-block-react');
  const nextCode = document.getElementById('code-block-next');
  
  const optionsStr = JSON.stringify(currentOptions, null, 2).replace(/"([^"]+)":/g, '$1:');
  
  if (esmCode) {
    esmCode.textContent = `import Favico from "favico.ts";\n\nconst favico = new Favico(${optionsStr});\n\n${valueAction || 'await favico.badge(12);'}`;
  }
  
  if (cjsCode) {
    cjsCode.textContent = `const Favico = require("favico.ts");\n\nconst favico = new Favico(${optionsStr});\n\n${valueAction || 'await favico.badge(12);'}`;
  }
  
  if (reactCode) {
    reactCode.textContent = `import { useEffect, useRef } from "react";\nimport Favico from "favico.ts";\n\nexport function FavicoBadge({ count }: { count: number }) {\n  const ref = useRef<Favico | null>(null);\n\n  useEffect(() => {\n    const favico = new Favico(${optionsStr.split('\\n').join('\\n    ')});\n    ref.current = favico;\n    return () => {\n      favico.destroy();\n      ref.current = null;\n    };\n  }, []);\n\n  useEffect(() => {\n    if (ref.current) {\n      void ref.current.badge(count);\n    }\n  }, [count]);\n\n  return null;\n}`;
  }
  
  if (nextCode) {
    nextCode.textContent = `"use client";\n\nimport { useEffect, useRef } from "react";\nimport Favico from "favico.ts";\n\nexport function NextFavicoBadge({ count }: { count: number }) {\n  const ref = useRef<Favico | null>(null);\n\n  useEffect(() => {\n    const favico = new Favico(${optionsStr.split('\\n').join('\\n    ')});\n    ref.current = favico;\n    return () => {\n      favico.destroy();\n    };\n  }, []);\n\n  useEffect(() => {\n    if (ref.current) {\n      void ref.current.badge(count);\n    }\n  }, [count]);\n\n  return null;\n}`;
  }
}

export function initCodeGenerator() {
  updateCodeSnippets();
  
  // Tab logic
  const tablist = document.querySelector('.tabs');
  const tabs = document.querySelectorAll('.tabs button');
  const panels = document.querySelectorAll('.tab-panel');
  
  tablist?.addEventListener('click', (e) => {
    const target = e.target as HTMLButtonElement;
    if (target.getAttribute('role') !== 'tab') return;
    
    tabs.forEach(t => t.setAttribute('aria-selected', 'false'));
    target.setAttribute('aria-selected', 'true');
    
    panels.forEach(p => p.setAttribute('hidden', 'true'));
    
    const panelId = target.getAttribute('aria-controls');
    if (panelId) {
      document.getElementById(panelId)?.removeAttribute('hidden');
    }
  });

  // Copy button
  const copyBtn = document.getElementById('copy-code-btn');
  copyBtn?.addEventListener('click', () => {
    const activeTab = document.querySelector('.tab-panel:not([hidden]) code');
    if (activeTab && activeTab.textContent) {
      navigator.clipboard.writeText(activeTab.textContent).then(() => {
        const feedback = document.getElementById('copy-feedback');
        if (feedback) {
          feedback.textContent = 'Copied!';
          setTimeout(() => { feedback.textContent = ''; }, 2000);
        }
      });
    }
  });
}
