import { favico, logConsole, updateStatus, onFavicoDestroy } from '../state';
import { updateCodeSnippets } from '../code-generator';

export function initVideoDemo() {
  const video = document.getElementById('sample-video') as HTMLVideoElement;

  onFavicoDestroy(() => {
    video.pause();
  });

  document.getElementById('video-start')?.addEventListener('click', async () => {
    if (!favico) return;
    try {
      if (video.paused) {
        await video.play();
      }
      await favico.startVideo(video);
      updateStatus('Playing', 'Video');
      logConsole('success', 'Video rendering started');
      updateCodeSnippets(`const video = document.getElementById('sample-video');\nawait favico.startVideo(video);`);
    } catch (e) {
      logConsole('error', String(e));
    }
  });

  document.getElementById('video-stop')?.addEventListener('click', () => {
    if (!favico) return;
    favico.stopVideo();
    video.pause();
    updateStatus('Stopped', 'Video');
    logConsole('info', 'Video rendering stopped');
    updateCodeSnippets(`favico.stopVideo();`);
  });
}
