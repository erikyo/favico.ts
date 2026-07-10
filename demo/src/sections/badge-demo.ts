import { currentOptions, favico, destroyFavico, recreateFavico, logConsole, updateStatus } from '../state';
import { updateCodeSnippets } from '../code-generator';

export function initBadgeDemo() {
  const badgeInput = document.getElementById('badge-value') as HTMLInputElement;
  
  function applyBadge(value: string | number) {
    if (!favico) return;
    updateCodeSnippets(`await favico.badge(${JSON.stringify(value)});`);
    favico.badge(value).catch(e => logConsole('error', String(e)));
    updateStatus(String(value), 'Badge');
    logConsole('info', `Badge set to ${value}`);
  }

  // Inputs
  badgeInput?.addEventListener('change', (e) => {
    const val = (e.target as HTMLInputElement).value;
    applyBadge(val);
  });

  document.getElementById('badge-inc')?.addEventListener('click', () => {
    const v = parseInt(badgeInput.value || '0', 10);
    badgeInput.value = String(v + 1);
    applyBadge(v + 1);
  });
  
  document.getElementById('badge-dec')?.addEventListener('click', () => {
    const v = parseInt(badgeInput.value || '0', 10);
    badgeInput.value = String(v - 1);
    applyBadge(v - 1);
  });

  document.querySelectorAll('.preset-buttons button[data-badge]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const val = (e.target as HTMLButtonElement).getAttribute('data-badge');
      if (val) {
        badgeInput.value = val;
        applyBadge(val.match(/^\d+$/) ? parseInt(val, 10) : val);
      }
    });
  });

  document.getElementById('badge-clear')?.addEventListener('click', () => {
    badgeInput.value = '';
    applyBadge(0);
  });

  document.getElementById('badge-random')?.addEventListener('click', () => {
    const val = Math.floor(Math.random() * 99) + 1;
    badgeInput.value = String(val);
    applyBadge(val);
  });

  // Options
  const binds = [
    { id: 'badge-type', key: 'type' },
    { id: 'badge-animation', key: 'animation' },
    { id: 'badge-position', key: 'position' },
    { id: 'badge-font', key: 'fontFamily' },
    { id: 'badge-font-style', key: 'fontStyle' },
  ] as const;

  for (const { id, key } of binds) {
    const el = document.getElementById(id) as HTMLInputElement | HTMLSelectElement;
    el?.addEventListener('change', () => {
      (currentOptions as any)[key] = el.value;
      if (favico) favico.setOptions(currentOptions);
      updateCodeSnippets();
    });
  }

  // Colors mapping (sync text input and color picker)
  const colors = [
    { picker: 'badge-bg-color', text: 'badge-bg-color-text', key: 'backgroundColor' },
    { picker: 'badge-text-color', text: 'badge-text-color-text', key: 'textColor' }
  ] as const;

  for (const { picker, text, key } of colors) {
    const pEl = document.getElementById(picker) as HTMLInputElement;
    const tEl = document.getElementById(text) as HTMLInputElement;
    
    pEl?.addEventListener('input', () => {
      tEl.value = pEl.value;
      (currentOptions as any)[key] = pEl.value;
      if (favico) favico.setOptions(currentOptions);
      updateCodeSnippets();
    });

    tEl?.addEventListener('change', () => {
      pEl.value = tEl.value;
      (currentOptions as any)[key] = tEl.value;
      if (favico) favico.setOptions(currentOptions);
      updateCodeSnippets();
    });
  }

  // Stress tests
  document.getElementById('test-rapid')?.addEventListener('click', async () => {
    if (!favico) return;
    for (let i = 1; i <= 10; i++) {
      favico.badge(i);
    }
    updateStatus('10', 'Rapid Badge');
    logConsole('info', 'Rapid updates fired (1-10)');
  });
  
  let simInterval: ReturnType<typeof setInterval> | null = null;
  document.getElementById('test-unread')?.addEventListener('click', () => {
    if (simInterval) clearInterval(simInterval);
    let count = 1;
    simInterval = setInterval(() => {
      if (!favico) {
        clearInterval(simInterval!);
        return;
      }
      favico.badge(count);
      updateStatus(String(count), 'Badge Sim');
      count++;
    }, 1000);
    logConsole('info', 'Simulation started');
  });

  document.getElementById('test-stop')?.addEventListener('click', () => {
    if (simInterval) {
      clearInterval(simInterval);
      simInterval = null;
      logConsole('info', 'Simulation stopped');
    }
  });

  document.getElementById('test-huge')?.addEventListener('click', () => {
    applyBadge(10000);
  });

  document.getElementById('test-reset')?.addEventListener('click', () => {
    if (favico) {
      favico.reset();
      updateStatus('Base', 'Original');
      const p = document.getElementById('generated-preview') as HTMLImageElement;
      if (p) p.src = '/favicon.svg';
      logConsole('info', 'Favicon reset');
      updateCodeSnippets('await favico.reset();');
    }
  });

  document.getElementById('test-destroy')?.addEventListener('click', () => {
    if (favico) {
      destroyFavico();
      updateStatus('Base', 'Original');
      const p = document.getElementById('generated-preview') as HTMLImageElement;
      if (p) p.src = '/favicon.svg';
      logConsole('warn', 'Instance destroyed');
      updateCodeSnippets('favico.destroy();');
    }
  });

  document.getElementById('test-recreate')?.addEventListener('click', () => {
    recreateFavico();
  });
}
