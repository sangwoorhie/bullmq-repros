// Repro: sandboxed processor given as an absolute path on Windows.
//   node index.js path  -> absolute path string (fails on Windows)
//   node index.js url   -> file URL via pathToFileURL (works)
const path = require('path');
const { pathToFileURL } = require('url');
const { Queue, Worker } = require('bullmq');

const mode = process.argv[2] === 'url' ? 'url' : 'path';
const processorPath = path.join(__dirname, 'processor.js');
const processor = mode === 'url' ? pathToFileURL(processorPath) : processorPath;

const connection = { host: 'localhost', port: 6379 };

(async () => {
  const queue = new Queue('win-sandbox', { connection });
  const worker = new Worker('win-sandbox', processor, { connection });

  worker.on('completed', (job, result) => { console.log(`[${mode}] completed:`, result); process.exit(0); });
  worker.on('failed', (job, err) => { console.error(`[${mode}] failed:`, err.message); process.exit(1); });
  worker.on('error', (err) => { console.error(`[${mode}] error:`, err.message); process.exit(1); });

  await queue.add('test', { n: 1 });
})();