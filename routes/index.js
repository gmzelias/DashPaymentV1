const express = require('express');
const router = express.Router();
const pjson = require('../test.json');
const cars = require('../carsData.json');
var mysql      = require('mysql');
var moment = require('moment');
var addrValidator = require('wallet-address-validator');
//var dashcore = require('@dashevo/dashcore-lib');
var request = require('request');
var bitcore = require('bitcore-lib-dash');
var Message = require('bitcore-message-dash');
var key = 'realrealrealreal';// Don't do this though, your keys should most likely be stored in env variables
                                                            // and accessed via process.env.MY_SECRET_KEY
var encryptor = require('simple-encryptor')(key);

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
    console.log('1');
    request.post(
      "https://api.blockcypher.com/v1/dash/main/addrs",
      { json: { key: 'value' } },
      function (error, response, body) {
          if (!error && response.statusCode == 201) {
            address = body.address;
            wif = body.wif;
            pAddress = body.private;
            callback(address,wif,pAddress);
          }
          else{
            console.log("Error on API"); //must be HTML
          }
      });
};
    //information
    //-------------------------
    function setInformation(address,wif,pAddress){
     console.log('2');
      var data = {
      validated:'',
      InvoiceID : req.body.Invoice,
      SimpleAddress :'', 
      RAddress :  address, //ATTENTION: Cable on RAddres ----> 'XpbyLiNovaWUpovfdDg9y31y11nzEwusoo',
      wif:wif,
      pAddress: pAddress,
      Amount :req.body.Amount, 
      Date :moment().format('llll')
      }
      var addrCheck = addrValidator.validate(data.RAddress, 'DASH');
      console.log('2.5');
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
    console.log('3');
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
    console.log('4');
    data.SimpleAddress=data.RAddress;
    data.RAddress ="dash:"+data.RAddress+'?amount='+data.Amount;
    //console.log(data);
    //Tx Signing
    /*
    console.log("-------------------------------------------");
    console.log("-------------------------------------------");
    var privateKey = bitcore.PrivateKey.fromWIF(data.pAddress);
    console.log("La Private");
    console.log(data.pAddress);
    var signature = Message('32b5ea64c253b6b466366647458cfd60de9cd29d7dc542293aa0b8b7300cd827').sign(privateKey);

    // const buf1 = Buffer.from('CEztKBAYNoUEEaPYbkyFeXC5v8Jz9RoZH9','hex');
    const buf2 = Buffer.from(signature, 'utf8').toString('hex');
    //const buf2 = Buffer.from('02152e2bb5b273561ece7bbe8b1df51a4c44f5ab0bc940c105045e2cc77e618044');

    console.log(signature);
    console.log(buf2);
    console.log("-------------------------------------------");
    console.log("-------------------------------------------");
    */
   var encrypted = encryptor.encrypt(data.pAddress);
   data.pAddress = encrypted;
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

router.post('/contact', function (req, res) {
  var decrypted = encryptor.decrypt(req.body.pAddress);
  var hash = req.body.hash;
  var address = encryptor.decrypt(req.body.address);
  var conf = false;
  function getConfirmation(hash,decrypted,address,conf){
    request.post(
      "https://api.blockcypher.com/v1/dash/main/txs/"+hash,
      { json: { key: 'value' } },
      function (error, response, body) {
          if (!error && response.statusCode == 200) {
            if (body.confirmations > 0) {
              conf = true;
              var newtx = {
                inputs: [{addresses: ['XpbyLiNovaWUpovfdDg9y31y11nzEwusoo']}], //Copay
                outputs: [{addresses: [address], value: 10000}]
              };
              newTx(newtx);

            }
          }
        })
      };
      var newtx = {
        inputs: [{addresses: ['XpbyLiNovaWUpovfdDg9y31y11nzEwusoo']}], //Copay
        outputs: [{addresses: ['Xny3GX4fdY7REo5MLVS6L91dQrumToaByU'],
        value: 10000}]
      };
      function newTx(newtx){
        console.log('entra en newtx');
        var options = {
          uri: 'https://api.blockcypher.com/v1/dash/main/txs/new',
          method: 'POST',
          json: {
            inputs: [{addresses: ['XpbyLiNovaWUpovfdDg9y31y11nzEwusoo']}], //Copay
        outputs: [{addresses: ['Xny3GX4fdY7REo5MLVS6L91dQrumToaByU'],
        value: 10000}]
          }
        };
        const buf2 = Buffer.from("C1rGdt7QEPGiwPMFhNKNhHmyoWpa5X92pn", 'utf8').toString('hex');
        console.log(buf2);
      };
       /* request(options, function (error, response, body) {
          console.log(response.statusCode);
          if (!error && response.statusCode == 201) {
            console.log(body) // Print the shortened url.
            console.log(body.tosign);
          }
        });*/

        
   
    newTx(newtx);
  res.render('contact', { 
    title: 'Contact', 
    message: '555-555-5555', 
    name: pjson.name });
  })

router.post('/about', function (req, res) {
  res.render('about', { 
    title: 'About Us', 
    message: pjson.description, 
    name: pjson.name 
})
})

router.get('/unconfirmed', function (req, res) {
  res.render('unconfirmed', { //do the page 
    title: 'Contact', 
    message: '555-555-5555', 
    name: pjson.name 
})
})

router.post('/contact', function (req, res) {
  var ale = req.body.pAddress
  //console.log(req.body.pAddress);
  var decrypted = encryptor.decrypt(req.body.pAddress);
  console.log('decrypted: %s', decrypted);
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
