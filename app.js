const path = require('path');
const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.redirect('/restaurantlist')
})

app.get('/restaurantlist', (req, res) => {
  res.send('www');
})

app.get('/restaurantlist/:id', (req, res) => {
  const id = req.params.id;
  res.send(`${id}`);
})

app.listen(port, (req, res) => {
  console.log(`the app is running at http://localhost:${port}`);
})