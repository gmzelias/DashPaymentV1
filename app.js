require('./config/config');

const express = require('express');
const app = express();
const routes = require ('./routes');
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.engine('pug', require('pug').__express);

app.set('view engine', 'pug');

app.use(express.static('public'))

app.use(routes);
const port = process.env.PORT;

app.listen(port, function () {
  console.log(`Example app listening on port ${port}!`);
})

/*app.listen(process.env.PORT || 3000, function () {
  console.log('Example app listening on port 3000!');
})*/