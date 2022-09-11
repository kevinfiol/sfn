import { bundle, logSuccess, logError } from './bundle.js';

bundle({ minify: true })
    .then(logSuccess)
    .catch((error) => {
        logError(error);
        process.exit(1);
    });