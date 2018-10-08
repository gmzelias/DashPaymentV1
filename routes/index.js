const express = require('express');
const router = express.Router();
const pjson = require('../test.json');
const cars = require('../carsData.json');
var mysql      = require('mysql');
var moment = require('moment');
var addrValidator = require('wallet-address-validator');
//var dashcore = require('@dashevo/dashcore-lib');

var bitcore = require('bitcore-lib-dash');
var Message = require('bitcore-message-dash');

var request = require('request');
//var dashcore = require('bitcore-lib-dash');
//var Message = require('bitcore-message-dash');
var encoder = require('int-encoder');//delete
var key = 'realrealrealreal';// Don't do this though, your keys should most likely be stored in env variables
                                                            // and accessed via process.env.MY_SECRET_KEY
var encryptor = require('simple-encryptor')(key);
const shell = require('shelljs');

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
    //CABLE
    address ="Xny3GX4fdY7REo5MLVS6L91dQrumToaByU";
    wif ="";
    pAddress ="xprv9s21ZrQH143K4YL3MvsYEr8bcC5gvVmu9iVVxzinw9SPVN18XZHyjkbmAwZHShZvrbnuWggVNpqa8NHVuACgxbAPYepdCgK9RLfrqBYWHda";
    callback(address,wif,pAddress);
    /*request.post(
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
      });*/
};
    //information
    //-------------------------
    function setInformation(address,wif,pAddress){
     console.log('2');
      var data = {
      validated:'',
      InvoiceID : req.body.Invoice,
      SimpleAddress :'', 
      RAddress :  address,
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
  var address = req.body.address;
  var confirmation = false;
  var times = 0;
  function getConfirmation(hash,decrypted,address,confirmation){
    request.get(
      "https://api.blockcypher.com/v1/dash/main/txs/"+hash,
      { json: { key: 'value' } },
      function (error, response, body) {
          if (!error && response.statusCode == 200) {
            if (body.confirmations >= 0) {
              console.log("Confirmations:" +body.confirmations);
              confirmation = true;
             /* var newtx = {
                inputs: [{addresses: ['XpbyLiNovaWUpovfdDg9y31y11nzEwusoo']}], //Copay
                outputs: [{addresses: [address], value: 10000}]
              };*/
              newTx(decrypted);
            }
            else{
                console.log("No se confirmo");
                setTimeout(function () {
                console.log('Entramos en el timeout');
                confirmation = false;
                times = times + 10;
                console.log(times);
                //VALIDATE WHEN A MINUTE IS COMPLETED
                getConfirmation(hash,decrypted,address,confirmation)
            }, 7000); 
            }
          }
        })
      };
        
      getConfirmation(hash,decrypted,address,confirmation)

      /*while (confirmation == false && times <= 60){
        console.log("No confirmation");
        getConfirmation(hash,decrypted,address,confirmation)
      }*/

      function newTx(decrypted){
        console.log("Check if decrypted is needed");
        console.log(decrypted);
        var input = 'XuDy7dvHrBfsRbj6w5xm3UQjtAQKGhzFW7';
        var output = 'XxjS2ApJA2u25tkTmFhvxLfmT7RMRLQK1Q';
        var options = {
          uri: 'https://api.blockcypher.com/v1/dash/main/txs/new',
          method: 'POST',
          json: {
            inputs: [{addresses: [input]}], 
                    outputs: [{addresses: [output], value: 10000}]
          }
        };
       request(options, function (error, response, body) {
          console.log(response.statusCode);
          console.log(body);
          if (!error && response.statusCode == 201) {
            var signatures = [];
            var pubkeys = [];
            var tx = body.tx;
            var toSign = body.tosign;

           /* console.log('private hex');
            var privatehex = Buffer.from("XwyXtUfTu9BvHhjm5s2ixozKSEWMdpgav6", 'utf8').toString('hex');
            console.log(privatehex);
            console.log('-----------------');
            var privateKey = bitcore.PrivateKey.fromString('0dc213f2480e2fff1385be63fb5d7447a55e4eba3724da2899d47fd9ebd8b9c8');*/
            for(var i = 0; i < toSign.length;i++){  
                //Tx Signing         
            console.log('ECSDA');
              //shell.exec(comandToExecute, {silent:true}).stdout;
              //you need little improvisation
              var stringShell = 'signer'+' '+toSign[i]+' '+'6b558e5e6546d253b6bb1ad85a4dcaaac9fb42a8d68a661122854a3926ebb896';
              var reina = shell.exec(stringShell);             
              var signed = reina.stdout;
              signed = signed.replace(/\n$/, '');
              signed = signed.trim();
              signatures.push(signed);

              pubkeys.push('02e91a29b20b2f7458d74f820c4e55137a1b65ed2763e43aadca50a5daa999ff0a');
            // var r = require('jsrsasign');
            //var ec = new r.ECDSA({ 'curve': 'secp256k1' });
            /*"private": "6b558e5e6546d253b6bb1ad85a4dcaaac9fb42a8d68a661122854a3926ebb896",
  
            "public": "02e91a29b20b2f7458d74f820c4e55137a1b65ed2763e43aadca50a5daa999ff0a",
            
            "address": "XuDy7dvHrBfsRbj6w5xm3UQjtAQKGhzFW7",
            
            "wif": "XEtGyDUW3QGa8mdWSboyRLCB1VQnFxQryLnczBmoB7kzSoZHBHMx"*/
            
            /*msg1 = toSign[i];          
            var sig = new r.Signature({ "alg": 'SHA256withECDSA' });
            sig.init({ d: prvhex, curve: 'secp256k1' });
            sig.updateString(msg1);
            var sigValueHex = sig.sign();
            
            var sig = new r.Signature({ "alg": 'SHA256withECDSA' });
            sig.init({ xy: pubhex, curve: 'secp256k1' });
            sig.updateString(msg1);
            var result = sig.verify(sigValueHex);
            //console.log(sigValueHex);
            if (result) {
              console.log("valid ECDSA signature");
            } else {
              console.log("invalid ECDSA signature");
            }*/


            //var  msg = randomBytes(32);
            //var privKey = randomBytes(32);
            //console.log(msg);
            //var enhex = msg.toString('hex');
            //console.log(enhex);
            //console.log(Buffer.from(enhex, 'hex'));

            /*var datatosignt = Buffer.from(toSign[i],'hex');
            var signwith = Buffer.from('b7e9997fb8cf094d6fc44e5e76b89f8d10c2259f8acddbacb4227397b934f835', 'hex');          
            var sigObj = secp256k1.sign(datatosignt, signwith);
            var enhexsigObj = sigObj.signature.toString('hex');
            console.log('asd');
            const pubkeytocheck = secp256k1.publicKeyCreate(signwith);*/



            //var pubkeytocheck = Buffer.from('032d3e6f8e6d673452fd61d22cf268608b60bd63586ab34530a19a9859f73421c2', 'hex');   
            //304402201fce11a7b612f9bc7d446054b1e661836f65cfecee0581700320a4c37caa9c2e0220540ea2d2edbe182e28a24afd0ffe29175eadea7c5ba69c5ed3ab0745b49cb9b0
            //3045022100cf05c2a72c7fe44e4e869634fb772dea4ba11f41a91394a4740757c14c56fdbd0220135ca8fbe0638ed8580123b984e3c4fcc832555f7e85e7687ef372953fb98498

            //30450221009f686e8d2b4c9fdd5581315e28d3efed41e32d3d9cfd490af0c401c07502d9760220335fe39d8b6899cad12ca5544667968d6163732c7e439696741cc4c44772cd2e

            //5b76e06a888623310083659c4668a063f2fa6150bc801f56d64f7edfecea3e0b288af75a0e4584784f473f155e1a286f6ef86333220519cf6606e531b75679a2
            //1385b5687ec868fff7f98cdfddd89778388be38ad89ae2f0912744e50684483c13b59273cadd7a451492d0132d5c01c3e95e0023ca607c37c7978e13deaa2e9a
            

            //console.log(enhexsigObj);

            //console.log(secp256k1.verify(datatosignt, sigObj.signature, pubkeytocheck)) //Check signature
            //console.log(Buffer.from(enhexsigObj, 'hex'));


                /*var signature = Message(toSign[i]).sign(privateKey);
                console.log(toSign[i]);
                const signatureHEX = Buffer.from(signature, 'utf8').toString('hex');*/
          
            }
            sendTx(tx,toSign,signatures,pubkeys);
          }
        else{
          console.log('Error creating TX');
             }   
        });
      };
      function sendTx(tx,toSign,signatures,pubkeys){
        console.log('tosign');
        console.log(toSign);
        console.log('signatures');
        console.log(signatures);
        console.log('pubkeys');
        console.log(pubkeys);

        var options = {
          uri: 'https://api.blockcypher.com/v1/dash/main/txs/send',
          method: 'POST',
          json: {
            tx: tx,
            tosign: 
              toSign
            ,
            signatures: 
              signatures
            ,
            pubkeys: 
              pubkeys
            
          }   
        };
        console.log('sendtx');
        request(options, function (error, response, body) {
          console.log(response.statusCode);
          console.log(body);
        });

      }
  
  res.render('contact', { 
    title: 'Contact', 
    message: '555-555-5555', 
    name: pjson.name });

  })

router.get('/unconfirmed', function (req, res) {
  res.render('unconfirmed', { //do the page 
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
