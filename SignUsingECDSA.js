//Important code if ECDSA signing is needed

 // var r = require('jsrsasign');
            //var ec = new r.ECDSA({ 'curve': 'secp256k1' });

            /*"private": "6b558e5e6546d253b6bb1ad85a4dcaaac9fb42a8d68a661122854a3926ebb896",
  
            "public": "02e91a29b20b2f7458d74f820c4e55137a1b65ed2763e43aadca50a5daa999ff0a",
            
            "address": "XuDy7dvHrBfsRbj6w5xm3UQjtAQKGhzFW7",
            
            "wif": "XEtGyDUW3QGa8mdWSboyRLCB1VQnFxQryLnczBmoB7kzSoZHBHMx"*/
            
            /*msg1 = toSign[i];          
            var sig = new r.Signature({ "alg": 'SHA256withECDSA' });
            sig.init({ d: prvhex, curve: 'secp256k1' });
            sig.updateString(msg1);
            var sigValueHex = sig.sign();
            
            var sig = new r.Signature({ "alg": 'SHA256withECDSA' });
            sig.init({ xy: pubhex, curve: 'secp256k1' });
            sig.updateString(msg1);
            var result = sig.verify(sigValueHex);
            //console.log(sigValueHex);
            if (result) {
              console.log("valid ECDSA signature");
            } else {
              console.log("invalid ECDSA signature");
            }*/


            //var  msg = randomBytes(32);
            //var privKey = randomBytes(32);
            //console.log(msg);
            //var enhex = msg.toString('hex');
            //console.log(enhex);
            //console.log(Buffer.from(enhex, 'hex'));

            /*var datatosignt = Buffer.from(toSign[i],'hex');
            var signwith = Buffer.from('b7e9997fb8cf094d6fc44e5e76b89f8d10c2259f8acddbacb4227397b934f835', 'hex');          
            var sigObj = secp256k1.sign(datatosignt, signwith);
            var enhexsigObj = sigObj.signature.toString('hex');
            console.log('asd');
            const pubkeytocheck = secp256k1.publicKeyCreate(signwith);*/



            //var pubkeytocheck = Buffer.from('032d3e6f8e6d673452fd61d22cf268608b60bd63586ab34530a19a9859f73421c2', 'hex');   
            //304402201fce11a7b612f9bc7d446054b1e661836f65cfecee0581700320a4c37caa9c2e0220540ea2d2edbe182e28a24afd0ffe29175eadea7c5ba69c5ed3ab0745b49cb9b0
            //3045022100cf05c2a72c7fe44e4e869634fb772dea4ba11f41a91394a4740757c14c56fdbd0220135ca8fbe0638ed8580123b984e3c4fcc832555f7e85e7687ef372953fb98498

            //30450221009f686e8d2b4c9fdd5581315e28d3efed41e32d3d9cfd490af0c401c07502d9760220335fe39d8b6899cad12ca5544667968d6163732c7e439696741cc4c44772cd2e

            //5b76e06a888623310083659c4668a063f2fa6150bc801f56d64f7edfecea3e0b288af75a0e4584784f473f155e1a286f6ef86333220519cf6606e531b75679a2
            //1385b5687ec868fff7f98cdfddd89778388be38ad89ae2f0912744e50684483c13b59273cadd7a451492d0132d5c01c3e95e0023ca607c37c7978e13deaa2e9a
            

            //console.log(enhexsigObj);

            //console.log(secp256k1.verify(datatosignt, sigObj.signature, pubkeytocheck)) //Check signature
            //console.log(Buffer.from(enhexsigObj, 'hex'));


                /*var signature = Message(toSign[i]).sign(privateKey);
                console.log(toSign[i]);
                const signatureHEX = Buffer.from(signature, 'utf8').toString('hex');*/
          
          
           /* console.log('private hex');
            var privatehex = Buffer.from("XwyXtUfTu9BvHhjm5s2ixozKSEWMdpgav6", 'utf8').toString('hex');
            console.log(privatehex);
            console.log('-----------------');
            var privateKey = bitcore.PrivateKey.fromString('0dc213f2480e2fff1385be63fb5d7447a55e4eba3724da2899d47fd9ebd8b9c8');*/