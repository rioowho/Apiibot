/*
💥 *COBALT (YOUTUBE DOWNLOADER)*

📝 *MOD* :
- Tanpa Pengaman CF (Cloudflare)
- Unlimited Request 

🧑‍💻 Script Code by Daffa
*/
const yts = require('yt-search');
const axios = require('axios');
const fs = require('fs');
const chalk = require('chalk')

const api = ['https://cobalt.api.timelessnesses.me', 'https://co.eepy.today', 'https://dl.khyernet.xyz'];

const rApi = () => api[Math.floor(Math.random() * api.length)];

const extractID = url => url.match(/(?:youtu\.be\/|youtube\.com\/.*[?&]v=|embed\/|shorts\/)([\w-]{11})/)?.[1];

const mp4 = async (videoId, mode, quality = 720, format = 'mp3') => {
    const response = await axios.post(`${rApi()}/`, {
        url: `https://youtube.com/watch?v=${videoId}`,
        downloadMode: mode,
        videoQuality: mode === 'video' ? quality : 720,
    }, { headers: { accept: 'application/json', 'content-type': 'application/json' } });

    if (response.status !== 200 || !response.data || response.data.status !== 'tunnel') throw new Error('Terjadi kesalahan saat mengambil data');
    return response.data.url;
};

const mp3 = async (videoId, mode, format = 'mp3') => {
    const response = await axios.post(`${rApi()}/`, {
        url: `https://youtube.com/watch?v=${videoId}`,
        downloadMode: mode,
        audioFormat: mode === 'audio' ? format : 'mp3'
    }, { headers: { accept: 'application/json', 'content-type': 'application/json' } });

    if (response.status !== 200 || !response.data || response.data.status !== 'tunnel') throw new Error('Terjadi kesalahan saat mengambil data');
    return response.data.url;
};
const DlCobalt = async (videoId, downloadMode, quality = 720, format = 'mp3') => {
    const apiUrl = rApi();
    const payload = {
        url: `https://youtube.com/watch?v=${extractID}`,
        downloadMode
    };
    if (downloadMode === 'video') payload.videoQuality = quality;
    if (downloadMode === 'audio') payload.audioFormat = format;

    const response = await axios.post(`${apiUrl}/`, payload, {
        headers: {
            accept: 'application/json',
            'content-type': 'application/json',
        }
    });

    if (response.status !== 200 || !response.data || response.data.status !== 'tunnel') {
        throw new Error('Terjadi kesalahan saat mengambil data 😮‍💨');
    }
    return response.data.url;
};
const Cobalt = async (input, mode = 'search', options = {}) => {
    try {
        const terinput = input.trim();
        if (!terinput) throw new Error('Gak usah bertele tele, tinggal masukin link youtube atau query yang mau dicari .. ');

        if (mode === 'search') {
            const searchResults = await yts(terinput);
            const videos = searchResults.videos;

            return {
                type: 'search',
                videos: videos.map(v => ({
                    title: v.title,
                    id: v.videoId,
                    url: v.url,
                    media: { thumbnail: v.thumbnail, image: v.image },
                }))
            };
        } else {
            const videoId = extractID(terinput);
            if (!videoId) throw new Error('Link youtube nya gak valid...');

            const videoData = await yts({ videoId: videoId });
            console.log(videoData);
            if (!videoData) {
                throw new Error('Video nya gak ada btw 😊');
            }

            const video = videoData;
            console.log(video);
            const { title, description, thumbnail, image, seconds, views, author, url } = video;

            let download = {
                title,
                description,
                url,
                media: { thumbnail, image },
                duration: seconds,
                views,
                author
            };

            if (mode === 'video') {
                const videoUrl = await request(videoId, 'video', options.quality || 720);
                download.videoUrl = videoUrl;
            } else if (mode === 'audio') {
                const audioUrl = await request(videoId, 'audio', '1440p', options.format || 'mp3');
                download.audioUrl = audioUrl;
            }

            return {
                type: 'download',
                download,
            };
        }
    } catch (err) {
        console.error(err.message);
        throw err;
    }
};

module.exports = { Cobalt, mp4, mp3 };

let file = require.resolve(__filename)
fs.watchFile(file, () => {
	fs.unwatchFile(file)
	console.log(chalk.redBright(`Update ${__filename}`))
	delete require.cache[file]
	require(file)
})