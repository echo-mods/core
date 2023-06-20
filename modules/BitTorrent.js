const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

class BitTorrent {
  constructor(magnetLink, savePath) {
    this.magnetLink = magnetLink;
    this.savePath = savePath;
    this.progressCallback = null;
  }

  setProgressCallback(callback) {
    this.progressCallback = callback;
  }

  async start() {
    const parsedUrl = url.parse(this.magnetLink);
    const options = {
      host: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.path,
      headers: {
        'Content-Type': 'application/x-bittorrent',
      },
    };

    const saveDir = path.dirname(this.savePath);
    if (!fs.existsSync(saveDir)) {
      fs.mkdirSync(saveDir, { recursive: true });
    }

    const fileStream = fs.createWriteStream(this.savePath);
    const request = http.request(options, (response) => {
      const totalBytes = response.headers['content-length'];
      let downloadedBytes = 0;

      response.on('data', (chunk) => {
        downloadedBytes += chunk.length;
        fileStream.write(chunk);

        if (this.progressCallback) {
          const progress = (downloadedBytes / totalBytes) * 100;
          this.progressCallback(progress);
        }
      });

      response.on('end', () => {
        fileStream.end();

        if (this.progressCallback) {
          this.progressCallback(100);
        }
      });

      response.on('error', (error) => {
        console.error('Error downloading torrent:', error);
        fileStream.close();

        if (this.progressCallback) {
          this.progressCallback(-1);
        }
      });
    });

    request.on('error', (error) => {
      console.error('Error downloading torrent:', error);
      fileStream.close();

      if (this.progressCallback) {
        this.progressCallback(-1);
      }
    });

    request.end();
  }
}

module.exports = BitTorrent