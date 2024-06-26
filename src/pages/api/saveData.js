import multer from 'multer';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const mkdir = promisify(fs.mkdir);
const unlink = promisify(fs.unlink);

// Configure multer for file upload
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

const uploadMiddleware = upload.fields([
  { name: 'headImage', maxCount: 1 },
  { name: 'footerImage', maxCount: 1 },
]);

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    uploadMiddleware(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        return res.status(500).json({ error: err.message });
      } else if (err) {
        return res.status(500).json({ error: 'An unknown error occurred' });
      }

      const { name, phone, color } = req.body;
      const headImagePath = req.files.headImage
        ? req.files.headImage[0].path
        : null;
      const footerImagePath = req.files.footerImage
        ? req.files.footerImage[0].path
        : null;

      try {
        // Create the 'data' directory if it doesn't exist
        const dataDir = path.join(process.cwd(), 'data');
        if (!fs.existsSync(dataDir)) {
          fs.mkdirSync(dataDir);
        }

        const configFilePath = path.join(dataDir, 'config.json');

        // Read existing data if config.json exists
        let existingData = {};
        if (fs.existsSync(configFilePath)) {
          const fileContents = await fs.promises.readFile(
            configFilePath,
            'utf8'
          );
          if (fileContents) {
            existingData = JSON.parse(fileContents);
          }
        }

        // Delete old images if new images are uploaded
        if (headImagePath && existingData.headImage) {
          const oldHeadImagePath = path.join(
            process.cwd(),
            'public',
            existingData.headImage
          );
          if (fs.existsSync(oldHeadImagePath)) {
            await unlink(oldHeadImagePath);
          }
        }
        if (footerImagePath && existingData.footerImage) {
          const oldFooterImagePath = path.join(
            process.cwd(),
            'public',
            existingData.footerImage
          );
          if (fs.existsSync(oldFooterImagePath)) {
            await unlink(oldFooterImagePath);
          }
        }

        // Create new data entry
        const newEntry = {
          id: uuidv4(),
          name,
          phone,
          color,
          headImage: headImagePath
            ? `uploads/${path.basename(headImagePath)}`
            : existingData.headImage,
          footerImage: footerImagePath
            ? `uploads/${path.basename(footerImagePath)}`
            : existingData.footerImage,
        };

        // Save the updated data to config.json
        await fs.promises.writeFile(
          configFilePath,
          JSON.stringify(newEntry, null, 2)
        );

        console.log('Form data saved successfully');
        res.status(200).json({ message: 'Form data saved successfully' });
      } catch (error) {
        console.error('Error saving form data:', error);
        res
          .status(500)
          .json({ message: 'Error saving form data', error: error.message });
      }
    });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
