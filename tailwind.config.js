/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                landgrid: {
                    bg: '#F8F9FB',
                    card: '#FFFFFF',
                    mint: '#34D399', // Mint Green
                    pink: '#F472B6', // Pink/Red
                    orange: '#FB923C', // Orange
                    blue: '#3B82F6', // Solid Blue
                    dark: '#0F172A', // Slate 900
                }
            },
            borderRadius: {
                '3xl': '2rem',
            }
        },
    },
    plugins: [],
}
