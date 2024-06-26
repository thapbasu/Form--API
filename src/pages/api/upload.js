// pages/api/upload.js
import multer from 'multer';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const mkdir = promisify(fs.mkdir);

const upload = multer({
  storage: multer.diskStorage({
    destination: async (req, file, cb) => {
      const dir = path.join(process.cwd(), 'public/uploads');
      await mkdir(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname);
    },
  }),
});

const uploadMiddleware = upload.single('file');

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    uploadMiddleware(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        return res.status(500).json({ error: err.message });
      } else if (err) {
        return res.status(500).json({ error: 'An unknown error occurred' });
      }
      return res.status(200).json({ message: 'File uploaded successfully' });
    });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
