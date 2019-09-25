const createHash = require('create-hash');
var Ascii85 = require('ascii85').Ascii85;

var bisurl = exports;

bisurl.bisUrl = bisUrl;
bisurl.checksum = checksum;


function checksum(string) {
    //  checksum for bisurl
    buffer = Buffer.from(string);
    md5 = createHash('md5').update(buffer).digest();
    var encoder = new Ascii85({
        // Use RFC194 table
        table: [
            '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
            'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
            'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
            '!', '#', '$', '%', '&', '(', ')', '*', '+', '-', ';', '<', '=', '>', '?', '@', '^', '_', '`', '{', '|', '}', '~'
        ]
    });
    encoded = encoder.encode(md5).toString()
    return encoded;
}

function bisUrl(transaction) {
    //  Assemble a bis url from json transaction data
    return "TODO";
}
