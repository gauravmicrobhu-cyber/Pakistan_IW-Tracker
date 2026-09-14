import { incidents } from './state.js';

export async function callClaude(prompt) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }]
    })
  });
  const data = await res.json();
  const text = data.content?.map(c => c.text||'').join('') || '';
  return text.replace(/```json\n?|\n?```/g, '').trim();
}

// ── ANALYSE FORM ──

export let lastAiResult = null;


export async function analyseForm() {
  const title  = document.getElementById('f-title').value.trim();
  const detail = document.getElementById('f-detail').value.trim();
  if (!title && !detail) { alert('Enter a title or description first.'); return; }

  const btn = document.getElementById('btnAnalyseForm');
  const spinner = document.getElementById('formSpinner');
  btn.disabled = true; spinner.classList.add('active');

  const prompt = `You are an expert analyst at PRISM (Policy Research Institute for Security, Intelligence & Modern Threats), specialising in Pakistan's information warfare operations against India.

Analyse this incident and respond ONLY with a JSON object, no preamble:

Title: ${title}
Details: ${detail}

Return exactly this JSON structure:
{
  "type": "one of: social | media | psyops | cyber | diplo | proxy",
  "severity": "one of: critical | high | medium | low",
  "confidence": "percentage like 87%",
  "actor": "primary attributed actor e.g. ISPR, ISI S-Wing, ISI-linked network, Unknown Pakistani state actor",
  "summary": "2-sentence analytical summary of the operation and its significance",
  "objective": "1-sentence assessment of the strategic objective this operation serves",
  "tags": ["array", "of", "5-8", "OSINT", "tags", "e.g.", "ISPR", "Kashmir", "hashtag-manipulation"]
}`;

  try {
    const raw = await callClaude(prompt);
    const result = JSON.parse(raw);
    lastAiResult = result;

    document.getElementById('ai-type').textContent      = result.type || '—';
    document.getElementById('ai-sev').textContent       = result.severity || '—';
    document.getElementById('ai-conf').textContent      = result.confidence || '—';
    document.getElementById('ai-actor').textContent     = result.actor || '—';
    document.getElementById('ai-summary').textContent   = result.summary || '—';
    document.getElementById('ai-objective').textContent = result.objective || '—';

    const tagsEl = document.getElementById('ai-tags');
    tagsEl.innerHTML = (result.tags||[]).map(t => `<span class="ai-tag">${t}</span>`).join('');

    document.getElementById('formAiPanel').classList.add('visible');
  } catch(e) {
    alert('AI analysis failed. Please try again.');
    console.error(e);
  }

  btn.disabled = false; spinner.classList.remove('active');
}


export function applyAiToForm() {
  if (!lastAiResult) return;
  const typeSelect = document.getElementById('f-type');
  const sevSelect  = document.getElementById('f-sev');
  if (lastAiResult.type && typeSelect.querySelector(`option[value="${lastAiResult.type}"]`)) {
    typeSelect.value = lastAiResult.type;
  }
  if (lastAiResult.severity && sevSelect.querySelector(`option[value="${lastAiResult.severity}"]`)) {
    sevSelect.value = lastAiResult.severity;
  }
  // Show toast
  const toast = document.getElementById('toast');
  toast.textContent = '✓ AI CLASSIFICATION APPLIED';
  toast.style.background = 'var(--purple)';
  toast.classList.add('show');
  setTimeout(() => { toast.classList.remove('show'); toast.textContent='✓ INCIDENT LOGGED'; toast.style.background='var(--teal)'; }, 2000);
}

// ── ANALYSE CARD ──

export async function generateBrief() {
  const spinner  = document.getElementById('briefSpinner');
  const status   = document.getElementById('briefStatus');
  const textEl   = document.getElementById('aiBriefText');
  spinner.classList.add('active');
  status.textContent = 'Generating brief...';
  status.parentElement.style.display = 'flex';
  textEl.style.display = 'none';

  const summary = incidents.slice(0,10).map((i,n) =>
    `${n+1}. [${i.type.toUpperCase()}/${i.sev.toUpperCase()}] ${i.title} (${i.date})`
  ).join('\n');

  const counts = {};
  incidents.forEach(i => counts[i.type] = (counts[i.type]||0)+1);
  const vectorSummary = Object.entries(counts).map(([k,v])=>`${k}:${v}`).join(', ');

  const prompt = `You are the lead analyst at PRISM (Policy Research Institute for Security, Intelligence & Modern Threats), New Delhi. You are writing a concise intelligence brief for Dr. Gaurav Tyagi, Assistant Professor at SCNSS, JNU.

Based on the following ${incidents.length} tracked Pakistan IW incidents (${vectorSummary}):

${summary}

Write a 3-paragraph intelligence brief covering:
1. Current threat landscape assessment — dominant vectors and escalation trends
2. Key patterns and doctrinal observations
3. Priority recommendations for India's counter-FIMI posture

Keep it sharp, analytical, and policy-relevant. Use bold for key terms. Do NOT use bullet points — prose only. Maximum 200 words.`;

  try {
    const text = await callClaude(prompt);
    textEl.innerHTML = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n\n/g, '</p><p style="margin-top:0.75rem;">')
      .replace(/^/, '<p>').replace(/$/, '</p>');
    status.parentElement.style.display = 'none';
    textEl.style.display = 'block';
  } catch(e) {
    status.textContent = 'Brief generation failed. Click Refresh to retry.';
    spinner.classList.remove('active');
    console.error(e);
    return;
  }
  spinner.classList.remove('active');
}

// ── TAB SWITCHING ──
