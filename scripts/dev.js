import servbot from 'servbot';
import { bundle, logSuccess, logError } from './bundle.js';

const PORT = 8081;

// Start dev server
const server = servbot({
  root: 'dist',
  reload: true,
  fallback: 'index.html'
});

server.listen(PORT);

bundle({
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
}).then(logSuccess).catch(e => {
    logError(e);
    server.close();
    process.exit(1);
});
