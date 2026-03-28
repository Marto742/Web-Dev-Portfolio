import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'

const inter = localFont({
  src: '../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2',
  variable: '--font-inter',
  display: 'swap',
})

const jetbrains = localFont({
  src: '../node_modules/@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2',
  variable: '--font-jetbrains',
  display: 'swap',
})

const playfair = localFont({
  src: [
    {
      path: '../node_modules/@fontsource-variable/playfair-display/files/playfair-display-latin-wght-normal.woff2',
      style: 'normal',
    },
    {
      path: '../node_modules/@fontsource-variable/playfair-display/files/playfair-display-latin-wght-italic.woff2',
      style: 'italic',
    },
  ],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Martin Petrov — Frontend & Full-Stack Developer',
  description:
    'Frontend & Full-Stack Developer crafting cinematic digital experiences. React, TypeScript, Node.js, Three.js.',
  metadataBase: new URL('https://martinpetrov.dev'),
  openGraph: {
    title: 'Martin Petrov — Frontend & Full-Stack Developer',
    description:
      'Frontend & Full-Stack Developer crafting cinematic digital experiences. React, TypeScript, Node.js, Three.js.',
    url: 'https://martinpetrov.dev',
    siteName: 'Martin Petrov',
    images: [{ url: '/api/og', width: 1200, height: 630, alt: 'Martin Petrov — Frontend & Full-Stack Developer' }],
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Martin Petrov — Frontend & Full-Stack Developer',
    description:
      'Frontend & Full-Stack Developer crafting cinematic digital experiences. React, TypeScript, Node.js, Three.js.',
    images: [{ url: '/api/og', alt: 'Martin Petrov — Frontend & Full-Stack Developer' }],
  },
  robots: { index: true, follow: true },
  authors: [{ name: 'Martin Petrov' }],
  alternates: { canonical: 'https://martinpetrov.dev' },
}

const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Martin Petrov',
  url: 'https://martinpetrov.dev',
  jobTitle: 'Frontend & Full-Stack Developer',
  description:
    'Frontend & Full-Stack Developer crafting cinematic digital experiences. React, TypeScript, Node.js, Three.js.',
  image: 'https://martinpetrov.dev/api/og',
  sameAs: [
    'https://github.com/martinpetrov',
    'https://linkedin.com/in/martinpetrov',
  ],
  knowsAbout: ['React', 'TypeScript', 'Next.js', 'Node.js', 'Three.js', 'WebGL', 'WebGPU'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrains.variable} ${playfair.variable}`}
    >
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
        {children}
      </body>
    </html>
  )
}
