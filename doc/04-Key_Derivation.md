# Key derivation

Voting keys are 256 bits keys, unique for each address and motion.  
They are supposed to be derived from a single master key, using a BIP32 Like derivation path

- Address keys are derived from master key and address
- Motion key is derived from Address key and Motion id

See BIP32 for reference and conventions used in the present document: https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki

Keys will be extended keys (512 bits) with only the public part used as voting key.    
We only use normal child keys.

For key derivation purposes, keys are considered as ecdsa keys (secp256k1) but will be used to encode the messages with AES block cipher.

> Following existing and heavily field tested algorithms avoids flaws of "roll your own crypto" like extension attacks.

## Derive a child key from a parent key

S is an ASCII string, representing either a BIS address or a txid

serP(P) serialize the coordinate pair P = (x, y) as a 64 byte sequence, hex encoded.

The function CKDpriv((kpar, cpar), S) → (ks, cs) computes a child extended private key from the parent extended private key:

- let I = HMAC-SHA512(Key = cpar, Data = serP(point(kpar)) || S).
- Split I into two 32-byte sequences, IL and IR.
- The returned child key ks is parse256(IL) + kpar (mod n).
- The returned chain code cs is IR.
- In case parse256(IL) ≥ n or ks = 0, the resulting key is invalid, and one should append a "*" char to S.

- The key used for AES encrypting the vote is the first 32-bytes of Ks where Ks is point(parse256(IL)) + Kpar.

## Implementation

See DerivableKey for our reference python implementation.

## Tests and test vectors

See tests directory.
