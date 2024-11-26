__path = process.cwd()
const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const fetch = require('node-fetch');
const got = require('got');
const { exec } = require("child_process");
const FormData = require('form-data'); 
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const { chromium } = require('playwright');
const { run } = require('shannz-playwright');
var { performance } = require("perf_hooks");
const NodeCache = require('node-cache');
const app = express();
const PORT = process.env.PORT || 3000;
app.enable("trust proxy");
app.set("json spaces", 2);

global.creator = "@riooxdzz"
// Middleware untuk CORS
app.use(cors());
loghandler = {
	error: {
		status: false,
		code: 503,
		message: "service got error, try again in 10 seconds",
		creator: global.creator 
	},
	noturl: {
		status: false,
		code: 503,
		message: "enter paramater url",
		creator: global.creator 
	},
	nottext: {
		status: false,
		code: 503,
		message: "enter parameter text",
		creator: global.creator 
	},
	notquery: {
		status: false,
		code: 503,
		message: "enter parameter query",
		creator: global.creator 
	},
	notusername: {
		status: false,
		code: 503,
		message: "enter parameter username",
		creator: global.creator 
	}
}
const myCache = new NodeCache({ stdTTL: 3600, checkperiod: 120 });
async function sfileSearch(query, page = 1) {
  let res = await fetch(
    `https://sfile.mobi/search.php?q=${query}&page=${page}`,
  );
  let $ = cheerio.load(await res.text());
  let result = [];
  $("div.list").each(function () {
    let title = $(this).find("a").text();
    let size = $(this).text().trim().split("(")[1];
    let link = $(this).find("a").attr("href");
    if (link) result.push({ title, size: size.replace(")", ""), link });
  });
  return result;
}
async function sfileDl(url) {
  let res = await fetch(url);
  let $ = cheerio.load(await res.text());
  let filename = $("div.w3-row-padding").find("img").attr("alt");
  let mimetype = $("div.list").text().split(" - ")[1].split("\n")[0];
  let filesize = $("#download")
    .text()
    .replace(/Download File/g, "")
    .replace(/\(|\)/g, "")
    .trim();
  let download =
    $("#download").attr("href") +
    "&k=" +
    Math.floor(Math.random() * (15 - 10 + 1) + 10);
  return { filename, filesize, mimetype, download };
}

