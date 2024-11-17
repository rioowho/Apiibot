const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const fetch = require('node-fetch');
const { randomBytes, randomUUID } = require('crypto');
const { chromium } = require('playwright');
const cheerio = require('cheerio');

const model = "70b";
const app = express();
const PORT = process.env.PORT || 3000;
app.enable("trust proxy");
app.set("json spaces", 2);
global.creator = "@riooxdzz"
// Middleware untuk CORS
app.use(cors());


async function mediafire(url) {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Linux; Android 6.0; iris50) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Mobile Safari/537.36'
    });
    const page = await context.newPage();
    try {
        await page.goto(url);
        const downloadInfo = await page.evaluate(() => {
            const fileNameElement = document.querySelector('.dl-btn-label');
            const fileName = fileNameElement ? fileNameElement.textContent.trim() : '';
            const downloadLinkElement = document.querySelector('#downloadButton');
            const downloadLink = downloadLinkElement ? downloadLinkElement.href : '';
            const fileSizeText = downloadLinkElement ? downloadLinkElement.textContent : '';
            const sizeMatch = fileSizeText.match(/\(([^)]+)\)/);
            const fileSize = sizeMatch ? sizeMatch[1] : '';

            return {
                fileName: fileName,
                downloadLink: downloadLink,
                fileSize: fileSize
            };
        });

        return downloadInfo;
    } catch (error) {
        return { success: true, message: error.message };
        console.error("Error:", error.response ? error.response.data : error.message);
    } finally {
        await browser.close();
    }
}
async function tiktok(url) {
  return new Promise(async (resolve, reject) => {
    try {
    const encodedParams = new URLSearchParams();
encodedParams.set('url', url);
encodedParams.set('hd', '1');

      const response = await axios({
        method: 'POST',
        url: 'https://tikwm.com/api/',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'Cookie': 'current_language=en',
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36'
        },
        data: encodedParams
      });
      const videos = response.data.data;
        const result = {
          title: videos.title,
          cover: videos.cover,
          origin_cover: videos.origin_cover,
          no_watermark: videos.play,
          watermark: videos.wmplay,
          music: videos.music
        };
        resolve(result);
    } catch (error) {
      reject(error);
    }
  });
}
async function searchApp(message) {
  try {
    const url = 'https://m.playmods.net/id/search/' + message; // Ganti dengan URL sumber HTML

    const response = await fetch(url);
    const html = await response.text();

    const $ = cheerio.load(html);

    const dataArray = [];

    $('a.beautify.ajax-a-1').each((index, element) => {
      const $element = $(element);

      const data = {
        link: 'https://m.playmods.net' + $element.attr('href'),
        title: $element.find('.common-exhibition-list-detail-name').text().trim(),
        menu: $element.find('.common-exhibition-list-detail-menu').text().trim(),
        detail: $element.find('.common-exhibition-list-detail-txt').text().trim(),
        image: $element.find('.common-exhibition-list-icon img').attr('data-src'),
        downloadText: $element.find('.common-exhibition-line-download').text().trim(),
      };

      dataArray.push(data);
    });
    return dataArray;
  } catch (error) {
    console.log(error);
  }
}
async function pinterest(message) {

    let res = await fetch(`https://www.pinterest.com/resource/BaseSearchResource/get/?source_url=%2Fsearch%2Fpins%2F%3Fq%3D${message}&data=%7B%22options%22%3A%7B%22isPrefetch%22%3Afalse%2C%22query%22%3A%22${message}%22%2C%22scope%22%3A%22pins%22%2C%22no_fetch_context_on_resource%22%3Afalse%7D%2C%22context%22%3A%7B%7D%7D&_=1619980301559`);
    let json = await res.json();
    let data = json.resource_response.data.results;
    if (!data.length) throw `Query "${message}" not found :/`;
    return data[~~(Math.random() * data.length)].images.orig.url;

}

