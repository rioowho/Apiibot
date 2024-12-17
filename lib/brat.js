const { createCanvas, registerFont } = require('canvas'); // pastikan 'canvas' package terinstal
const Jimp = require('jimp');

async function BratGenerator(teks) {
  const width = 512;
  const height = 512;
  const margin = 20;
  const wordSpacing = 50;

registerFont('./lib/arial.ttf', { family: 'Arial' });

  // Membuat canvas dan context 2D
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Set background
  ctx.fillStyle = 'white';  // Warna latar belakang putih
  ctx.fillRect(0, 0, width, height);

  // Set font size dan tinggi baris
  let fontSize = 80;
  let lineHeightMultiplier = 1.3;

  // Atur alignment dan warna teks
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillStyle = 'black'; // Warna font hitam, bisa disesuaikan agar kontras dengan latar belakang

  // Split teks menjadi kata-kata dan mengatur pembungkusan
  const words = teks.split(' ');
  let lines = [];

  // Fungsi untuk membangun kembali baris berdasarkan pembungkusan kata
  const rebuildLines = () => {
    lines = [];
    let currentLine = '';

    for (let word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const lineWidth =
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

  // Set font (gunakan font kustom jika perlu)
  ctx.font = `${fontSize}px Arial`; // Ganti dengan font yang diinginkan

  // Bangun baris teks
  rebuildLines();

  // Jika baris melebihi tinggi canvas, sesuaikan ukuran font
  while (lines.length * fontSize * lineHeightMultiplier > height - 2 * margin) {
    fontSize -= 2;
    ctx.font = `${fontSize}px Arial`; // Ganti dengan font yang diinginkan
    rebuildLines();
  }

  // Hitung tinggi baris dan posisi vertikal
  const lineHeight = fontSize * lineHeightMultiplier;
  let y = margin;

  // Gambar teks pada canvas
  for (let line of lines) {
    const wordsInLine = line.split(' ');
    let x = margin;

    for (let word of wordsInLine) {
      ctx.fillText(word, x, y);
      x += ctx.measureText(word).width + wordSpacing;
    }

    y += lineHeight;
  }

  // Generate buffer gambar dari canvas
  const buffer = canvas.toBuffer('image/png');
  const image = await Jimp.read(buffer);

  // Terapkan efek blur jika diperlukan
  image.blur(1); // Kurangi nilai blur atau hapus jika tidak diinginkan

  // Ambil buffer gambar yang sudah di-blur
  const blurredBuffer = await image.getBufferAsync(Jimp.MIME_PNG);

  return blurredBuffer;
}

module.exports = BratGenerator