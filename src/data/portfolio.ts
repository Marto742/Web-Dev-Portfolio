import type { Project, Testimonial, NavLink } from '@/types'
import projectsJson from '../../content/projects.json'

export const navLinks: NavLink[] = [
  { label: 'About', href: '#about' },
  { label: 'Work', href: '#projects' },
  { label: 'Skills', href: '#skills' },
  { label: 'Contact', href: '#contact' },
]

export const projects: Project[] = projectsJson as Project[]

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
