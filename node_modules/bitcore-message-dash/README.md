# Dash Message Verification and Signing for Bitcore-Dash


[![NPM Package](https://img.shields.io/npm/v/bitcore-message-dash.svg?style=flat-square)](https://www.npmjs.org/package/bitcore-message-dash)
[![Build Status](https://img.shields.io/travis/dashpay/bitcore-message-dash.svg?branch=master&style=flat-square)](https://travis-ci.org/dashpay/bitcore-message-dash)
[![Coverage Status](https://img.shields.io/coveralls/bitpay/bitcore-message-dash.svg?style=flat-square)](https://coveralls.io/r/dashpay/bitcore-message-dash?branch=master)

bitcore-message-dash adds support for verifying and signing dash messages in [Node.js](http://nodejs.org/) and web browsers.

See [the main bitcore-dash repo](https://github.com/dashpay/bitcore-dash) for more information.

## Getting Started

```sh
npm install bitcore-message-dash
```

```sh
bower install bitcore-message-dash
```

To sign a message:

```javascript
var bitcore = require('bitcore-lib-dash');
var Message = require('bitcore-message-dash');

var privateKey = bitcore.PrivateKey.fromWIF('cPBn5A4ikZvBTQ8D7NnvHZYCAxzDZ5Z2TSGW2LkyPiLxqYaJPBW4');
var signature = Message('hello, world').sign(privateKey);
```

To verify a message:

```javascript
var address = 'n1ZCYg9YXtB5XCZazLxSmPDa8iwJRZHhGx';
var signature = 'H/DIn8uA1scAuKLlCx+/9LnAcJtwQQ0PmcPrJUq90aboLv3fH5fFvY+vmbfOSFEtGarznYli6ShPr9RXwY9UrIY=';
var verified = Message('hello, world').verify(address, signature);
```

## Contributing

See [CONTRIBUTING.md](https://github.com/dashpay/bitcore-dash/blob/master/CONTRIBUTING.md) on the main bitcore-dash repo for information about how to contribute.

## License

Code released under [the MIT license](https://github.com/bitpay/bitcore/blob/master/LICENSE).

Copyright 2013-2015 BitPay, Inc. Bitcore is a trademark maintained by BitPay, Inc.

