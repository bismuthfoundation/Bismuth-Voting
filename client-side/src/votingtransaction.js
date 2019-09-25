const derivableKey = require("./derivableKey.js");
var DerivableKey = derivableKey.DerivableKey;

var votingtransaction = exports;

votingtransaction.version = "0.0.2";
votingtransaction.VotingTransaction = VotingTransaction;

votingtransaction.bisurl = bisurl;
votingtransaction.checksum = checksum;

// TODO: bisurl functions could be in a separate module for other uses.

function checksum(string) {
    //  checksum for bisurl
    return "TODO";
}

function bisurl(transaction) {
    //  Assemble a bis url from json transaction data
    return "TODO";
}


function VotingTransaction(seed, address, motion_id, motion_txid, motion_address) {
  // We could accept word seed or seed, and derive seed from word seed depending on input type.
  this.seed = seed;
  if (seed) {
    // precalc real key
    this.key = new DerivableKey(seed).derive(address).derive(motion_txid);
    this.motion_id = motion_id;
    this.motion_address = motion_address;
  }
}

VotingTransaction.prototype.get_vote_transaction = function get_vote_transaction(vote_option, vote_amount) {
    // Returns transaction json, including bisurl, for given path and option

    // TODO: make sure vote_amount is a float
    transaction = {"amount": vote_amount, "recipient": this.motion_address, "operation": "bgvp:vote"}

    transaction['openfield'] = this.motion_id.toString() + ":" + this.key.encrypt_vote_b64(vote_option);

    transaction['bis_url'] = bisurl(transaction);

    return transaction;
}
