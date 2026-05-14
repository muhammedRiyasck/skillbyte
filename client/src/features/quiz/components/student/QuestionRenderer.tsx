import React from 'react';
import { Terminal } from 'lucide-react';
import { InlineText, SyntaxHighlight } from './QuestionRenderer.components';
import { formatCode } from './QuestionRenderer.utils';

export const QuestionRenderer: React.FC<{ text: string }> = ({ text }) => {
  // Normalize triple backticks and single backticks that look like code blocks.
  let normalizedText = text.replace(/```(?:\w+)?\s*\n?([\s\S]*?)\n?\s*```/g, '\n```\n$1\n```\n');
  
  // Handle single backticks containing obvious JS/TS code or very long content
  // e.g. `javascript async function...` or ` jsfunction... `
  normalizedText = normalizedText.replace(/`\s*(?:javascript|js|typescript|ts)?\s*(function|async|const|let|var|class|console\.|import\s|export\s)[\s\S]*?`/gi, (match) => {
    const inner = match.slice(1, -1).trim();
    const cleanInner = inner.replace(/^(?:javascript|js|typescript|ts)\s*/i, '');
    return '\n```\n' + cleanInner + '\n```\n';
  });

  const codeBlockSplitter = /\n```\n([\s\S]*?)\n```\n/g;
  const parts = [];
  let lastIndex = 0;
  let match;
  
  // ensure we have enough padding for splitting
  const paddedText = '\n' + normalizedText + '\n';

  while ((match = codeBlockSplitter.exec(paddedText)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: paddedText.substring(lastIndex, match.index) });
    }
    parts.push({ type: 'code', content: match[1] });
    lastIndex = codeBlockSplitter.lastIndex;
  }
  
  if (lastIndex < paddedText.length) {
    parts.push({ type: 'text', content: paddedText.substring(lastIndex) });
  }

  const hasCodeBlocks = parts.some(p => p.type === 'code');

  if (hasCodeBlocks) {
    return (
      <div className="space-y-6">
        {parts.map((part, i) => {
          if (part.type === 'code') {
            const formattedCode = formatCode(part.content.trim());
            return (
              <div key={i} className="relative group my-4">
                 <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
                 <pre className="relative bg-gray-900 text-indigo-300 p-6 rounded-xl overflow-x-auto font-mono text-sm leading-relaxed border border-gray-800 shadow-2xl">
                    <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-800 opacity-50">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                      <span className="ml-2 text-[10px] font-bold text-gray-500 tracking-widest uppercase">JavaScript Snippet</span>
                    </div>
                    <code><SyntaxHighlight code={formattedCode} /></code>
                 </pre>
              </div>
            );
          } else {
            const textContent = part.content.trim();
            if (!textContent) return null;
            return (
              <h2 key={i} className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-relaxed tracking-tight whitespace-pre-wrap">
                <InlineText text={textContent} />
              </h2>
            );
          }
        })}
      </div>
    );
  }

  // 4. Robust Fallback for Unformatted AI Text
  // Try to find an intro, code, and a question.
  // Pattern: [Intro] [Code] [Question]
  const introRegex = /^(Given the following code:|Look at this snippet:|Consider the following.*?snippet:|Consider this code:|Analyze the following code:)\s*/i;
  const introMatch = text.match(introRegex);
  
  let intro = '';
  let remainingText = text;
  
  if (introMatch) {
    intro = introMatch[1];
    remainingText = text.substring(introMatch[0].length);
  }

  // Look for the actual question part (usually starts with What, Which, How, etc.)
  const questionStartRegex = /\b(What|Which|How|Identify|Evaluate|Choose|True or False)\b/i;
  
  const textMatches = Array.from(remainingText.matchAll(new RegExp(questionStartRegex, 'gi')));
  let questionIndex = -1;
  
  if (textMatches.length > 0) {
    // Prioritize the FIRST occurrence for splitting to avoid cutting the question in half
    questionIndex = textMatches[0].index!;
  }

  if (questionIndex !== -1) {
    const rawCode = remainingText.substring(0, questionIndex).trim();
    const question = remainingText.substring(questionIndex).trim();

    // Stricter code detection for non-backticked blocks
    // Must have structural markers AND not start like a prose sentence
    const hasStructure = /({|}|=>|\bfunction\s*\(|\bconst\s+\w+\s*=|\blet\s+\w+\s*=|\bvar\s+\w+\s*=|\bclass\s+\w+|;\s*(\n|$))/.test(rawCode);
    const looksLikeProse = /^(Given|Consider|Look at|Analyze|The)\s+[a-z]+/i.test(rawCode);
    
    const isCode = hasStructure && !looksLikeProse && rawCode.length > 10;

    if (isCode) {
      const code = formatCode(rawCode);
      return (
        <div className="space-y-6">
          {intro && (
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm uppercase tracking-wider">
              <Terminal className="w-4 h-4" />
              {intro}
            </div>
          )}
          <div className="relative group my-4">
            <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
            <pre className="relative bg-gray-900 text-indigo-300 p-6 rounded-xl font-mono text-sm leading-relaxed border border-gray-800 shadow-2xl whitespace-pre-wrap break-words">
              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-800 opacity-50">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                <span className="ml-2 text-[10px] font-bold text-gray-500 tracking-widest uppercase">JavaScript Snippet</span>
              </div>
              <code><SyntaxHighlight code={code} /></code>
            </pre>
          </div>
          <div className="pt-4">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-relaxed tracking-tight">
              <InlineText text={question} />
            </h2>
          </div>
        </div>
      );
    }
  }

  // Final Fallback: Just render the text nicely with inline code support
  return (
    <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-relaxed tracking-tight">
      <InlineText text={text} />
    </h2>
  );
};

export default QuestionRenderer;
