export function showToast(msg, color) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.style.background = color || 'var(--teal)';
  toast.classList.add('show');
  setTimeout(() => { toast.classList.remove('show'); toast.textContent = '✓ INCIDENT LOGGED'; toast.style.background = 'var(--teal)'; }, 2200);
}


export function updateClock() {
  const now = new Date();
  const ist = new Date(now.getTime() + (5.5 * 3600000 - now.getTimezoneOffset() * 60000));
  const h = String(ist.getUTCHours()).padStart(2,'0');
  const m = String(ist.getUTCMinutes()).padStart(2,'0');
  const s = String(ist.getUTCSeconds()).padStart(2,'0');
  document.getElementById('clock').textContent = `${h}:${m}:${s} IST`;
}
