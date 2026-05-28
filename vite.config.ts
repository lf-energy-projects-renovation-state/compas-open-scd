import { defineConfig } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
  plugins: [
    viteStaticCopy({
      targets: [
        { src: 'packages/external-plugins/**/*', dest: 'external-plugins', rename: { stripBase: 2 } },
        { src: 'packages/external-plugins/IedEditor.ts', dest: 'external-plugins', rename: { stripBase: 2 } }
      ]
    })
  ],
  optimizeDeps: {
    exclude: ['@compas-oscd/plugins']
  },
  server: {
    port: 8080
  }
})
