import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";

type MarkdownAnswerProps = {
  content: string;
};

function normalizeMath(content: string) {
  return content
    .replace(/\\\[((?:.|\n)*?)\\\]/g, "\n$$$$\n$1\n$$$$\n")
    .replace(/\\\((.+?)\\\)/g, "$$$1$")
    .replace(/\[FORMULE\]((?:.|\n)*?)\[\/FORMULE\]/g, "\n$$$$\n$1\n$$$$\n");
}

export function MarkdownAnswer({ content }: MarkdownAnswerProps) {
  const normalizedContent = normalizeMath(content);

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 text-base leading-8 text-slate-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] sm:p-7">
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          h1: ({ children }) => (
            <h1 className="mb-4 mt-2 text-3xl font-black leading-tight tracking-tight text-ink">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-3 mt-7 border-t border-slate-200 pt-5 text-2xl font-black leading-tight tracking-tight text-ink first:mt-0 first:border-t-0 first:pt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-2 mt-5 text-lg font-black leading-tight text-ink">{children}</h3>
          ),
          p: ({ children }) => <p className="my-3 max-w-none text-slate-800">{children}</p>,
          ul: ({ children }) => (
            <ul className="my-4 list-disc space-y-2 pl-6 marker:text-lagoon">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="my-4 list-decimal space-y-2 pl-6 marker:font-bold marker:text-lagoon">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="pl-1">{children}</li>,
          strong: ({ children }) => <strong className="font-black text-ink">{children}</strong>,
          blockquote: ({ children }) => (
            <blockquote className="my-5 border-l-4 border-lagoon bg-paper px-5 py-3 font-semibold text-ink">
              {children}
            </blockquote>
          ),
          code: ({ className, children }) => {
            const isBlock = Boolean(className);

            if (!isBlock) {
              return (
                <code className="rounded-md border border-slate-200 bg-paper px-1.5 py-0.5 font-mono text-[0.92em] font-bold text-ink">
                  {children}
                </code>
              );
            }

            return (
              <code className={`${className} block whitespace-pre-wrap font-mono text-sm`}>
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="my-5 overflow-x-auto rounded-lg bg-[#1f2930] p-4 text-sm leading-7 text-white">
              {children}
            </pre>
          ),
          table: ({ children }) => (
            <div className="my-5 overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full border-collapse text-left text-sm">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border-b border-slate-200 bg-paper px-4 py-3 font-black text-ink">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-b border-slate-100 px-4 py-3 align-top">{children}</td>
          ),
        }}
      >
        {normalizedContent}
      </ReactMarkdown>
    </article>
  );
}
