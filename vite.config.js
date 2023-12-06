import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
	base: '',
	publicDir: false,
	plugins: [vue()],
	build: {
		minify: false
	}
})
