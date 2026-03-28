import nextConfig from 'eslint-config-next/core-web-vitals'

const eslintConfig = [
  ...nextConfig,
  {
    rules: {
      // The mount guard pattern (useEffect(() => { setMounted(true) }, []))
      // is the standard Next.js SSR approach for client-only rendering.
      // react-hooks v7 flags it too aggressively.
      'react-hooks/set-state-in-effect': 'off',
    },
  },
]

export default eslintConfig
