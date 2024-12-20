const fetch = require('node-fetch')

let handler = async (m, { rioo, text, usedPrefix, command, reply }) => {
if (!text) return reply(`Contoh:\n${usedPrefix}${command} Halo?`);
let gpiti = await gptturbo(text);
let turbo = `Title : ${text}\n\nMessage : ${gpiti}\n`;
await rioo.sendMessage(m.chat, {
    text: "⬣───「 *G P T T U R B O* 」───⬣" + "\n\n" + turbo,
    contextInfo: {
      externalAdReply: {  
        title: "GPT - TURBO",
        body: '',
        thumbnailUrl: "https://pomf2.lain.la/f/jzv6iqu.jpg",
        sourceUrl: null,
        mediaType: 1,
        renderLargerThumbnail: true
      }
    }
  }, { quoted: m });
}
handler.help = ['gptturbo']
handler.tags = ['ai']
handler.command = /^(gptturbo)$/i
module.exports = handler;
async function gptturbo(query) {
    const apiUrl = `https://restapii.rioooxdzz.web.id/api/gptturbo?message=${encodeURIComponent(query)}`;

    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36",
            }
        });
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const responseJson = await response.json();
         if (responseJson && responseJson.data.response) {
            return responseJson.data.response.message.content;
        } else {
            return "Tidak ada pesan dalam response.";
        }
    } catch (error) {
        console.error("Terjadi kesalahan:", error.message);
        return "Gagal mendapatkan respons dari server.";
    }
}

