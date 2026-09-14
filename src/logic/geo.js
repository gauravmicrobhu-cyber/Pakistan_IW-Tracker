export function greatCircleArc(o, d, curveHeight) {
  // Build a gently-curved path between two real lat/lng points (not just a straight geodesic)
  // by bowing the midpoint outward — reads as a "flow" line on the actual map.
  const midLat = (o.lat + d.lat) / 2;
  const midLng = (o.lng + d.lng) / 2;
  const dx = d.lng - o.lng, dy = d.lat - o.lat;
  const dist = Math.sqrt(dx*dx + dy*dy) || 1;
  // perpendicular offset
  const offLat = (-dx / dist) * curveHeight;
  const offLng = (dy / dist) * curveHeight;
  const bendLat = midLat + offLat;
  const bendLng = midLng + offLng;
  const pts = [];
  const STEPS = 40;
  for (let i = 0; i <= STEPS; i++) {
    const t = i / STEPS;
    const lat = (1-t)*(1-t)*o.lat + 2*(1-t)*t*bendLat + t*t*d.lat;
    const lng = (1-t)*(1-t)*o.lng + 2*(1-t)*t*bendLng + t*t*d.lng;
    pts.push([lat, lng]);
  }
  return pts;
}

// ── LIVE SIGNALS (X/Twitter embedded search feed — no API key required) ──
