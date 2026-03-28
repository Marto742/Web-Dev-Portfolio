import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { posts, getPost } from '@/data/blog'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return posts.map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) return {}

  const ogImage = `https://martinpetrov.dev/api/og/blog/${slug}`

  return {
    title: `${post.title} — Martin Petrov`,
    description: post.description,
    openGraph: {
      title: `${post.title} — Martin Petrov`,
      description: post.description,
      url: `https://martinpetrov.dev/blog/${slug}`,
      type: 'article',
      publishedTime: post.date,
      images: [{ url: ogImage, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${post.title} — Martin Petrov`,
      description: post.description,
      images: [{ url: ogImage, alt: post.title }],
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) notFound()

  let Content: React.ComponentType
  try {
    const mod = await import(`../../../content/blog/${slug}.mdx`)
    Content = mod.default
  } catch {
    notFound()
  }

  return (
    <main className="min-h-screen bg-bg">
      {/* Nav */}
      <div className="fixed top-0 left-0 right-0 z-50 px-6 py-5 flex items-center justify-between border-b border-white/[0.04] bg-bg/80 backdrop-blur-md">
        <Link
          href="/blog"
          className="font-mono text-[11px] tracking-[0.3em] uppercase text-ink-muted hover:text-amber transition-colors duration-300"
        >
          ← Writing
        </Link>
        <span className="font-mono text-[11px] tracking-[0.3em] uppercase text-ink-faint">
          {post.readingTime} read
        </span>
      </div>

      <article className="max-w-2xl mx-auto px-6 pt-36 pb-32">
        {/* Meta */}
        <div className="flex items-center gap-4 mb-8">
          <span className="font-mono text-[10px] tracking-[0.35em] uppercase text-amber">
            {new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
          <span className="w-px h-3 bg-white/[0.1]" aria-hidden="true" />
          <div className="flex gap-2 flex-wrap">
            {post.tags.map(tag => (
              <span
                key={tag}
                className="font-mono text-[10px] tracking-widest uppercase text-ink-faint border border-white/[0.06] px-2 py-0.5"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Title */}
        <h1 className="font-display text-4xl md:text-5xl font-bold text-ink tracking-tight mb-6 leading-[1.1]">
          {post.title}
        </h1>

        {/* Lede */}
        <p className="font-sans text-lg text-ink-muted leading-relaxed mb-12 border-b border-white/[0.04] pb-12">
          {post.description}
        </p>

        {/* MDX content */}
        <div className="prose-none">
          <Content />
        </div>

        {/* Footer */}
        <div className="mt-20 pt-8 border-t border-white/[0.04] flex items-center justify-between">
          <Link
            href="/blog"
            className="font-mono text-[11px] tracking-[0.3em] uppercase text-ink-muted/50 hover:text-amber transition-colors duration-300"
          >
            ← All posts
          </Link>
          <Link
            href="/#contact"
            className="font-mono text-[11px] tracking-[0.3em] uppercase text-amber/60 hover:text-amber transition-colors duration-300"
          >
            Get in touch →
          </Link>
        </div>
      </article>
    </main>
  )
}
