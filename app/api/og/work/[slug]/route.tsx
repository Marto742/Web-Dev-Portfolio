import { ImageResponse } from 'next/og'
import { projects } from '@/data/portfolio'
import { slugify } from '@/lib/slugify'

export const runtime = 'edge'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const project = projects.find(p => slugify(p.title) === slug)

  if (!project) {
    return new Response('Not found', { status: 404 })
  }

  const techLine = project.tech.join(' · ')

  return new ImageResponse(
    (
      <div
        style={{
          background: '#090909',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px 96px',
        }}
      >
        {/* Amber glow */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '500px',
            height: '260px',
            background: 'radial-gradient(ellipse at bottom left, rgba(245,166,35,0.14) 0%, transparent 70%)',
          }}
        />

        {/* Category + year label */}
        <p
          style={{
            fontFamily: 'monospace',
            fontSize: 13,
            letterSpacing: '0.35em',
            textTransform: 'uppercase',
            color: '#F5A623',
            margin: '0 0 28px',
          }}
        >
          {project.category} · {project.year}
        </p>

        {/* Project title */}
        <h1
          style={{
            fontFamily: 'serif',
            fontSize: 72,
            fontWeight: 700,
            color: '#F5F5F0',
            margin: '0 0 32px',
            letterSpacing: '-0.02em',
            lineHeight: 1.05,
            maxWidth: '900px',
          }}
        >
          {project.title}
        </h1>

        {/* Divider */}
        <div
          style={{
            width: 56,
            height: 2,
            background: 'rgba(245,166,35,0.4)',
            margin: '0 0 32px',
          }}
        />

        {/* Tech stack */}
        <p
          style={{
            fontFamily: 'monospace',
            fontSize: 14,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#4A4A4A',
            margin: 0,
          }}
        >
          {techLine}
        </p>

        {/* Attribution */}
        <p
          style={{
            position: 'absolute',
            bottom: 48,
            right: 96,
            fontFamily: 'monospace',
            fontSize: 12,
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: '#2A2A2A',
            margin: 0,
          }}
        >
          martinpetrov.dev
        </p>
      </div>
    ),
    { width: 1200, height: 630 },
  )
}
