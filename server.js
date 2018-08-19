// server.js
// where your node app starts

// init project
const fs = require('fs-extra')
const showdown  = require('showdown')
const nunjucks = require('nunjucks')
const express = require('express')

if (!process.env.PROJECT_DOMAIN) {
  // read environment variables (only necessary locally, not on Glitch)
  require('dotenv').config();
}

const converter = new showdown.Converter()
const markdown = (s) => converter.makeHtml(s)

const app = express()
nunjucks.configure('templates', {
  autoescape: true,
  express: app,
  noCache: true,
})

async function renderPage(mdFile) {
  let body = await fs.readFile(`./pages/${mdFile}.md`, 'utf-8')
  let title = 'Untitled'
  try {
    // The title is taken as the text of the first h1 element in the document
    title = body.split('\n').filter(line => line.startsWith('# '))[0].substring(2)
  } catch (err) { }

  body = markdown(body)

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>${title}</title>
    <link id="favicon" rel="icon" href="https://glitch.com/edit/favicon-app.ico" type="image/x-icon">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">
    <link rel="stylesheet" href="/styles.css">
  </head>
  <body class="container">
    <header>
      <a href="/">Home</a>
      <a href="/notes">Notes</a>
      <a href="/activities">Activities</a>
      <a href="/resources">Resources</a>
      <a href="/faq">FAQ</a>
    </header>
    <main>
      ${body}
    </main>
  </body>
</html>`
}

app.use(express.static('public'))

app.get('/', async (req, res) => {
  res.send(await renderPage('index'))
})

app.get('/:path(*)', async (req, res) => {
  try {
    let html = await renderPage(req.params.path)
    res.send(html)
  } catch (err) {
    if (err.code === 'ENOENT') {
      res.status(404).send('No page found')
    }
  }
})

const listener = app.listen(process.env.PORT || 8000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
