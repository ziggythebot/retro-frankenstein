#!/usr/bin/env node

const puppeteer = require('puppeteer');
const fs = require('fs');
const https = require('https');
const path = require('path');

/**
 * Deep scraper with headless browser
 * Captures JS-rendered images, backgrounds, logos
 */
class DeepScraper {
  constructor(url) {
    this.url = url;
    this.images = [];
    this.browser = null;
    this.downloadDir = './downloaded-assets';
  }

  async init() {
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }

  async scrape() {
    await this.init();
    
    console.log(`\n🔍 Deep scraping ${this.url}...\n`);
    
    const page = await this.browser.newPage();
    
    // Capture all network requests for images
    page.on('response', async (response) => {
      const url = response.url();
      const contentType = response.headers()['content-type'] || '';
      
      if (contentType.includes('image')) {
        this.images.push({
          url,
          type: 'network',
          contentType
        });
      }
    });
    
    await page.goto(this.url, { waitUntil: 'networkidle2' });
    
    // Wait for lazy-loaded images
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Extract all image sources
    const pageImages = await page.evaluate(() => {
      const results = [];
      
      // <img> tags
      document.querySelectorAll('img').forEach(img => {
        if (img.src) results.push({ url: img.src, type: 'img', alt: img.alt });
        if (img.dataset.src) results.push({ url: img.dataset.src, type: 'lazy' });
        if (img.srcset) results.push({ url: img.srcset.split(',')[0].trim().split(' ')[0], type: 'srcset' });
      });
      
      // Background images
      document.querySelectorAll('*').forEach(el => {
        const bg = window.getComputedStyle(el).backgroundImage;
        if (bg && bg !== 'none') {
          const match = bg.match(/url\(['"]?([^'")]+)['"]?\)/);
          if (match) results.push({ url: match[1], type: 'background' });
        }
      });
      
      // SVGs
      document.querySelectorAll('svg').forEach(svg => {
        results.push({ 
          url: 'inline-svg', 
          type: 'svg',
          content: svg.outerHTML 
        });
      });
      
      return results;
    });
    
    pageImages.forEach(img => {
      if (!this.images.find(i => i.url === img.url)) {
        this.images.push(img);
      }
    });
    
    await this.browser.close();
    
    return this.images;
  }

  async downloadImages() {
    if (!fs.existsSync(this.downloadDir)) {
      fs.mkdirSync(this.downloadDir, { recursive: true });
    }
    
    console.log(`\n📥 Downloading ${this.images.length} images...\n`);
    
    let downloaded = 0;
    
    for (const img of this.images) {
      if (!img.url || img.url === 'inline-svg' || img.url.startsWith('data:')) {
        continue;
      }
      
      try {
        const filename = this.getFilename(img.url);
        const filepath = path.join(this.downloadDir, filename);
        
        await this.downloadFile(img.url, filepath);
        img.localPath = filepath;
        downloaded++;
        console.log(`✓ ${filename}`);
      } catch (err) {
        console.log(`✗ Failed: ${img.url.substring(0, 60)}...`);
      }
    }
    
    console.log(`\n✅ Downloaded ${downloaded}/${this.images.length} images`);
  }

  getFilename(url) {
    try {
      const parsed = new URL(url);
      let filename = path.basename(parsed.pathname);
      
      if (!filename || filename === '/') {
        filename = 'image-' + Date.now() + '.jpg';
      }
      
      return filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    } catch {
      return 'image-' + Date.now() + '.jpg';
    }
  }

  downloadFile(url, filepath) {
    return new Promise((resolve, reject) => {
      https.get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`HTTP ${response.statusCode}`));
          return;
        }
        
        const file = fs.createWriteStream(filepath);
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
        file.on('error', reject);
      }).on('error', reject);
    });
  }

  generateReport() {
    console.log('\n=== Deep Scraper Results ===\n');
    console.log(`Found ${this.images.length} images from ${this.url}\n`);
    
    const byType = {};
    this.images.forEach(img => {
      byType[img.type] = (byType[img.type] || 0) + 1;
    });
    
    console.log('By type:');
    Object.entries(byType).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });
    
    console.log('\nAll images:');
    this.images.forEach((img, i) => {
      const shortUrl = img.url.length > 80 ? img.url.substring(0, 80) + '...' : img.url;
      console.log(`${i + 1}. [${img.type}] ${shortUrl}`);
    });
  }

  exportJSON(filename = 'deep-scraped-images.json') {
    fs.writeFileSync(filename, JSON.stringify(this.images, null, 2));
    console.log(`\n📄 Exported to ${filename}`);
  }
}

// CLI usage
if (require.main === module) {
  const url = process.argv[2] || 'https://bureaubonanza.com/';
  
  const scraper = new DeepScraper(url);
  
  scraper.scrape()
    .then(() => scraper.generateReport())
    .then(() => scraper.exportJSON('bureau-bonanza-deep.json'))
    .then(() => scraper.downloadImages())
    .catch(err => {
      console.error('Scrape failed:', err);
      process.exit(1);
    });
}

module.exports = DeepScraper;
