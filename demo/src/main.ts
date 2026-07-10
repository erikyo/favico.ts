import { recreateFavico, destroyFavico } from './state';
import { initCodeGenerator } from './code-generator';
import { initBadgeDemo } from './sections/badge-demo';
import { initImageDemo } from './sections/image-demo';
import { initVideoDemo } from './sections/video-demo';
import { initWebcamDemo } from './sections/webcam-demo';
import { initCompatibilityDemo } from './sections/compatibility-demo';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize UI systems
  initCodeGenerator();
  initCompatibilityDemo();

  // Clear console button
  document.getElementById('clear-console-btn')?.addEventListener('click', () => {
    const consoleOutput = document.getElementById('console-output');
    if (consoleOutput) {
      consoleOutput.innerHTML = '';
    }
  });

  // Start the actual Favico instance
  recreateFavico();

  // Bind playgrounds
  initBadgeDemo();
  initImageDemo();
  initVideoDemo();
  initWebcamDemo();
  
  // Teardown event listeners
  window.addEventListener('pagehide', destroyFavico);
  window.addEventListener('beforeunload', destroyFavico);
});
