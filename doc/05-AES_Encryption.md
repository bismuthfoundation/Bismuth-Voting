# Votes encryption and decryption

Every vote - and further vote change - is encrypted with a disposable key for the motion.  
That key is 256 bits large and is used to encrypt the message with AES in CBC mode.  
In order to reveal the vote, the key is then sent.

## AES parameters

- 256 bits key len
- Initialization vector is fixed to the "Bismuth BGVP IV." string (16 bytes large)

## Message formatting

Real message content is only the vote option (One char)  
One space is added, then the message is padded to 16 bytes with random bytes.

Once encrypted, the message will be base64 encoded as part of the data payload.

When decrypting a vote message, the first space char is used to split the vote from the random padding.

The key reveal message is the 256 bits key, b64 encoded as well. 

## Test vectors

TODO
