
const axios = require('axios');
const cheerio = require('cheerio');
const qs = require('qs'); // Untuk memproses data form-urlencoded

// URL situs target
const BASE_URL = 'https://ytconvert.pro';

async function youtube(videoUrl) {
    try {
        // Kirim request awal untuk mendapatkan token atau data yang diperlukan (jika ada)
        const initialResponse = await axios.get(BASE_URL);
        const $ = cheerio.load(initialResponse.data);

        // Contoh: Ambil token atau data hidden input (jika diperlukan)
        const token = $('input[name="token"]').val(); // Sesuaikan dengan struktur HTML

        // Data untuk permintaan POST
        const postData = qs.stringify({
            url: videoUrl,
            token, // Sertakan token jika diperlukan
        });

        // Kirim permintaan POST ke server
        const response = await axios.post(`${BASE_URL}/process`, postData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        // Parsing hasil respon dengan Cheerio
        const $$ = cheerio.load(response.data);

        // Ambil informasi yang diinginkan dari hasil
        const downloadLink = $$('a.download-link').attr('href'); // Sesuaikan selector
        const title = $$('h1.video-title').text(); // Sesuaikan selector

        // Tampilkan hasil
        console.log('Judul Audio:', title);
        console.log('Link Download:', downloadLink);

    } catch (error) {
        console.error('Error saat scraping:', error.message);
    }
};

module.exports = { youtube };
