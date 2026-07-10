export function initCompatibilityDemo() {
  const list = document.getElementById('compat-list');
  if (!list) return;

  function check(name: string, isSupported: boolean) {
    const li = document.createElement('li');
    li.innerHTML = `<span>${name}</span> <span class="${isSupported ? 'compat-yes' : 'compat-no'}">${isSupported ? 'Yes' : 'No'}</span>`;
    list!.appendChild(li);
  }

  check('DOM Access', typeof window !== 'undefined' && typeof document !== 'undefined');
  check('Canvas 2D', !!window.CanvasRenderingContext2D);
  
  const canvas = document.createElement('canvas');
  check('Canvas data URLs', typeof canvas.toDataURL === 'function');
  
  check('requestAnimationFrame', typeof requestAnimationFrame === 'function');
  
  check('requestVideoFrameCallback', 'requestVideoFrameCallback' in HTMLVideoElement.prototype);
  check('navigator.mediaDevices', !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia));
  
  check('ImageBitmap', typeof createImageBitmap === 'function');
  check('Page Visibility API', typeof document.hidden !== 'undefined');
  
  check('Secure Context', window.isSecureContext);
}
