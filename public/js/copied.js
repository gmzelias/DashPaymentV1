function copyThat() {
    var copyText = document.getElementById("HexAddr");

    /* Select the text field */
    copyText.select();
  
    /* Copy the text inside the text field */
    document.execCommand("copy");

    document.getSelection().removeAllRanges();
  }
