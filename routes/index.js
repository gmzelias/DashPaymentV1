const express = require('express');
const router = express.Router();
const pjson = require('../test.json');
const cars = require('../carsData.json');
var mysql      = require('mysql');
var moment = require('moment');
var addrValidator = require('wallet-address-validator');
//var dashcore = require('@dashevo/dashcore-lib');
var request = require('request');

var pool      =    mysql.createPool({
  connectionLimit : 100, //important
  host     : 'localhost',
  user     : 'Elias',
  password : '18003154dash',
  database : 'dpayments',
  debug    :  false
});


//Front Page
router.get('/', function (req, res) {
  /*
  var publicKey2 = new dashcore.PublicKey('022c79e7699ebb6c07afdcdfeb1aac03ce4707f0c2628bcbef86b93e2e6b97d69f');
  var address = publicKey2.toAddress();*/
  res.render('index', { 
    title: 'Home', 
    message: pjson.formM, 
    name: pjson.name 
})
})
//Submit Button
router.post('/submit', function (req, res, next) {
  //Generate key and addresses
  function getInformation(callback){
    var address;
  request.post(
      "https://api.blockcypher.com/v1/dash/main/addrs",
      { json: { key: 'value' } },
      function (error, response, body) {
          if (!error && response.statusCode == 201) {
            address = body.address;
            callback(address);
          }
      }
  );
  
};
    //information
    //-------------------------
    function setInformation(address){
      console.log(req.body.Amount);
      var data = {
      validated:'',
      InvoiceID : req.body.Invoice,
      SimpleAddress :'', 
      RAddress : address, //req.body.PubAddress, //attention
      Amount :req.body.Amount, 
      Date :moment().format('llll')
      }
      var addrCheck = addrValidator.validate(data.RAddress, 'DASH');
      if(addrCheck)
        runQuery(data,setValue);
     else
     {
       data.validated = false;
        res.render('submit', {data});
      }
};
    //Validate address information
    //-------------------------------
    getInformation(setInformation);

   function runQuery(data,callback) {
     var DataToInsert = {InvoiceID:data.InvoiceID,
      SAddress:data.SimpleAddress,
      RAddress:data.RAddress,
      Amount:data.Amount,
      Date:data.Date}
      pool.query('INSERT INTO paymentinfo SET ?', DataToInsert, function (error, results, fields) {
        if (!error){
        console.log('Query executed.');
        data.validated = true;
        }
        else{
          console.log(error);
        console.log('Error while performing Query.');
        data.validated = false;
        }
      callback(data);
    });
  };

  function setValue(data) {
    data.SimpleAddress=data.RAddress;
    data.RAddress = data.RAddress +'?amount='+data.Amount;
    console.log(data);
    res.render('submit', {data});
    };
  

    //Select Query
   // --------------
    /*pool.query('SELECT * from paymentinfo', function(err, rows, fields) {
        if (!err)
           console.log('The solution is: ', rows);
        else
        console.log('Error while performing Query.');
    });*/

    //Activate for POSTMAN use:
    // ---------------------------
    /*res.writeHead(200, {"Content-Type": "application/json"});
    var json = JSON.stringify({ 
      Invoice: req.body.Invoice, 
      PubAddress: req.body.PubAddress, 
      Ammount: req.body.Ammount
    });
    res.end(json);*/
})

router.get('/about', function (req, res) {
  res.render('about', { 
    title: 'About Us', 
    message: pjson.description, 
    name: pjson.name 
})
})

router.get('/contact', function (req, res) {
  res.render('contact', { 
    title: 'Contact', 
    message: '555-555-5555', 
    name: pjson.name 
})
})

router.get('/:id', function (req, res) {
  var i = 0;
  switch(req.params.id) {
    case 'toyota': i = 0; break;
    case 'subaru': i = 1; break;
    case 'nissan': i = 2; 
}
  
  res.render('cars', { 
    currentBrand: req.params.id.charAt(0).toUpperCase() + req.params.id.substr(1),
    title: req.params.id,
    name: pjson.name,
    model1: cars[i].models[0], 
    model2: cars[i].models[1],
    model3: cars[i].models[2]
    })
})

module.exports = router;
