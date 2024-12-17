let { createCanvas } = require('canvas');
let Jimp = require('jimp');

async function BratGenerator(teks) {
  let width = 512;
  let height = 512;
  let margin = 20;
  let wordSpacing = 50;

  // Create the canvas and 2D context
  let canvas = createCanvas(width, height);
  let ctx = canvas.getContext('2d');

  // Set up the background
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, width, height);

  // Default font size and line height multiplier
  let fontSize = 80;
  let lineHeightMultiplier = 1.3;

  // Text alignment and color
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillStyle = 'black';

  // Split the text into words and handle wrapping
  let words = teks.split(' ');
  let lines = [];

  // Function to rebuild lines based on word wrapping
  let rebuildLines = () => {
    lines = [];
    let currentLine = '';

    for (let word of words) {
      let testLine = currentLine ? `${currentLine} ${word}` : word;
      let lineWidth =
        ctx.measureText(testLine).width + (currentLine.split(' ').length - 1) * wordSpacing;

      if (lineWidth < width - 2 * margin) {
        currentLine = testLine;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }
  };

  // Set the font (check if custom fonts are required here)
  ctx.font = `${fontSize}px Sans-serif`;

  // Rebuild lines for initial font size
  rebuildLines();

  // Adjust font size if lines overflow the canvas
  while (lines.length * fontSize * lineHeightMultiplier > height - 2 * margin) {
    fontSize -= 2;
    ctx.font = `${fontSize}px Sans-serif`;
    rebuildLines();
  }

  // Line height based on font size
  let lineHeight = fontSize * lineHeightMultiplier;
  let y = margin;

  // Draw each line of text
  for (let line of lines) {
    let wordsInLine = line.split(' ');
    let x = margin;

    for (let word of wordsInLine) {
      ctx.fillText(word, x, y);
      x += ctx.measureText(word).width + wordSpacing;
    }

    y += lineHeight;
  }

  // Generate the image buffer from the canvas
  let buffer = canvas.toBuffer('image/png');
  let image = await Jimp.read(buffer);

  // Apply a slight blur (adjust blur strength if necessary)
  image.blur(1); // Reduce blur or remove it completely if undesired

  // Get the final image buffer
  let blurredBuffer = await image.getBufferAsync(Jimp.MIME_PNG);

  return blurredBuffer;
}

module.exports = BratGenerator