var request = require('request');

function checkTx(callback){
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
//set some timefunction to check that
setInterval(checkScannerYn,500)