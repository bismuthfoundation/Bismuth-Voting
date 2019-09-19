import _ from 'lodash';
const bip39 = require('bip39');
const crypto = require("crypto");
const eccrypto = require("eccrypto");


const TEST_SEED_HEX = "95a7ecb56bda5eba808eec2407b418002b824c6c1cb159ec44b8371405629f8429419e98e1b67fc6367368f5d82871a501bbc655a62d31e8391411d7a6e74b86";
const DEFAULT_PASSWORD = 'BismuthGVP';

function component() {
  const element = document.createElement('div');

  const mnemonic = bip39.entropyToMnemonic('00000000000000000000000000000000');
  element.innerHTML = _.join(['Mnemonic', mnemonic], ' ');

  console.log("seed");
  bip39.mnemonicToSeed('letter advice cage absurd amount doctor acoustic avoid letter advice cage above', DEFAULT_PASSWORD).then(bytes => bytes.toString('hex')).then(console.log);

  return element;
}


document.body.appendChild(component());
