module.exports = {
    // ... other config
    theme: {
      extend: {
        animation: {
          shimmer: 'shimmer 2s linear infinite',
        },
        keyframes: {
          shimmer: {
            '0%': { transform: 'translateX(-100%)' },
            '100%': { transform: 'translateX(100%)' },
          },
        },
      },
    },
  } 