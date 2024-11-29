
const axios = require('axios');
async function Ddownr(link) {
        this.url = url;
        this.video = ["360", "480", "720", "1080"];
    }

    download = async(type) => {
     if (!type) {
            return {
                success: false,
                list: this.video
            }
        }
        if (!this.video.includes(type)) {
            return {
                success: false,
                list: this.video
            }
        }

        try {
            const { data } = await axios.get(`https://p.oceansaver.in/ajax/download.php?copyright=0&format=${type}&url=${this.url}&api=dfcb6d76f2f6a9894gjkege8a4ab232222`);
            let result = {};

            while (true) {
                const response = await axios.get(`https://p.oceansaver.in/ajax/progress.php?id=${data.id}`).catch(e => e.response);
                if (response.data.download_url) {
                      result = {
                            type,
                            download: response.data.download_url
                        };
                    break;
                } else {
                    console.log(`[ ! ] ${response.data.text} : ${response.data.progress}/1000`);
                }
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            return { ...data.info, ...result };
        } catch (e) {
          return {
           success: false,
            msg: "Kode Nya Turu min Besok lagi saja", 
            err: e 
          };
        }

module.exports = { Ddownr }
