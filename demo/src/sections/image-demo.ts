import { favico, logConsole, updateStatus, onFavicoDestroy } from '../state';
import { updateCodeSnippets } from '../code-generator';

export function initImageDemo() {
  const objectUrls: string[] = [];

  onFavicoDestroy(() => {
    for (const url of objectUrls) {
      URL.revokeObjectURL(url);
    }
    objectUrls.length = 0;
  });

  function applyImage(url: string, sourceName: string) {
    if (!favico) return;
    favico.image(url).then(() => {
      updateStatus('Image loaded', sourceName);
      logConsole('success', `Image rendered from ${sourceName}`);
      updateCodeSnippets(`await favico.image("${url}");`);
    }).catch(e => logConsole('error', String(e)));
  }

  document.getElementById('img-sample-avatar')?.addEventListener('click', () => {
    applyImage('/sample-avatar.svg', 'Avatar SVG');
  });

  document.getElementById('img-sample-status')?.addEventListener('click', () => {
    applyImage('/sample-status.svg', 'Status SVG');
  });

  document.getElementById('img-load-url')?.addEventListener('click', () => {
    const input = document.getElementById('img-url') as HTMLInputElement;
    if (input.value) {
      applyImage(input.value, 'Custom URL');
    }
  });

  document.getElementById('img-upload')?.addEventListener('change', (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      objectUrls.push(url);
      applyImage(url, 'Local File');
    }
  });

  document.getElementById('img-raw')?.addEventListener('click', () => {
    if (!favico) return;
    const input = document.getElementById('img-url') as HTMLInputElement;
    const url = input.value || '/sample-avatar.svg';
    favico.rawImageSrc(url).then(() => {
      updateStatus('Raw image applied', 'rawImageSrc()');
      logConsole('success', `Raw image set from URL: ${url}`);
      updateCodeSnippets(`await favico.rawImageSrc("${url}");`);
    }).catch(e => logConsole('error', String(e)));
  });
}
