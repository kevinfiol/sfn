import esbuild from 'esbuild';
import { resolve } from 'node:path';

const PORT = 8081;
const DEV = process.argv.includes('--dev');
const API_URL = process.env.API_URL;
const OUTFILE = resolve('dist/app.js');
const ENTRY = resolve('src/index.jsx');

/** @type {import('servbot').ServbotServer?} **/
let server;

/** @type {esbuild.BuildOptions} **/
const config = {
  format: 'esm',
  entryPoints: [ENTRY],
  outfile: OUTFILE,
  bundle: true,
  minify: !DEV,
  sourcemap: DEV,
  jsxFactory: 'm',
  jsxFragment: '"["',
  define: { 'process.env.API_URL': `"${API_URL}"` },
  plugins: [{
    name: 'on-end',
    setup(build) {
      build.onEnd(({ errors }) => {
        if (!errors.length) {
          console.log('Bundled: ', OUTFILE);
          if (server) server.reload();
        }
      });
    }
  }]
};

if (DEV) {
  const ctx = await esbuild.context(config);
  const servbot = await import('servbot');

  server = servbot.default({
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
  await esbuild.build(config);
}
