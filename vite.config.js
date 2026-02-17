import { defineConfig, loadEnv } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Plugin to flatten HTML output
const flattenHtml = () => {
  return {
    name: 'flatten-html',
    closeBundle() {
      const distDir = path.resolve(__dirname, 'dist');
      const srcDir = path.resolve(distDir, 'src');

      if (fs.existsSync(srcDir)) {
        const files = fs.readdirSync(srcDir);
        files.forEach(file => {
          const oldPath = path.resolve(srcDir, file);
          const newPath = path.resolve(distDir, file);
          fs.renameSync(oldPath, newPath);
        });
        fs.rmdirSync(srcDir);
      }
    }
  }
}

// Remove root: 'src' to use default CWD
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      rollupOptions: {
        input: {
          background: path.resolve(__dirname, 'src/background.js'),
          content_sidebar: path.resolve(__dirname, 'src/content_sidebar.js'),
          options: path.resolve(__dirname, 'src/options.html'),
          sidepanel: path.resolve(__dirname, 'src/sidepanel.html')
        },
        output: {
          entryFileNames: '[name].js',
          chunkFileNames: '[name].js',
          assetFileNames: '[name].[ext]'
        }
      }
    },
    plugins: [
      flattenHtml(),
      viteStaticCopy({
        targets: [
          {
            src: 'src/manifest.json',
            dest: '.',
            transform: (content) => {
              const manifest = JSON.parse(content);

              // Inject OAuth2 Client ID from env
              if (env.VITE_OAUTH_CLIENT_ID) {
                if (!manifest.oauth2) manifest.oauth2 = {};
                manifest.oauth2.client_id = env.VITE_OAUTH_CLIENT_ID;
              }

              // Inject Key from env (for consistent extension ID)
              if (env.VITE_EXTENSION_KEY) {
                manifest.key = env.VITE_EXTENSION_KEY;
              } else {
                // Remove key if not provided (so it doesn't use a placeholder or empty string)
                delete manifest.key;
              }

              return JSON.stringify(manifest, null, 2);
            }
          },
          { src: 'src/rules.json', dest: '.' },
          { src: 'src/*.png', dest: '.' },
          { src: 'src/content_sidebar.css', dest: '.' }
        ]
      })
    ]
  };
});
