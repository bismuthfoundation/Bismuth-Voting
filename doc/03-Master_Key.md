#  Voting master key

The master key is not a requirement but a convenient way of generating and storing several keys.  
The Bismuth Voting Protocol (BVP) requires a new key to be created for every address and every motion. That key is then made public and no more used.

You can think of the master key as an "identity secret key".    
With your master key you can (re)build as many keys as you want, no matter the number of addresses you want to vote with or the number of votes you issue.

Specifying a format for that masterkey - from a well known and standard algorithm - allows all implementations to use it and avoid future incompatibilities.


## Abstract

The master key follows BIP-39 specifications.  
It's a 256 bits seed generated from a mnemonic, according to https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki

We only use english wordlist fior the time being.

## Formats

- BIP39 Mnemonic is a string, ascii, 15 to 24 english words, lower case.
- BIP39 seed is the resulting 256 bits key, hex format, lowercase.
- Entropy is 128 to 256 bits, hex format, lowercase.

## User flow

- User enters his mnemonic/entropy or creates a new random one
- Entropy is stored in the wallet - encrypted if the wallet is encrypted
- BIP39 Mnemonic can be restored from the Entropy any time.

- The wallet / Voting client derives a new "address key" for every address of the wallet (can be done live)
- The wallet / Voting client derives a new "voting key" from the address key for every motion to vote upon.

- the voting key is used to encrypt the vote transactions and is revealed at the end of the process.

No matter how many addresses he wants to vote with, the user only has one single mnemonic to backup. 
 
## Test vectors

See default BIP39 test vectors https://github.com/trezor/python-mnemonic/blob/master/vectors.json

See tests/test_BIP39.py for our matching tests.
 
## Useful links

Reference implementation (Python)  
http://github.com/trezor/python-mnemonic

Online JS implementation, allows to get BIP39 seed from a BIP39 mnemonic  
https://iancoleman.io/bip39/

Bitcoinjs library  
https://github.com/bitcoinjs/bip39
