const express = require('express');
const router = express.Router();
const pjson = require('../test.json');
var mysql      = require('mysql');
var moment = require('moment');
var addrValidator = require('wallet-address-validator');
var request = require('request');
var key = process.env.JWT_SECRET;// Key used to encryptor env variable
var encryptor = require('simple-encryptor')(key);
//const shell = require('shelljs');
var r = require('jsrsasign');
var rn = require('random-number');
let merchantsCodes = require('../public/js/merchants.json');
let transferCodeDT = '';
let idOfPosUser = null;

var pool      =    mysql.createPool({
  connectionLimit : 100, //important
  host     : 'dashdatabase.cshqrg6tymlg.us-west-2.rds.amazonaws.com',
  user     : 'dashadmin',
  password : 'dashmaster8766',
  database : 'dashadmin',
  debug    :  false
});


/*                                                                        EXECUTION STARTS IN LINE 306 */
//Front Page


//Check tx status, endpoint for integration
router.get('/checkTxStatus', function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept"); 
  req.on('close', function (err){
    clearInterval(refreshIntervalId);
});
  req.setTimeout(350000);
  let ms = 0;
  let refreshIntervalId = setInterval(rex,7000); 
  if (req.query.contrato == undefined || req.query.idestablecimiento == undefined ){
    clearInterval(refreshIntervalId);
    return res.status(500).send({Message:'Missing information'});
  }
  else{// Set here the secs to check for the Tx.
    rex();
    refreshIntervalId;
  }
    function rex(){
    ms = ms + 10000;
    if (ms === 450000){ 
      //console.log('Data not found')
      clearInterval(refreshIntervalId);
      return res.status(500).send({Message:'Data not found'});
    }else{
      var SQL = 'SELECT * FROM txinfo WHERE Contrato = ? AND ID_Establecimiento = ?';
      pool.query(SQL, [req.query.contrato,req.query.idestablecimiento], function(err, rows, fields) {
        if (err){
          //console.log('Error on DB')
          clearInterval(refreshIntervalId);
          return res.status(500).send({Message:'Unexpected error (DB)'});            
        }
        if (rows.length != 0)
        {
          let dataToSend ={
            Contrato: rows[0].Contrato,
            MontoDash: rows[0].MontoDash,
            Hash: rows[0].Hash,
            Status: rows[0].Status,
            TimeStamp: rows[0].DateCompleted,
          }
          //console.log('Success')
          clearInterval(refreshIntervalId);
          return res.status(200).json(dataToSend);      
        }
      });
    }
  }
});

