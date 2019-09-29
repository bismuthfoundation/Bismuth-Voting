// import _ from 'lodash';
const bip39 = require('bip39');
// const crypto = require("crypto");
// const eccrypto = require("eccrypto");

const { DerivableKey, version: derivableKeyVersion } = require("./DerivableKey");
const { VotingTransaction } = require("./VotingTransaction");

const utils = require("./utils");

const TEST_SEED_HEX = "95a7ecb56bda5eba808eec2407b418002b824c6c1cb159ec44b8371405629f8429419e98e1b67fc6367368f5d82871a501bbc655a62d31e8391411d7a6e74b86";
const DEFAULT_PASSWORD = 'BismuthGVP';


const MOTION_ID = 1;  // hardcoded motion id for the time being
const MOTION_TXID = "motion_1_txid_this_would_be_a_b64_encoded_string"; // hardcoded motion txid for the time being
const MOTION_ADDRESS = "test_motion_address"; // hardcoded motion address for the time being

// TODO: to be used to check whether the related action is allowed. (hardcoded for first vote)
const START_VOTE_TIMESTAMP = 0;  // from START_VOTE_TIMESTAMP to END_VOTE_TIMESTAMP user can send a vote
const END_VOTE_TIMESTAMP = 0;    // from END_VOTE_TIMESTAMP to END_REVEAL_TIMESTAMP user can reveal their votes
const END_REVEAL_TIMESTAMP = 0;

/**
 * Utility to display error/warning message
 * @param {string} id of the field
 * @param {'error'|'message'|'warning'} type 
 * @param {boolean} show
 */
function displayMessage(id, type, show = true) {
  const el = document.querySelector(`#${id}-${type}`);
  if (el) {
    if (show) el.classList.remove('hidden');
    else el.classList.add('hidden');
  }
}

let vote;


function generate_seed() {
  // user is brand new and had no prior seed, we generate and fill it for him
  const mnemonic = bip39.generateMnemonic(128);  // 128 is the entropy. can be 128 to 256 - multiple of 32. 128 gives 12 words, easier for the user.
  const element = document.querySelector('#master-key');
  element.value = mnemonic;
  displayMessage('master-key', 'message', true);
}

