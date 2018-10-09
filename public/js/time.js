var request = require('request');
function checkTx(/*callback*/){
    console.log('entra en checkTX');
  var address= $('#HexAddr').text();
  request.get(
      "https://api.blockcypher.com/v1/dash/main/txs",
      { json: { key: 'value' } },
      function (error, response, body) {
          //console.log(body);
          if (!error && response.statusCode == 200) {               
            for(var i = 0; i < body.length;i++){               
                var addressUN = body[i].addresses;              
                for(var o = 0; o < addressUN.length;o++){
                    if (addressUN[o].trim() == address.trim()){                   
                        console.log("Payment received");
                        var hash = body[i].hash;
                        var data = {
                            hash: hash,
                            address: address,
                            prAddress: $('#pr_a').text(),
                            puAddress: $('#pu_a').text(),
                            Address: $('#add_rr').text()
                        };
                        o = addressUN.length;
                        i =  body.length;   
                        mSecondsSuccess = 1;
                        $.ajax({
                            type: "POST",
                            url: "http://localhost:3000/contact",
                            data: data,
                            success: function(a) {                           
                              console.log('Success AJAX');
                              //window.location.href="http://localhost:3000/contact";
                            }
                        });
                    }
                    else{
                        console.log('retrying...');
                    }

                }
            }
          }
          else{
            alert("Confirmation Error (API)");
          }
      });
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
var mSeconds = 60000;
var mSecondsSuccess = mSeconds;
function rex(){
mSeconds = mSeconds-100;
mSecondsSuccess = mSecondsSuccess-100;
/*if (mSeconds<1){
    window.location.href="http://localhost:3000/contact";
}*/
var segs = (Math.round($('.ldBar-label').text()/1000));
$('.love').text(segs + " Secs");
bar2.set(mSeconds);
if (mSecondsSuccess % 15000 == 0 ){
    checkTx();
}
}
setInterval(rex,100);
