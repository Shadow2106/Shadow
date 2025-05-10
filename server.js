const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Ensure required folders exist
const uploadsDir = path.join(__dirname, 'uploads');
const papersDir = path.join(__dirname, 'papers');

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
if (!fs.existsSync(papersDir)) fs.mkdirSync(papersDir);

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage: storage });

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadsDir));

// Serve the upload form
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Upload.html'));
});

// Handle form submission
app.post('/submit-novel', upload.fields([{ name: 'file' }, { name: 'cover' }]), (req, res) => {
  const { title, author, genre, language, summary } = req.body;
  const novelFile = req.files['file']?.[0]?.filename || '';
  const coverImage = req.files['cover']?.[0]?.filename || '';

  const filePath = path.join(papersDir, 'Book2.xlsx');
  let workbook, worksheet, data = [];

  if (fs.existsSync(filePath)) {
    workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    worksheet = workbook.Sheets[sheetName];
    data = XLSX.utils.sheet_to_json(worksheet);
  } else {
    workbook = XLSX.utils.book_new();
  }

  // Add new data
  data.push({
    Title: title,
    Author: author,
    Genre: genre,
    Language: language,
    Synopsis: summary,
    NovelFile: novelFile,
    CoverImage: coverImage
  });

  // Rewrite sheet properly (avoid duplicate sheets)
  const newSheet = XLSX.utils.json_to_sheet(data);
  workbook.SheetNames = ['Submissions'];
  workbook.Sheets = { Submissions: newSheet };

  XLSX.writeFile(workbook, filePath);

  res.send(`<h2>Submission Successful!</h2><p><a href="/submissions">View Submissions</a></p>`);
});

// View all submissions
app.get('/submissions', (req, res) => {
  const filePath = path.join(papersDir, 'Book2.xlsx');
  if (!fs.existsSync(filePath)) {
    return res.send('No submissions found.');
  }

  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet);

  let html = '<h2>Submissions</h2><ul>';
  data.forEach((entry) => {
    html += `<li>
      <strong>${entry.Title}</strong> by ${entry.Author}<br>
      Genre: ${entry.Genre}, Language: ${entry.Language}<br>
      Synopsis: ${entry.Synopsis}<br>
      <a href="/uploads/${entry.NovelFile}" target="_blank">📄 View Novel PDF</a> |
      <a href="/uploads/${entry.CoverImage}" target="_blank">🖼️ View Cover Image</a>
      <hr>
    </li>`;
  });

  html += '</ul>';
  res.send(html);
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});



  