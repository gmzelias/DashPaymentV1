      function newTxUp(/*decrypted,*/total,output,percent,callback){
        var ResultObject;
        //console.log(decrypted);
        var input = 'XuDy7dvHrBfsRbj6w5xm3UQjtAQKGhzFW7'; //XuDy7dvHrBfsRbj6w5xm3UQjtAQKGhzFW7 BlockCypher
        var output = output;
        console.log('Grand Total: '+ total);
        var value = Math.round(total * percent);
        console.log('Value: '+value );
        var options = {
          uri: 'https://api.blockcypher.com/v1/dash/main/txs/new',
          method: 'POST',
          json: {
            inputs: [{addresses: [input]}], 
                    outputs: [{addresses: [output], value: value}]
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
            console.log(toSign);
            for(var i = 0; i < toSign.length;i++){  
                //Tx Signing         
            console.log('Signing process...');
              var stringShell = 'signer'+' '+toSign[i]+' '+'6b558e5e6546d253b6bb1ad85a4dcaaac9fb42a8d68a661122854a3926ebb896';
              var reina = shell.exec(stringShell);             
              var signed = reina.stdout;
              signed = signed.replace(/\n$/, '');
              signed = signed.trim();
              signatures.push(signed);
              pubkeys.push('02e91a29b20b2f7458d74f820c4e55137a1b65ed2763e43aadca50a5daa999ff0a');          
            }   
           ResultObject = {
              Errors : false,
              tx:tx,
              toSign:toSign,
              signatures:signatures,
              pubkeys:pubkeys
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
            pubkeys:pubkeys
          }
          callback(ResultObject);  
             }   
        });
      
      };

      function SendTxUp(tx,toSign,signatures,pubkeys,/*callback*/){
        /*console.log('tosign');
        console.log(toSign);
        console.log('signatures');
        console.log(signatures);
        console.log('pubkeys');*/
        //console.log(tx);
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
          console.log(options); 
          if (!error && response.statusCode == 201) {
          //  callback();
          }
         // console.log(body);
        });
      }

      function BigTx(Big){
        console.log('entro en bigtx');
     //   console.log(Big);
var tx = Big.tx;
var tosign = Big.toSign;
var signatures = Big.signatures;
var pubkeys = Big.pubkeys;
        testB = Big.Errors;
        if (testB==false){  
          console.log('empezar confirmacion de Big'); 
          function SmallTx(Small){
            console.log('entro en smalltx');
            testS = Small.Errors;
            if (testB == false && testS== true ){
                console.log('las 2 tx realizadas sin firmar');
            }
          }       
              //  newTx(decrypted,total,'XxjS2ApJA2u25tkTmFhvxLfmT7RMRLQK1Q',0.10,SmallTx);



/*console.log(tx);
console.log(tosign);
console.log(signatures);
console.log(pubkeys);*/



SendTxUp(tx,tosign,signatures,pubkeys);
              }
      }


      newTxUp(/*decrypted,*/600,'XxjS2ApJA2u25tkTmFhvxLfmT7RMRLQK1Q',0.90,BigTx);
