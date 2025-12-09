import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, '.', '')

  return {
    plugins: [react()],
    define: {
      // This is vital: It replaces process.env.KEY in your code with the actual value from Render
      'process.env': {
        API_KEY: env.API_KEY,
        SUPABASE_URL: env.SUPABASE_URL,
        SUPABASE_KEY: env.SUPABASE_KEY
      }
    }
  }
})