$('#BsSAmount').on('input',function() { 
    var rate = $('#ExRa').text();
    var exchange = $('#BsSAmount').val() / rate;
    var e = exchange.toFixed(8);
    $('#DashAmount').val(e);
});