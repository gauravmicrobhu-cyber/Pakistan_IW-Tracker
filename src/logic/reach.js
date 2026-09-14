export function parseReachValue(str) {
  if (!str) return null;
  const s = str.toLowerCase();
  const candidates = [];
  const unitMap = { crore: 1e7, lakh: 1e5, million: 1e6, mn: 1e6, billion: 1e9, bn: 1e9, thousand: 1e3 };

  const unitRe = /([\d,]+\.?\d*)\s*(crore|lakh|million|mn|billion|bn|thousand)/gi;
  let m;
  while ((m = unitRe.exec(s))) {
    const num = parseFloat(m[1].replace(/,/g,''));
    if (!isNaN(num)) candidates.push(num * unitMap[m[2]]);
  }

  const suffixRe = /([\d.]+)\s*([mbk])\b/gi;
  while ((m = suffixRe.exec(s))) {
    const num = parseFloat(m[1]);
    const mult = m[2].toLowerCase() === 'b' ? 1e9 : m[2].toLowerCase() === 'm' ? 1e6 : 1e3;
    if (!isNaN(num)) candidates.push(num * mult);
  }

  const commaRe = /(\d{1,3}(?:,\d{3})+)/g;
  while ((m = commaRe.exec(s))) {
    const num = parseFloat(m[1].replace(/,/g,''));
    if (!isNaN(num)) candidates.push(num);
  }

  return candidates.length ? Math.max(...candidates) : null;
}


export function formatCompactNumber(n) {
  if (n >= 1e9) return (n/1e9).toFixed(n >= 1e10 ? 0 : 1) + 'B';
  if (n >= 1e6) return (n/1e6).toFixed(n >= 1e7 ? 0 : 1) + 'M';
  if (n >= 1e3) return (n/1e3).toFixed(n >= 1e4 ? 0 : 1) + 'K';
  return String(Math.round(n));
}

