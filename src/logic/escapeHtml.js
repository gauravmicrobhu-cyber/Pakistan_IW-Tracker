// ── HTML ESCAPING ── shared utility for safely interpolating untrusted/user-supplied strings
// into innerHTML-assigned template strings. Community-submitted incident fields (routed through
// the public submission pipeline) and GitHub-Issue-derived Pending Review content are NOT
// author-controlled the way the curated seed data is, so every such field must be escaped before
// it touches innerHTML. Does not escape internally-generated labels/colors/class names — only
// wrap actual incident-supplied or issue-supplied string fields with this.

export function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
