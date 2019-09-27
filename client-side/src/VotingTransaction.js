const { DerivableKey } = require("./DerivableKey");
const bisurl = require("./bisurl");
var bisUrl = bisurl.bisUrl;

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

VotingTransaction.prototype.get_vote_transaction = function (vote_option, vote_amount) {
  // Returns transaction json, including bisurl, for given path and option

  // TODO: make sure vote_amount is a float
  transaction = { "amount": vote_amount, "recipient": this.motion_address, "operation": "bgvp:vote" }

  transaction['openfield'] = this.motion_id.toString() + ":" + this.key.encrypt_vote_b64(vote_option);

  transaction['bis_url'] = bisUrl(transaction);

  return transaction;
}

VotingTransaction.prototype.get_reveal_transaction = function () {
  // Returns transaction json, including bisurl, for given path and option

  transaction = { "amount": 0, "recipient": this.motion_address, "operation": "bgvp:reveal" }

  transaction['openfield'] = this.motion_id.toString() + ":" +  this.key.reveal_key_b64();

  transaction['bis_url'] = bisUrl(transaction);

  return transaction;
}


module.exports = {
  version: "0.0.2",
  VotingTransaction
};