//Main Page
router.get('/', function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept"); 
let exchange;
//console.log(req.headers); //Show headers on console.
// ------------------------------------------------------------Validate that headers in the request are valid.
//req.query.idestablecimiento == undefined 
if (req.query.idestablecimiento == undefined || req.query.monto==undefined || req.query.contrato==undefined || 
  req.query.currency==undefined){
  var data = {validated:"headers"}// Error with headers
 // res.status(500).render('index', {data}); //  HTML (VISUAL) VERSION

                                                // INTEGRATION VERSION
  res.status(500).render('index', {data},       // 
  function(err, html) {                         //
   res.send({Message: 'Check params data'});     //
    }                                           //
  )                                             //
                                                // INTEGRATION VERSION
  return;
}
 //------------------------------Start! 

 //-----------------------------------Validate if the contract (invoice) is not repeated in the merchant, if repeated return the Tx response.
 var SQL = 'SELECT * FROM txinfo, paymentlog WHERE paymentlog.Contrato = ? AND paymentlog.Establecimiento = ? AND txinfo.FK_PaymentId = paymentlog.ID';
 pool.query(SQL, [req.query.contrato, req.query.idestablecimiento], function(err, rows, fields) {
  if (rows == undefined){
    //console.log(err);
    res.status(500).send({error : 2,
      Message : 'Error while performing Query'});
      return;
  }
  if (rows.length != 0){
      res.status(202).send({
          Contrato: rows[0].Contrato,
          MontoDash: rows[0].MontoDash,
          Hash: rows[0].Hash,
          Status : rows[0].Status,
          TimeStamp: rows[0].DateCompleted });
          return;
  }else{
    getRate(AssignBs);
  } 
});
//-----------------
//-----------------
//-----------------
//-----------------
//-------------------------------------------------------------------------Function to get BsS rate
function getRate(callback){
RateInfo = {error:0,rate:0}

if (req.query.currency != 'Bs' && req.query.currency != 'USD' ){
  RateInfo.error=1;
  callback(RateInfo);
}
if (req.query.currency === 'Bs'){
    /*var options = {uri: 'https://dash.casa/api/?cur=VES',
                    method: 'GET'};*/

    var options = {uri: 'http://ec2-18-237-86-164.us-west-2.compute.amazonaws.com:3000/API/dashRate?currency=Bs',
    method: 'GET'};  
    request(options, function (error, response, body) {   
      if (!error && response.statusCode == 200) {
          var JsonBody = JSON.parse(body);
          var mainBsRate = JsonBody.vesDashRate.replace(/[\[\]&(.)]+/g, '');
          mainBsRate = mainBsRate.replace(",", ".");
          RateInfo.error=0;
          RateInfo.rate=parseFloat(mainBsRate);
      }
    else{
      RateInfo.error=1;
      }
      callback(RateInfo);
    });
  }
  if (req.query.currency === 'USD'){
    var options = {uri: 'http://ec2-18-237-86-164.us-west-2.compute.amazonaws.com:3000/API/dashRate?currency=USD',
    method: 'GET'};  
    request(options, function (error, response, body) {   
      if (!error && response.statusCode == 200) {
          var JsonBody = JSON.parse(body);
          var mainUSDRate = JsonBody.usdDashRate;
          RateInfo.error=0;
          RateInfo.rate=parseFloat(mainUSDRate);
      }
    else{
      RateInfo.error=1;
      }
      callback(RateInfo);
    });
  }
};

//-----------------------------------------------------------------Function to convert BsS into Dash
function AssignBs(RateInfo){
var finalRate = RateInfo;
if (finalRate.error==0){
  var rate = finalRate.rate;
  exchange = ((req.query.monto) / rate) //+0.00000300; // 300 Duff added as a Flat Fee
  exchange = exchange.toFixed(8);
  getInformation(setInformation);
  } //----------------------------------if from currency in BsS
  else{
    //console.log('Error with currency');
    var data = {
      validated:"currency"// Error with currency
    }
    res.status(500).render('index', {data},
    function(err, html) {
     res.send({Message: 'Error with currency'});
      }
    )
  }
}
  //--------------------------------------------------------Sets data in PUG.
  function setValue(data){
    console.log('4');
   data.SimpleAddress=data.Address;
   data.RAddress ="dash:"+data.Address+'?amount='+data.Amount;
   //var PrivateEncrypted = encryptor.encrypt(data.Private);
   //var PublicEncrypted = encryptor.encrypt(data.Public);
   var AddressEncrypted = encryptor.encrypt(data.Address);
   var rpq =  encryptor.encrypt(req.query.idestablecimiento);
   var Mbs =  encryptor.encrypt(req.query.monto);
   var Cnt =  encryptor.encrypt(req.query.contrato);
   var TcDT =  encryptor.encrypt(data.transferCodeDT);
   console.log('5');
   //data.privateAddress = PrivateEncrypted;
   //data.publicAddress = PublicEncrypted;
   data.Address = AddressEncrypted;
   data.RPQ = rpq;
   data.Mbs = Mbs;
   data.Cnt = Cnt;
   data.TcDT = TcDT;
   data.TextToken = data.TextToken;
   data.currency = req.query.currency
   res.status(200).render('index', {data});
  };

  // -----------------------------------------------------------Function to save the payment info in the DB
  function runQuery(data,callback) {
      console.log('3'); 
      var rn1= rn.generator({
        min:  10000,
        max:  99999,
        integer: true
      });
      var TextToken = rn1();
      data.TextToken = TextToken;
       var DataToInsert ={
        Contrato:data.InvoiceID,
        DynamicAddress:data.Address,
        MontoDash:data.Amount,
        MontoFiat:req.query.monto,
        TextToken:TextToken.toString(),
        DateCreated:data.Date,
        TextTokenStatus:true,
        Establecimiento: data.establecimiento}
        pool.query('INSERT INTO paymentlog SET ?', DataToInsert, function (error, results, fields) {
          if (!error){
          //console.log('Query executed.');
          data.validated = true;
          callback(data);
          }
          else{
          //console.log(error);
         // console.log('Error while performing Query.');
          data.validated = "query";
          callback(data);
          }
      });
  };


  //-----------------------------------------------------------Validate the generated address
  function setInformation(Address){
    console.log('2');
    if (Address.error == 0)
    {
     var data = {
     validated:true,
     InvoiceID : req.query.contrato,
     //Private :Address.private,
     Address :  Address.address,
     transferCodeDT : Address.transferCodeDT,
     //Wif:Address.wif,
    // Public: Address.public,
     establecimiento: req.query.idestablecimiento,
     Amount :exchange, 
     CurrencyAmount : req.query.monto,
     Date :moment().format('llll')
     }

     //console.log(data);
     var addrCheck = addrValidator.validate(data.Address, 'DASH');
     console.log('2.5');
     if(addrCheck)
       runQuery(data,setValue)
    else
    {
    // console.log('Error with address');
      data.validated = "address";
      res.status(500).render('index', {data},
      function(err, html) {
       res.send({Message: 'Error with address'});
        }
      )
     }
   }else{
     var data = {validated:"address"}
    // console.log('Error with address');
     res.status(500).render('index', {data},
     function(err, html) {
      res.send({Message: 'Error with address'});
       }
     )
   }

   };

//-----------------------------------------------------------------Generate dynamic address information
function getInformation(callback){
  console.log('1');
  let finalAddress = merchantsCodes[req.query.idestablecimiento];
  if (finalAddress === undefined){
    var SQL = 'SELECT id,DashAddress FROM User WHERE email = ?';
    pool.query(SQL, [req.query.idestablecimiento], function(err, rows, fields) {
      if (err){
        //console.log('entra en error al buscar en la BD');
        Address = {error:1} 
        callback(Address);         
      }
      if (rows.length != 0)
      {
        //console.log(rows[0].DashAddress);
        finalAddress = rows[0].DashAddress; 
          //Generation of dynamic address using DashText API------------------------------------------------------------------------------------------
            request.post({
              url: 'https://dash.abacco.com/apinew.php',
              form: { address:/*eval("process.env."+req.headers.idestablecimiento) <-env variables */finalAddress,
                      token:'ADGPNP1'
                      },
              headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.110 Safari/537.36',
                'Content-Type' : 'application/x-www-form-urlencoded' 
              },
              method: 'POST'
            },
              function (error, response, body) {
                  if (!error && response.statusCode == 200) {
                    let JSONresponse = JSON.parse(body);
                    //console.log(JSONresponse);
                   // console.log(JSONresponse, 'RESPONSE FROM NEW ADDRESS');
                    Address = {
                      address : JSONresponse['address'],
                      transferCodeDT : JSONresponse['code'],
                    /* wif : body.wif,
                      private : body.private,
                      public :body.public,*/
                      error:0}
                  }
                  else{
                    Address = {error:1}
                   // console.log("Error on generating address"); //must be HTML
                  }
                  callback(Address);
              });
      }
      if (rows.length === 0){
        Address = {error:1} 
        callback(Address);        
      }
    });
  }else{
      //Generation of dynamic address using DashText API------------------------------------------------------------------------------------------
      request.post({
        url: 'https://dash.abacco.com/apinew.php',
        form: { address:/*eval("process.env."+req.headers.idestablecimiento) <-env variables */finalAddress,
                token:'ADGPNP1'
                },
        headers: { 
          'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.110 Safari/537.36',
          'Content-Type' : 'application/x-www-form-urlencoded' 
        },
        method: 'POST'
      },
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
              let JSONresponse = JSON.parse(body);
              //console.log(JSONresponse, 'RESPONSE FROM NEW ADDRESS');
              Address = {
                address : JSONresponse['address'],
                transferCodeDT :JSONresponse['code'],
              /* wif : body.wif,
                private : body.private,
                public :body.public,*/
                error:0}
            }
            else{
              Address = {error:1}
             // console.log("Error on generating address"); //must be HTML
            }
            callback(Address);
    });


  }

};



});

