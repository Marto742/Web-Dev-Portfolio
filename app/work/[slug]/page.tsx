import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { projects } from '@/data/portfolio'
import { slugify } from '@/lib/slugify'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return projects.map(p => ({ slug: slugify(p.title) }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const project = projects.find(p => slugify(p.title) === slug)
  if (!project) return {}

  const ogImage = `https://martinpetrov.dev/api/og/work/${slug}`

  return {
    title: `${project.title} — Martin Petrov`,
    description: project.description,
    openGraph: {
      title: `${project.title} — Martin Petrov`,
      description: project.description,
      url: `https://martinpetrov.dev/work/${slug}`,
      images: [{ url: ogImage, width: 1200, height: 630, alt: project.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${project.title} — Martin Petrov`,
      description: project.description,
      images: [{ url: ogImage, alt: project.title }],
    },
  }
}

export default async function WorkPage({ params }: Props) {
  const { slug } = await params
  const project = projects.find(p => slugify(p.title) === slug)
  if (!project) notFound()

  const caseStudySchema = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: project.description,
    url: `https://martinpetrov.dev/work/${slug}`,
    dateCreated: project.year,
    creator: {
      '@type': 'Person',
      name: 'Martin Petrov',
      url: 'https://martinpetrov.dev',
    },
    keywords: project.tech.join(', '),
    image: `https://martinpetrov.dev/api/og/work/${slug}`,
  }

  return (
    <main className="min-h-screen bg-bg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(caseStudySchema) }}
      />
      {/* Nav bar */}
      <div className="fixed top-0 left-0 right-0 z-50 px-6 py-5 flex items-center justify-between border-b border-white/[0.04] bg-bg/80 backdrop-blur-md">
        <Link
          href="/"
          className="font-mono text-[11px] tracking-[0.3em] uppercase text-ink-muted hover:text-amber transition-colors duration-300"
        >
          ← Martin Petrov
        </Link>
        <span className="font-mono text-[11px] tracking-[0.3em] uppercase text-ink-faint">
          Case Study
        </span>
      </div>

      <div className="max-w-4xl mx-auto px-6 pt-36 pb-32">
        {/* Category label */}
        <p className="font-mono text-xs tracking-[0.35em] uppercase text-amber mb-6">
          {project.category} · {project.year}
        </p>

        {/* Title */}
        <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight text-ink mb-8 leading-[1.05]">
          {project.title}
        </h1>

        {/* Divider */}
        <div className="w-16 h-px bg-amber/30 mb-10" />

        {/* Description */}
        <p className="font-sans text-lg md:text-xl text-ink-muted leading-relaxed max-w-2xl mb-14">
          {project.description}
        </p>

        {/* Tech stack */}
        <div className="mb-14">
          <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-ink-faint mb-4">
            Tech Stack
          </p>
          <div className="flex flex-wrap gap-2">
            {project.tech.map(t => (
              <span
                key={t}
                className="font-mono text-xs tracking-wider px-3 py-1.5 border border-white/[0.08] text-ink-muted"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Live link */}
        {project.link && project.link !== '#' && (
          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 font-mono text-sm tracking-[0.2em] uppercase text-amber border border-amber/40 px-8 py-4 hover:bg-amber/8 hover:border-amber transition-all duration-300"
          >
            View live project ↗
          </a>
        )}

        {/* Footer nav */}
        <div className="mt-24 pt-8 border-t border-white/[0.04] flex items-center justify-between">
          <Link
            href="/"
            className="font-mono text-[11px] tracking-[0.3em] uppercase text-ink-muted/50 hover:text-amber transition-colors duration-300"
          >
            ← Back to portfolio
          </Link>
          <span className="font-mono text-[10px] tracking-wider text-ink-faint">
            martinpetrov.dev
          </span>
        </div>
      </div>
    </main>
  )
}
