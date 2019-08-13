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

/*router.get('/submit', function (req, res) {
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
  res.render('submit',DataToRender);
};
  getRate(Render);
});*/

//Main Page
router.get('/checkTxStatus', function (req, res, next) {
  req.on('close', function (err){
    console.log('Canceled');
    clearInterval(refreshIntervalId);
});
  req.setTimeout(350000);
  let ms = 0;
  let refreshIntervalId = setInterval(rex,7000); 
  console.log(req.headers.contrato);
  console.log(req.headers.idestablecimiento);
  if (req.headers.contrato == undefined || req.headers.idestablecimiento == undefined ){
    console.log('Undefined header')
    clearInterval(refreshIntervalId);
    return res.status(500).send({error:'Missing information'});
  }
  else{// Set here the secs to check for the Tx.
    rex();
    refreshIntervalId;
  }
    function rex(){
    console.log(ms);
    ms = ms + 10000;
    if (ms === 450000){ 
      console.log('Data not found')
      clearInterval(refreshIntervalId);
      return res.status(500).send({error:'Data not found'});
    }else{
      var SQL = 'SELECT * FROM txinfo WHERE Contrato = ? AND ID_Establecimiento = ?';
      pool.query(SQL, [req.headers.contrato,req.headers.idestablecimiento], function(err, rows, fields) {
        if (err){
          console.log('Error on DB')
          clearInterval(refreshIntervalId);
          return res.status(500).send('Unexpected error (DB)');            
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
          console.log('Success')
          clearInterval(refreshIntervalId);
          return res.status(200).json(dataToSend);      
        }
      });
    }
  }
});

