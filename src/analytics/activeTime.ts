export function bindActiveTime(add: (ms: number) => void): () => void {
  let last = performance.now();
  const tick = () => {
    const now = performance.now();
    if (document.visibilityState === 'visible') add(now - last);
    last = now;
  };
  const onVisibility = () => {
    last = performance.now();
  };
  const timer = window.setInterval(tick, 1000);
  document.addEventListener('visibilitychange', onVisibility);
  return () => {
    window.clearInterval(timer);
    document.removeEventListener('visibilitychange', onVisibility);
  };
}
