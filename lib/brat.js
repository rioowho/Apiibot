const { createCanvas } = require('canvas');


async function BratGenerator(text) {
  const tempPath = `brat_image_${Date.now()}.png`;
  const width = 500;
  const height = 500;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Set a darker background for better contrast
  ctx.fillStyle = 'darkgray';
  ctx.fillRect(0, 0, width, height);

  // Apply a slight blur to the background (optional)
  ctx.filter = 'blur(5px)';
  ctx.fillRect(0, 0, width, height);
  ctx.filter = 'none';

  // Set font style and appearance
  ctx.font = '50px Sans-serif'; // Reduced font size to fit better
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillStyle = 'white';  // Use white color for better contrast against dark background
  ctx.lineWidth = 4;       // Adjust line width for stroke

  const maxWidth = width - 40;  // Added more margin for better readability
  const words = text.split(' ');
  let x = 20;
  let y = 20;
  let lineHeight = 70;  // Adjusted line height
  let line = '';

  // Split text into lines based on the max width
  words.forEach((word, index) => {
    const testLine = line + word + ' ';
    const testWidth = ctx.measureText(testLine).width;

    // If the text overflows, move to the next line
    if (testWidth > maxWidth) {
      ctx.strokeStyle = 'black';  // Dark stroke for better visibility
      ctx.strokeText(line, x, y);
      ctx.fillText(line, x, y);

      line = word + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }

    if (index < words.length - 1) {
      x += ctx.measureText(word + ' ').width;  // Adjust x position based on word width
    }
  });

  // Final line of text
  ctx.strokeStyle = 'black';
  ctx.strokeText(line, x, y);
  ctx.fillText(line, x, y);

  return canvas.toBuffer('image/png');
}


module.exports = BratGenerator