function generate_vote() {

  // TODO: check timestamps

  const mnemonic = document.querySelector('#master-key').value;
  // block if empty or less than 12 words
  if (!mnemonic || mnemonic.split(' ').length < 12) {
    displayMessage('master-key', 'error');
    return;
  }
  const valid = bip39.validateMnemonic(mnemonic);
  // mnemonic created by a BIP39 compatible tool will validate, but we have to account for other generators to be safe.
  if (!valid) {
    // If valid is false, then warn the user but go on anyway.
    displayMessage('master-key', 'warning');
  }
  console.log("Valid mnemonic:", valid);

  const address = document.querySelector('#wallet-address').value.trim();
  // trim address and validate, give feedback to user if invalid
  // A valid bis address matches either one of these regexps:
  // RE_RSA_ADDRESS "^[abcdef0123456789]{56}$"
  // RE_ECDSA_ADDRESS "^Bis1[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{28,52}$"
  // We can use "Bis_test_address1" - that does not validate - to test the GUI with test vectors
  const rsaAddressMatch = address.match(/^[abcdef0123456789]{56}$/);
  const ecdsaAddressMatch = address.match(/^Bis1[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{28,52}$/);
  if (!(rsaAddressMatch || ecdsaAddressMatch)) {
    displayMessage('wallet-address', 'error');
    return;
  }

  if (!vote) {
    displayMessage('vote', 'error');
    return;
  }

  const amount = parseInt(document.querySelector('#bis-amount').value, 10);
  // Validate, make sure this is an integer. Will mostly not be the case because input field is number
  if (!amount.match(/[0-9]+/) || amount <= 0) {
    displayMessage('bis-amount', 'error');
    return;
  }

  // This part is redundant, done by VotingTransaction later on, but can be useful for debug (advanced tab).
  const seed = bip39.mnemonicToSeedSync(mnemonic, DEFAULT_PASSWORD);
  const master_key = new DerivableKey(seed);
  let voting_key = master_key.derive(address).derive(MOTION_TXID);
  let aes_key = voting_key.to_aes_key()

  const voting_transaction = new VotingTransaction(seed, address, MOTION_ID, MOTION_TXID, MOTION_ADDRESS);
  const transaction = voting_transaction.get_vote_transaction(vote, 10);
  console.log(transaction);


  const element = document.querySelector('#result');
  let message = "VOTE TRANSACTION<hr/>BIS URL Tab:<br/>";
  message += "Send the following BisUrl from the related wallet: " + transaction['bis_url'] + "<br/>";
  // TODO: 1 click "copy" button
  message += "<hr/>Raw transaction Tab:<br/>";
  message += "If your wallet does not support the bisurl feature, you can send the vote transaction by pasting the following info:<br/>";
  message += "recipient: " + transaction["recipient"] + "<br/>";
  message += "amount: " + transaction["amount"] + "<br/>";
  message += "operation: " + transaction["operation"] + "<br/>";
  message += "openfield/data: " + transaction["openfield"] + "<br/>";
  // TODO: 1 click "copy" buttons

  message += "<hr/>Pawer Tab:<br/>";
  message += "If you're using Pawer, copy and paste this command to send your vote: <br/>";
  let pawer = "pawer operation " + transaction["operation"] + " " + transaction["recipient"] + " " + transaction["amount"] + " " + transaction["openfield"];
  message += pawer;
  // TODO: 1 click "copy" buttons


  message += "<hr/>Advanced/Debug tab:<br/>";
  // master seed derived from the mnemonic
  message += "Master 512 bits Seed: " + seed.toString("hex") + "<br/>";
  message += "Derivation path: m/" + address + "/" + MOTION_TXID + "<br/>";
  message += "Voting key: " + utils.bytesToHex(voting_key.seed) + "<br/>";
  message += "AES Key: " + utils.bytesToHex(aes_key) + "<br/>";
  result.innerHTML = message;
}


function generate_reveal() {

  // TODO: mostly copy/paste from generate_vote, factorize code.

  // TODO: check timestamps

  const mnemonic = document.querySelector('#master-key').value;
  // TODO: block if empty or less than 12 words
  const valid = bip39.validateMnemonic(mnemonic);
  // TODO: If valid is false, then warn the user but go on anyway.
  // mnemonic created by a BIP39 compatible tool will validate, but we have to account for other generators to be safe.
  console.log("Valid mnemonic:", valid);

  const address = document.querySelector('#wallet-address').value;
  // TODO: trim address and validate, give feedback to user if invalid
  // A valid bis address matches either one of these regexps:
  // RE_RSA_ADDRESS "^[abcdef0123456789]{56}$"
  // RE_ECDSA_ADDRESS "^Bis1[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{28,52}$"
  // We can use "Bis_test_address1" - that does not validate - to test the GUI with test vectors

  // No need for option nor amount

  // This part is redundant, done by VotingTransaction later on, but can be useful for debug (advanced tab).
  const seed = bip39.mnemonicToSeedSync(mnemonic, DEFAULT_PASSWORD);
  const master_key = new DerivableKey(seed);
  let voting_key = master_key.derive(address).derive(MOTION_TXID);
  let aes_key = voting_key.to_aes_key()

  const voting_transaction = new VotingTransaction(seed, address, MOTION_ID, MOTION_TXID, MOTION_ADDRESS);
  const transaction = voting_transaction.get_reveal_transaction();
  console.log(transaction);


  const element = document.querySelector('#result');
  const message = `
  <div id="bis-tab">
  REVEAL TRANSACTION<hr/>BIS URL Tab:<br/>
  Send the following BisUrl from the related wallet: ${transaction['bis_url']}<br/>
  <hr/>Raw transaction Tab:<br/>
  If your wallet does not support the bisurl feature, you can send the vote transaction by pasting the following info:<br/>
  recipient: ${transaction["recipient"]}<br/>
  amount: ${transaction["amount"]}<br/>
  operation: ${transaction["operation"]}<br/>
  openfield/data: ${transaction["openfield"]}<br/>
  </div>
  <div id="pawer-tab">
  <hr/>Pawer Tab:<br/>
  If you're using Pawer, copy and paste this command to send your vote: <br/>
  pawer operation ${transaction["operation"]} ${transaction["recipient"]} ${transaction["amount"]} ${transaction["openfield"]}
  </div>
  <div id="advanced-tab">
  <hr/>Advanced/Debug tab:<br/>
  Master 512 bits Seed: ${seed.toString("hex")}<br/>
  Derivation path: m/${address}/${MOTION_TXID}<br/>
  Voting key: ${utils.bytesToHex(voting_key.seed)}<br/>
  AES Key: ${utils.bytesToHex(aes_key)}<br/>
  </div>
  `;
  // master seed derived from the mnemonic

  result.innerHTML = message;
}



function component() {
  const element = document.createElement('div');

  /*
    const mnemonic = bip39.entropyToMnemonic('00000000000000000000000000000000');
    element.innerHTML = _.join(['Mnemonic', mnemonic], ' ');
  
    //console.log("seed");
    bip39.mnemonicToSeed('letter advice cage absurd amount doctor acoustic avoid letter advice cage above', DEFAULT_PASSWORD).then(bytes => bytes.toString('hex')).then(console.log);
    //bip39.mnemonicToSeed('letter advice cage absurd amount doctor acoustic avoid letter advice cage above', DEFAULT_PASSWORD).then(console.log);
  
    console.log(derivableKeyVersion);
  
    const master_key = new DerivableKey(utils.hexToBytes(TEST_SEED_HEX));
    console.log("Master " + master_key);
    console.log("Master seed", master_key.seed);
    console.log("Master seed h1", master_key.seed.toString('hex')); // ???
    console.log("Master seed h2", utils.bytesToHex(master_key.seed));
    const pubkey = master_key.to_pubkey()
    console.log("pubkey " + utils.bytesToHex(pubkey));
    const address_key1 = master_key.derive("Bis_test_address1");
    console.log("Seed1 " + utils.bytesToHex(address_key1.seed));
    console.log("AES1 " + utils.bytesToHex(address_key1.to_aes_key()));
    const motion_key1a = address_key1.derive("motion_1_txid_this_would_be_a_b64_encoded_string");
    console.log("Seed1a " + utils.bytesToHex(motion_key1a.seed));
    console.log("AES1a " + utils.bytesToHex(motion_key1a.to_aes_key()));
    let encrypted = motion_key1a.encrypt_vote('B', true);
    console.log("encrypted1a B" + utils.bytesToHex(encrypted));
    console.log("encrypted1a B b64", Buffer.from(encrypted).toString('base64'));
    // B 7b74501d577bc84c655bfcb3c91fc5f3  - Message e3RQHVd7yExlW/yzyR/F8w==
    encrypted = motion_key1a.encrypt_vote('A', true);
    console.log("encrypted1a A" + utils.bytesToHex(encrypted));
    console.log("encrypted1a A b64", Buffer.from(encrypted).toString('base64'));
    // A A41fea09e3f2e12886c6a24ff73c203d2 -  Message Qf6gnj8uEohsaiT/c8ID0g==
    */
  return element;
}

// TODO: harmonize ids
document.querySelector('#btn-generate').addEventListener('click', generate_seed);
document.querySelector('#generate-vote-url').addEventListener('click', generate_vote);
document.querySelector('#generate-reveal-url').addEventListener('click', generate_reveal);
document.body.appendChild(component());

const voteAButton = document.querySelector('#btn-vote-a');
const voteBButton = document.querySelector('#btn-vote-b');

voteAButton.addEventListener('click', () => {
  vote = 'A';
  // add green color to button A and remove from B
  voteAButton.classList.replace('bg-gray-200', 'bg-green-400');
  voteAButton.classList.replace('hover:bg-gray-300', 'hover:bg-green-500');
  voteBButton.classList.replace('bg-green-400', 'bg-gray-200');
  voteBButton.classList.replace('hover:bg-green-500', 'hover:bg-gray-300');
});
voteBButton.addEventListener('click', () => {
  vote = 'B';
  // add green color to button B and remove from A
  voteBButton.classList.replace('bg-gray-200', 'bg-green-400');
  voteBButton.classList.replace('hover:bg-gray-300', 'hover:bg-green-500');
  voteAButton.classList.replace('bg-green-400', 'bg-gray-200');
  voteAButton.classList.replace('hover:bg-green-500', 'hover:bg-gray-300');
});

// TODO: add listeners to remove errors when value changes
// TODO: remove Generate button when the field has value

// TABS
const tabsWrapEl = document.querySelector('#tabs-wrap');
// const tabsActiveClasses = 
Array.from(document.querySelector('.tabs')).forEach(tabEl => {
  tabEl.addEventListener('click', () => {
    // remove current active tab
    tabsWrapEl
    // set new active tab
    tabsWrapEl.querySelector(`#${tabEl.dataset.id}`).classList
  })
})

const resElement = document.querySelector('#result');
resElement.innerHTML = `
  <div id="bis-url-tab" class="">
  REVEAL TRANSACTION<hr/>BIS URL Tab:<br/>
  Send the following BisUrl from the related wallet: klsandcjasbdfsad c,asdjbclasd<br/>
  </div>
  <div id="raw-txn-tab" class="hidden">
  <hr/>Raw transaction Tab:<br/>
  If your wallet does not support the bisurl feature, you can send the vote transaction by pasting the following info:<br/>
  recipient: klsandcjasbdfsad c,asdjbclasd<br/>
  amount: klsandcjasbdfsad c,asdjbclasd<br/>
  operation: klsandcjasbdfsad c,asdjbclasd<br/>
  openfield/data: klsandcjasbdfsad c,asdjbclasd<br/>
  </div>
  <div id="pawer-tab" class="hidden">
  <hr/>Pawer Tab:<br/>
  If you're using Pawer, copy and paste this command to send your vote: <br/>
  pawer operation command
  </div>
  <div id="advanced-tab" class="hidden">
  <hr/>Advanced/Debug tab:<br/>
  Master 512 bits Seed: klsandcjasbdfsad c,asdjbclasd<br/>
  Derivation path: m/klsandcjasbdfsad c,asdjbclasd<br/>
  Voting key: klsandcjasbdfsad c,asdjbclasd<br/>
  AES Key: klsandcjasbdfsad c,asdjbclasd<br/>
  </div>
  `;