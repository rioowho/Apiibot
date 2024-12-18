const { createCanvas } = require('canvas');


async function BratGenerator(text) {
  const tempPath = `brat_image_${Date.now()}.png`;
  const width = 500;
  const height = 500;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, width, height);

  ctx.filter = 'blur(20px)';
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, width, height);
  ctx.filter = 'none';

  ctx.font = '120px Arial';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillStyle = 'black';
  ctx.lineWidth = 6;

  const maxWidth = width - 20;
  const words = text.split(' ');
  let x = 20;
  let y = 20;
  let lineHeight = 140;
  let line = '';

  words.forEach((word, index) => {
    const testLine = line + word + ' ';
    const testWidth = ctx.measureText(testLine).width;

    if (testWidth > maxWidth) {
      ctx.filter = 'blur(30px)';
      ctx.strokeText(line, x, y);
      ctx.fillText(line, x, y);
      ctx.filter = 'none';

      line = word + '      ';
      y += lineHeight;
    } else {
      line = testLine;
    }

    if (index < words.length - 1) {
      x += ctx.measureText(word + ' ').width + 20;
    }
  });

  ctx.filter = 'blur(30px)';
  ctx.strokeText(line, x, y);
  ctx.fillText(line, x, y);
  ctx.filter = 'none';

  return canvas.toBuffer('image/png');
}


module.exports = BratGenerator