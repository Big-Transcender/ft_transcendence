/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './public/index.html',
    './src/**/*.{html,js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
		fontFamily:{
			ubuntu: ['Ubuntu', 'sans-serif'],
		},
		textShadow: {
			sm: '50px 50px 50px rgba(50, 50, 50, 0.3)',
		},
	},
},
	plugins: [],
};
