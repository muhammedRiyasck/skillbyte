// ── Zero-dependency JavaScript syntax highlighter ──────────────────────────
export type Token = { type: string; value: string };

export const tokenize = (code: string): Token[] => {
  const tokens: Token[] = [];
  const patterns: [string, RegExp][] = [
    ['comment',  /^(\/\/[^\n]*|\/\*[\s\S]*?\*\/)/],
    ['string',   /^(`(?:\\[\s\S]|[^`\\])*`|'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*")/],
    ['number',   /^-?\d+(\.\d+)?/],
    ['keyword',  /^\b(function|async|await|return|const|let|var|new|if|else|for|while|of|in|typeof|class|this|true|false|null|undefined|import|export|default)\b/],
    ['builtin',  /^\b(Promise|Object|Array|console|setTimeout|Math|JSON)\b/],
    ['method',   /^\.([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?=\()/],
    ['fn',       /^\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?=\()/],
    ['punct',    /^([{}()[\];,]|=>|\.)/],
    ['space',    /^(\s+)/],
    ['other',    /^[^\s]+/],
  ];

  let remaining = code;
  while (remaining.length > 0) {
    let matched = false;
    for (const [type, re] of patterns) {
      const m = remaining.match(re);
      if (m) {
        tokens.push({ type, value: m[0] });
        remaining = remaining.slice(m[0].length);
        matched = true;
        break;
      }
    }
    if (!matched) { tokens.push({ type: 'other', value: remaining[0] }); remaining = remaining.slice(1); }
  }
  return tokens;
};

export const tokenColor: Record<string, string> = {
  keyword: '#c792ea',   // purple
  builtin: '#82aaff',   // blue
  fn:      '#82aaff',   // blue
  method:  '#82aaff',   // blue
  string:  '#c3e88d',   // green
  number:  '#f78c6c',   // orange
  comment: '#546e7a',   // grey
  punct:   '#89ddff',   // cyan
  other:   '#eeffff',   // white
  space:   'inherit',
};

// Auto-formatter: adds line breaks and indentation to flat AI-generated code strings
export const formatCode = (code: string): string => {
  // If the code is wrapped in single backticks, strip them (AI marker mistake)
  let cleanCode = code.trim();
  if (cleanCode.startsWith('`') && cleanCode.endsWith('`') && (cleanCode.match(/`/g) || []).length === 2) {
    cleanCode = cleanCode.slice(1, -1).trim();
  }

  // If the code already has newlines, it's already formatted — return as-is
  if (cleanCode.includes('\n')) return cleanCode;

  let result = '';
  let indent = 0;
  const INDENT = '  '; // 2 spaces

  // Tokenize character by character
  let i = 0;
  const targetCode = cleanCode;
  while (i < targetCode.length) {
    const ch = targetCode[i];
    const next = targetCode[i + 1] || '';

    // Skip leading spaces only right after a newline (we handle indentation ourselves)
    if (ch === ' ' && result.endsWith('\n')) {
      i++;
      continue;
    }

    if (ch === '{') {
      result += ' {\n';
      indent++;
      result += INDENT.repeat(indent);
    } else if (ch === '}') {
      // Remove trailing spaces before closing brace
      result = result.trimEnd();
      result += '\n';
      indent = Math.max(0, indent - 1);
      result += INDENT.repeat(indent) + '}';
      // Add newline after } unless it's followed by more closing or end
      if (next && next !== ')' && next !== ';' && next !== ',') {
        result += '\n' + INDENT.repeat(indent);
      }
    } else if (ch === ';') {
      result += ';\n' + INDENT.repeat(indent);
    } else if (ch === ',' && (next === ' ' || next === '\n')) {
      result += ', ';
      i++; // skip the space
    } else {
      result += ch;
    }
    i++;
  }

  // Clean up: remove consecutive blank lines and trailing whitespace on each line
  return result
    .split('\n')
    .map(line => line.trimEnd())
    .filter((line, idx, arr) => !(line === '' && arr[idx - 1] === ''))
    .join('\n')
    .trim();
};
