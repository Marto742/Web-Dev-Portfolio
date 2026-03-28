export interface BlogPost {
  slug: string
  title: string
  description: string
  date: string
  readingTime: string
  tags: string[]
}

export const posts: BlogPost[] = [
  {
    slug: 'how-i-built-the-hero-particle-system',
    title: 'How I Built the Hero Particle System',
    description:
      'A deep dive into building a 1,800-particle WebGL hero with custom GLSL shaders, mouse repulsion physics, and formation morphing — all running at 60fps.',
    date: '2025-03-15',
    readingTime: '8 min',
    tags: ['Three.js', 'WebGL', 'GLSL', 'TypeScript'],
  },
  {
    slug: 'webgpu-in-2025-what-actually-works',
    title: 'WebGPU in 2025 — What Actually Works',
    description:
      "WebGPU shipped in Chrome 113. Here's what works in production, what doesn't, and how to build a progressive enhancement that falls back to WebGL gracefully.",
    date: '2025-02-28',
    readingTime: '6 min',
    tags: ['WebGPU', 'Three.js', 'Performance'],
  },
  {
    slug: 'building-a-saas-solo',
    title: 'Building a SaaS Solo — What I Learned',
    description:
      'Twelve months of shipping ApexFit and Local Business OS solo. The architectural decisions I got right, the ones I regret, and how I would approach it differently today.',
    date: '2025-01-20',
    readingTime: '10 min',
    tags: ['SaaS', 'Next.js', 'Architecture'],
  },
]

export function getPost(slug: string): BlogPost | undefined {
  return posts.find(p => p.slug === slug)
}
