import Favico from 'favico.ts';

// Central options
export const currentOptions = {
  animation: 'slide' as const,
  position: 'down' as const,
  type: 'circle' as const,
  backgroundColor: '#dd0000',
  textColor: '#ffffff',
  fontFamily: 'sans-serif',
  fontStyle: 'bold'
};

export let favico: Favico | null = null;
let destroyListeners: (() => void)[] = [];

// Re-instantiate Favico
export function recreateFavico() {
  if (favico) {
    destroyFavico();
  }
  
  favico = new Favico({
    ...currentOptions,
    onUpdate: (url) => {
      const previewEl = document.getElementById('generated-preview') as HTMLImageElement;
      const dataLengthEl = document.getElementById('status-data-length');
      
      if (previewEl) {
        previewEl.src = url;
      }
      if (dataLengthEl) {
        dataLengthEl.textContent = `${url.length} bytes`;
      }
    }
  });
  logConsole('info', 'Favico instance recreated');
}

export function destroyFavico() {
  if (favico) {
    favico.destroy();
    favico = null;
    logConsole('info', 'Favico instance destroyed');
  }
  
  // Call all cleanup listeners
  for (const listener of destroyListeners) {
    listener();
  }
}

export function onFavicoDestroy(listener: () => void) {
  destroyListeners.push(listener);
}

// Console and status update helpers
export function logConsole(level: 'info' | 'error' | 'success' | 'warn', message: string) {
  const container = document.getElementById('console-output');
  if (!container) return;
  
  const div = document.createElement('div');
  div.className = `log-${level}`;
  div.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
  
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

export function updateStatus(value: string, source: string) {
  const valueEl = document.getElementById('status-value');
  const sourceEl = document.getElementById('status-source');
  
  if (valueEl) valueEl.textContent = value;
  if (sourceEl) sourceEl.textContent = source;
}
