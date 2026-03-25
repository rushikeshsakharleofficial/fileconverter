import express from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const PORT = 4000;

// Ensure uploads dir exists
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// --- Cleanup: delete files older than 7 days ---
const cleanupOldFiles = () => {
  const now = Date.now();
  fs.readdirSync(UPLOADS_DIR).forEach(file => {
    if (file === '.gitkeep') return;
    const filePath = path.join(UPLOADS_DIR, file);
    const { mtimeMs } = fs.statSync(filePath);
    if (now - mtimeMs > MAX_AGE_MS) {
      fs.unlinkSync(filePath);
      console.log(`[cleanup] Deleted expired file: ${file}`);
    }
  });
};

// Run cleanup on startup and every hour
cleanupOldFiles();
setInterval(cleanupOldFiles, 60 * 60 * 1000);

// --- Multer config ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ts = Date.now();
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${ts}_${safe}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB per file
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

const app = express();
app.use(cors());
app.use(express.json());

// Serve uploads folder statically
app.use('/uploads', express.static(UPLOADS_DIR));

// POST /api/upload — accept one or more images
app.post('/api/upload', upload.array('files', 100), (req, res) => {
  if (!req.files?.length) return res.status(400).json({ error: 'No files uploaded' });
  const saved = req.files.map(f => ({
    id: f.filename,
    name: f.originalname,
    size: f.size,
    url: `/uploads/${f.filename}`,
    expiresAt: new Date(Date.now() + MAX_AGE_MS).toISOString(),
  }));
  res.json({ files: saved });
});

// GET /api/files — list all uploaded files with expiry info
app.get('/api/files', (req, res) => {
  const now = Date.now();
  const files = fs.readdirSync(UPLOADS_DIR)
    .filter(f => f !== '.gitkeep')
    .map(f => {
      const { mtimeMs, size } = fs.statSync(path.join(UPLOADS_DIR, f));
      const expiresAt = new Date(mtimeMs + MAX_AGE_MS);
      const msLeft = expiresAt - now;
      const daysLeft = Math.ceil(msLeft / (24 * 60 * 60 * 1000));
      // Original name is everything after the first underscore
      const name = f.replace(/^\d+_/, '');
      return { id: f, name, size, url: `/uploads/${f}`, expiresAt: expiresAt.toISOString(), daysLeft };
    })
    .sort((a, b) => b.id.localeCompare(a.id)); // newest first
  res.json({ files });
});

// DELETE /api/files/:id — delete a specific file
app.delete('/api/files/:id', (req, res) => {
  const filePath = path.join(UPLOADS_DIR, req.params.id);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' });
  fs.unlinkSync(filePath);
  res.json({ ok: true });
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
