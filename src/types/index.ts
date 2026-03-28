export interface Project {
  id: number
  title: string
  description: string
  tech: string[]
  category: 'Frontend' | 'Full-Stack'
  year: string
  link: string
  span: 'normal' | 'tall' | 'wide'
}

export interface Testimonial {
  id: number
  name: string
  role: string
  company: string
  text: string
}

export interface Skill {
  name: string
  category: 'frontend' | 'fullstack'
}

export interface NavLink {
  label: string
  href: string
}