//---------------------------------------------------------Route to be executed when the timer gets to 0 seconds.
router.post('/timeup', function (req, res) {
  var Eid = encryptor.decrypt(req.body.Eid);
  var Mbs = encryptor.decrypt(req.body.Mbs);
  var Cnt = encryptor.decrypt(req.body.Cnt);
  var adrdecrypted = encryptor.decrypt(req.body.Address);
  var SQL = 'SELECT * FROM paymentlog WHERE Contrato = ? AND Establecimiento = ? ORDER BY ID DESC LIMIT 1';
  pool.query(SQL, [Cnt,Eid], function(err, rows, fields) {
    if (rows == undefined){
      res.status(500).send({error : 2,
        Message : 'Error while performing Query'});
        return;
    }else{
      var SQL = 'SELECT ID FROM User WHERE email = ?';
      pool.query(SQL, [Eid], function(err, rows2, fields) {
        if (rows2.length === 0){
          var TxData = {
            ID_Establecimiento : Eid,
            MontoFiat: Mbs, 
            TipoFiat : 'Bs',
            Contrato: Cnt,
            MontoDash: rows[0].MontoDash,
            Hash: "NA",
            Status : "Failed",
            DateCompleted: moment().format('llll'),
            FK_PaymentId: rows[0].ID
          }
          pool.query('INSERT INTO txinfo SET ?', TxData, function (error, results, fields) {
            if (!error){
            //console.log('Query executed.');
            res.status(200).send({error : 0,
              Message : 'completed'});
              return;
            }else{
            //console.log('Error while performing Query');
            res.status(500).send({error : 1,
              Message : 'Error while performing Query'});
              return;
            }
          });
        }
        else{
          var TxData = {
            ID_Establecimiento : Eid,
            MontoFiat: Mbs, 
            TipoFiat : 'Bs',
            Contrato: Cnt,
            MontoDash: rows[0].MontoDash,
            Hash: "NA",
            Status : "Failed",
            DateCompleted: moment().format('llll'),
            FK_PaymentId: rows[0].ID,
            FK_UserId: rows2[0].ID
          }
          pool.query('INSERT INTO txinfo SET ?', TxData, function (error, results, fields) {
            if (!error){
            //console.log('Query executed.');
            res.status(200).send({error : 0,
              Message : 'completed'});
              return;
            }else{
            //console.log('Error while performing Query');
            res.status(500).send({error : 1,
              Message : 'Error while performing Query'});
              return;
            }
          });
        }

      })
  }
});   
});


