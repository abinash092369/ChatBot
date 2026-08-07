'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { CodeBlock } from './code-block';
import { MermaidRenderer } from './mermaid-renderer';

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="prose dark:prose-invert max-w-none prose-sm sm:prose-base prose-p:leading-relaxed prose-pre:p-0 prose-pre:bg-transparent">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          code({ node, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            const codeString = String(children).replace(/\n$/, '');

            if (language === 'mermaid') {
              return <MermaidRenderer chart={codeString} />;
            }

            if (match || codeString.includes('\n')) {
              return <CodeBlock language={language} value={codeString} />;
            }

            return (
              <code className="px-1.5 py-0.5 rounded-md bg-muted font-mono text-xs font-semibold text-purple-600 dark:text-purple-400" {...props}>
                {children}
              </code>
            );
          },
          table({ children }) {
            return (
              <div className="my-4 overflow-x-auto rounded-xl border bg-card">
                <table className="w-full text-left text-sm divide-y divide-border">{children}</table>
              </div>
            );
          },
          th({ children }) {
            return <th className="px-4 py-3 bg-muted/40 font-semibold">{children}</th>;
          },
          td({ children }) {
            return <td className="px-4 py-3 border-t border-border">{children}</td>;
          },
          a({ href, children }) {
            return (
              <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline font-medium hover:text-primary/80">
                {children}
              </a>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
