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
  function getRate(callback){
    RateInfo = {
      error:0,
      rate:0
    }
  var options = {
    uri: 'http://dash.casa/api/?cur=VES',
    method: 'GET'
  };
  request(options, function (error, response, body) {   
    if (!error && response.statusCode == 200) {
      var JsonBody = JSON.parse(body);
      RateInfo.error=JsonBody.errcode;
      RateInfo.rate=JsonBody.dashrate;
    }
   else{
     RateInfo.error=0;
    }
    callback(RateInfo);
  });
};
function Render(RateInfo){
  DataToRender = {
    title: 'Dash Payment System', 
    message: pjson.formM, 
    name: pjson.name,
    rate : 'NaN'
    }
  if (RateInfo.error==0){
    DataToRender.rate = RateInfo.rate
  }
  DataToRender.rate = Math.round(DataToRender.rate * 100) / 100
  console.log(DataToRender);
  res.render('index',DataToRender);
};
getRate(Render);
});


//Submit Button
router.post('/submit', function (req, res, next) {
            /*"private": "6b558e5e6546d253b6bb1ad85a4dcaaac9fb42a8d68a661122854a3926ebb896",
  
            "public": "02e91a29b20b2f7458d74f820c4e55137a1b65ed2763e43aadca50a5daa999ff0a",
            
            "address": "XuDy7dvHrBfsRbj6w5xm3UQjtAQKGhzFW7",
            
            "wif": "XEtGyDUW3QGa8mdWSboyRLCB1VQnFxQryLnczBmoB7kzSoZHBHMx"*/

  //Generate key and addresses
  function getInformation(callback){
    console.log('1');
    //CABLE
    /*address ="XuDy7dvHrBfsRbj6w5xm3UQjtAQKGhzFW7";
    wif ="";
    pAddress ="6b558e5e6546d253b6bb1ad85a4dcaaac9fb42a8d68a661122854a3926ebb896";
    callback(address,wif,pAddress);*/
    request.post(
      "https://api.blockcypher.com/v1/dash/main/addrs",
      { json: { key: 'value' } },
      function (error, response, body) {
          if (!error && response.statusCode == 201) {
            Address = {
              address : body.address,
              wif : body.wif,
              private : body.private,
              public :body.public
            }
            callback(Address);
          }
          else{
            console.log("Error on generating address"); //must be HTML
          }
      });
};
      // -------Validate de address
    function setInformation(Address){
      console.log(req.body);
     console.log('2');
      var data = {
      validated:'',
      InvoiceID : req.body.Invoice,
      Private :Address.private,
      Address :  Address.address,
      Wif:Address.wif,
      Public: Address.public,
      Amount :req.body.DashAmount, 
      AmountBsS : req.body.Amount,
      Date :moment().format('llll')
      }
     
      var addrCheck = addrValidator.validate(data.Address, 'DASH');
      console.log('2.5');
      console.log(addrCheck);
      if(addrCheck)
        runQuery(data,setValue)
     else
     {
       data.validated = false;
       res.render('submit', {data});
      }
};
    // ----Inserts data in DB
   function runQuery(data,callback) {
    console.log('3');
     var DataToInsert ={InvoiceID:data.InvoiceID,
      SAddress:data.Private,
      RAddress:data.Address,
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
  //Sets the data in PUG.
  function setValue(data) {
    console.log('4');
  
    data.SimpleAddress=data.Address;
    data.RAddress ="dash:"+data.Address+'?amount='+data.Amount;
    
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
   var PrivateEncrypted = encryptor.encrypt(data.Private);
   var PublicEncrypted = encryptor.encrypt(data.Public);
   var AddressEncrypted = encryptor.encrypt(data.Address);
   console.log('5');
   data.privateAddress = PrivateEncrypted;
   data.publicAddress = PublicEncrypted;
   data.Address = AddressEncrypted;
   res.render('submit', {data});
  };
    //Generates a brand new address.
    getInformation(setInformation);

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
});




router.post('/contact', function (req, res) {
  //Callback of creating log
  function logResponse(res){
    if(res.validated==true){
      console.log("Log created successfully.");
    }else{
      console.log("Error creating  log.");
    }
  };
     //Creates logs.
  function runLog(data,callback) {
      pool.query('INSERT INTO txlog SET ?', data, function (error, results, fields) {
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
  var privdecrypted = encryptor.decrypt(req.body.prAddress);//'43592e6549a22d033ba6e4068308a07236da5feb51d9ec1978a986ca17efc2c1';//encryptor.decrypt(req.body.prAddress);
  var pubdecrypted = encryptor.decrypt(req.body.puAddress);//'0361b6d42b0109751ae19898855b25c07e0f2b9c3f22d5257b58bfc1642d0ea57f';//encryptor.decrypt(req.body.puAddress);
  var adrdecrypted = encryptor.decrypt(req.body.Address);//'XrNUrhPrUVnL4CXJ3urXitJhwsUizhxqie';//encryptor.decrypt(req.body.Address);
  console.log('Address:'+adrdecrypted);
  console.log('Private:'+privdecrypted);
  console.log('Public:'+pubdecrypted);
  var hash = req.body.hash;
  var address = req.body.address;
  var confirmation = false;
  var times = 0;
  //Checks if the first tx has been done (QR SCANNING).
  function getConfirmation(hash,adrdecrypted,privdecrypted,pubdecrypted,address,confirmation){
    request.get(
      "https://api.blockcypher.com/v1/dash/main/txs/"+hash,
      { json: { key: 'value' } },
      function (error, response, body) {
          if (!error && response.statusCode == 200) {
            if (body.confirmations >= 0) {
              //console.log("Confirmations:" +body.confirmations);
              confirmation = true;
              console.log('1st transaction -------------------------------------------');
              console.log(body);
              console.log('End of 1st transaction -------------------------------------------');        
              var total = 600;//+ body.fees; // Attention with the total!!!!!!!!!
              function BigTx(Big){
                testB = Big.Errors;
                if (testB==false){          
              function bigTxCompleted(BigSigned){
                SignedBig = BigSigned.Errors;
                if (SignedBig==false){ 
                  console.log('Big Completa, falta generar y firmar Small');
                    //Generate Log
                    var LogData = {
                      InputAddress :BigSigned.Input,
                      OutputAddress:BigSigned.Output, 
                      ForcedValue:BigSigned.ForcedValue,
                      ValueInSkeleton:BigSigned.Value,
                      ForcedFee:BigSigned.ForcedFee,
                      ActualFee:BigSigned.ActualFee,
                      Size:BigSigned.Size,
                      Preference:BigSigned.Preference,
                      Hash:BigSigned.Hash,   
                      Date:BigSigned.ActualTime,
                    }
                  runLog(LogData,logResponse);

                  function smallTx(SmallTx){
                    SmallSigned = SmallTx.Errors;
                    if (SmallSigned==false){ 
                      function smallTxCompleted(SmallTxSigned){
                        SmallSign = SmallTxSigned.Errors;
                        if (SmallSign==false){ 
                          console.log('Small completed...');
                        }
                        else{
                          console.log('Error signing small');
                        }
                      }
                   // SendTx(SmallTx.tx,SmallTx.toSign,SmallTx.signatures,SmallTx.pubkeys,smallTxCompleted);
                    console.log('Big completed...');
                    }
                    else{
                    console.log('Error creating small');
                    }
                  }       
                  //Generar Small
                 // newTx(adrdecrypted,privdecrypted,pubdecrypted,total,'XxjS2ApJA2u25tkTmFhvxLfmT7RMRLQK1Q',0.10,smallTx); //Xw9tZZGrh3RVb5e68jut1EFMyUSZMpBeqs Etherum
                    }
                else{
                  console.log('Error signing big');
                    }
                }
                //Firmar Big
               SendTx(Big.tx,Big.toSign,Big.signatures,Big.pubkeys,Big.ForcedValue,Big.ForcedFee,bigTxCompleted);
                }
                else{
              console.log('Error creating big transaction');
                }
              }
              //Generar Big
              setTimeout(function () {
                newTx(adrdecrypted,privdecrypted,pubdecrypted,total,'XxjS2ApJA2u25tkTmFhvxLfmT7RMRLQK1Q',1,BigTx); //XxjS2ApJA2u25tkTmFhvxLfmT7RMRLQK1Q Dash Official Android
              }, 1000); //Timeout!

                /*function SmallTx(Small){
                  console.log('entro en smalltx');
                  testS = Small.Errors;
                  console.log(testB);
                  console.log(testS);
                  if (testB == false && testS==false){
                    console.log('Starting confirmation process');
                    SendTx(Big.tx,Big.toSign,Big.signatures,Big.pubkeys,txCompleted);
                    function txCompleted(){
                      console.log('Big completed...');
                    SendTx(Small.tx,Small.toSign,Small.signatures,Small.pubkeys);
                    }                
                  }
                  else{
                    console.log('Error on Signing')
                  }
                };
                setTimeout(function () {
                  newTx(decrypted,total,'XxjS2ApJA2u25tkTmFhvxLfmT7RMRLQK1Q',0.50,SmallTx); // Electrum Xw9tZZGrh3RVb5e68jut1EFMyUSZMpBeqs
                }, 10000); 
              };
              newTx(decrypted,total,'XxjS2ApJA2u25tkTmFhvxLfmT7RMRLQK1Q',0.90,BigTx);*/

              //newTx(decrypted,total,'XiAb8znhJqfq4JEd7ty532cPkwsfaE9VkL',0.01,SmallTx);
              //console.log(BigTx.Error);
              //console.log(SmallTx.Errors);
              //if (BigTx.Errors == false && SmallTx.Errors == false ){
              //console.log('No errors');
             // }
              //else{
             // console.log('Errors found');  
              //}
            }
            else{
                console.log("No se confirmo");
                setTimeout(function () {
                console.log('Entramos en el timeout');
                confirmation = false;
                times = times + 10;
                console.log(times);
                body.confirmations = 3;
                //VALIDATE WHEN A MINUTE IS COMPLETED
                getConfirmation(hash,adrdecrypted,privdecrypted,pubdecrypted,address,confirmation)
            }, 3000); 
            }
          }
        })
      };
        
      getConfirmation(hash,adrdecrypted,privdecrypted,pubdecrypted,address,confirmation)
      /*while (confirmation == false && times <= 60){
        console.log("No confirmation");
        getConfirmation(hash,decrypted,address,confirmation)
      }*/

      function newTx(adrdecrypted,privdecrypted,pubdecrypted,total,output,percent,callback){
        var ResultObject;
        //console.log(decrypted);
        var input = adrdecrypted; //'XuDy7dvHrBfsRbj6w5xm3UQjtAQKGhzFW7'; <-- where money comes from, generated by blockcypher
        var output = output;
        var fee = 500; // <-- Forced Fee!
        console.log('Grand Total: '+ total);
        var value = Math.round(total * percent);
        console.log('****************Value**********: '+ value );
        var options = {
          uri: 'https://api.blockcypher.com/v1/dash/main/txs/new',
          method: 'POST',
          json: {
            confirmations:0,
            //preference:'low',
            fees : fee,
            inputs: [{addresses: [input]}], 
            outputs: [{addresses: [output], value: value}],           
          }
        };
       request(options, function (error, response, body) {
          //console.log(response.statusCode);
          console.log(body);
          if (!error && response.statusCode == 201) {
            var signatures = [];
            var pubkeys = [];
            var tx = body.tx;
            var toSign = body.tosign;
            for(var i = 0; i < toSign.length;i++){  
                //Tx Signing         
            console.log('Signing process...');
              var stringShell = 'signer'+' '+toSign[i]+' '+ privdecrypted;  //'6b558e5e6546d253b6bb1ad85a4dcaaac9fb42a8d68a661122854a3926ebb896'<--private from the input
              var shellexec = shell.exec(stringShell);             
              var signed = shellexec.stdout;
              signed = signed.replace(/\n$/, '');
              signed = signed.trim();
              signatures.push(signed);
              pubkeys.push(pubdecrypted);//('02e91a29b20b2f7458d74f820c4e55137a1b65ed2763e43aadca50a5daa999ff0a')<--public from the input         
            }   
           ResultObject = {
              Errors : false,
              tx:tx,
              toSign:toSign,
              signatures:signatures,
              pubkeys:pubkeys,
              ForcedValue: value,
              ForcedFee: fee
            }
            callback(ResultObject);         
          }
        else{
          console.log('Error creating TX');
           ResultObject = {
            Errors : true,
            tx:tx,
            toSign:toSign,
            signatures:signatures,
            pubkeys:pubkeys,
            ForcedValue: value,
            ForcedFee: fee
          }
          callback(ResultObject);  
             }   
        }); 
      };

      function SendTx(tx,toSign,signatures,pubkeys,forcedvalue,forcedfee,callback){
        /*console.log('tosign');
        console.log(toSign);
        console.log('signatures');
        console.log(signatures);
        console.log('pubkeys');
        console.log(pubkeys);*/
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
        console.log('Sending tx...');
        request(options, function (error, response, body) {  
          console.log(body);   
          if (!error && response.statusCode == 201) {
            ResultObject = {
              Errors : false,
              Input:body.tx.addresses[0],
              Output:body.tx.addresses[1], 
              ForcedValue:forcedvalue,
              Value:body.tx.total, 
              ForcedFee:forcedfee,
              ActualFee:body.tx.fees,
              Size:body.tx.size,
              Hash : body.tx.hash,      
              ActualTime : moment().format('llll'),
              Preference:body.tx.preference
              };
            callback(ResultObject);
          }
            else{
              ResultObject = {
                Errors : true,
              }
              callback(ResultObject);
            }
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
