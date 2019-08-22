var request = require('request');
function checkTx(/*callback*/){
    if ($('#time').text() === "00:00" || ms === 600000){ // 600000 = 5min
        $('#time').text("00:00");
        clearInterval(refreshIntervalId);
        clearInterval(clocktimer);
        $('#RAddress').addClass("blurmed");
        var data = {
            prAddress: $('#pr_a').text(),
            puAddress: $('#pu_a').text(),
            Address: $('#add_rr').text(),
            Eid: $('#Eid').text(),
            Mbs: $('#Mbs').text(),
            Cnt: $('#Cnt').text()
        };
        $.ajax({
            type: "POST",
            url: "/timeup",
            data: data,
            success: function(a) {        
               // console.log('Success AJAX TimeUp');
                //$('#middle').append(a);
                $('#RAddress').addClass("hideQR");
                $('.itemdesc').hide();
                $('.costBs').hide();
                $('.topdiv').hide();
                //$('#DashLoader').removeClass("ld");
                $('#QR').addClass("actionlogo");
                $('#QR').prepend('<div class = "topdivchecked bigEntrance"><img id="DashFailed" class="ld ld-tick" /></div>')
                $('#HexButton').remove();
                $('#mainHexButton').prepend('<div class ="bigEntrance"><img id="Fail"/></div>');
                $('.SubDashText').remove();
                $('.dashTextUp').remove();
                //$('.dashTextDown').remove();
                $('.TextToken').remove();
            // $('#dashText').append('<div class ="bigEntrance"><button id="submitfail"></button>')
                //console.log(a);
                //$("#timerqr").removeClass("blurmed");
                //window.location.href="http://localhost:3000/action";
                setTimeout(function () {
                $('#DashFailed').removeClass("ld");
                }, 2000); 
            },
            error: function (e) {
            },
        });
        return;
    }
/*
    //FOR TESTING PURPOSE ONLY
    clearInterval(refreshIntervalId);
    clearInterval(clocktimer);
    var data = {
        hash: "ssssss",
        address: "ssss",
        prAddress: $('#pr_a').text(),
        puAddress: $('#pu_a').text(),
        Address: $('#add_rr').text(),
        eid: $('#eid').text()
    };
    $.ajax({
        type: "POST",
        url: "/action", //change to non existing address to test error
        data: data,
        success: function(a) {        
      //clock.stop();                     
      console.log('Success AJAX');
      //$('#middle').append(a);
      $('#RAddress').addClass("hideQR");
      $('.itemdesc').hide();
      $('.costBs').hide();
      $('.topdiv').hide();
      //$('#DashLoader').removeClass("ld");
      $('#QR').addClass("actionlogo");
      $('#QR').prepend('<div class = "topdivchecked bigEntrance"><img id="DashCompleted" class="ld ld-tick" /></div>');
      $('#HexButton').remove();
     // $('#submit').remove();
      $('#mainHexButton').prepend('<div class ="bigEntrance"><img id="Success"/></div>');
      $('.dashTextUp').remove();
      //$('.dashTextDown').remove();
      $('.TextToken').remove();
      //$('#dashText').append('<div class ="bigEntrance"><button id="submit"></button>')
      //console.log(a);
      //$("#timerqr").removeClass("blurmed");
      //window.location.href="http://localhost:3000/action";
      setTimeout(function () {
        $('#DashCompleted').removeClass("ld");
        }, 2000); 
    },
        error: function (e) {
            console.log('Error on AJAX');
            console.log('Success AJAX');
            //$('#middle').append(a);
            $('#RAddress').addClass("hideQR");
            $('.itemdesc').hide();
            $('.costBs').hide();
            $('.topdiv').hide();
            //$('#DashLoader').removeClass("ld");
            $('#QR').addClass("actionlogo");
            $('#QR').prepend('<div class = "topdivchecked bigEntrance"><img id="DashFailed" class="ld ld-tick" /></div>')
            $('#HexButton').remove();
            $('#mainHexButton').prepend('<div class ="bigEntrance"><img id="Fail"/></div>')
            $('.dashTextUp').remove();
            //$('.dashTextDown').remove();
            $('.TextToken').remove();
           // $('#dashText').append('<div class ="bigEntrance"><button id="submitfail"></button>')
            //console.log(a);
            //$("#timerqr").removeClass("blurmed");
            //window.location.href="http://localhost:3000/action";
            setTimeout(function () {
              $('#DashFailed').removeClass("ld");
              }, 2000); 
        },
    });

*/


  /*
  //Using BlockCypher Endpoints
  console.log('entra en checkTX');
  var address= $('#HexAddr').val();
  console.log(address);
  request.get(
      "https://api.blockcypher.com/v1/dash/main/txs?token=cc0b3cdc830d431e8405d448c1f9c335",
      { json: { key: 'value' } },
      function (error, response, body) {
          //console.log(body);
          if (!error && response.statusCode == 200) {               
            for(var i = 0; i < body.length;i++){               
                var addressUN = body[i].addresses;              
                for(var o = 0; o < addressUN.length;o++){
                    if (addressUN[o].trim() == address.trim()){    
                        //here the blur               
                        $('#RAddress').addClass("blurmed");
                        $('#QR').prepend('<div class = "topdiv"><img id="DashLoader" style="width:100px;height:100px;" src="img/dashnew.svg" class="ld ld-coin-h" />')      
                        clearInterval(refreshIntervalId);
                        clearInterval(clocktimer);
                        console.log("Payment received");
                        var hash = body[i].hash;
                        var data = {
                            hash: hash,
                            address: address,
                            prAddress: $('#pr_a').text(),
                            puAddress: $('#pu_a').text(),
                            Address: $('#add_rr').text(),
                            Eid: $('#Eid').text(),
                            Mbs: $('#Mbs').text(),
                            Cnt: $('#Cnt').text()
                        };
                        o = addressUN.length;
                        i =  body.length;   
                        mSecondsSuccess = 1;
                        $.ajax({
                            type: "POST",
                            url: "/action",
                            data: data,
                            success: function(a) {        
                                 //clock.stop();                     
                        console.log('Success AJAX');
                        //$('#middle').append(a);
                        $('#RAddress').addClass("hideQR");
                        $('.itemdesc').hide();
                        $('.costBs').hide();
                        $('.topdiv').hide();
                        //$('#DashLoader').removeClass("ld");
                        $('#QR').addClass("actionlogo");
                        $('#QR').prepend('<div class = "topdivchecked bigEntrance"><img id="DashCompleted" class="ld ld-tick" /></div>');
                        $('#HexButton').remove();
                        // $('#submit').remove();
                        $('#mainHexButton').prepend('<div class ="bigEntrance"><img id="Success"/></div>');
                        $('.SubDashText').remove();
                        $('.dashTextUp').remove();
                        //$('.dashTextDown').remove();
                        $('.TextToken').remove();
                        //$('#dashText').append('<div class ="bigEntrance"><button id="submit"></button>')
                        //console.log(a);
                        //$("#timerqr").removeClass("blurmed");
                        //window.location.href="http://localhost:3000/action";
                        setTimeout(function () {
                            $('#DashCompleted').removeClass("ld");
                            }, 2000); 
                        },
                            error: function (e) {
                                console.log('Error AJAX');
                                //$('#middle').append(a);
                                $('#RAddress').addClass("hideQR");
                                $('.itemdesc').hide();
                                $('.costBs').hide();
                                $('.topdiv').hide();
                                //$('#DashLoader').removeClass("ld");
                                $('#QR').addClass("actionlogo");
                                $('#QR').prepend('<div class = "topdivchecked bigEntrance"><img id="DashFailed" class="ld ld-tick" /></div>')
                                $('#HexButton').remove();
                                $('#mainHexButton').prepend('<div class ="bigEntrance"><img id="Fail"/></div>');
                                $('.SubDashText').remove();
                                $('.dashTextUp').remove();
                                //$('.dashTextDown').remove();
                                $('.TextToken').remove();
                            // $('#dashText').append('<div class ="bigEntrance"><button id="submitfail"></button>')
                                //console.log(a);
                                //$("#timerqr").removeClass("blurmed");
                                //window.location.href="http://localhost:3000/action";
                                setTimeout(function () {
                                $('#DashFailed').removeClass("ld");
                                }, 2000); 
                            },
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
      });*/

      let address= $('#HexAddr').val();
      request.post({
        url: 'https://dash.abacco.com/api/apisaldo.php',
        form: { address:address},
        headers: { 
           'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.110 Safari/537.36',
           'Content-Type' : 'application/x-www-form-urlencoded' 
        },
        method: 'POST'
       },
          function (error, response, body) {
             // console.log(body);
              if (!error && response.statusCode == 200) { 
                let JSONresponse = JSON.parse(body);
                  if(JSONresponse['amount'] !== 0){                                
                            //here the blur               
                            $('#RAddress').addClass("blurmed");
                            $('#QR').prepend('<div class = "topdiv"><img id="DashLoader" style="width:100px;height:100px;" src="img/dashnew.svg" class="ld ld-coin-h" />')      
                            clearInterval(refreshIntervalId);
                            clearInterval(clocktimer);
                           // console.log("Payment received");
                            //var hash = body[i].hash; IMPORTANT
                            var data = {
                                hash: "addresstest",
                                address: address,
                                //prAddress: $('#pr_a').text(),
                                //puAddress: $('#pu_a').text(),
                                Address: $('#add_rr').text(),
                                Eid: $('#Eid').text(),
                                Mbs: $('#Mbs').text(),
                                Cnt: $('#Cnt').text(),
                                TcDT: $('#TcDT').text(),
                                AmounToDT:JSONresponse['amount']
                            };
                           // o = addressUN.length;
                            //i =  body.length;   
                            mSecondsSuccess = 1;
                            $.ajax({
                                type: "POST",
                                url: "/actionDashText",
                                data: data,
                                success: function(a) {        
                                     //clock.stop();                     
                           // console.log('Success AJAX');
                            //$('#middle').append(a);
                            $('#RAddress').addClass("hideQR");
                            $('.itemdesc').hide();
                            $('.costBs').hide();
                            $('.topdiv').hide();
                            //$('#DashLoader').removeClass("ld");
                            $('#QR').addClass("actionlogo");
                            $('#QR').prepend('<div class = "topdivchecked bigEntrance"><img id="DashCompleted" class="ld ld-tick" /></div>');
                            $('#HexButton').remove();
                            // $('#submit').remove();
                            $('#mainHexButton').prepend('<div class ="bigEntrance"><img id="Success"/></div>');
                            $('.SubDashText').remove();
                            $('.dashTextUp').remove();
                            //$('.dashTextDown').remove();
                            $('.TextToken').remove();
                            //$('#dashText').append('<div class ="bigEntrance"><button id="submit"></button>')
                            //console.log(a);
                            //$("#timerqr").removeClass("blurmed");
                            //window.location.href="http://localhost:3000/action";
                            setTimeout(function () {
                                $('#DashCompleted').removeClass("ld");
                                }, 2000); 
                            },
                                error: function (e) {
                                 //   console.log('Error AJAX',e);
                                    //$('#middle').append(a);
                                    $('#RAddress').addClass("hideQR");
                                    $('.itemdesc').hide();
                                    $('.costBs').hide();
                                    $('.topdiv').hide();
                                    //$('#DashLoader').removeClass("ld");
                                    $('#QR').addClass("actionlogo");
                                    $('#QR').prepend('<div class = "topdivchecked bigEntrance"><img id="DashFailed" class="ld ld-tick" /></div>')
                                    $('#HexButton').remove();
                                    $('#mainHexButton').prepend('<div class ="bigEntrance"><img id="Fail"/></div>');
                                    $('.SubDashText').remove();
                                    $('.dashTextUp').remove();
                                    //$('.dashTextDown').remove();
                                    $('.TextToken').remove();
                                // $('#dashText').append('<div class ="bigEntrance"><button id="submitfail"></button>')
                                    //console.log(a);
                                    //$("#timerqr").removeClass("blurmed");
                                    //window.location.href="http://localhost:3000/action";
                                    setTimeout(function () {
                                    $('#DashFailed').removeClass("ld");
                                    }, 2000); 
                                },
                            });
                        }  
              }
              else{
                console.log("Confirmation Error (DashTextAPI)");
              }
          }
          
          );
         
};



/*   var clock = $('.countdown').FlipClock(4000,{
    countdown:true,
    clockFace: 'MinuteCounter',
	onDestroy: function() {
		// Do something
	}
    });
    clock.setTime(900);*/

   /* var bar2 = new ldBar(".ldBar", {
    "value":60000,
    "stroke": '#f00',
    "stroke-width": 10,
    "min":0,
    "max":60000,
    "value":60000,
    "preset":'fan',
    "type":'stroke',
    "stroke":"data:ldbar/res,gradient(0,1,#045089,#008de4)"
   });*/
/*var mSeconds = 60000;
var mSecondsSuccess = mSeconds;/*==*/
function rex(){
ms = ms + 10000;
checkTx();//ActivateTX

// Code used for loading bar

/*mSeconds = mSeconds-100;
mSecondsSuccess = mSecondsSuccess-100;
var segs = (Math.round($('.ldBar-label').text()/1000));
$('.love').text(segs + " Secs");
bar2.set(mSeconds);
if (mSecondsSuccess % 10000 == 0 ){
   // checkTx();
}*/

}
var ms = 0;
var refreshIntervalId = setInterval(rex,5000); // Set here the secs to check for the Tx.
refreshIntervalId;
