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


app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
})

