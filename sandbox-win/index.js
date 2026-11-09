const path = require('path');
const { pathToFileURL } = require('url');
const { Queue, Worker } = require('bullmq');

const connection = { host: 'localhost', port: 6379 };

(async () => {
  const queue = new Queue('win-sandbox', { connection });
  const worker = new Worker('win-sandbox', pathToFileURL(path.join(__dirname, 'processor.js')), { connection });

  worker.on('completed', (job, result) => { console.log('completed:', result); process.exit(0); });
  worker.on('failed', (job, err) => { console.error('failed:', err.message); process.exit(1); });
  worker.on('error', (err) => { console.error('error:', err.message); process.exit(1); });

  await queue.add('test', { n: 1 });
})();