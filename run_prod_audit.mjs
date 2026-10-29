import { spawn, execSync } from 'child_process';
import fs from 'fs';

console.log('Building for production...');
execSync('npm run build', { stdio: 'inherit' });

console.log('Starting preview server...');
const preview = spawn('npx', ['vite', 'preview', '--port', '4173', '--strictPort'], { stdio: 'pipe' });

setTimeout(() => {
  const pages = [
    { name: 'prod-home-desktop', url: 'http://localhost:4173/', preset: 'desktop' },
    { name: 'prod-home-mobile', url: 'http://localhost:4173/', preset: 'mobile' },
    { name: 'prod-detail-desktop', url: 'http://localhost:4173/nft/nft_1', preset: 'desktop' },
    { name: 'prod-detail-mobile', url: 'http://localhost:4173/nft/nft_1', preset: 'mobile' },
  ];

  let hasFailure = false;
  for (const p of pages) {
    const flags = p.preset === 'desktop' 
      ? '--preset=desktop' 
      : '--form-factor=mobile --screenEmulation.mobile=true';
    const cmd = `npx lighthouse ${p.url} --output=json,html --output-path=./lighthouse-reports/${p.name} --chrome-flags="--headless --no-sandbox" ${flags} --only-categories=performance,accessibility,best-practices,seo`;
    console.log(`Auditing ${p.name}...`);
    try {
      execSync(cmd, { stdio: 'ignore' });
      const json = JSON.parse(fs.readFileSync(`./lighthouse-reports/${p.name}.report.json`, 'utf8'));
      const scores = {
        performance: Math.round(json.categories.performance.score * 100),
        accessibility: Math.round(json.categories.accessibility.score * 100),
        bestPractices: Math.round(json.categories['best-practices'].score * 100),
        seo: Math.round(json.categories.seo.score * 100),
      };
      console.log(`Results for ${p.name}:`, scores);
      
      // Target thresholds: Performance >= 90, Accessibility >= 95, Best Practices >= 95, SEO >= 90
      if (scores.performance < 90 || scores.accessibility < 95 || scores.bestPractices < 95 || scores.seo < 90) {
        console.warn(`⚠️ Warning: ${p.name} did not meet target thresholds!`);
        hasFailure = true;
      }
    } catch (err) {
      console.error(`Failed ${p.name}:`, err.message);
      hasFailure = true;
    }
  }

  preview.kill();
  if (hasFailure) {
    console.log('Audit completed with warnings or failures.');
  } else {
    console.log('✅ All pages met or exceeded Lighthouse quality criteria (Perf >= 90, A11y >= 95, BP >= 95, SEO >= 90)!');
  }
  process.exit(hasFailure ? 1 : 0);
}, 3000);
