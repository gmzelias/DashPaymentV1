var request = require('request');
function checkTx(callback){
  var address= $('#HexAddr').text();
  var addresses;
  console.log();
 /* request.get(
      "https://api.blockcypher.com/v1/dash/main/txs",
      { json: { key: 'value' } },
      function (error, response, body) {
          if (!error && response.statusCode == 200) {    
            for(var i = 0; i < body.length;i++){
                var addressUN = body[i].addresses;
                for(var o = 0; o < addressUN.length;o++){
                    if (addressUN[o] == address){
                        console.log("Payment received");
                       //window.location.href="http://localhost:3000/contact";
                    }
                }
            }
          //  console.log(addresses);
           // callback(address);
          }
      }
  );*/
};
    var bar2 = new ldBar(".ldBar", {
    "value":60000,
    "stroke": '#f00',
    "stroke-width": 10,
    "min":0,
    "max":60000,
    "value":60000,
    "preset":'fan',
    "type":'stroke',
    "stroke":"data:ldbar/res,gradient(0,1,#045089,#008de4)"
   });
var cu = 60000;
function rex(){
cu = cu-100;
if (cu<1){
    window.location.href="http://localhost:3000/contact";
}
var segs = (Math.round($('.ldBar-label').text()/1000));
$('.love').text(segs + " Secs");
bar2.set(cu);
}
setInterval(rex,100);
//checkTx();
//set some timefunction to check that
setInterval(checkTx,3000)