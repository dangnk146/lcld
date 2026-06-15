"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

function buildComponents(compact: boolean): Components {
  const text = compact ? "text-[10px]" : "text-xs";
  const heading1 = compact ? "text-sm" : "text-base";
  const heading2 = compact ? "text-xs" : "text-sm";
  const heading3 = compact ? "text-[11px]" : "text-xs";

  return {
    h1: ({ children }) => (
      <h1 className={`${heading1} font-bold text-slate-900 border-b border-sky-100 pb-1.5 mt-4 mb-2 uppercase tracking-wide`}>
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className={`${heading2} font-bold text-sky-800 mt-4 mb-2 uppercase tracking-wide flex items-center gap-1.5`}>
        <span className="w-1 h-3.5 bg-sky-600 rounded-sm shrink-0" />
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className={`${heading3} font-bold text-sky-700 mt-3 mb-1.5`}>{children}</h3>
    ),
    h4: ({ children }) => (
      <h4 className={`${text} font-semibold text-slate-700 mt-2 mb-1`}>{children}</h4>
    ),
    p: ({ children }) => (
      <p className={`${text} text-slate-700 leading-relaxed my-1.5`}>{children}</p>
    ),
    ul: ({ children }) => (
      <ul className={`${text} list-disc pl-4 space-y-1 my-2 text-slate-700`}>{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className={`${text} list-decimal pl-4 space-y-1 my-2 text-slate-700`}>{children}</ol>
    ),
    li: ({ children }) => <li className="leading-relaxed">{children}</li>,
    blockquote: ({ children }) => (
      <blockquote className={`${text} border-l-4 border-sky-500 bg-sky-50/60 pl-3 py-1.5 pr-2 my-2 rounded-r-lg text-slate-700 italic`}>
        {children}
      </blockquote>
    ),
    strong: ({ children }) => <strong className="font-semibold text-slate-900">{children}</strong>,
    em: ({ children }) => <em className="italic text-slate-600">{children}</em>,
    code: ({ className, children }) => {
      const isBlock = className?.includes("language-");
      if (isBlock) {
        return (
          <code className="block text-[10px] font-mono bg-slate-900 text-slate-100 rounded-lg p-3 my-2 overflow-x-auto whitespace-pre-wrap">
            {children}
          </code>
        );
      }
      return (
        <code className="bg-slate-100 px-1 py-0.5 rounded text-[10px] font-mono text-slate-800 border border-slate-200">
          {children}
        </code>
      );
    },
    pre: ({ children }) => (
      <pre className="my-2 overflow-x-auto rounded-lg">{children}</pre>
    ),
    table: ({ children }) => (
      <div className="my-3 overflow-x-auto border border-sky-100 rounded-lg shadow-sm">
        <table className="w-full text-left border-collapse text-[10px] bg-white min-w-[280px]">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => <thead className="bg-sky-50 border-b border-sky-100">{children}</thead>,
    th: ({ children }) => (
      <th className="p-2 font-bold text-sky-900 whitespace-nowrap">{children}</th>
    ),
    td: ({ children }) => (
      <td className="p-2 text-slate-700 border-t border-sky-50 align-top">{children}</td>
    ),
    tr: ({ children }) => <tr className="hover:bg-sky-50/40">{children}</tr>,
    hr: () => <hr className="my-3 border-sky-100" />,
    a: ({ href, children }) => (
      <a href={href} target="_blank" rel="noopener noreferrer" className="text-sky-700 underline hover:text-sky-900">
        {children}
      </a>
    ),
  };
}

export function MarkdownRenderer({
  content,
  compact = false,
}: {
  content: string;
  compact?: boolean;
}) {
  return (
    <div className={`markdown-body ${compact ? "markdown-compact" : ""}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={buildComponents(compact)}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
