import React from 'react';
import { tokenize, tokenColor } from './QuestionRenderer.utils';

export const InlineText: React.FC<{ text: string }> = ({ text }) => {
  const parts = text.split(/(`.+?`)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <code
              key={i}
              className="inline bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-mono text-[0.85em] px-1.5 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-800 mx-0.5 break-words whitespace-pre-wrap align-baseline"
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
};

export const SyntaxHighlight: React.FC<{ code: string }> = ({ code }) => {
  const tokens = tokenize(code);
  return (
    <>
      {tokens.map((tok, i) => (
        <span key={i} style={{ color: tokenColor[tok.type] || '#eeffff' }}>
          {tok.value}
        </span>
      ))}
    </>
  );
};
