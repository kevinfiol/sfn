import esbuild from 'esbuild';
import servbot from 'servbot';
import env from 'env-smart';
import { resolve } from 'node:path';

// load .env file
env.load();

const PORT = 8081;
const DEV = process.argv.includes('--dev');
const API_URL = process.env.API_URL;
const OUTFILE = resolve('dist/app.js');
const ENTRY = resolve('src/index.js');

/** @type {import('servbot').ServbotServer?} **/
let server;

/** @type {esbuild.BuildOptions} **/
const esbuildConfig = {
  format: 'iife',
  entryPoints: [ENTRY],
  outfile: OUTFILE,
  bundle: true,
  minify: !DEV,
  sourcemap: DEV,
  jsxFactory: 'm',
  jsxFragment: '"["',
  define: {
    'process.env.API_URL': `"${API_URL}"`,
    'window.DEV_MODE': DEV ? 'true' : 'false'
  },
  plugins: [{
    name: 'on-end',
    setup(build) {
      build.onEnd(({ errors }) => {
        if (errors[0]) {
          console.error('Bundling Failed!', errors[0]);
          return;
        }

        console.log('Bundled: ', OUTFILE);
        if (server) server.reload();
      });
    }
  }]
};

// create & configure context
const ctx = await esbuild.context(esbuildConfig);

if (DEV) {
  server = servbot({
    root: 'dist',
    reload: true,
    fallback: 'index.html'
  });

  server.listen(PORT);
  await ctx.watch();

  process.on('exit', () => {
    ctx.dispose();
    server.close();
  });
} else {
  ctx.rebuild().finally(ctx.dispose);
}
