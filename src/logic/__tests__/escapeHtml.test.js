import { describe, it, expect } from 'vitest';
import { escapeHtml } from '../escapeHtml.js';

describe('escapeHtml', () => {
  it('escapes &, <, >, ", \' individually', () => {
    expect(escapeHtml('&')).toBe('&amp;');
    expect(escapeHtml('<')).toBe('&lt;');
    expect(escapeHtml('>')).toBe('&gt;');
    expect(escapeHtml('"')).toBe('&quot;');
    expect(escapeHtml("'")).toBe('&#39;');
  });

  it('escapes multiple special characters in one string, in the correct order (& first)', () => {
    expect(escapeHtml('<script>alert("XSS")</script>')).toBe(
      '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;'
    );
    expect(escapeHtml(`Tom & Jerry's "big" <adventure>`)).toBe(
      'Tom &amp; Jerry&#39;s &quot;big&quot; &lt;adventure&gt;'
    );
  });

  it('does not double-escape an already-escaped ampersand incorrectly beyond a single pass', () => {
    expect(escapeHtml('a & b')).toBe('a &amp; b');
  });

  it('leaves plain text without special characters unchanged', () => {
    expect(escapeHtml('Plain incident title with no markup')).toBe('Plain incident title with no markup');
  });

  it('returns an empty string for null, undefined, and empty-string input without throwing', () => {
    expect(escapeHtml(null)).toBe('');
    expect(escapeHtml(undefined)).toBe('');
    expect(escapeHtml('')).toBe('');
  });

  it('coerces non-string input (numbers) to a string', () => {
    expect(escapeHtml(42)).toBe('42');
  });
});