async function iask(query) {
 const code = `const { chromium } = require('playwright');

 async function iask(query) {
 const browser = await chromium.launch();
 const page = await browser.newPage();

 try {
 await page.goto(\`https://iask.ai/?mode=question&q=\${query}\`);
 await page.waitForSelector('.mt-6.md\\\\:mt-4.w-full.p-px.relative.self-center.flex.flex-col.items-center.results-followup', { timeout: 0 });
 
 const outputDiv = await page.$('#output');

 if (!outputDiv) {
 return { image: [], answer: null, sources: [], videoSource: [], webSearch: [] };
 }

 const answerElement = await outputDiv.$('#text');
 const answerText = await answerElement.evaluate(el => el.innerText);
 const [answer, sourcesText] = answerText.split('Top 3 Authoritative Sources Used in Answering this Question');
 const cleanedAnswer = answer.replace(/According to Ask AI & Question AI www\\.iAsk\\.ai:\\s*/, '').trim();
 const sources = sourcesText ? sourcesText.split('\\n').filter(source => source.trim() !== '') : [];
 
 const imageElements = await outputDiv.$$('img');
 const images = await Promise.all(imageElements.map(async (img) => {
 return await img.evaluate(img => img.src);
 }));

 const videoSourceDiv = await page.$('#related-videos');
 const videoSources = [];
 if (videoSourceDiv) {
 const videoElements = await videoSourceDiv.$$('a');
 for (const videoElement of videoElements) {
 const videoLink = await videoElement.evaluate(el => el.href);
 const videoTitle = await videoElement.$eval('h3', el => el.innerText).catch(() => 'No title found');
 const videoThumbnail = await videoElement.$eval('img', el => el.src).catch(() => 'No thumbnail found');

 if (videoTitle !== 'No title found' && videoThumbnail !== 'No thumbnail found') {
 videoSources.push({ title: videoTitle, link: videoLink, thumbnail: videoThumbnail });
 }
 }
 }

 const webSearchDiv = await page.$('#related-links');
 const webSearchResults = [];
 if (webSearchDiv) {
 const linkElements = await webSearchDiv.$$('a');
 for (const linkElement of linkElements) {
 const linkUrl = await linkElement.evaluate(el => el.href);
 const linkTitle = await linkElement.evaluate(el => el.innerText);
 const linkImage = await linkElement.$eval('img', el => el.src).catch(() => 'No image found');
 const linkDescription = await linkElement.evaluate(el => el.nextElementSibling.innerText).catch(() => 'No description found');

 if (linkTitle && linkUrl) {
 webSearchResults.push({
 title: linkTitle,
 link: linkUrl,
 image: linkImage,
 description: linkDescription
 });
 }
 }
 }
 
 const src = sources.map(source => source.trim());
 const result = { image: images, answer: cleanedAnswer, sources: src, videoSource: videoSources, webSearch: webSearchResults };
 return JSON.stringify(result, null, 2);

 } catch (error) {
 console.error('Error fetching data:', error);
 return { image: [], answer: null, sources: [], videoSource: [], webSearch: [] };
 } finally {
 await browser.close();
 }
 }

 iask(\`${query}\`).then(a => console.log(a));`;

 const start = await run('javascript', code);
 const string = start.result.output;
 return JSON.parse(string);
}
async function aio(url) {
  if (!url) throw new Error('URL is required.');

  const endpoint = `https://api.neastooid.xyz/api/downloader/aiodown?url=${encodeURIComponent(url)}`;
  const response = await fetch(endpoint);

  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status}`);
  }

  return response.json();
}

async function ytdl(videoUrl) {
 const form = new FormData();
 form.append('query', videoUrl);

 try {
 const response = await axios.post('https://yttomp4.pro/', form, {
 headers: {
 ...form.getHeaders()
 }
 });

 const $ = cheerio.load(response.data);

 const results = {
 title: $('.vtitle').text().trim(),
 duration: $('.res_left p').text().replace('Duration: ', '').trim(),
 image: $('.ac img').attr('src'),
 video: [],
 audio: [],
 other: []
 };
 
 $('.tab-item-data').each((index, tab) => {
 const tabTitle = $(tab).attr('id');
 $(tab).find('tbody tr').each((i, element) => {
 const fileType = $(element).find('td').eq(0).text().trim();
 const fileSize = $(element).find('td').eq(1).text().trim();
 const mp4 = $(element).find('a.dbtn').attr('href');
 const mp3 = $(element).find('a.dbtn').attr('href');
 const downloadLink = $(element).find('a.dbtn').attr('href');
 
 if (tabTitle === 'tab-item-1') {
 results.video.push({
 fileType,
 fileSize,
 mp4
 });
 } else if (tabTitle === 'tab-item-2') {
 results.audio.push({
 fileType,
 fileSize,
 mp3
 });
 } else if (tabTitle === 'tab-item-3') {
 results.other.push({
 fileType,
 fileSize,
 downloadLink
 });
 }
 });
 });
 
 return results;
 } catch (error) {
 return { success: false, url: error.message };
 console.log('Error:' + error);
 }
}

async function imagetohd(url, method) {
  return new Promise(async (resolve, reject) => {
    let Methods = ["enhance", "recolor", "dehaze"]
    Methods.includes(method) ? (method = method): (method = Methods[0])
    let buffer,
    Form = new FormData(),
    scheme = "https" + "://" + "inferenceengine" + ".vyro" + ".ai/" + method
    Form.append("model_version", 1, {
      "Content-Transfer-Encoding": "binary",
      contentType: "multipart/form-data charset=uttf-8",
    })
    Form.append("image", Buffer.from(url), {
      filename: "enhance_image_body.jpg",
      contentType: "image/jpeg",
    })
    Form.submit(
      {
        url: scheme,
        host: "inferenceengine" + ".vyro" + ".ai",
        path: "/" + method,
        protocol: "https:",
        headers: {
          "User-Agent": "okhttp/4.9.3",
          Connection: "Keep-Alive",
          "Accept-Encoding": "gzip",
        },
      },
      function (err, res) {
        if (err) reject()
        let data = []
        res
        .on("data", function (chunk, resp) {
          data.push(chunk)
        })
        .on("end", () => {
          resolve(Buffer.concat(data))
        })
        res.on("error", (e) => {
          reject()
        })
      }
    )
  })
}

async function mediafire(url) {
 const code = `const { chromium } = require('playwright');

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
 const sizeMatch = fileSizeText.match(/\\$([^)]+)\\$/);
 const fileSize = sizeMatch ? sizeMatch[1] : '';

 return {
 fileName: fileName,
 downloadLink: downloadLink,
 fileSize: fileSize
 };
 });

 return downloadInfo;
 } catch (error) {
 console.error("Error:", error.response ? error.response.data : error.message);
 return { success: false, message: error.message };
 } finally {
 await browser.close();
 }
 }
 mediafire(\`${url}\`).then(a => console.log(a));`;

 const start = await run('javascript', code);
 return start.result.output;
}
async function getToken() {
        try {
  const { data } = await axios.get("https://storysaver.to/en")

  // Modify regex patterns for flexibility and ensure capturing
  const kExpMatch = /k_exp\s*=\s*"(\d+)"/.exec(data);
  const kTokenMatch = /k_token\s*=\s*"([a-f0-9]+)"/.exec(data);

  // Retrieve the values
  const k_exp = kExpMatch ? kExpMatch[1] : null;
  const k_token = kTokenMatch ? kTokenMatch[1] : null;

  console.log("k_exp:", k_exp);
  console.log("k_token:", k_token);
  return {
    k_exp: k_exp,
    k_token: k_token,
  }     
    } catch (e) {        
        return e.message
    }
}

