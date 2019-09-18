#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Makes sure BIP39 matches reference implementation

run with pytest -v
"""

import pytest
import json
import sys
from binascii import hexlify, unhexlify


sys.path.append("../")
from bismuthvoting.bip39 import BIP39


def check_list(language, vectors, verbose=False):
    for v in vectors:
        bip39 = BIP39(entropy=unhexlify(v[0]))
        code = bip39.to_mnemonic()
        seed = hexlify(bip39.to_seed(mnemonic=code, passphrase="TREZOR"))
        if sys.version >= "3":
            seed = seed.decode("utf8")
        assert BIP39.check(v[1]) is True
        assert v[1] == code
        assert v[2] == seed
        print(code, "Ok")


def test_vectors(verbose=False):
    with open("data/bip39.json", "r") as f:
        vectors = json.load(f)
    for lang in vectors.keys():
        check_list(lang, vectors[lang], verbose=verbose)


if __name__ == "__main__":
    test_vectors(verbose=True)
    # The test vectors include input entropy, mnemonic and seed. The passphrase "TREZOR" is used for all vectors.
