require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns');
const bodyParser = require('body-parser');
const urlParser = require('url');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

let urlDatabase = {}; // short_url: original_url
let counter = 1;
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint

app.post('/api/shorturl', (req, res) => {
  const userInput = req.body.url;

  let hostname;
  try {
    const parsedUrl = new URL(userInput);

    // Only allow http or https
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return res.json({ error: 'invalid url' });
    }

    hostname = parsedUrl.hostname;
  } catch (err) {
    // Invalid URL syntax
    return res.json({ error: 'invalid url' });
  }

  // Check if hostname is real
  dns.lookup(hostname, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    }

    const shortUrl = counter++;
    urlDatabase[shortUrl] = userInput;
    res.json({ original_url: userInput, short_url: shortUrl });
  });
});
app.get('/api/shorturl/:short', (req, res) => {
  const short = req.params.short;
  const originalUrl = urlDatabase[short];

  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.json({ error: 'No short URL found for given input' });
  }
});
app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