async function igdl(url) {
  try {
    const form = new FormData();
    const { k_exp, k_token } = await getToken();

    form.append("url", url);
    form.append("k_token", k_token);
    form.append("k_exp", k_exp);
    form.append("q", url); // Check if this URL is correct
    form.append("t", "media");
    form.append("lang", "en");
    form.append("v", "v2");

    // Post request with form data and appropriate headers
    const response = await axios.post(
      "https://storysaver.to/api/ajaxSearch",
      form,
      { headers: form.getHeaders ? form.getHeaders() : {} }
    );

    // console.log(response.data.data);
    const $ = cheerio.load(response.data.data);

    // Find all <a> tags and extract href attributes
    const result = [];
    $('a').each((index, element) => {
      const href = $(element).attr('href');
      if (href) {
        if (!href.includes("snapcdn")) return
        result.push(href);
      }
    });

    return result
  } catch (error) {
    console.error("Error fetching Instagram data:", error.message);
    return error.message
  }
}
class Spotify {
    async Download(url) {
        try {
        const response = (await axios.get("https://api.fabdl.com/spotify/get?url=" + url, {
            headers: {
                origin:
                    "https://spotifymp3.com",
                referer:
                    "https://spotifymp3.com/",
            }
        })).data
        return response.result
    } catch (e) {        
        return e.message
    }
}
    async getTask(gid, id) {
        try {
        const response = (await axios.get("https://api.fabdl.com/spotify/mp3-convert-task/" + gid + "/" + id, {
            headers: {
                origin:
                    "https://spotifymp3.com",
                referer:
                    "https://spotifymp3.com/",
            }
        })).data
        return 'https://api.fabdl.com' + response.result.download_url
    } catch (e) {        
        return e.message
    }
}
}

