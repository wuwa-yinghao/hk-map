export async function takeScreenshot(elementId: string): Promise<string | null> {
  return new Promise((resolve) => {
    if ((window as any).html2canvas) {
      runScreenshot();
    } else {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
      script.onload = runScreenshot;
      script.onerror = () => resolve(null);
      document.head.appendChild(script);
    }

    function runScreenshot() {
      const el = document.getElementById(elementId);
      if (!el) return resolve(null);
      
      (window as any).html2canvas(el, {
        scale: 2,
        backgroundColor: '#0A0C10',
        ignoreElements: (node: Element) => node.hasAttribute('data-html2canvas-ignore')
      }).then((canvas: HTMLCanvasElement) => {
        resolve(canvas.toDataURL('image/png'));
      }).catch(() => resolve(null));
    }
  });
}
