import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#090909',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px',
        }}
      >
        {/* Amber glow */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '600px',
            height: '300px',
            background: 'radial-gradient(ellipse at center bottom, rgba(245,166,35,0.18) 0%, transparent 70%)',
          }}
        />

        {/* Label */}
        <p
          style={{
            fontFamily: 'monospace',
            fontSize: 14,
            letterSpacing: '0.35em',
            textTransform: 'uppercase',
            color: '#F5A623',
            opacity: 0.7,
            marginBottom: 32,
          }}
        >
          Portfolio
        </p>

        {/* Name */}
        <h1
          style={{
            fontFamily: 'serif',
            fontSize: 80,
            fontWeight: 700,
            color: '#F5F5F0',
            margin: '0 0 20px',
            letterSpacing: '-0.02em',
          }}
        >
          Martin Petrov
        </h1>

        {/* Role */}
        <p
          style={{
            fontFamily: 'sans-serif',
            fontSize: 28,
            color: '#6B6B6B',
            margin: 0,
          }}
        >
          Frontend &amp; Full-Stack Developer
        </p>

        {/* Divider */}
        <div
          style={{
            marginTop: 48,
            width: 64,
            height: 2,
            background: 'rgba(245,166,35,0.4)',
          }}
        />

        {/* Tech */}
        <p
          style={{
            fontFamily: 'monospace',
            fontSize: 13,
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: '#2A2A2A',
            marginTop: 24,
          }}
        >
          React · TypeScript · Node.js · Three.js
        </p>
      </div>
    ),
    { width: 1200, height: 630 },
  )
}
