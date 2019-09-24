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
  var encrypted = motion_key1a.encrypt_vote(motion_key1a.to_aes_key(), 'B', true);
  console.log("encrypted1a B" + utils.bytesToHex(encrypted));
  // B 7b74501d577bc84c655bfcb3c91fc5f3  - Message e3RQHVd7yExlW/yzyR/F8w==
  var encrypted = motion_key1a.encrypt_vote(motion_key1a.to_aes_key(), 'A', true);
  console.log("encrypted1a A" + utils.bytesToHex(encrypted));
  // A 41fea09e3f2e12886c6a24ff73c203d2  - Message Qf6gnj8uEohsaiT/c8ID0g==


  return element;
}


document.body.appendChild(component());
