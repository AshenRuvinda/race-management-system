module.exports = {
    content: [
      './src/**/*.{js,jsx,ts,tsx}', 
      './public/index.html'
    ],
    theme: {
      extend: {
        colors: {
          // Racing-themed color palette
          'race': {
            'primary': '#1e40af',
            'secondary': '#64748b',
            'success': '#10b981',
            'danger': '#ef4444',
            'warning': '#f59e0b',
            'info': '#3b82f6',
            'gold': '#fbbf24',
            'silver': '#9ca3af',
            'bronze': '#d97706',
          },
          // Team colors
          'team': {
            'red': '#dc2626',
            'blue': '#2563eb',
            'green': '#16a34a',
            'yellow': '#ca8a04',
            'purple': '#9333ea',
            'orange': '#ea580c',
            'pink': '#db2777',
            'teal': '#0d9488',
          },
          // Track status colors
          'track': {
            'green': '#22c55e',  // Race start/clear track
            'yellow': '#eab308', // Caution/safety car
            'red': '#ef4444',    // Red flag/stopped
            'blue': '#3b82f6',   // Information
            'checkered': '#000000', // Race finish
          }
        },
        fontFamily: {
          'sans': ['Inter', 'system-ui', 'sans-serif'],
          'mono': ['Fira Code', 'Monaco', 'Cascadia Code', 'Segoe UI Mono', 'monospace'],
          'display': ['Inter', 'system-ui', 'sans-serif'],
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
        },
        spacing: {
          '18': '4.5rem',
          '88': '22rem',
          '128': '32rem',
        },
        borderRadius: {
          'xl': '0.75rem',
          '2xl': '1rem',
          '3xl': '1.5rem',
        },
        boxShadow: {
          'race': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          'race-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          'race-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          'inner-race': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
          'glow-green': '0 0 20px rgba(34, 197, 94, 0.5)',
          'glow-red': '0 0 20px rgba(239, 68, 68, 0.5)',
          'glow-blue': '0 0 20px rgba(59, 130, 246, 0.5)',
          'glow-yellow': '0 0 20px rgba(251, 191, 36, 0.5)',
        },
        animation: {
          'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          'bounce-slow': 'bounce 2s infinite',
          'spin-slow': 'spin 2s linear infinite',
          'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
          'fadeIn': 'fadeIn 0.5s ease-in-out',
          'slideIn': 'slideIn 0.3s ease-out',
          'checkered': 'checkered 2s linear infinite',
        },
        keyframes: {
          fadeIn: {
            '0%': { opacity: '0' },
            '100%': { opacity: '1' },
          },
          slideIn: {
            '0%': { transform: 'translateX(-100%)' },
            '100%': { transform: 'translateX(0)' },
          },
          checkered: {
            '0%': { backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px' },
            '100%': { backgroundPosition: '20px 0, 20px 10px, 30px -10px, 10px 0px' },
          },
        },
        backdropBlur: {
          xs: '2px',
        },
        backgroundImage: {
          'checkered-flag': `
            linear-gradient(45deg, #000 25%, transparent 25%), 
            linear-gradient(-45deg, #000 25%, transparent 25%), 
            linear-gradient(45deg, transparent 75%, #000 75%), 
            linear-gradient(-45deg, transparent 75%, #000 75%)
          `,
          'race-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          'victory-gradient': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          'track-gradient': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        },
        backgroundSize: {
          'checkered': '20px 20px',
        },
      },
    },
    plugins: [],
    // Enable dark mode
    darkMode: 'class',
  }