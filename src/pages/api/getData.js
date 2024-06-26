import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const dataDir = path.join(process.cwd(), 'data');
      const configFilePath = path.join(dataDir, 'config.json');

      if (fs.existsSync(configFilePath)) {
        const fileContents = fs.readFileSync(configFilePath, 'utf8');
        const data = JSON.parse(fileContents);
        res.status(200).json(data);
      } else {
        res.status(404).json({ message: 'Config file not found' });
      }
    } catch (error) {
      console.error('Error reading config file:', error);
      res
        .status(500)
        .json({ message: 'Error reading config file', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
