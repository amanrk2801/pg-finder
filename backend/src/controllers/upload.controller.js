const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');
const ALLOWED_TYPES = { jpeg: 'jpg', jpg: 'jpg', png: 'png', webp: 'webp' };
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB decoded

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

/**
 * Decodes a base64 / data-URI image, writes it to the uploads dir, and
 * returns the filename. Throws an Error with .status set on invalid input.
 */
async function saveBase64Image(data) {
  if (!data || typeof data !== 'string') {
    const err = new Error('Image data is required');
    err.status = 400;
    throw err;
  }

  let ext = 'jpg';
  let payload = data;
  const dataUriMatch = data.match(/^data:image\/(\w+);base64,(.+)$/s);
  if (dataUriMatch) {
    const type = dataUriMatch[1].toLowerCase();
    if (!ALLOWED_TYPES[type]) {
      const err = new Error(`Unsupported image type: ${type}`);
      err.status = 400;
      throw err;
    }
    ext = ALLOWED_TYPES[type];
    payload = dataUriMatch[2];
  }

  const buffer = Buffer.from(payload, 'base64');
  if (!buffer.length) {
    const err = new Error('Invalid image data');
    err.status = 400;
    throw err;
  }
  if (buffer.length > MAX_BYTES) {
    const err = new Error('Image too large (max 8 MB)');
    err.status = 413;
    throw err;
  }

  const filename = `${crypto.randomUUID()}.${ext}`;
  await fs.promises.writeFile(path.join(UPLOAD_DIR, filename), buffer);
  return filename;
}

function buildUploadUrl(req, filename) {
  return `${req.protocol}://${req.get('host')}/uploads/${filename}`;
}

// Accepts { data: "<base64 or data-URI>" } and stores it as a served static file.
async function uploadImage(req, res, next) {
  try {
    const filename = await saveBase64Image(req.body.data);
    return res.status(201).json({ url: buildUploadUrl(req, filename) });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    return next(err);
  }
}

module.exports = {
  uploadImage, saveBase64Image, buildUploadUrl, UPLOAD_DIR,
};