//Main Page
router.get('/', function (req, res, next) {
//console.log(req.headers); //Show headers on console.
// ------------------------------------------------------------Validate that headers in the request are valid.
if (req.headers.idestablecimiento == undefined || req.headers.monto==undefined || req.headers.contrato==undefined || merchantsCodes[req.headers.idestablecimiento]==undefined){
  var data = {validated:"headers"}// Error with headers
  res.status(500).render('index', {data});
  return;
}
//-----------------
//-----------------
//-----------------
//-----------------
//-------------------------------------------------------------------------Function to get BsS rate
function getRate(callback){
RateInfo = {error:0,
            rate:0}
/*var options = {uri: 'https://dash.casa/api/?cur=VES',
              method: 'GET'};*/
  var options = {uri: 'http://ec2-18-237-86-164.us-west-2.compute.amazonaws.com:3000/API/dashRate?currency=Bs',
              method: 'GET'};  
request(options, function (error, response, body) {   
  if (!error && response.statusCode == 200) {
    //try{
      console.log("try API Bs rate");
      var JsonBody = JSON.parse(body);
      var mainBsRate = JsonBody.vesDashRate.replace(/[\[\]&(.)]+/g, '');
      console.log(mainBsRate, 'del api nuevo');
      mainBsRate = mainBsRate.replace(",", ".");
      console.log(parseFloat(mainBsRate), 'del api nuevo');
      RateInfo.error=0;
      RateInfo.rate=parseFloat(mainBsRate);
   // }
   /* catch(e){
      console.log("entra en catch");
      RateInfo.error=0;
      RateInfo.rate=43920;
      }  */
  }
 else{
   RateInfo.error=1;
  }
   callback(RateInfo);
});
};

//-----------------------------------------------------------------Function to convert BsS into Dash
function AssignBs(RateInfo){
var BsRate = RateInfo;
if (BsRate.error==0){
  var rate = BsRate.rate;
  var exchange = ((req.headers.monto) / rate)+0.00000300; // 500 Duff added as a Flat Fee
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

    //Generation of dynamic address using BlockCypher--------------------------------------------------------------------------------------
    /*
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
      });*/

    //Generation of dynamic address using DashText API------------------------------------------------------------------------------------------
    request.post({
      url: 'https://dash.abacco.com/apinew.php',
      form: { address:/*eval("process.env."+req.headers.idestablecimiento) <-env variables */merchantsCodes[req.headers.idestablecimiento],
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
            console.log(JSONresponse, 'RESPONSE FROM NEW ADDRESS');
            transferCodeDT =JSONresponse['code'];
             Address = {
              address : JSONresponse['address'],
             /* wif : body.wif,
              private : body.private,
              public :body.public,*/
              error:0}
          }
          else{
            Address = {error:1}
            console.log("Error on generating address"); //must be HTML
          }
          callback(Address);
      });



};

  //-----------------------------------------------------------Validate the generated address
    function setInformation(Address){
     console.log('2');
     if (Address.error == 0)
     {
      var data = {
      validated:true,
      InvoiceID : req.headers.contrato,
      //Private :Address.private,
      Address :  Address.address,
      //Wif:Address.wif,
     // Public: Address.public,
      Amount :exchange, 
      AmountBsS : req.headers.monto,
      Date :moment().format('llll')
      }

      console.log(data);
      var addrCheck = addrValidator.validate(data.Address, 'DASH');
      console.log('2.5');
      if(addrCheck)
        runQuery(data,setValue)
     else
     {
      console.log('Error with address');
       data.validated = "address";
       res.status(500).render('index', {data});
      }
    }else{
      var data = {validated:"address"}
      console.log('Error with address');
      res.status(500).render('index', {data});
    }

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
      MontoBs:req.headers.monto,
      TextToken:TextToken.toString(),
      DateCreated:data.Date,
      TextTokenStatus:true}
      pool.query('INSERT INTO paymentlog SET ?', DataToInsert, function (error, results, fields) {
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
    /*data.validated = true;
    callback(data);*/
  };
  //--------------------------------------------------------Sets data in PUG.
  function setValue(data){
    console.log('4');
   data.SimpleAddress=data.Address;
   data.RAddress ="dash:"+data.Address+'?amount='+data.Amount;
   //var PrivateEncrypted = encryptor.encrypt(data.Private);
   //var PublicEncrypted = encryptor.encrypt(data.Public);
   var AddressEncrypted = encryptor.encrypt(data.Address);
   var rpq =  encryptor.encrypt(req.headers.idestablecimiento);
   var Mbs =  encryptor.encrypt(req.headers.monto);
   var Cnt =  encryptor.encrypt(req.headers.contrato);
   console.log('5');
   //data.privateAddress = PrivateEncrypted;
   //data.publicAddress = PublicEncrypted;
   data.Address = AddressEncrypted;
   data.RPQ = rpq;
   data.Mbs = Mbs;
   data.Cnt = Cnt;
   data.TextToken = data.TextToken;
   res.status(200).render('index', {data});
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
    res.status(500).render('index', {data});
  }
}
 //------------------------------Start! 

 //-----------------------------------Validate if the contract (invoice) is not repeated in the merchant, if repeated return the Tx response.
 pool.query('SELECT * FROM paymentlog WHERE Contrato = '+req.headers.contrato+' ORDER BY ID DESC LIMIT 1', function(err, rows, fields) {
  if (rows == undefined){
    console.log(err);
    res.status(500).send({error : 2,
      message : 'Error while performing Query'});
      return;
  }
  if (rows.length != 0)
  {
    var Payment = rows[0].ID;
    var Merchant = req.headers.idestablecimiento;
    var SQL = 'SELECT * FROM txinfo WHERE FK_PaymentId = ? AND ID_Establecimiento = ?';
    pool.query(SQL, [Payment, Merchant], function(err, rows2, fields) {
      if (rows2 == undefined){
        res.status(500).send({error : 2,
          message : 'Error while performing Query'});
          return;
      }
     if (rows2.length != 0){
      res.status(200).send({
          Contrato: rows2[0].Contrato,
          MontoDash: rows2[0].MontoDash,
          Hash: rows2[0].Hash,
          Status : rows2[0].Status,
          TimeStamp: rows2[0].DateCompleted });
          return;
      }
      else{
        getRate(AssignBs);
      }
    });
  }else{
    getRate(AssignBs);
  } 
});
//getRate(AssignBs);     //Uncomment to test
});


//---------------------------------------------------------Route to be executed when the timer gets to 0 seconds.
router.post('/timeup', function (req, res) {
  var Eid = encryptor.decrypt(req.body.Eid);
  var Mbs = encryptor.decrypt(req.body.Mbs);
  var Cnt = encryptor.decrypt(req.body.Cnt);
  var adrdecrypted = encryptor.decrypt(req.body.Address);

  pool.query('SELECT * FROM paymentlog WHERE Contrato = '+Cnt+' ORDER BY ID DESC LIMIT 1', function(err, rows, fields) {
    console.log(rows);
    if (rows == undefined){
      res.status(500).send({error : 2,
        message : 'Error while performing Query'});
        return;
    }else{
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
        console.log('Query executed.');

        //------------------Send Tx info to merchant's URL.
        const options = {  
          url: 'http://localhost:3000/testresponse',
          body:JSON.stringify({TxData}),    
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
        }      
      };
        request(options, function(err, output, body) {});
      //---------------------------------------------------
      res.status(200).send({error : 0,
          message : 'completed'});
          return;
        }else{
        console.log('Error while performing Query.');
        }
      });
  }
});   
});


