const spawnSync = require('child_process').spawnSync;
const lighthouseCli = require.resolve('lighthouse/lighthouse-cli');
const {
  computeMedianRun
} = require('lighthouse/lighthouse-core/lib/median-run.js');
const url = 'https://svg-loading-strategies.netlify.app/lazy-embeds.html';
const testRuns = 50;

const results = [];
for (let i = 0; i < testRuns; i++) {
  console.log(`Running Lighthouse attempt #${i + 1}...`);
  const { status = -1, stdout } = spawnSync('node', [
    lighthouseCli,
    url,
    '--output=json'
  ]);
  if (status !== 0) {
    console.log('Lighthouse failed, skipping run...');
    continue;
  }
  results.push(JSON.parse(stdout));
}

const median = computeMedianRun(results);
const metrics = median.audits.metrics.details.items[0];

console.log('performanceScore ', median.categories.performance.score * 100);
console.log('firstContentfulPaint ', metrics.firstContentfulPaint);
console.log('largestContentfulPaint ', metrics.largestContentfulPaint);
console.log('interactive ', metrics.interactive);
console.log('speedIndex ', metrics.speedIndex);
console.log('totalBlockingTime ', metrics.totalBlockingTime);
console.log('observedLoad ', metrics.observedLoad);
console.log('observedDomContentLoaded ', metrics.observedDomContentLoaded);
