/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            screens: {
                xs: "300px",
            },
            colors: {
                // Refined minimal palette (neutral with soft amber accent)
                primary: {
                    DEFAULT: "#0F172A", // deep midnight
                    light: "#E8EAEE", // subtle surface highlight
                    dark: "#0B1220",
                },
                secondary: {
                    DEFAULT: "#5F6B7A", // muted slate for text accents
                    light: "#EDF0F4",
                    dark: "#485462",
                },
                accent: {
                    DEFAULT: "#E2A45A", // warm amber accent
                    light: "#FFF5E6",
                    dark: "#C07F2D",
                },
                neutral: {
                    50: "#F8F7F4",
                    100: "#F1EFEB",
                    200: "#E3E0DA",
                    300: "#CEC9C1",
                    400: "#B6B0A6",
                    500: "#8E877B",
                    600: "#6C655C",
                    700: "#4C463F",
                    800: "#312C27",
                    900: "#1F1B17",
                },
                text: {
                    primary: "#111827",
                    secondary: "#4B5563",
                    light: "#6B7280",
                },
                // Legacy keys kept to reduce breakage during transition
                primary_green: {
                    DEFAULT: "#0F172A",
                    light: "#E8EAEE",
                },
                desc_gray: {
                    DEFAULT: "#4B5563",
                },
                title_black: {
                    DEFAULT: "#111827",
                },
            },
            fontFamily: {
                poppins: ["Poppins", "sans-serif"],
            },
            animation: {
                'slide-up': 'slideUp 0.4s ease-out',
                'fade-in': 'fadeIn 0.3s ease-in',
                'scale-in': 'scaleIn 0.3s ease-out',
                'shimmer': 'shimmer 2s infinite',
                'bounce-soft': 'bounceSoft 2s infinite',
            },
            keyframes: {
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                scaleIn: {
                    '0%': { transform: 'scale(0.95)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-1000px 0' },
                    '100%': { backgroundPosition: '1000px 0' },
                },
                bounceSoft: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-5px)' },
                },
            },
            boxShadow: {
                'soft': '0 2px 15px rgba(0, 0, 0, 0.05)',
                'medium': '0 4px 25px rgba(0, 0, 0, 0.1)',
                'strong': '0 10px 40px rgba(0, 0, 0, 0.15)',
                'card': '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
                'card-hover': '0 10px 40px rgba(99, 102, 241, 0.15)',
            },
            borderRadius: {
                '2xl': '1rem',
                '3xl': '1.5rem',
            },
        },
    },
    plugins: [require("@tailwindcss/typography")],
}
