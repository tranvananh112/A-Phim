/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: [
        './*.html',
        './js/*.js',
    ],
    theme: {
        extend: {
            colors: {
                "primary": "#f2f20d",
                "primary-dim": "#b3b30a",
                "primary-red": "#ec1313",
                "background-light": "#f8f8f5",
                "background-dark": "#1e202c",
                "surface-dark": "#282a3a",
            },
            fontFamily: {
                "display": ["Space Grotesk", "sans-serif"],
                "vietnam": ["Be Vietnam Pro", "sans-serif"]
            },
            borderRadius: {
                "DEFAULT": "0.25rem",
                "lg": "0.5rem",
                "xl": "0.75rem",
                "2xl": "1rem",
                "full": "9999px"
            },
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
    ],
}
