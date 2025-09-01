import formidable from 'formidable';
import fs from 'fs/promises';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res
      .status(405)
      .json({ success: false, message: 'Method not allowed' });
  }

  const uploadDir = path.join(process.cwd(), 'public', 'schoolImages');

  try {
    await fs.mkdir(uploadDir, { recursive: true });
  } catch (error) {
    console.error('Faild to create upload directory:', error);
  }

  const form = formidable({
    uploadDir,
    keepExtensions: true,
    maxFields: 5 * 1024 * 1024,
    filename: (name, ext, part) => {
      const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      return fileName;
    },
  });

  try {
    const [fields, files] = await form.parse(req);
    const file = Array.isArray(files.image) ? files.image[0] : files.image;

    if (!file) {
      return res
        .status(400)
        .json({ success: false, message: 'No file uploaded' });
    }

    const filename = path.basename(file.filepath);
    res.status(200).json({
      success: true,
      filename: `/schoolImages/${filename}`,
    });
  } catch (error) {
    console.error('Failed to upload file:', error);
    res.status(500).json({ success: false, message: 'Failed to upload file' });
  }
}
