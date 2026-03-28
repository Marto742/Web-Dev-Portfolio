import type { Metadata } from 'next'
import Link from 'next/link'
import { posts } from '@/data/blog'

export const metadata: Metadata = {
  title: 'Writing — Martin Petrov',
  description:
    'Technical writing on React, Three.js, WebGL, WebGPU, and building SaaS products solo.',
  openGraph: {
    title: 'Writing — Martin Petrov',
    description:
      'Technical writing on React, Three.js, WebGL, WebGPU, and building SaaS products solo.',
    url: 'https://martinpetrov.dev/blog',
  },
}

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-bg">
      {/* Nav */}
      <div className="fixed top-0 left-0 right-0 z-50 px-6 py-5 flex items-center justify-between border-b border-white/[0.04] bg-bg/80 backdrop-blur-md">
        <Link
          href="/"
          className="font-mono text-[11px] tracking-[0.3em] uppercase text-ink-muted hover:text-amber transition-colors duration-300"
        >
          ← Martin Petrov
        </Link>
        <span className="font-mono text-[11px] tracking-[0.3em] uppercase text-ink-faint">
          Writing
        </span>
      </div>

      <div className="max-w-3xl mx-auto px-6 pt-36 pb-32">
        {/* Header */}
        <p className="font-mono text-xs tracking-[0.35em] uppercase text-amber mb-6">
          Writing
        </p>
        <h1 className="font-display text-5xl md:text-6xl font-bold tracking-tight text-ink mb-4 leading-[1.05]">
          Technical notes.
        </h1>
        <p className="font-sans text-ink-muted mb-16 max-w-lg">
          Deep dives on WebGL, React, and building in public.
        </p>

        {/* Post list */}
        <div className="space-y-0 divide-y divide-white/[0.04]">
          {posts.map(post => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col md:flex-row md:items-baseline gap-2 md:gap-8 py-8 hover:bg-white/[0.02] -mx-4 px-4 transition-colors duration-300"
            >
              <span className="font-mono text-[10px] tracking-widest uppercase text-ink-faint shrink-0 md:w-24">
                {new Date(post.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </span>
              <div className="flex-1">
                <h2 className="font-display text-xl font-bold text-ink group-hover:text-amber transition-colors duration-300 mb-2">
                  {post.title}
                </h2>
                <p className="font-sans text-sm text-ink-muted leading-relaxed mb-3">
                  {post.description}
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                  {post.tags.map(tag => (
                    <span
                      key={tag}
                      className="font-mono text-[10px] tracking-widest uppercase text-ink-faint border border-white/[0.06] px-2 py-0.5"
                    >
                      {tag}
                    </span>
                  ))}
                  <span className="font-mono text-[10px] tracking-widest text-ink-faint ml-auto">
                    {post.readingTime} read
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
