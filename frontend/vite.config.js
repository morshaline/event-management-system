import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/event-management-system/', // এখানে আপনার গিটহাব রিপোজিটরির নাম ঠিক এভাবেই দেবেন
})