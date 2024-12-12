const fs = require('fs');
const path = require('path');
const axios = require('axios');

const imgBase = (filePath) => {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const filex = fs.readFileSync(filePath);
  const based = filex.toString('base64');
  const ext = path.extname(filePath).slice(1);
  const mimeType = ext ? `image/${ext}` : 'application/octet-stream';
  return `data:${mimeType};base64,${based}`;
};

const headers = {
  authority: 'labs.writingmate.ai',
  accept: '*/*',
  'content-type': 'application/json',
  origin: 'https://labs.writingmate.ai',
  referer: 'https://labs.writingmate.ai/share/JyVg?__show_banner=false',
  'user-agent': 'Postify/1.0.0',
};

const mateai = async (array) => {
  const data = {
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'image_prompt',
        strict: true,
        schema: {
          type: 'object',
          properties: { prompt: { type: 'string' } },
          required: ['prompt'],
          additionalProperties: false,
        },
      },
    },
    chatSettings: {
      model: 'gpt-4o',
      temperature: 0.7,
      contextLength: 16385,
      includeProfileContext: false,
      includeWorkspaceInstructions: false,
      embeddingsProvider: 'openai',
    },
    messages: array,
    customModelId: '',
  };

  try {
    const response = await axios.post('https://labs.writingmate.ai/api/chat/public', data, { headers });
    return response.data;
  } catch (error) {
    // Pastikan error yang dilempar lebih deskriptif
    throw new Error(`Request failed: ${error.response?.data?.message || error.message}`);
  }
};

module.exports = mateai