async function tiktoks(message) {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await axios({
        method: 'POST',
        url: 'https://tikwm.com/api/feed/search',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded charset=UTF-8',
          'Cookie': 'current_language=en',
          'User-Agent': 'Mozilla/5.0 (Linux Android 10 K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36'
        },
        data: {
          keywords: message,
          count: 10,
          cursor: 0,
          HD: 1
        }
      })
      const videos = response.data.data.videos
      if (videos.length === 0) {
        reject("Tidak ada video ditemukan.")
      } else {
        const riooxdzz = Math.floor(Math.random() * videos.length)
        const videorndm = videos[riooxdzz]

        const result = {
          author: creator,
          title: videorndm.title,
          cover: videorndm.cover,
          origin_cover: videorndm.origin_cover,
          no_watermark: videorndm.play,
          watermark: videorndm.wmplay,
          music: videorndm.music
        }
        resolve(result)
      }
    } catch (error) {
      reject(error)
    }
  })
}

async function AimusicLyrics(message) {
  const url = "https://aimusic.one/api/v3/lyrics/generator"
  const headers = {
    "Content-Type": "application/json",
    "User-Agent":
      "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Mobile Safari/537.36",
    Referer: "https://aimusic.one/ai-lyrics-generator"
  }
  const data = {
    description: message,
    style: "Auto",
    topic: "Auto",
    mood: "Auto",
    lan: "auto",
    isPublic: true
  }
  try {
    let response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(data)
    })
    let result = await response.json()
    return result.lyrics
  } catch (e) {
    throw e
  }
}
async function gemini(message) {
    const apiKey = 'AIzaSyD-BIXRyW2O3x4vLTFmfRWIk_pxnMc_SVs'; // Dapatkan apikey dari  https://aistudio.google.com/app/apikey
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
    const body = JSON.stringify({
        text: message
    });
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: body
        });

        const data = await response.json();

        if (response.ok) {
            return data; 
        } else {
            throw new Error(data.error.message || 'Request failed');
        }
    } catch (error) {
        console.error('Error:', error.message);
        return null;
    }
};
   
   async function gpt4o(message, content) {
  try {
    const formattedDate = new Date().toLocaleString("id-ID", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: false
    }).replace(/:/g, ".");
    const response = await fetch("https://chat.eqing.tech/api/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-requested-with": "XMLHttpRequest",
        "x-guest-id": "jwR1jqSQNUaVihChLqQmk",
        useSearch: "false",
        plugins: "0",
        accept: "text/event-stream",
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Mobile Safari/537.36",
        Referer: "https://chat.eqing.tech/#/chat"
      },
      body: JSON.stringify({
        messages: [{
          role: "system",
          content: `hallo world 👋\nCurrent model: gpt-4-turbo\nCurrent time: ${formattedDate}\nLatex inline: $ x^2 $ \nLatex block: $$ e=mc^2 $$\n\n`
        }, {
          role: "user",
          content: content
        }],
        stream: true,
        model: "gpt-4-turbo",
        temperature: .5,
        presence_penalty: 0,
        frequency_penalty: 0,
        top_p: 1,
        chat_token: 63,
        captchaToken: "P1_eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.hadwYXNza2V5xQUZkY1Z98HAIuwgz9AZTo6KUEVGWSNm-7Pu-YPONk9QTTEUkSbxUG63epLUjmhFjBxgKugqfrV0TN_2Vet9iKiqVbCnh6F1oWgqlxjCEyXMIqBw2Ay6r1B8ZEl34s56IZRokGYU6f8C7YZzT5SJkFIvinFbyGgPp24Q71tDj30WiOYs_XHbPqn8PwF-dxcgGgjSmC2Vm6HII9Axnd53ySLDhakLDV5l9V5qjd-pV9t1qXpcjWOS0FEM78MQBQE19pQExamhG0Nga4E1o7Ic5KkIgEfiYzBuxhVWcAqj14WEHFK-R1CRs8qWob6Pi3XvmvGQtJ7EgynPB5FM9bOSUabusKV7_FV9YBXS0bz6HGNKQiYTQa4bVSepMq3nwdtMOFKhdQH8V5cwyaJXqgUNyO8qdJ12x-5PKPqIKNuaXb3dXAk3gs2jzA0MjVBgi7VyBOed1bRTWy-KPNtZoCDFP56bRfbUVgaNpjFGXtXNhPYYXvlYXRcoIgQj2aZSDrU1qJ2nLKEtAOGI4ZqMIIQ61HVYcd5EN703vGGxaSghurdnal8X7BDO-r93yKTj3RucLk4W1y6Sqgwy-UktHhOf4NIXBn4TJ-LzIxCTp9yiSZiaxTPhysCp2IVIjJH9kFswIY-dNRhXgdDNjaVdegLaCjOqRKLzvUpYfjiAIGHBwYRH1xk5CythyBGDnAEHRQUt8_YixAnaTeQWeaPamXT2k8Q3httenqhzT3XTv7uCqe61KfgDE95oJSUOU0u2JjFuBB76NBhkwVAW5UDtJROE0Duydj4fFj-UookNGQ_f_sgEog8P1fcspkPAP8OappJ3WGkIaWDJIzcG8ObaT4awfNwyiEM-rsJCJrUyz6Yk1tMZLcoFCQ0pS28oH4MateWjtyZDxL8uads3qQyqoSgBXscqIcQKN2Tzqj7cqPyxTFvdJD1yADgX3HpcpOqTvQ5EzkQ4Zh_prcEID2gVnH8VMR_4BukZqS-E076VM15Id-9INMDJFaoDk6x2WhtOtJe7ob7osinjzVVGtaZ8sNDJxlEnzwxSt9QOdVQCa-8iCMVrxd85jXXGYVQEbruDFjrP-8LZ_gaDg1kdoPT0ddxfwM_vGW_wsmbX-k869C_C0UBwa5U1yK8wTSpOMi52BfnbgkZHyLdTvDmJRRHvkiL3v50Rz_436ejH8UU_ASFaV8wysM4bP21TOG9k0MahgJJYuHCxhh_hPxbSvEV7Qixlepd6wAjx4Gi2sLVztFF2d7sf7KvqDJMtcmO8Et6oTn16FTdDLRkNvIFn7W3Y89vz-23iWtQQxvihbqzFOc5xDgt2u-dxUoZKPJtQD-kKKpCW75B5K-XgInwtx1Ob9y8dAP6O8yGmvm4qKZjuNYi0jNzstYJvlckfwDFJVyhoCpJaLwj1HW7D4qZLTlWH9-taFvtm-6fF3dwIc5MgNXner5dnZGSRAYCHTF4GMnwXWaKJfDKnqrJRszMxBuJMkxKlL2BXkrHQYOKI0i5rENI4l9VE5aAz15kBAeiHifS_SGa17CjlNGhiSarpviK19vIT1wA3B6187rhhlMP_oHraJ1dIqyef_pzJ7P7BDp2dGtGj8SNoRau6YHrfQhjduJcBTIbxznJITy6D83JEGUS-I7lF_KdnE6-biPmGYyrpJupi6GmfCp6qlsPb6lTXjfRbrCC0WEz5BlAEtFCb7rTVTfLfPZHWawPF54rexO0mSSmT7aubiGGkpbtf6NTgo2V4cM5mzc-eqHNoYXJkX2lkzg9y6m-ia3KoMTQ5MDJjY2aicGQA.V55IkMN8HlHCsFaBMmu39k9KiKRb5Djj9E1R7mGan5s"
      }),
      compress: true
    });
    const result = await response.text();
    return result.split("\n\n").filter(data => data.includes('data: {"id":"chatcmpl')).slice(0, -52).map(data => {
      try {
        return JSON.parse(data.match(/{.*}/)?.[0]);
      } catch (error) {
        return console.error("Error parsing JSON:", error), null;
      }
    }).filter(Boolean).map(data => data.choices[0]?.delta.content).join("");
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}
async function gpt3(message) {
    const url = 'https://shinoa.us.kg/api/gpt/gpt3';
    const headers = {
        'accept': '*/*',
        'api_key': 'kyuurzy',
        'Content-Type': 'application/json'
    };
    const body = JSON.stringify({
        text: message
    });

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: body
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Request failed:', error);
        throw error;
    }
}

