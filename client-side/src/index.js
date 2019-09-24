import _ from 'lodash';
const bip39 = require('bip39');
const crypto = require("crypto");
const eccrypto = require("eccrypto");

const derivableKey = require("./derivableKey.js");
const utils = require("./utils.js");
var DerivableKey = derivableKey.DerivableKey;

const TEST_SEED_HEX = "95a7ecb56bda5eba808eec2407b418002b824c6c1cb159ec44b8371405629f8429419e98e1b67fc6367368f5d82871a501bbc655a62d31e8391411d7a6e74b86";
const DEFAULT_PASSWORD = 'BismuthGVP';

function component() {
  const element = document.createElement('div');

  const mnemonic = bip39.entropyToMnemonic('00000000000000000000000000000000');
  element.innerHTML = _.join(['Mnemonic', mnemonic], ' ');

  //console.log("seed");
  bip39.mnemonicToSeed('letter advice cage absurd amount doctor acoustic avoid letter advice cage above', DEFAULT_PASSWORD).then(bytes => bytes.toString('hex')).then(console.log);
  //bip39.mnemonicToSeed('letter advice cage absurd amount doctor acoustic avoid letter advice cage above', DEFAULT_PASSWORD).then(console.log);

  console.log(derivableKey.version);

  var master_key = new DerivableKey(utils.hexToBytes(TEST_SEED_HEX));
  console.log("Master " + master_key);
  console.log("Master seed", master_key.seed);
  console.log("Master seed h1", master_key.seed.toString('hex')); // ???
  console.log("Master seed h2", utils.bytesToHex(master_key.seed));
  var pubkey = master_key.to_pubkey()
  console.log("pubkey " + utils.bytesToHex(pubkey));
  var address_key1 = master_key.derive("Bis_test_address1");
  console.log("Seed1 " + utils.bytesToHex(address_key1.seed));
  console.log("AES1 " + utils.bytesToHex(address_key1.to_aes_key()));
  var motion_key1a = address_key1.derive("motion_1_txid_this_would_be_a_b64_encoded_string");
  console.log("Seed1a " + utils.bytesToHex(motion_key1a.seed));
  console.log("AES1a " + utils.bytesToHex(motion_key1a.to_aes_key()));

  // "c5d44637eb43b04bfa07b8cf1272e22d95a740126cd9e1ab7363840f118a9ebf6671d081ea1f89f13aad09c1a92dabd62eb1c0e81b701f8116b7401a30a98867"
  //console.log("AES1 " + address_key1.to_aes_key().toString('hex'));*/

  return element;
}


document.body.appendChild(component());
