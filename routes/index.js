const express = require('express');
const router = express.Router();
const pjson = require('../test.json');
var mysql      = require('mysql');
var moment = require('moment');
var addrValidator = require('wallet-address-validator');
var request = require('request');
var key = process.env.JWT_SECRET;// 
var encryptor = require('simple-encryptor')(key);
//const shell = require('shelljs');
var r = require('jsrsasign');


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
    uri: 'https://dash.casa/api/?cur=VES',
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
 // console.log(DataToRender);
  res.render('index',DataToRender);
};
getRate(Render);
});









//Submit Button or Main page of payment processor.
router.get('/submit', function (req, res, next) {
//console.log(req.headers); //Show headers on console.
if (req.headers.idestablecimiento == undefined || req.headers.monto==undefined || req.headers.contrato==undefined || eval("process.env."+req.headers.idestablecimiento)==undefined){
  var data = {
    validated:"headers"// Error with currency
  }
  res.render('submit', {data});
  return;
}
//-------------------------------------------------------------------------Get BsS rate
function getRate(callback){
RateInfo = {error:0,
            rate:0}
var options = {uri: 'https://dash.casa/api/?cur=VES',
              method: 'GET'};
request(options, function (error, response, body) {   
  if (!error && response.statusCode == 200) {
    var JsonBody = JSON.parse(body);
    RateInfo.error=JsonBody.errcode;
    RateInfo.rate=JsonBody.dashrate;
  }
 else{
   RateInfo.error=1;}
   callback(RateInfo);
});
};

//-----------------------------------------------------------------Covert BsS into Dash
function AssignBs(RateInfo){
var BsRate = RateInfo;
if (BsRate.error==0){
  var rate = BsRate.rate;
  var exchange = ((req.headers.monto) / rate)+0.00000500; // 500 Duff added as a Flat Fee
  exchange = exchange.toFixed(8);
//-----------------------------------------------------------------Generate dynamic address information
  function getInformation(callback){
    console.log('1');
    //CABLE'S BEGIN
    /*address ="XuDy7dvHrBfsRbj6w5xm3UQjtAQKGhzFW7";
    wif ="";
    pAddress ="6b558e5e6546d253b6bb1ad85a4dcaaac9fb42a8d68a661122854a3926ebb896";
    callback(address,wif,pAddress);*/
    //CABLE'S END
    request.post(
      "https://api.blockcypher.com/v1/dash/main/addrs?token=cc0b3cdc830d431e8405d448c1f9c335",
      { json: { key: 'value' } },
      function (error, response, body) {
          if (!error && response.statusCode == 201) {
             Address = {
              address : body.address,
              wif : body.wif,
              private : body.private,
              public :body.public,
              error:0}
          }
          else{
            Address = {error:1}
            console.log("Error on generating address"); //must be HTML
          }
          callback(Address);
      });
};

  //-----------------------------------------------------------Validate de address
    function setInformation(Address){
     console.log('2');
     if (Address.error == 0)
     {
      var data = {
      validated:true,
      InvoiceID : req.headers.contrato,
      Private :Address.private,
      Address :  Address.address,
      Wif:Address.wif,
      Public: Address.public,
      Amount :exchange, 
      AmountBsS : req.headers.monto,
      Date :moment().format('llll')
      }
      var addrCheck = addrValidator.validate(data.Address, 'DASH');
      console.log('2.5');
      if(addrCheck)
        runQuery(data,setValue)
     else
     {
      console.log('Error with address');
       data.validated = "address";
       res.render('submit', {data});
      }
    }else{
      var data = {
        validated:"address",
      }
      console.log('Error with address');
      res.render('submit', {data});
    }

    };
    // ------------------------------------------------------Insert data in DB
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
        callback(data);
        }
        else{
        console.log(error);
        console.log('Error while performing Query.');
        data.validated = "query";
        callback(data);
        }
    });
  };
  //--------------------------------------------------------Sets the data in PUG.
  function setValue(data){
    console.log('4');
   data.SimpleAddress=data.Address;
   data.RAddress ="dash:"+data.Address+'?amount='+data.Amount;
   var PrivateEncrypted = encryptor.encrypt(data.Private);
   var PublicEncrypted = encryptor.encrypt(data.Public);
   var AddressEncrypted = encryptor.encrypt(data.Address);
   var rpq =  encryptor.encrypt(req.headers.idestablecimiento);
   console.log('5');
   data.privateAddress = PrivateEncrypted;
   data.publicAddress = PublicEncrypted;
   data.Address = AddressEncrypted;
   data.RPQ = rpq;
   res.render('submit', {data});
  };

  getInformation(setInformation);


   // --------------Select Query
    /*pool.query('SELECT * from paymentinfo', function(err, rows, fields) {
        if (!err)
           console.log('The solution is: ', rows);
        else
        console.log('Error while performing Query.');
    });*/

    // ---------------------------Activate for POSTMAN use:
    /*res.writeHead(200, {"Content-Type": "application/json"});
    var json = JSON.stringify({ 
      Invoice: req.body.Invoice, 
      PubAddress: req.body.PubAddress, 
      Ammount: req.body.Ammount
    });
    res.end(json);*/

  } //----------------------------------if from currency in BsS
  else{
    console.log('Error with currency');
    var data = {
      validated:"currency"// Error with currency
    }
    res.render('submit', {data});
  }
}
 //------------------------------Start!
