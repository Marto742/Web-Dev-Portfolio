import { ImageResponse } from 'next/og'
import { getPost } from '@/data/blog'

export const runtime = 'edge'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const post = getPost(slug)

  if (!post) {
    return new Response('Not found', { status: 404 })
  }

  const tagLine = post.tags.join(' · ')
  const date = new Date(post.date).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

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
        {/* Amber glow — top right for visual variety vs work pages */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '500px',
            height: '260px',
            background: 'radial-gradient(ellipse at top right, rgba(245,166,35,0.12) 0%, transparent 70%)',
          }}
        />

        {/* Writing label + date */}
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
          Writing · {date}
        </p>

        {/* Article title */}
        <h1
          style={{
            fontFamily: 'serif',
            fontSize: 64,
            fontWeight: 700,
            color: '#F5F5F0',
            margin: '0 0 32px',
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            maxWidth: '900px',
          }}
        >
          {post.title}
        </h1>

        {/* Divider */}
        <div
          style={{
            width: 56,
            height: 2,
            background: 'rgba(245,166,35,0.4)',
            margin: '0 0 28px',
          }}
        />

        {/* Reading time + tags */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <p
            style={{
              fontFamily: 'monospace',
              fontSize: 13,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#3A3A3A',
              margin: 0,
            }}
          >
            {post.readingTime} read
          </p>
          <div
            style={{
              width: 1,
              height: 12,
              background: '#2A2A2A',
            }}
          />
          <p
            style={{
              fontFamily: 'monospace',
              fontSize: 13,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#3A3A3A',
              margin: 0,
            }}
          >
            {tagLine}
          </p>
        </div>

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
