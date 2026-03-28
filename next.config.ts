import type { NextConfig } from 'next'
import createMDX from '@next/mdx'

const withMDX = createMDX({
  extension: /\.mdx?$/,
})

const config: NextConfig = {
  // Three.js ships ESM-only sub-paths (three/webgpu) that need transpilation
  transpilePackages: ['three'],
  // Allow .md and .mdx files as pages/imports
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
}

export default withMDX(config)
