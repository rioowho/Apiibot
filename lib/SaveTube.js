const axios = require('axios'); // Pastikan axios diimpor

const SaveTube = {
    qualities: {
        audio: { 1: '32', 2: '64', 3: '128', 4: '192' },
        video: { 1: '144', 2: '240', 3: '360', 4: '480', 5: '720', 6: '1080', 7: '1440', 8: '2160' }
    },

    headers: {
        'accept': '*/*',
        'referer': 'https://ytshorts.savetube.me/',
        'origin': 'https://ytshorts.savetube.me/',
        'user-agent': 'Postify/1.0.0',
        'Content-Type': 'application/json'
    },

    cdn() {
        return Math.floor(Math.random() * 11) + 51;
    },

    checkQuality(type, qualityIndex) {
        if (!(qualityIndex in this.qualities[type])) {
            throw new Error(`❌ Kualitas ${type} tidak valid. Pilih salah satu: ${Object.keys(this.qualities[type]).join(', ')}`);
        }
    },

    async fetchData(url, cdn, body = {}) {
        const headers = {
            ...this.headers,
            'authority': `cdn${cdn}.savetube.su`
        };

        try {
            const response = await axios.post(url, body, { headers });
            if (!response || response.status !== 200 || !response.data) {
                throw new Error(`❌ Gagal mengambil data dari server (status: ${response?.status || 'unknown'})`);
            }
            return response.data;
        } catch (error) {
            console.error(`❌ Gagal mengambil data dari ${url}:`, error.message);
            throw new Error(`❌ Gagal mengambil data: ${error.message}`);
        }
    },

    dLink(cdnUrl, type, quality, videoKey) {
        return `https://${cdnUrl}/download`;
    },

    async dl(link, qualityIndex, typeIndex) {
        if (![1, 2].includes(typeIndex)) {
            throw new Error('❌ Tipe tidak valid. Pilih 1 untuk audio atau 2 untuk video.');
        }

        const type = typeIndex === 1 ? 'audio' : 'video';

        this.checkQuality(type, qualityIndex);

        const quality = this.qualities[type][qualityIndex];
        const cdnNumber = this.cdn();
        const cdnUrl = `cdn${cdnNumber}.savetube.su`;

        try {
            const videoInfo = await this.fetchData(`https://${cdnUrl}/info`, cdnNumber, { url: link });
            if (!videoInfo?.data?.key) {
                throw new Error('❌ Tidak dapat mengambil informasi video.');
            }

            const body = {
                downloadType: type,
                quality: quality,
                key: videoInfo.data.key
            };

            const dlRes = await this.fetchData(this.dLink(cdnUrl, type, quality, videoInfo.data.key), cdnNumber, body);
            if (!dlRes?.data?.downloadUrl) {
                throw new Error('❌ Tidak dapat menghasilkan link unduhan.');
            }

            return {
                link: dlRes.data.downloadUrl,
                duration: videoInfo.data.duration,
                durationLabel: videoInfo.data.durationLabel,
                fromCache: videoInfo.data.fromCache,
                id: videoInfo.data.id,
                key: videoInfo.data.key,
                thumbnail: videoInfo.data.thumbnail,
                thumbnail_formats: videoInfo.data.thumbnail_formats,
                title: videoInfo.data.title,
                titleSlug: videoInfo.data.titleSlug,
                videoUrl: videoInfo.data.url,
                quality,
                type
            };
        } catch (error) {
            console.error('❌ Terjadi kesalahan:', error.message);
            throw error;
        }
    }
};

async function ytdlnew(url) {
    try {
        // Assuming SaveTube is the library you are using for downloading
        // Parameters: url, 3 = 128kbps, 1 = audio type (check if these are correct for SaveTube)
        const downloadInfo = await SaveTube.dl(url, 3, 1); // 3 = 128kbps, 1 = audio type
        console.log('Download info:', downloadInfo);

        // Example: If downloadInfo includes a URL to the audio file
        if (downloadInfo && downloadInfo.url) {
            const audioUrl = downloadInfo.url;
            const response = await axios.get(audioUrl, { responseType: 'stream' });
            
            // Handle the audio stream (you can save it, process it, etc.)
            console.log('Audio stream response:', response.status);
            // Add your logic to process or save the audio file here
        }
    } catch (error) {
        // Handle errors effectively
        console.error('Terjadi kesalahan:', error.response ? error.response.data : error.message);
    }
}

module.exports = { ytdlnew } // Opsional jika digunakan dalam proyek Node.js
