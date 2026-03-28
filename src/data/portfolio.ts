import type { Project, Testimonial, NavLink } from '@/types'

export const navLinks: NavLink[] = [
  { label: 'About', href: '#about' },
  { label: 'Work', href: '#projects' },
  { label: 'Skills', href: '#skills' },
  { label: 'Contact', href: '#contact' },
]

export const projects: Project[] = [
  {
    id: 1,
    title: 'ApexFit SaaS',
    description:
      'Full-stack fitness platform with AI-generated workout plans, progress analytics, real-time coaching, and Stripe subscription management.',
    tech: ['React', 'Node.js', 'PostgreSQL', 'Stripe', 'OpenAI'],
    category: 'Full-Stack',
    year: '2024',
    link: '#',
    span: 'tall',
  },
  {
    id: 2,
    title: 'Cinematic UI Kit',
    description:
      'A dark-themed React component library with cinematic aesthetics. 40+ accessible, TypeScript-first components.',
    tech: ['React', 'TypeScript', 'Tailwind', 'Radix UI'],
    category: 'Frontend',
    year: '2024',
    link: '#',
    span: 'normal',
  },
  {
    id: 3,
    title: 'Local Business OS',
    description:
      'Multi-tenant SaaS for local businesses. Includes invoicing, CRM, calendar, and a branded client portal.',
    tech: ['Next.js', 'Prisma', 'PostgreSQL', 'Resend'],
    category: 'Full-Stack',
    year: '2024',
    link: '#',
    span: 'normal',
  },
  {
    id: 4,
    title: 'Particle Canvas',
    description:
      'Interactive generative art engine built with Three.js and WebGL. 100k+ particles, real-time mouse physics.',
    tech: ['Three.js', 'WebGL', 'GLSL', 'TypeScript'],
    category: 'Frontend',
    year: '2025',
    link: '#',
    span: 'normal',
  },
  {
    id: 5,
    title: 'E-Commerce Platform',
    description:
      'Production-grade e-commerce store with full cart, checkout, admin dashboard, and inventory management.',
    tech: ['Next.js', 'Stripe', 'Sanity CMS', 'Vercel'],
    category: 'Full-Stack',
    year: '2023',
    link: '#',
    span: 'tall',
  },
  {
    id: 6,
    title: 'Focus OS',
    description:
      'Productivity mobile app with Pomodoro timer, task tracking, deep-work streaks, and habit analytics.',
    tech: ['React Native', 'Expo', 'SQLite', 'Reanimated'],
    category: 'Frontend',
    year: '2025',
    link: '#',
    span: 'normal',
  },
]

export const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Alex Mercer',
    role: 'CTO',
    company: 'Velocity Labs',
    text: "Martin delivered beyond expectations. The UI he built is the kind you see at Awwwards — every pixel deliberate, every interaction considered. He's going to be dangerous in a few years.",
  },
  {
    id: 2,
    name: 'Sofia Raines',
    role: 'Product Lead',
    company: 'Horizon Digital',
    text: "What sets Martin apart is his instinct for design. He doesn't just implement — he improves. The component system he built saved us weeks and our users noticed the difference immediately.",
  },
  {
    id: 3,
    name: 'James Okafor',
    role: 'Founder',
    company: 'Flux Studio',
    text: "Martin rewrote our entire frontend in three weeks. The animations, the performance, the code quality — everything leveled up. Rare to find a junior who thinks in systems like this.",
  },
]

export const frontendSkills = [
  'React',
  'TypeScript',
  'Tailwind CSS',
  'Three.js',
  'Framer Motion',
  'GSAP',
  'HTML / CSS',
  'Next.js',
]

export const fullStackSkills = [
  'Node.js',
  'Express',
  'PostgreSQL',
  'REST APIs',
  'Prisma',
  'MongoDB',
  'Docker',
  'Supabase',
]
