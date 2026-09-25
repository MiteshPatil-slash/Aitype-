import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';
import analyzeHandler from './api/analyze.js';
import generateParagraphHandler from './api/generate-paragraph.js';

dotenv.config({ override: true });

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'local-api-handler',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url && req.url.startsWith('/api/analyze')) {
            try {
              await analyzeHandler(req, res);
            } catch (err) {
              console.error('[API Middleware Error /api/analyze]:', err);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: 'Internal server error' }));
            }
          } else if (req.url && req.url.startsWith('/api/generate-paragraph')) {
            try {
              await generateParagraphHandler(req, res);
            } catch (err) {
              console.error('[API Middleware Error /api/generate-paragraph]:', err);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: 'Internal server error' }));
            }
          } else {
            next();
          }
        });
      }
    }
  ],
  server: {
    port: 3000,
    open: false,
    host: true
  }
});
