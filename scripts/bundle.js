import esbuild from 'esbuild';
import env from 'env-smart';
import { resolve } from 'path';

env.load();

const API_URL = process.env.API_URL;

export const ENTRY = resolve('src/index.js');
export const OUTFILE = resolve('dist/app.js');

export function bundle(config = {}) {
    return esbuild.build({
        format: 'iife',
        entryPoints: [ENTRY],
        bundle: true,
        outfile: OUTFILE,
        jsxFactory: 'm',
        jsxFragment: '"["',
        define: {
            'process.env.API_URL': `"${API_URL}"`
        },
        ...config
    });
}

export const logSuccess = () => console.log('\x1b[42m%s\x1b[0m', `Bundled: ${OUTFILE}`);
export const logError = message => console.error('\x1b[41m%s\x1b[0m', message);
