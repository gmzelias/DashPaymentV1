$('#BsSAmount').on('input',function() { 
    var rate = $('#ExRa').text();
    var exchange = ($('#BsSAmount').val() / rate)+0.00000500; // 500 Duff added as a Flat Fee
    var e = exchange.toFixed(8);
    $('#DashAmount').val(e);
});