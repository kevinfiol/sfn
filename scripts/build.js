import servbot from 'servbot';
import esbuild from 'esbuild';
import env from 'env-smart';
import { resolve } from 'path';

// load .env file
env.load();

const DEV = process.argv.includes('-d');
const API_URL = process.env.API_URL;
const ENTRY = resolve('src/index.js');
const OUTFILE = resolve('dist/app.js');
const SERVER_PORT = 8081;

function logSuccess() {
    console.log('\x1b[42m%s\x1b[0m', `Bundled: ${OUTFILE}`);
}

function logError(msg) {
    console.error('\x1b[41m%s\x1b[0m', msg)
}

function bundle(config = {}) {
    return esbuild.build({
        minify: true,
        format: 'esm',
        entryPoints: [ENTRY],
        outfile: OUTFILE,
        bundle: true,
        jsxFactory: 'm',
        jsxFragment: '"["',
        define: {
            'process.env.API_URL': `"${API_URL}"`
        },
        ...config
    });
}

let config = {};

if (DEV) {
    const server = servbot({
      root: 'dist',
      reload: true,
      fallback: 'index.html'
    });

    server.listen(SERVER_PORT);

    config = {
        minify: false,
        sourcemap: true,
        watch: {
            onRebuild(error) {
                if (error) logError(error);
                else {
                    logSuccess();
                    server.reload();
                }
            }
        }
    };
}

bundle(config)
    .then(logSuccess)
    .catch((error) => {
        logError(error);
        process.exit(1);
    });