async function spotify(url) {
try {
    const client = new Spotify()
    const { gid, id } = await client.Download(url)
    const result = await client.getTask(gid, id)
    console.log(result)
    return result
 } catch (e) {        
    return e.message
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

async function chatgpt(text) {
  // Cek cache terlebih dahulu
  const cachedResponse = myCache.get(text);
  if (cachedResponse) {
    console.log("Returning cached response");
    return cachedResponse;
  }

  try {
    console.log(`Attempting to connect to AI service...`);
    const response = await axios.get('https://rest-api.aetherss.xyz/api/ai', {
      params: { prompt: text },
      headers: {
        'User-Agent': 'AETHERz/1.0',
      },
      timeout: 30000
    });

    console.log("Response received:", response.status, response.statusText);
    
    if (response.data) {
      // Simpan respons ke cache
      myCache.set(text, response.data);
      return response.data;
    } else {
      console.error("Unexpected response structure:", JSON.stringify(response.data));
      return fallbackResponse(text);
    }
  } catch (error) {
    console.error("Error in aiChat:", error.message);
    return fallbackResponse(text);
  }
}
async function gemini(message) {
    try {
        const { data  } = await axios.get(`https://hercai.onrender.com/gemini/hercai?question=${encodeURIComponent(message)}`, {
            headers: {
                "content-type": "application/json",
            },
        })
        return data;
    } catch (e) {
    console.log(e)
}
}

async function gpt3(message) {
   try {
     var api = await axios.get(`https://hercai.onrender.com/turbo/hercai?question=${encodeURIComponent(message)}`, {
         headers: {
         "content-type": "application/json",
         },
        })
      return api.data;
    } catch (e) {
    console.log(e)
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

async function gptlogic(prompt) {
let postData = {
    prompt: prompt,
    sessionId: '-',
    character: `Kamu adalah Rioo, kamu bukanlah ai atau chat bot, kamu adalah anak remaja sma, kamu memiliki sifat kasar dan toxic, kadang kamu memakai emoji 🖕 ketika kesal, kamu kalau ngobrol menggunakan bahasa gaul anak Indonesia seperti lu untuk kamu dan gw untuk aku, rest api Rioo: https://restapii.rioooxdzz.web.id, untuk nomor nya wa.me/6285691304150`
};

try {
    const response = await axios({
        url: "https://elxyzgpt.xyz/api/chat",
        method: 'POST',
        data: new URLSearchParams(Object.entries(postData)),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}
		async function bard(query) {
    const COOKIE_KEY = "g.a000mwgL5JRw9IARGMYCihj5YvtGl7tz7BOQSlsQyEAHYA1KvbeO-vBerIBI5FcrtceDgrFr6gACgYKAUcSARYSFQHGX2MiQ4NYw4HGfFmoBkuy3Bg-RhoVAUF8yKqas8HgMOBNEddTflPWq2Ry0076";
    const psidCookie = '__Secure-1PSID=' + COOKIE_KEY;
    const headers = {
        "Host": "gemini.google.com",
        "X-Same-Domain": "1",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36",
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        "Origin": "https://gemini.google.com",
        "Referer": "https://gemini.google.com",
        'Cookie': psidCookie
    };
    const bardRes = await fetch("https://gemini.google.com/", { method: 'get', headers });
    const bardText = await bardRes.text();
    const [snlM0e, blValue] = [bardText.match(/"SNlM0e":"(.*?)"/)?.[1], bardText.match(/"cfb2h":"(.*?)"/)?.[1]];
    const bodyData = `f.req=[null,"[[\\"${encodeURIComponent(query)}\\"],null,[\\"\\",\\"\\",\\"\\"]]\"]&at=${snlM0e}`;
    const response = await fetch(`https://gemini.google.com/_/BardChatUi/data/assistant.lamda.BardFrontendService/StreamGenerate?bl=${blValue}&_reqid=229189&rt=c`, { method: 'post', headers, body: bodyData });
    const answer = JSON.parse(JSON.parse((await response.text()).split("\n").reduce((a, b) => (a.length > b.length ? a : b), ""))[0][2])[4][0][1];
    
    // Ubah hasil ke dalam bahasa Indonesia jika API mendukung parameter ini
    return answer;
}
function openai(messages) {
    return new Promise(async (resolve, reject) => {
        try {
            if (!Array.isArray(messages)) {
                messages = [messages];
            }

            const url = 'https://chatsandbox.com/api/chat';
            const requestData = {
                messages: messages,
                character: 'openai'
            };

            const headers = {
                "Content-Type": "application/json"
            };

            const response = await axios.post(url, requestData, { headers });

            if (response.status === 200 && response.data) {
                resolve(response.data);
            } else {
                reject(new Error('Failed to get a valid response'));
            }
        } catch (error) {
            reject(error);
        }
    });
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
    const messages = req.query.message;
    if (!messages) {
      return res.status(400).json({ error: 'Parameter "message" tidak ditemukan' });
    }
    const response = await openai(messages);
    res.status(200).json({
      status: 200,
      creator: "RiooXdzz",
      data: { response }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get('/api/bard', async (req, res) => {
  try {
    const query = req.query.message;
    if (!query) {
      return res.status(400).json({ error: 'Parameter "message" tidak ditemukan' });
    }
    const response = await bard(query);
    res.status(200).json({
      status: 200,
      creator: "RiooXdzz",
      data: { response }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get('/api/gptlogic', async (req, res) => {
  try {
    const prompt = req.query.message;
    if (!prompt) {
      return res.status(400).json({ error: 'Parameter "message" tidak ditemukan' });
    }
    const response = await gptlogic(prompt);
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
app.get('/api/iask', async (req, res) => {
  try {
    const query = req.query.message;
    if (!query) {
      return res.status(400).json({ error: 'Parameter "text" tidak ditemukan' });
    }
    const response = await iask(query);
    res.status(200).json({
      status: 200,
      creator: "RiooXdzz",
      data: { response }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get('/api/chatgpt', async (req, res) => {
  try {
    const text = req.query.message;
    if (!text) {
      return res.status(400).json({ error: 'Parameter "text" tidak ditemukan' });
    }
    const response = await chatgpt(text);
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
app.get('/api/sfiledl', async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) {
      return res.status(400).json({ error: 'Parameter "url" tidak ditemukan' });
    }
    const response = await sfileDl(url);
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
app.get('/api/search-sfile', async (req, res) => {
  try {
    const query = req.query.message;
    if (!query) {
      return res.status(400).json({ error: 'Parameter "message" tidak ditemukan' });
    }
    const response = await sfileSearch(query);
    res.status(200).json({
      status: 200,
      creator: "RiooXdzz",
      data: { response }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get('/api/ytdl', async (req, res) => {
  try {
    const videoUrl = req.query.url;
    if (!videoUrl) {
      return res.status(400).json({ error: 'Parameter "url" tidak ditemukan' });
    }
    const response = await ytdl(videoUrl);
    res.status(200).json({
      status: 200,
      creator: "RiooXdzz",
      data: { response }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get('/api/aio', async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) {
      return res.status(400).json({ error: 'Parameter "url" tidak ditemukan' });
    }
    const response = await aio(url);
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
app.get('/api/spotify', async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) {
      return res.status(400).json({ error: 'Parameter "url" tidak ditemukan' });
    }
    const response = await spotify(url);
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
app.get('/api/igdl', async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) {
      return res.status(400).json({ error: 'Parameter "url" tidak ditemukan' });
    }
    const response = await igdl(url);
    res.status(200).json({
      status: 200,
      creator: "RiooXdzz",
      data: { response }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get('/api/remini', async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) {
      return res.status(400).json({ error: 'Parameter "image" tidak ditemukan' });
    }
    const response = await imagetohd(url);
    res.status(200).json({
      status: 200,
      creator: "RiooXdzz",
      data: { response }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/status', async (req, res) => {
function muptime(seconds) {
	function pad(s) {
		return (s < 10 ? "0" : "") + s;
	}
	var hours = Math.floor(seconds / (60 * 60));
	var minutes = Math.floor((seconds % (60 * 60)) / 60);
	var seconds = Math.floor(seconds % 60);

	return pad(hours) + " : " + pad(minutes) + " : " + pad(seconds);
}
	var date = new Date();
	var jam = date.getHours();
	var menit = date.getMinutes();
	var detik = date.getSeconds();
	var old = performance.now();
	var neww = performance.now();
	var ram = `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(
		2
	)}MB / ${Math.round(require("os").totalmem / 1024 / 1024)}MB`;
	var cpu = require("os").cpus();
	var json = await (await fetch("https://api.ipify.org/?format=json")).json();
	var port = process.env.PORT || 8080 || 5000 || 3000;
	status = {
		status: "online",
		memory: ram,
		cpu: cpu[0].model,
		port: port,
		ip: json.ip,
		time: `${jam} : ${menit} : ${detik}`,
		uptime: muptime(process.uptime()),
		speed: `${neww - old}ms`,
		info: {
			owner: "RiooXdzz",
			apikey: "Chat Owner: https://wa.me/6285691304150",
		},
	};
	res.json(status);
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
