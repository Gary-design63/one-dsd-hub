require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fileUpload = require('express-fileupload');
const fs = require('fs');

const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');
const { requireAuth } = require('./middleware/auth');
const { getDb, saveDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet({ contentSecurityPolicy: false }));
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim()) : [];
app.use(cors(allowedOrigins.length > 0 ? { origin: allowedOrigins, credentials: true } : undefined));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({ limits: { fileSize: 10 * 1024 * 1024 }, abortOnLimit: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', version: '5.1.0', timestamp: new Date().toISOString(), env: process.env.NODE_ENV || 'development' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);

// File upload
app.post('/api/upload', requireAuth, async (req, res) => {
  if (!req.files || !req.files.file) return res.status(400).json({ error: 'No file uploaded' });
  const uploadDir = path.join(__dirname, '../uploads');
  fs.mkdirSync(uploadDir, { recursive: true });
  const file = req.files.file;
  const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  try {
    await file.mv(path.join(uploadDir, safeName));
    res.json({ message: 'File uploaded', filename: safeName });
  } catch (err) {
    res.status(500).json({ error: 'Upload failed: ' + err.message });
  }
});

// Static files (React frontend)
const publicDir = path.join(__dirname, '../public');
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api') && !req.path.startsWith('/health')) {
      res.sendFile(path.join(publicDir, 'index.html'));
    } else {
      res.status(404).json({ error: 'Not found' });
    }
  });
}

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message });
});

// Graceful shutdown
async function shutdown(signal) {
  console.log(`\n${signal} received. Saving database...`);
  try { saveDb(); console.log('Database saved.'); } catch (e) { console.error(e.message); }
  process.exit(0);
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Start
getDb().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    const aiStatus = process.env.ANTHROPIC_API_KEY ? '✓ ANTHROPIC_API_KEY configured' : '✗ Set ANTHROPIC_API_KEY for AI';
    console.log(`\nOne DSD Consultant Operating System v5.1`);
    console.log(`Minnesota DHS — Disability Services Division`);
    console.log(`Server:  http://0.0.0.0:${PORT}`);
    console.log(`Login:   gbanks / equity2026! (equity_lead)`);
    console.log(`AI:      ${aiStatus}\n`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});

module.exports = app;
