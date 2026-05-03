/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#16a34a',  // green-600
                secondary: '#15803d', // green-700
            },
        },
    },
    plugins: [],
}
