const createHash = require('create-hash');
const { Ascii85 } = require('ascii85');


const encoder = new Ascii85({
    // Use RFC194 table
    table: [
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
        'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
        '!', '#', '$', '%', '&', '(', ')', '*', '+', '-', ';', '<', '=', '>', '?', '@', '^', '_', '`', '{', '|', '}', '~'
    ]
});


function checksum(string) {
    //  checksum for bisurl
    buffer = Buffer.from(string);
    md5 = createHash('md5').update(buffer).digest();
    encoded = encoder.encode(md5).toString()
    return encoded;
}

function bisUrl(transaction) {
    //  Assemble a bis url from json transaction data
    url = "bis://pay/" + transaction['recipient'] + "/"
        + transaction['amount'].toString() + "/"
        + encoder.encode(transaction['operation']).toString() + "/"
        + encoder.encode(transaction['openfield']).toString() + "/";
    chk = checksum(url);
    url += chk;
    return url;
}

module.exports = {
    bisUrl,
    checksum
}