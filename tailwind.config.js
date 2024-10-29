/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/**/*.{html,js,jsx}"],
	theme: {
	extend: {
		colors: {
			violet: '#381272',
			indigo: '#321065',
			matte: {
				light: '#444444',
				dark: '#333333'
			},
		}
	},
	},
	plugins: [],
}