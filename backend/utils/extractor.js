const fs = require('fs');
const mammoth = require('mammoth');

const extractText = async (filePath, fileType) => {
  try {
    const buffer = fs.readFileSync(filePath);

    if (fileType === 'pdf') {
      const pdfParse = require('pdf-parse');
      const data = await pdfParse(buffer);
      return data.text.trim();
    }

    if (fileType === 'docx') {
      const result = await mammoth.extractRawText({ buffer });
      return result.value.trim();
    }

    throw new Error('Unsupported file type');
  } catch (err) {
    throw new Error(`Text extraction failed: ${err.message}`);
  }
};

module.exports = { extractText };