getRate(AssignBs);
});


router.post('/contact', function (req, res) {
//ONLY FOR TESTING PURPOSE
//------------------------------------------------
res.render('contact', {
  Errors : 0,
  Hash:"c1539050b6dc20e40844edaa9ea535bc76ce093471de449289fbf490cc281dfb",
  DateCompleted:'Tue, Nov 6, 2018 7:52 PM',
  ValueDash:0.00001710},
 function(err, html) {
  res.send({MontoDash: 0.00001710,
  Hash: "c1539050b6dc20e40844edaa9ea535bc76ce093471de449289fbf490cc281dfb",
  Status : "Completed",
  TimeStamp: 'Tue, Nov 6, 2018 7:52 PM' });
});


  //-------------------------------------Merchants ID
  var eid = encryptor.decrypt(req.body.eid);
  var MayorAddress = eval("process.env."+eid);
 /* console.log('ssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss');
  console.log(eid);
  console.log(MayorAddress);*/

  //-------------------------------Callback of creating log
  function logResponse(res){
    if(res.validated==true){
      console.log("Log created successfully.");
    }else{
      console.log("Error creating  log.");}
  };
  //--------------------------------Creates logs.
  function runLog(data,callback) {
    console.log("entra en el Log");
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
    /*data.validated = true;
    callback(data);*/
  };
  var privdecrypted = encryptor.decrypt(req.body.prAddress);//'43592e6549a22d033ba6e4068308a07236da5feb51d9ec1978a986ca17efc2c1';//encryptor.decrypt(req.body.prAddress);
  var pubdecrypted = encryptor.decrypt(req.body.puAddress);//'0361b6d42b0109751ae19898855b25c07e0f2b9c3f22d5257b58bfc1642d0ea57f';//encryptor.decrypt(req.body.puAddress);
  var adrdecrypted = encryptor.decrypt(req.body.Address);//'XrNUrhPrUVnL4CXJ3urXitJhwsUizhxqie';//encryptor.decrypt(req.body.Address);
  /*console.log('Address:'+adrdecrypted);
  console.log('Private:'+privdecrypted);
  console.log('Public:'+pubdecrypted);*/
  var hash = req.body.hash;
  //CHECK CHECK CHECK CHECK
  var address = req.body.address;
  //CHECK CHECK CHECK CHECK
  var confirmation = false;
  var times = 0;

  //----------------------------------------------Checks if the first tx has been done (QR SCANNING).
  function getConfirmation(hash,adrdecrypted,privdecrypted,pubdecrypted,address,confirmation){
    var total; //= 1000;//+ body.fees; // Attention with the total!!!!!!!!!
    request.get(
      "https://api.blockcypher.com/v1/dash/main/txs/"+hash+"?token=cc0b3cdc830d431e8405d448c1f9c335",
      { json: { key: 'value' } },
      function (error, response, body) {
          if (!error && response.statusCode == 200) {
            //No confirmations needed
            if (body.confirmations >= 0) {
              //console.log("Confirmations:" +body.confirmations);
              confirmation = true;
              console.log('1st transaction -------------------------------------------');
              console.log(body);
             for(var i = 0; i < body.outputs.length;i++){  
                if(body.outputs[i].addresses == adrdecrypted)
                  total = body.outputs[i].value;    
              }           
              console.log('End of 1st transaction -------------------------------------------'); 
               //-------------------------------Create Tx   
              function BigTx(Big){
                testB = Big.Errors;
                if (testB==false){   
              //---------------------------------Sign Tx         
              function bigTxCompleted(BigSigned){
                SignedBig = BigSigned.Errors;
                if (SignedBig==false){ 
                  console.log('Tx completed.');
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
                 res.render('contact', {
                  Errors : 0,
                  Hash:BigSigned.Hash,
                  DateCompleted:BigSigned.ActualTime,
                  ValueDash:BigSigned.Value},
                 function(err, html) {
                  res.send({MontoDash: BigSigned.Value+BigSigned.ActualFee,
                  Hash: BigSigned.Hash,
                  Status : "Completed",
                  TimeStamp: BigSigned.ActualTime });
                });
                    }
                else{
                  res.render('contact', {
                    Errors : 1,
                    Hash:BigSigned.Hash,
                    DateCompleted:BigSigned.ActualTime,
                    ValueDash:BigSigned.Value},
                   function(err, html) {
                    res.send({MontoDash: BigSigned.Value+BigSigned.ActualFee,
                    Hash: BigSigned.Hash,
                    Status : "Failed",
                    TimeStamp: BigSigned.ActualTime });
                  });
                  console.log('Error signing tx');
                    }
                }
              //---------------------------------------------------Firmar Big
               SendTx(Big.tx,Big.toSign,Big.signatures,Big.pubkeys,Big.ForcedValue,Big.ForcedFee,bigTxCompleted);
                } //if errors found when creating Tx
                else{
              console.log('Error creating transaction');
              res.render('contact',{
                Errors : 1,
                Hash:BigSigned.Hash,
                DateCompleted:BigSigned.ActualTime,
                ValueDash:BigSigned.Value,
              });       
                }
              }
              //Generar Big
              /*setTimeout(function () {*/
                newTx(adrdecrypted,privdecrypted,pubdecrypted,total,MayorAddress,1,BigTx); //XxjS2ApJA2u25tkTmFhvxLfmT7RMRLQK1Q Dash Official Android
             /* }, 1000); //Timeout!*/
            }
            else{
              // Code only needed if its necessary that tx has at least one confirmation
              /*
                console.log("No se confirmo");
                setTimeout(function () {
                console.log('Entramos en el timeout');
                confirmation = false;
                times = times + 10;
                console.log(times);
                body.confirmations = 3;
                //VALIDATE WHEN A MINUTE IS COMPLETED
                getConfirmation(hash,adrdecrypted,privdecrypted,pubdecrypted,address,confirmation)
                }, 3000); */
            }
          }
        })
      };
      //------------------------Function that creates new Tx
      function newTx(adrdecrypted,privdecrypted,pubdecrypted,total,output,percent,callback){
        var ResultObject;
        var input = adrdecrypted; //'XuDy7dvHrBfsRbj6w5xm3UQjtAQKGhzFW7'; <-- where money comes from, generated by blockcypher
        console.log(output);
        //var output2 = 'Xw9tZZGrh3RVb5e68jut1EFMyUSZMpBeqs'; // the 1%   
        var fee = 300; // <-- Forced Fee!
        console.log('Grand Total: '+ total);
        var total =  total - fee;
        var value = Math.round((total * percent));
        /*var value1 = Math.round(value*0.99);
        var value2 = Math.round(value * 0.01);*/                 //  REVERSE to make 2 tx
        console.log('****************Value*****************: '+ value );
        var options = {
          uri: 'https://api.blockcypher.com/v1/dash/main/txs/new?token=cc0b3cdc830d431e8405d448c1f9c335',
          method: 'POST',
          json: {
            confirmations:0,
            //preference:'low',
            fees : fee,
            inputs: [{addresses: [input]}], 
            outputs: [{addresses: [output], value: value}/*
          {addresses: [output2],value: value2}*/]        //REVERSE to make 2 tx
          }
        };
       request(options, function (error, response, body) {
          console.log(body);
          if (!error && response.statusCode == 201) {
            var signatures = [];
            var pubkeys = [];
            var tx = body.tx;
            var toSign = body.tosign; 
            var EC = new r.ECDSA({'curve': 'secp256k1'});  
            for(var i = 0; i < toSign.length;i++){

                //*************************************************
                //Tx signing using ECDSA
                function signECDSA(){
                  var signed = EC.signHex(toSign[i], privdecrypted);
                  return signed
                }
               //**************************************************** 

               //****************************************************
              //Tx Signing using Golang         
              /*console.log('Signing process using Golang');
              var stringShell = 'signer'+' '+toSign[i]+' '+ privdecrypted;  //'6b558e5e6546d253b6bb1ad85a4dcaaac9fb42a8d68a661122854a3926ebb896'<--private from the input
              var shellexec = shell.exec(stringShell);             
              var signed = shellexec.stdout;/*
              //*****************************************************/
              var signed = signECDSA();
              console.log('signed example ECDSA:'+signed);
              while(signed.indexOf("022100") != -1){
                console.log('Had High S');
                signed = signECDSA();
              };
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
      //----------------------------------------------------------------Function that signs the new Tx
      function SendTx(tx,toSign,signatures,pubkeys,forcedvalue,forcedfee,callback){
        var options = {
          uri: 'https://api.blockcypher.com/v1/dash/main/txs/send?token=cc0b3cdc830d431e8405d448c1f9c335',
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
      };

      getConfirmation(hash,adrdecrypted,privdecrypted,pubdecrypted,address,confirmation);
  });

router.get('/unconfirmed', function (req, res) {
  res.render('unconfirmed', { //do the page 
    title: 'Contact', 
    message: '555-555-5555', 
    name: pjson.name 
})
});

/*router.get('/:id', function (req, res) {
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
});*/

module.exports = router;
