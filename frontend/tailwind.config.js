/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Retro-synthwave palette
        retro: {
          bg: '#0a0a0a',        // Near-black background
          'bg-light': '#1a1a1a', // Slightly lighter background
          cyan: '#00ffd5',       // Neon cyan
          magenta: '#ff00aa',    // Neon magenta
          lime: '#88ff00',       // Neon lime
          amber: '#ffaa00',      // Neon amber
          purple: '#aa00ff',     // Neon purple
          blue: '#0088ff',       // Neon blue
        },
        // Text variations
        text: {
          primary: '#ffffff',
          secondary: '#b3b3b3',
          muted: '#666666',
          glow: '#00ffd5',
        },
      },
      fontFamily: {
        // Retro fonts
        pixel: ['"Press Start 2P"', 'monospace'],
        pixeloid: ['"Pixeloid"', 'monospace'],
        mono: ['"IBM Plex Mono"', '"JetBrains Mono"', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },
      boxShadow: {
        'neon-cyan': '0 0 5px #00ffd5, 0 0 10px #00ffd5, 0 0 15px #00ffd5',
        'neon-magenta': '0 0 5px #ff00aa, 0 0 10px #ff00aa, 0 0 15px #ff00aa',
        'neon-lime': '0 0 5px #88ff00, 0 0 10px #88ff00, 0 0 15px #88ff00',
        'neon-amber': '0 0 5px #ffaa00, 0 0 10px #ffaa00, 0 0 15px #ffaa00',
        'glow-sm': '0 0 10px rgba(0, 255, 213, 0.3)',
        'glow-md': '0 0 20px rgba(0, 255, 213, 0.4)',
        'glow-lg': '0 0 40px rgba(0, 255, 213, 0.5)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'flicker': 'flicker 0.15s infinite linear',
        'scan': 'scan 2s linear infinite',
      },
      keyframes: {
        glow: {
          from: { 
            textShadow: '0 0 10px #00ffd5, 0 0 20px #00ffd5, 0 0 30px #00ffd5',
            filter: 'brightness(1)'
          },
          to: { 
            textShadow: '0 0 20px #00ffd5, 0 0 30px #00ffd5, 0 0 40px #00ffd5',
            filter: 'brightness(1.2)'
          },
        },
        flicker: {
          '0%, 19.9%, 22%, 62.9%, 64%, 64.9%, 70%, 100%': {
            opacity: '1',
          },
          '20%, 21.9%, 63%, 63.9%, 65%, 69.9%': {
            opacity: '0.4',
          },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
    },
  },
  plugins: [],
}