router.post('/testresponse', function (req, res) {
console.log(req.body);
});


//---------------------------------------------------------Route to be executed using DashText endpoint to get payment on dynamic address.
router.post('/actionDashText', function (req, res) {
  //-------------------------------------Merchants ID
  var Eid = encryptor.decrypt(req.body.Eid);
  var Mbs = encryptor.decrypt(req.body.Mbs);
  var Cnt = encryptor.decrypt(req.body.Cnt);
  var MayorAddress = merchantsCodes[Eid];
  let amountFromDT =req.body.AmounToDT;
  let transferCodeDTAction =transferCodeDT;
  MayorAddress = (MayorAddress.replace(/['"]+/g, '')).trim();
    //-------------------------------Callback of creating log
    function logResponse(res){
      console.log('antes log');
      if(res.validated==true){
        console.log("Log created successfully.");
      }if(res.validated==false){
        console.log("Error creating  log.");}
    };
    //-------------------------------Function to save the Tx info and update the payments log.
    function runTx(data,callback) {
      pool.query('SELECT ID, TextToken FROM paymentlog WHERE Contrato = '+data.Contrato+' ORDER BY ID DESC LIMIT 1', function(err, rows, fields) {
          data.FK_PaymentId = rows[0].ID;
          var TextToken = rows[0].TextToken;
          pool.query('UPDATE paymentlog SET TextTokenStatus = false WHERE  TextToken = '+TextToken+'');   
          console.log("1er select");
          pool.query('INSERT INTO txinfo SET ?', data, function (error, results, fields) {
            console.log("2do select o insert");
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
      });   
    }
  var adrdecrypted = encryptor.decrypt(req.body.Address);//'XrNUrhPrUVnL4CXJ3urXitJhwsUizhxqie';//encryptor.decrypt(req.body.Address);
  var address = req.body.address;

  function makeTxDashText(amountFromDT,transferCodeDTAction) {
  console.log('just before make transfer using DT');
  console.log('amount to DT',amountFromDT);
  console.log('code to DT',transferCodeDT);
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
        console.log('Tx completed using DashText');
        let JSONresponse = JSON.parse(response.body);
        let toAddress = JSONresponse['to'];
        let txHash = JSONresponse['hash'];
        let txAmount = JSONresponse['amount'];
        console.log(toAddress,txHash,txAmount);
        var TxData = {
          ID_Establecimiento : Eid,
          MontoFiat: Mbs,
          TipoFiat : 'Bs', 
          Contrato: Cnt,
          MontoDash: txAmount,
          Hash: txHash,
          Status : "Completed",
          DateCompleted: moment().format('llll')
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
      }else{
        console.log('Error on Dash Text API(TRAN)',error);
        var TxData = {
          ID_Establecimiento : Eid,
          MontoFiat: Mbs,
          TipoFiat : 'Bs', 
          Contrato: Cnt,
          MontoDash: amountFromDT,
          Hash: "NA",
          Status : "Failed",
          Date: moment().format('llll')
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

  makeTxDashText(amountFromDT,transferCodeDTAction);
}),
    

//---------------------------------------------------------Route that returns the address and ammount of a determined text token to pay with DashText.
//---------------------------------------------------------Used mainly by DashText app.
router.get('/TextToken', function (req, res) {
  if (req.headers.token==undefined){
    res.status(500).send({error : 1,
              message : 'Error with header information'});
    return;
  }
  pool.query('SELECT DynamicAddress,MontoDash, MontoBs FROM paymentlog WHERE TextToken = '+req.headers.token+' ORDER BY ID DESC LIMIT 1', function(err, rows, fields) {
    if (rows == undefined){
      res.status(500).send({error : 2,
        message : 'Error while performing Query'});
        return;
    }
    if (rows.length == 0)
    {
      res.status(500).send({error : 3,
        message : 'Token not found'});
        return;
    }
    else
    {
      res.status(200).send({error : 0,
        message : '',
        DynamicAddress : rows[0].DynamicAddress,
        MontoBsS: rows[0].MontoBs,
        MontoDash : rows[0].MontoDash});
        return;
    }
  });
});


module.exports = router;
