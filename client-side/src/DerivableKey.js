const bip39 = require('bip39');
const crypto = require("crypto");
const eccrypto = require("eccrypto");
const BN = require('bn.js');
const createHash = require('create-hash');
const createHmac = require('create-hmac');
const aesjs = require('aes-js');
//const bindexOf = require('buffer-indexof');
//var utf8 = require('utf8-encoding');
//var encoder = new utf8.TextEncoder();
//var decoder = new utf8.TextDecoder();

const utils = require("./utils.js");

function DerivableKey(seed) {
  this.seed = seed;
  // Convert privkey to required format
  if (seed) {
    this.privkey = Buffer.from(this.seed.slice(0, 32));
    this.chainCode = Buffer.from(this.seed.slice(32));
  }
}


function hmacSHA512(key, data) {
  return createHmac('sha512', key).update(data).digest();
}


/*
function splitBuffer(buf,splitBuf,includeDelim){
// From https://www.npmjs.com/package/buffer-split
  var search = -1
  , lines = []
  , move = includeDelim?splitBuf.length:0
  ;
  while((search = bufferIndexOf(buf,splitBuf)) > -1){
    lines.push(buf.slice(0,search+move));
    buf = buf.slice(search+splitBuf.length,buf.length);
  }
  lines.push(buf);
  return lines;
}
*/

//module.exports = DerivableKey

DerivableKey.prototype.to_pubkey = function () {
    //Computes and sends back pubkey, point(kpar) of current key(kpar)
    if (this.pubkey === undefined) this.pubkey = eccrypto.getPublic(this.privkey);
    return this.pubkey;
    /*
    kpar = PrivateKey.from_hex(this.seed[:32].hex())
    K = kpar.public_key.format(compressed=False)
    return K
    */
}

DerivableKey.prototype.to_aes_key = function () {
    // Returns sha256 hash of the pubkey, to use as AES key
    if (this.aeskey === undefined) this.aeskey = createHash('sha256').update(this.to_pubkey()).digest();
    return this.aeskey;
    /* pubkey = self.to_pubkey()
    return sha256(pubkey).digest()
    */
}

DerivableKey.prototype.derive = function (s) {
    //Derive with given buffer
    var data = Buffer.from(utils.bytesToHex(this.to_pubkey()) + s);
    //console.log("data", data);
    //console.log("datahex", utils.bytesToHex(data));
    // datahex 303431386239393038643433663530336165386564333132386333356564643865306239333530633031613338396266356438336165636534383232373232623632323364626661656331353830313235336436353833353638333638303261343363343031666564313431356133313266316130396635326439366135326165344269735f746573745f6164647265737331
    const I = hmacSHA512(this.chainCode, data);
    const IL = I.slice(0, 32);
    //console.log("IL", utils.bytesToHex(IL));
    // IL 302c59827f6951917978ccab0abeca2d6a24f3a6502887bf2eab4cfb0c27ff3b
    const IR = I.slice(32);
    //console.log("Seedp", utils.bytesToHex(this.privkey));
    // seedp 95a7ecb56bda5eba808eec2407b418002b824c6c1cb159ec44b8371405629f84
    //const ks = new BN(this.privkey, 16).add(new BN(IL, 16));
    const ks = new BN(IL, 16).add(new BN(this.privkey, 16));
    ks_string = ks.toString('hex').slice(-64);  // Slice does the modulo 2**256
    //console.log("ks", ks_string);
    // ks_hex c5d44637eb43b04bfa07b8cf1272e22d95a740126cd9e1ab7363840f118a9ebf
    const seed_string = ks_string + IR.toString('hex');
    //console.log("seed_string", seed_string);
    return new DerivableKey(utils.hexToBytes(seed_string));
    /*
    data = this.to_pubkey().hex() + s
    I = hmac.new(self.seed[32:], data.encode("utf-8"), sha512).digest()
    IL, IR = I[:32], I[32:]
    ks_int = (string_to_int(IL) + string_to_int(self.seed[:32])) % FIELD_ORDER
    ks = int_to_string(ks_int)
    cs = IR
    return DerivableKey(seed=ks + cs)
    */

    /* key_motion 1a
    IL c1772e0d5ff856e726f511bb9a7dd3a1cabe109838f0df4efe1cf4bb4d4557f5
    seed c5d44637eb43b04bfa07b8cf1272e22d95a740126cd9e1ab7363840f118a9ebf
    ks_hex 874b74454b3c073320fcca8aacf0b5cf606550aaa5cac0fa718078ca5ecff6b4
    Seed1a 874b74454b3c073320fcca8aacf0b5cf606550aaa5cac0fa718078ca5ecff6b43ee220e340fbfdd51d9202c2598f2f8930777c4d146c41a2bf915101a4bd72cb
    AES1a fdbe119cf50392b483e072af11b6731cfbb457e35e54e811e3f1ca1fae4ceece
    */

}

