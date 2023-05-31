const express = require('express');
const multer = require('multer');
const mysql = require('mysql');
const path = require('path');

const app = express();
const port = 3000;
app.use(express.static('uploads'));

// Set up MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'notice-board'
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL as id ' + db.threadId);
});

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: './uploads',
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Set up static file serving
app.use(express.static('public'));

// Set up EJS as the template engine
app.set('view engine', 'ejs');

// Routes
app.get('/', (req, res) => {
  db.query('SELECT * FROM notices', (err, result) => {
    if (err) {
      console.error('Error executing MySQL query: ' + err.stack);
      return res.sendStatus(500);
    }
    res.render('index', { notices: result });
  });
});

app.get('/student', (req, res) => {
  db.query('SELECT * FROM notices', (err, result) => {
    if (err) {
      console.error('Error executing MySQL query: ' + err.stack);
      return res.sendStatus(500);
    }
    res.render('student', { notices: result });
  });
});

app.post('/upload', upload.single('file'), (req, res) => {
  const notice = {
    title: req.body.title,
    description: req.body.description,
    filename: req.file.filename
  };

  db.query('INSERT INTO notices SET ?', notice, (err, result) => {
    if (err) {
      console.error('Error executing MySQL query: ' + err.stack);
      return res.sendStatus(500);
    }
    res.redirect('/');
  });
});

app.listen(port, () => {
  console.log('Server started on port ' + port);
});