//---------------------------------------------------------Route to be executed using DashText endpoint to get payment on dynamic address.
router.post('/actionDashText', function (req, res) {
  //-------------------------------------Merchants ID
  var Eid = encryptor.decrypt(req.body.Eid);
  var Mbs = encryptor.decrypt(req.body.Mbs);
  var Cnt = encryptor.decrypt(req.body.Cnt);
  //var MayorAddress = merchantsCodes[Eid];
  let TcDT = encryptor.decrypt(req.body.TcDT);
  let amountFromDT =req.body.AmounToDT;
  let transferCodeDTAction = TcDT;

  makeTxDashText(amountFromDT,transferCodeDTAction);
  //MayorAddress = (MayorAddress.replace(/['"]+/g, '')).trim();
    //-------------------------------Callback of creating log
    function logResponse(res){
      //console.log('antes log');
      if(res.validated==true){
       // console.log("Log created successfully.");
      }if(res.validated==false){
       // console.log("Error creating  log.");
      }
    };
    //-------------------------------Function to save the Tx info and update the payments log.
    function runTx(data,callback) {
      var SQL = 'SELECT ID, TextToken FROM paymentlog WHERE Contrato = ? AND Establecimiento = ? ORDER BY ID DESC LIMIT 1';
      pool.query(SQL, [data.Contrato,data.ID_Establecimiento], function(err, rows, fields) {
          data.FK_PaymentId = rows[0].ID;
          var TextToken = rows[0].TextToken;
          var SQL = 'SELECT ID FROM User WHERE email = ?';
          pool.query(SQL, [data.ID_Establecimiento], function(err, rows2, fields) {
            if (rows2.length === 0){
              pool.query('UPDATE paymentlog SET TextTokenStatus = false WHERE  TextToken = '+TextToken+'');   
             // console.log("1er select");
              pool.query('INSERT INTO txinfo SET ?', data, function (error, results, fields) {
              //  console.log("2do select o insert");
                if (!error){
               // console.log('Query executed.');
                data.validated = true;
                }
                else{
              //  console.log(error);
               // console.log('Error while performing Query.');
                data.validated = false;
                }
                callback(data);
              });
            }
            else{
              data.FK_UserId = rows2[0].ID;
              pool.query('UPDATE paymentlog SET TextTokenStatus = false WHERE  TextToken = '+TextToken+'');   
            //  console.log("1er select");
              pool.query('INSERT INTO txinfo SET ?', data, function (error, results, fields) {
              //  console.log("2do select o insert");
                if (!error){
              //  console.log('Query executed.');
                data.validated = true;
                }
                else{
             //   console.log(error);
              //  console.log('Error while performing Query.');
                data.validated = false;
                }
                callback(data);
              });
            }

          })

      });   
    }

  function makeTxDashText(amountFromDT,transferCodeDTAction) {
  //  console.log(transferCodeDTAction, 'codetoaction');
  request.post({
    url: 'https://dash.abacco.com/api/apitran.php',
    form: { amount:amountFromDT,
            code:transferCodeDTAction,
            token:'ADGPNP1'
            },
    headers: { 
       'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.110 Safari/537.36',
       'Content-Type' : 'application/x-www-form-urlencoded' 
    },
    method: 'POST'
   },
    function (error, response, body) {
      if (!error && response.statusCode == 200) {
      //  console.log('Tx completed using DashText');
        let JSONresponse = JSON.parse(response.body);
        let toAddress = JSONresponse['to'];
        let txHash = JSONresponse['hash'];
        let txAmount = JSONresponse['amount'];
          // DashText API returns 200 status but there's an error, that why there's this if condition
        if (toAddress === undefined || txHash === undefined ||txAmount === undefined  ){
        //  console.log('Error on Dash Text API(TRAN)',error);
          var TxData = {
            ID_Establecimiento : Eid,
            MontoFiat: Mbs,
            TipoFiat : 'Bs', 
            Contrato: Cnt,
            MontoDash: amountFromDT,
            Hash: "NA",
            Status : "Failed",
            DateCompleted: moment().format('llll'),
            FK_UserId: idOfPosUser
          }
          //Call to function to save de Tx and log info.  
          runTx(TxData,logResponse);
          res.statusCode=500;
          res.render('actionDashText', {
            Errors : 1,
            Hash: "NA",
            DateCompleted: moment().format('llll'),
            ValueDash:txAmount},
           function(err, html) {
            res.send({MontoDash: amountFromDT,
            Hash: "NA",
            Status : "Failed",
            Contrato: Cnt,
            TimeStamp:  moment().format('llll') });
          }
          );
        }
        else{
        var TxData = {
          ID_Establecimiento : Eid,
          MontoFiat: Mbs,
          TipoFiat : 'Bs', 
          Contrato: Cnt,
          MontoDash: txAmount,
          Hash: txHash,
          Status : "Completed",
          DateCompleted: moment().format('llll'),
          FK_UserId: idOfPosUser
        }
        runTx(TxData,logResponse); // Function to save data in the DB.
        res.statusCode=200;
        res.render('actionDashText', {
         Errors : 0,
         Hash:txHash,
         DateCompleted:TxData.DateCompleted,
         ValueDash:txAmount},
         function(err, html) {
          res.send({MontoDash: txAmount,
          Hash: txHash,
          Contrato: Cnt,
          Status : "Completed",
          TimeStamp: TxData.DateCompleted});
           }
           );
        }
      }else{
     //   console.log('Error on Dash Text API(TRAN)',error);
        var TxData = {
          ID_Establecimiento : Eid,
          MontoFiat: Mbs,
          TipoFiat : 'Bs', 
          Contrato: Cnt,
          MontoDash: amountFromDT,
          Hash: "NA",
          Status : "Failed",
          Date: moment().format('llll'),
          FK_UserId: idOfPosUser
        }
        //Call to function to save de Tx and log info.  
        runTx(TxData,logResponse);
        res.statusCode=500;
        res.render('actionDashText', {
          Errors : 1,
          Hash: "NA",
          DateCompleted: moment().format('llll'),
          ValueDash:txAmount},
         function(err, html) {
          res.send({MontoDash: amountFromDT,
          Hash: "NA",
          Status : "Failed",
          Contrato: Cnt,
          TimeStamp:  moment().format('llll') });
        }
        );
      }

    })
  }

}),
    

//---------------------------------------------------------Route that returns the address and amount of a determined text token to pay with DashText.
//---------------------------------------------------------Used mainly by DashText app.
router.get('/TextToken', function (req, res) {
  if (req.headers.token==undefined){
    res.status(500).send({error : 1,
      Message : 'Error with header information'});
    return;
  }
  pool.query('SELECT DynamicAddress,MontoDash, MontoFiat FROM paymentlog WHERE TextToken = '+req.headers.token+' ORDER BY ID DESC LIMIT 1', function(err, rows, fields) {
    if (rows == undefined){
      res.status(500).send({error : 2,
        Message : 'Error while performing Query (DashText)'});
        return;
    }
    if (rows.length == 0)
    {
      res.status(500).send({error : 3,
        Message : 'Token not found'});
        return;
    }
    else
    {
      res.status(200).send({error : 0,
        message : '',
        DynamicAddress : rows[0].DynamicAddress,
        MontoBsS: rows[0].MontoFiat,
        MontoDash : rows[0].MontoDash});
        return;
    }
  });
});


module.exports = router;
