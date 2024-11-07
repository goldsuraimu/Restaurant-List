const path = require('path');
const express = require('express');
const {engine} = require('express-handlebars');
const app = express();
const port = 3000;
const restaurants = require(path.join(__dirname, "public/jsons/restaurant.json")).results;

app.engine('.hbs', engine({extname: '.hbs'}));
app.set('view engine', '.hbs')
app.set('views', path.join(__dirname, 'views'))


app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.redirect('/restaurantlist')
})

app.get('/restaurantlist', (req, res) => {
  res.render('index', { restaurants });
})

app.get('/restaurants/:id', (req, res) => {
  const id = req.params.id;
  const restaurant = restaurants.find((restaurant) => restaurant.id === Number(id))
  res.render('detail', { restaurant });
})

app.listen(port, (req, res) => {
  console.log(`the app is running at http://localhost:${port}`);
})