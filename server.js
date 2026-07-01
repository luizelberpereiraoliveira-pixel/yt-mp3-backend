import express from 'express';
import YTDlpWrapModule from 'yt-dlp-wrap';
import cors from 'cors';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const YTDlpWrap = YTDlpWrapModule.default || YTDlpWrapModule;
const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(cors());
const PORT = 3001;
const ytDlp = new YTDlpWrap(join(__dirname, 'yt-dlp.exe'));

app.get('/info', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'URL não fornecida' });
  try {
    const info = await ytDlp.getVideoInfo(url);
    res.json({
      title: info.title,
      author: info.uploader,
      duration: info.duration,
      thumbnail: info.thumbnail,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/download', async (req, res) => {
  const { url, quality = '128', format = 'mp3' } = req.query;
  if (!url) return res.status(400).json({ error: 'URL não fornecida' });
  try {
    const info = await ytDlp.getVideoInfo(url);
    const title = info.title.replace(/[^\w\s]/gi, '');
    res.setHeader('Content-Disposition', `attachment; filename="${title}.${format}"`);
    res.setHeader('Content-Type', 'audio/mpeg');
    const stream = ytDlp.execStream([
      url,
      '-x',
      '--audio-format', format,
      '--audio-quality', quality,
      '-o', '-'
    ]);
    stream.pipe(res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Backend rodando em http://localhost:${PORT}`));