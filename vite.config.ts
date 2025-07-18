import { defineConfig } from 'vite'
import UnoCSS from 'unocss/vite'
import react from '@vitejs/plugin-react-swc'
import { fileURLToPath } from 'node:url'
import { getBuildTime } from './build/config';


// https://vite.dev/config/
export default defineConfig(configEnv => {

  const buildTime = getBuildTime();

  return {
    define: {
      BUILD_TIME: JSON.stringify(buildTime)
    },
    plugins: [react(), UnoCSS()],
    preview: {
      port: 9725
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '~': fileURLToPath(new URL('./', import.meta.url))
      }
    }
  }
});