async function LuminAI(message, model = "gpt-4o-mini") {
                try {
                    const response = await axios.post('https://luminai.my.id/v2', {
                        text: message,
                        model: model
                    });

                    return response.data.reply.reply;
                } catch (error) {
                    console.error("Terjadi kesalahan:", error.message);
                    throw new Error("Gagal mendapatkan respons dari AI.");
                }
            }

// Fungsi untuk degreeGuru
async function degreeGuru(message, prompt) {
  try {
    const response = await axios.post('https://degreeguru.vercel.app/api/guru', {
      messages: [
        { role: 'user', content: message }
      ]
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

// Fungsi untuk smartContract
async function smartContract(message) {
  try {
    const response = await axios.post("https://smart-contract-gpt.vercel.app/api/chat", {
      messages: [{ content: message, role: "user" }]
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

async function blackboxAIChat(message) {
  try {
    const response = await axios.post('https://www.blackbox.ai/api/chat', {
      messages: [{ id: null, content: message, role: 'user' }],
      id: null,
      previewToken: null,
      userId: null,
      codeModelMode: true,
      agentMode: {},
      trendingAgentMode: {},
      isMicMode: false,
      isChromeExt: false,
      githubToken: null,
      webSearchMode: true,
      userSystemPrompt: null,
      mobileClient: false,
      maxTokens: 100000,
      playgroundTemperature: parseFloat(message.temperature) || 0.7,
      playgroundTopP: 0.9,
      validated: "69783381-2ce4-4dbd-ac78-35e9063feabc",
    });

    return response.data;
  } catch (error) {
    throw error;
  }
}


async function openai(message) {
    const messages = [
        { role: "assistant", content: "Kamu adalah asisten AI yang siap membantu segala hal." },
        { role: "user", content: message }
    ];

    try {
        const response = await fetch("https://deepenglish.com/wp-json/ai-chatbot/v1/chat", {
            method: "POST",
            headers: { Accept: "text/event-stream", "Content-Type": "application/json" },
            body: JSON.stringify({ messages })
        });

        return await response.json();
    } catch (error) {
        console.error("An error occurred during data fetching:", error);
        throw error;
    }
}

async function llama3(message) {
  if (!["70b", "8b"].some((qq) => model == qq)) model = "70b"; //correct
  try {
    const BASE_URL = "https://llama3-enggan-ngoding.vercel.app/api/llama";
    const payload = {
      messages: [
        {
          role: "system",
          content: `Kamu adalah Meta AI Berbahasa Indonesia yang di kembangkan oleh Meta Platforms Inc. dan SSA Team, kamu bisa apa saja, kamu menggunakan Google sebagai search engine utamamu`,
        },
        {
          role: "user",
          content: message,
        },
      ],
      model: "meta-llama-3-70B-Instruct",
    };
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 13_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.1 Mobile/15E148",
      },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}
// Endpoint untuk servis dokumen HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Endpoint untuk LuminAI
app.get('/api/luminai', async (req, res) => {
  try {
    const { message }= req.query;
    if (!message) {
      return res.status(400).json({ error: 'Parameter "message" tidak ditemukan' });
    }
    const response = await LuminAI(message);
    res.status(200).json({
      status: 200,
      creator: "RiooXdzz",
      data: { response }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint untuk gemini
app.get('/api/gemini', async (req, res) => {
  try {
    const message = req.query.message;
    if (!message) {
      return res.status(400).json({ error: 'Parameter "message" tidak ditemukan' });
    }
    const response = await gemini(message);
    res.status(200).json({
      status: 200,
      creator: "RiooXdzz",
      data: { response }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint untuk degreeGuru
app.get('/api/degreeguru', async (req, res) => {
  try {
    const { message }= req.query;
    if (!message) {
      return res.status(400).json({ error: 'Parameter "message" tidak ditemukan' });
    }
    const response = await degreeGuru(message);
    res.status(200).json({
      status: 200,
      creator: "RiooXdzz",
      data: { response }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint untuk pinecone
app.get('/api/gpt3', async (req, res) => {
  try {
    const message = req.query.message;
    if (!message) {
      return res.status(400).json({ error: 'Parameter "message" tidak ditemukan' });
    }
    const response = await gpt3(message);
    res.status(200).json({
      status: 200,
      creator: "RiooXdzz",
      data: { response }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get('/api/llama3', async (req, res) => {
  try {
    const message = req.query.message;
    if (!message) {
      return res.status(400).json({ error: 'Parameter "message" tidak ditemukan' });
    }
    const response = await llama3(message);
    res.status(200).json({
      status: 200,
      creator: "RiooXdzz",
      data: { response }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get('/api/openai', async (req, res) => {
  try {
    const message = req.query.message;
    if (!message) {
      return res.status(400).json({ error: 'Parameter "message" tidak ditemukan' });
    }
    const response = await openai(message);
    res.status(200).json({
      status: 200,
      creator: "RiooXdzz",
      data: { response }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Endpoint untuk smartContract
app.get('/api/smartcontract', async (req, res) => {
  try {
    const message = req.query.message;
    if (!message) {
      return res.status(400).json({ error: 'Parameter "message" tidak ditemukan' });
    }
    const response = await smartContract(message);
    res.status(200).json({
      status: 200,
      creator: "RiooXdzz",
      data: { response }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint untuk blackboxAIChat
app.get('/api/blackboxAIChat', async (req, res) => {
  try {
    const message = req.query.message;
    if (!message) {
      return res.status(400).json({ error: 'Parameter "text" tidak ditemukan' });
    }
    const response = await blackboxAIChat(message);
    res.status(200).json({
      status: 200,
      creator: "RiooXdzz",
      data: { response }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get('/api/aimusic', async (req, res) => {
  try {
    const message = req.query.message;
    if (!message) {
      return res.status(400).json({ error: 'Parameter "text" tidak ditemukan' });
    }
    const response = await AimusicLyrics(message);
    res.status(200).json({
      status: 200,
      creator: "RiooXdzz",
      data: { response }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get('/api/gpt4o', async (req, res) => {
  try {
    const message = req.query.message;
    if (!message) {
      return res.status(400).json({ error: 'Parameter "text" tidak ditemukan' });
    }
    const response = await gpt4o(message);
    res.status(200).json({
      status: 200,
      creator: "RiooXdzz",
      data: { response }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get('/api/search-tiktok', async (req, res) => {
  try {
    const message = req.query.message;
    if (!message) {
      return res.status(400).json({ error: 'Parameter "message" tidak ditemukan' });
    }
    const response = await tiktoks(message);
    res.status(200).json({
      status: 200,
      creator: "RiooXdzz",
      data: { response }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get('/api/search-pinterest', async (req, res) => {
  try {
    const message = req.query.message;
    if (!message) {
      return res.status(400).json({ error: 'Parameter "message" tidak ditemukan' });
    }
    const response = await pinterest(message);
    res.status(200).json({
      status: 200,
      creator: "RiooXdzz",
      data: { response }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get('/api/search-apk', async (req, res) => {
  try {
    const message = req.query.message;
    if (!message) {
      return res.status(400).json({ error: 'Parameter "message" tidak ditemukan' });
    }
    const response = await searchApp(message);
    res.status(200).json({
      status: 200,
      creator: "RiooXdzz",
      data: { response }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/tiktok', async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) {
      return res.status(400).json({ error: 'Parameter "url" tidak ditemukan' });
    }
    const response = await tiktok(url);
    res.status(200).json({
      status: 200,
      creator: "RiooXdzz",
      data: { response }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get('/api/mediafire', async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) {
      return res.status(400).json({ error: 'Parameter "url" tidak ditemukan' });
    }
    const response = await mediafire(url);
    res.status(200).json({
      status: 200,
      creator: "RiooXdzz",
      data: { response }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Handle 404 error
app.use((req, res, next) => {
  res.status(404).send("Sorry can't find that!");
});

// Handle error
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Jalankan server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app
