import { favico, logConsole, updateStatus, onFavicoDestroy } from '../state';
import { updateCodeSnippets } from '../code-generator';

export function initWebcamDemo() {
  const statusEl = document.getElementById('webcam-status');
  let currentStream: MediaStream | null = null;

  function stopTracks() {
    if (currentStream) {
      for (const track of currentStream.getTracks()) {
        track.stop();
      }
      currentStream = null;
    }
  }

  onFavicoDestroy(() => {
    if (favico) favico.stopWebcam();
    stopTracks();
    if (statusEl) statusEl.textContent = 'Webcam inactive.';
  });

  document.getElementById('webcam-start')?.addEventListener('click', async () => {
    if (!favico) return;
    try {
      currentStream = (await favico.startWebcam({ video: true, audio: false })) || null;
      if (statusEl) statusEl.textContent = 'Webcam active (tracks running).';
      updateStatus('Live', 'Webcam');
      logConsole('success', 'Webcam started');
      updateCodeSnippets(`await favico.startWebcam({ video: true, audio: false });`);
    } catch (e) {
      logConsole('error', `Webcam failed: ${e}`);
      if (statusEl) statusEl.textContent = 'Permission denied or error.';
    }
  });

  document.getElementById('webcam-stop')?.addEventListener('click', () => {
    if (!favico) return;
    favico.stopWebcam();
    stopTracks();
    if (statusEl) statusEl.textContent = 'Webcam inactive.';
    updateStatus('Stopped', 'Webcam');
    logConsole('info', 'Webcam stopped');
    updateCodeSnippets(`favico.stopWebcam();`);
  });
}
