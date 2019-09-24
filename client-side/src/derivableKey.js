const bip39 = require('bip39');
const crypto = require("crypto");
const eccrypto = require("eccrypto");

var derivableKey = exports;

derivableKey.version = "0.0.1";
derivableKey.DerivableKey = DerivableKey;


function DerivableKey(seed) {
  this.seed = seed;
  // Convert privkey to required format
  this.privkey = Buffer.from(this.seed.slice(0, 32));
}

//module.exports = DerivableKey

DerivableKey.prototype.to_pubkey = function to_pubkey() {
    //Computes and sends back pubkey, point(kpar) of current key(kpar)
    if (this.pubkey === undefined) this.pubkey = eccrypto.getPublic(this.privkey);
    return this.pubkey;
    /*
    kpar = PrivateKey.from_hex(this.seed[:32].hex())
    K = kpar.public_key.format(compressed=False)
    return K
    */
}

DerivableKey.prototype.derive = function derive(s) {
    //Derive with given buffer
    /*
    data = this.to_pubkey().hex() + s
    I = hmac.new(self.seed[32:], data.encode("utf-8"), sha512).digest()
    IL, IR = I[:32], I[32:]
    ks_int = (string_to_int(IL) + string_to_int(self.seed[:32])) % FIELD_ORDER
    ks = int_to_string(ks_int)
    cs = IR
    return DerivableKey(seed=ks + cs)
    */
}
