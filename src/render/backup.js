import { incidents, annotations, setAnnotations, saveAnnotations, saveIncidents } from '../state.js';
import { enrichIncident } from '../logic/enrichIncident.js';
import { renderFeed } from './feed.js';
import { showToast } from './misc.js';

export function getUserIncidents() { return incidents.filter(i => !i.seed); }

export function hasLocalUserData() { return getUserIncidents().length > 0 || Object.keys(annotations).length > 0; }


export function backupUserData() {
  const payload = {
    exportedAt: new Date().toISOString(),
    annotations: annotations,
    userIncidents: getUserIncidents()
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `pakistan-iw-tracker-backup-${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
  localStorage.setItem('tracker_last_backup', Date.now().toString());
  showToast('Backup downloaded');
  updateBackupBanner();
}


export function restoreUserData(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const payload = JSON.parse(e.target.result);
      let annCount = 0, incCount = 0;
      if (payload.annotations && typeof payload.annotations === 'object') {
        setAnnotations({ ...annotations, ...payload.annotations });
        saveAnnotations();
        annCount = Object.keys(payload.annotations).length;
      }
      if (Array.isArray(payload.userIncidents)) {
        const existingIds = new Set(incidents.map(i => i.id));
        payload.userIncidents.forEach(inc => {
          if (!existingIds.has(inc.id)) {
            enrichIncident(inc);
            incidents.push(inc);
            incCount++;
          }
        });
        saveIncidents();
      }
      renderFeed();
      showToast(`Restored ${incCount} incident(s), ${annCount} annotation(s)`);
      updateBackupBanner();
    } catch (err) {
      showToast('Restore failed — not a valid backup file', 'var(--accent)');
    }
  };
  reader.readAsText(file);
  document.getElementById('restoreFileInput').value = '';
}


export function updateBackupBanner() {
  const banner = document.getElementById('backupBanner');
  const status = document.getElementById('backupStatus');
  if (!banner) return;
  if (!hasLocalUserData()) {
    banner.style.display = 'none';
    status.textContent = '';
    return;
  }
  banner.style.display = 'flex';
  const lastBackup = localStorage.getItem('tracker_last_backup');
  const daysSince = lastBackup ? (Date.now() - parseInt(lastBackup)) / 86400000 : Infinity;
  if (lastBackup && daysSince < 3) {
    banner.classList.add('ok');
    status.textContent = `Last backup: ${new Date(parseInt(lastBackup)).toLocaleString('en-IN')}`;
  } else {
    banner.classList.remove('ok');
    status.textContent = lastBackup ? `Last backup: ${new Date(parseInt(lastBackup)).toLocaleString('en-IN')} — consider backing up again` : 'No backup taken yet.';
  }
}

