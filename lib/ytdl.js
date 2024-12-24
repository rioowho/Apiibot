const fetch = require('node-fetch');

class YouTube {
  static async download(url, type = 'audio') { // Default 'audio'
    try {
      if (!url) throw new Error('URL is required');
      if (!['video', 'audio'].includes(type)) throw new Error('Type must be either "video" or "audio"');

      const endpoint =
        type === 'video'
          ? 'https://free-api-call.aiseo.ai/youtube-video-info'
          : 'https://free-api-call.aiseo.ai/youtube-audio-info';

      const response = await fetch(`${endpoint}?url=${encodeURIComponent(url)}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();

      if (type === 'video') {
        if (!data.formats || !data.formats.length) throw new Error('No video formats found');
        return {
          title: data.title,
          duration: data.duration,
          viewCount: data.view_count,
          description: data.description,
          thumbnail: data.thumbnail,
          formats: data.formats.map((format) => ({
            resolution: format.resolution,
            quality: format.quality,
            type: format.type,
            url: format.url,
            ext: format.ext,
          })),
        };
      }

      if (type === 'audio') {
        if (!data.file_url) throw new Error('No audio URL found');
        return { url: data.file_url };
      }
    } catch (error) {
      throw new Error(`Download failed: ${error.message}`);
    }
  }
}

module.exports = YouTube;