DerivableKey.prototype.encrypt = function (data, iv, aes_key=null) {
    // Generic AES buffer encryption

    //var textBytes = encoder.encode(text_data);
    /*
    console.log("aes_hex", aes_key.toString('hex'));
    console.log("data_hex", data.toString('hex'));
    console.log("iv_hex", iv.toString('hex'));
    */
    /*
    aes key fdbe119cf50392b483e072af11b6731cfbb457e35e54e811e3f1ca1fae4ceece
            fdbe119cf50392b483e072af11b6731cfbb457e35e54e811e3f1ca1fae4ceece
    aes data 42200000000000000000000000000000
             42200000000000000000000000000000
    aes iv 4269736d75746820424756502049562e
           4269736d75746820424756502049562e
    */

    if (!aes_key) {
        aes_key = this.to_aes_key();
    }
    // var aesCbc = new aesjs.CBC(aes_key, iv);
    var aesCbc = new aesjs.ModeOfOperation.cbc(aes_key, iv);
    /*var encryptedBytes = new Uint8Array(data.length);
    aesCbc.encrypt(data, encryptedBytes);
    */
    var encryptedBytes = aesCbc.encrypt(data);
    return encryptedBytes;
    /*
    assert len(aes_key) == 32
    # AES is stateful, needs one instance per operation
    aes = AES.new(aes_key, AES.MODE_CBC, iv=iv)
    encrypted = aes.encrypt(data)
    return encrypted
    */
}

DerivableKey.prototype.encrypt_vote = function (data, pad_with_zeroes=false, iv=null, aes_key=null) {
    // Dedicated method to encrypt vote message
    if (pad_with_zeroes) {
        var buffer16 = Buffer.alloc(16); // fills with 0
    } else {
        var buffer16 = crypto.randomBytes(16); // "random"
    }
    // Add space to vote option
    var buffer = Buffer.from(data + ' ');
    buffer = Buffer.concat([buffer, buffer16], 16); // padds to 16
    // console.log("Buffer", buffer);
    if (!iv) {
        iv = Buffer.from("Bismuth BGVP IV.");
    }
    return this.encrypt(buffer, iv, aes_key);

    /*    data += " "
        data = data.encode("utf-8")
        # Pad to 16 bytes -
        data = random_padding(data, 16, pad_with_zeros=pad_with_zeroes)
        if iv is None:
            # iv is needed for CBC, we use a fixed iv - 16 bytes long - to limit data to transmit by default.
            iv = "Bismuth BGVP IV.".encode("utf-8")
        return cls.encrypt(aes_key, data, iv)
     */
}

DerivableKey.prototype.encrypt_vote_b64 = function (data, pad_with_zeroes=false, aes_key=null) {
    var encrypted = this.encrypt_vote(data, pad_with_zeroes, null, aes_key);
    return Buffer.from(encrypted).toString('base64');
}


DerivableKey.prototype.decrypt = function decrypt(data, iv, aes_key=null) {
    // Generic AES buffer decryption
    if (!aes_key) {
        aes_key = this.to_aes_key();
    }
    var aesCbc = new aesjs.ModeOfOperation.cbc(aes_key, iv);
    var decryptedBytes = aesCbc.decrypt(data);
    return decryptedBytes;
}

DerivableKey.prototype.decrypt_vote_b64 = function (b64_string, aes_key=null) {
    var buffer = Buffer.from(b64_string, 'base64');
    const iv = Buffer.from("Bismuth BGVP IV.");
    decrypted = this.decrypt(buffer, iv, aes_key);
    // Split at space
    decrypted = decrypted.slice(0, decrypted.indexOf(32));
    //console.log("decrypted", decrypted);
    //console.log("decrypted hex", Buffer.from(decrypted).toString('ascii'));
    return Buffer.from(decrypted).toString('ascii');
}


DerivableKey.prototype.reveal_key_b64 = function (aes_key=null) {
    // b64 encoded version of the aes key
    if (!aes_key) {
        aes_key = this.to_aes_key();
    }
    return Buffer.from(aes_key).toString('base64');
}

module.exports = {
    version: "0.0.3",
    DerivableKey
}