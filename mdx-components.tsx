import type { MDXComponents } from 'mdx/types'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => (
      <h1 className="font-display text-4xl md:text-5xl font-bold text-ink tracking-tight mt-12 mb-6 leading-[1.1]">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="font-display text-2xl md:text-3xl font-bold text-ink mt-10 mb-4">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="font-sans text-lg font-semibold text-ink mt-8 mb-3">
        {children}
      </h3>
    ),
    p: ({ children }) => (
      <p className="font-sans text-ink-muted leading-relaxed mb-5 text-base md:text-[17px]">
        {children}
      </p>
    ),
    a: ({ href, children }) => (
      <a
        href={href}
        className="text-amber hover:text-amber-light underline underline-offset-2 transition-colors duration-200"
        target={href?.startsWith('http') ? '_blank' : undefined}
        rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
      >
        {children}
      </a>
    ),
    code: ({ children }) => (
      <code className="font-mono text-sm bg-white/[0.06] text-amber px-1.5 py-0.5 rounded">
        {children}
      </code>
    ),
    pre: ({ children }) => (
      <pre className="font-mono text-sm bg-white/[0.04] border border-white/[0.08] rounded p-5 overflow-x-auto my-6 leading-relaxed">
        {children}
      </pre>
    ),
    ul: ({ children }) => (
      <ul className="font-sans text-ink-muted mb-5 space-y-2 list-none pl-0">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="font-sans text-ink-muted mb-5 space-y-2 list-decimal pl-5">
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li className="flex gap-2 items-start before:content-['—'] before:text-amber/50 before:shrink-0 before:mt-px">
        <span>{children}</span>
      </li>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-2 border-amber/40 pl-5 my-6 italic text-ink-muted">
        {children}
      </blockquote>
    ),
    hr: () => <div className="w-16 h-px bg-amber/20 my-10" />,
    ...components,
  }
}
