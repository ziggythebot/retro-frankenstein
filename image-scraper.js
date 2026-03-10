#!/usr/bin/env node

const https = require('https');
const http = require('http');
const { URL } = require('url');

/**
 * Scrape all images from a website
 * Mega Frankenstein Tool™
 */
class ImageScraper {
  constructor(url) {
    this.url = url;
    this.images = [];
  }

  async scrape() {
    try {
      const html = await this.fetchHTML(this.url);
      this.extractImages(html);
      return this.images;
    } catch (err) {
      console.error('Scrape failed:', err.message);
      return [];
    }
  }

  fetchHTML(url) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const client = urlObj.protocol === 'https:' ? https : http;
      
      client.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
      }).on('error', reject);
    });
  }

  extractImages(html) {
    // Extract img src
    const imgRegex = /<img[^>]+src="([^">]+)"/gi;
    let match;
    while ((match = imgRegex.exec(html)) !== null) {
      this.addImage(match[1], 'img');
    }

    // Extract background images from inline styles
    const bgRegex = /background(?:-image)?:\s*url\(['"]?([^'")]+)['"]?\)/gi;
    while ((match = bgRegex.exec(html)) !== null) {
      this.addImage(match[1], 'background');
    }

    // Extract data-src (lazy loading)
    const dataSrcRegex = /data-src="([^">]+)"/gi;
    while ((match = dataSrcRegex.exec(html)) !== null) {
      this.addImage(match[1], 'lazy');
    }
  }

  addImage(src, type) {
    // Make relative URLs absolute
    if (src.startsWith('//')) {
      src = 'https:' + src;
    } else if (src.startsWith('/')) {
      const baseUrl = new URL(this.url);
      src = `${baseUrl.protocol}//${baseUrl.host}${src}`;
    } else if (!src.startsWith('http')) {
      return; // Skip invalid URLs
    }

    this.images.push({ url: src, type });
  }

  generateReport() {
    console.log('\n=== Image Scraper Results ===\n');
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
      console.log(`${i + 1}. [${img.type}] ${img.url}`);
    });
  }

  exportJSON(filename = 'scraped-images.json') {
    const fs = require('fs');
    fs.writeFileSync(filename, JSON.stringify(this.images, null, 2));
    console.log(`\nExported to ${filename}`);
  }
}

// CLI usage
if (require.main === module) {
  const url = process.argv[2] || 'https://bureaubonanza.com/';
  
  const scraper = new ImageScraper(url);
  scraper.scrape().then(() => {
    scraper.generateReport();
    scraper.exportJSON('bureau-bonanza-images.json');
  });
}

module.exports = ImageScraper;
