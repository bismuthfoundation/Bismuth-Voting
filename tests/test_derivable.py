#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Tests for DerivableKey class

run with pytest -v
"""

# import pytest
import sys


sys.path.append("../")
from bismuthvoting.bip39 import BIP39
from bismuthvoting.derivablekey import DerivableKey


TEST_MNEMONIC = (
    "letter advice cage absurd amount doctor acoustic avoid letter advice cage above"
)
# Matching seed
TEST_SEED_HEX = "95a7ecb56bda5eba808eec2407b418002b824c6c1cb159ec44b8371405629f8429419e98e1b67fc6367368f5d82871a501bbc655a62d31e8391411d7a6e74b86"


def test_seed(verbose=False):
    bip39 = BIP39.from_mnemonic(TEST_MNEMONIC)
    if verbose:
        print("Entropy", bip39.entropy.hex())
    assert bip39.entropy.hex() == "80808080808080808080808080808080"
    seed = bip39.to_seed()
    if verbose:
        print("Seed", seed.hex())
    assert seed.hex() == TEST_SEED_HEX
    key = DerivableKey(seed=seed)
    if verbose:
        print("Pubkey", key.to_pubkey().hex())
        print("AES key", key.to_aes_key().hex())
    assert (
        key.to_pubkey().hex()
        == "0418b9908d43f503ae8ed3128c35edd8e0b9350c01a389bf5d83aece4822722b6223dbfaec15801253d658356836802a43c401fed1415a312f1a09f52d96a52ae4"
    )
    assert (
        key.to_aes_key().hex()
        == "3b49e2c776a2a8c3a1b5666ab19e3b1103bb4a435efc70eadf829bfd59c06e20"
    )


def test_derive(verbose=False):
    master_key = DerivableKey(seed=bytes.fromhex(TEST_SEED_HEX))
    address_key1 = master_key.derive("Bis_test_address1")
    if verbose:
        print("Seed1", address_key1.seed.hex())
        print("AES1", address_key1.to_aes_key().hex())
    assert (
        address_key1.seed.hex()
        == "c5d44637eb43b04bfa07b8cf1272e22d95a740126cd9e1ab7363840f118a9ebf6671d081ea1f89f13aad09c1a92dabd62eb1c0e81b701f8116b7401a30a98867"
    )
    assert (
        address_key1.to_aes_key().hex()
        == "e04dd85a24c134292713e7896d67669751aca36910d134245f97b8ea3652989b"
    )
    address_key2 = master_key.derive("Bis_test_address2")
    if verbose:
        print("Seed2", address_key2.seed.hex())
        print("AES2", address_key2.to_aes_key().hex())
    assert (
        address_key2.seed.hex()
        == "0f7aca6e77d9623637089a004947cbd8cae7fda8560ecd02731d378b297b4c4d816aaf5000c7306edcc96ba8182d1c0153f54ac952875b12ea93470861cafe14"
    )
    assert (
        address_key2.to_aes_key().hex()
        == "5fff141d265e752c83099b9a491dcd161637a92b870fb0b3558d0689f5b0f6ef"
    )

    motion_key1a = address_key1.derive(
        "motion_1_txid_this_would_be_a_b64_encoded_string"
    )
    if verbose:
        print("Seed1a", motion_key1a.seed.hex())
        print("AES1a", motion_key1a.to_aes_key().hex())
    assert (
        motion_key1a.seed.hex()
        == "874b74454b3c073320fcca8aacf0b5cf606550aaa5cac0fa718078ca5ecff6b43ee220e340fbfdd51d9202c2598f2f8930777c4d146c41a2bf915101a4bd72cb"
    )
    assert (
        motion_key1a.to_aes_key().hex()
        == "fdbe119cf50392b483e072af11b6731cfbb457e35e54e811e3f1ca1fae4ceece"
    )

    motion_key1b = address_key1.derive(
        "motion_2_txid_this_would_be_a_b64_encoded_string"
    )
    if verbose:
        print("Seed1b", motion_key1b.seed.hex())
        print("AES1b", motion_key1b.to_aes_key().hex())
    assert (
        motion_key1b.seed.hex()
        == "f5fef68b6e7fbc7d518506a924687e75590ff557b61f4c56f1df1b1ec7b852b80d98113e35eebd3e3df500f4caa071044043c03d47bba613ce5b68c121a62bae"
    )
    assert (
        motion_key1b.to_aes_key().hex()
        == "59d33c0c38dd1a292245116ab2bf0911b0aa61a15523f4b7cb23be498e3bf7ce"
    )


if __name__ == "__main__":
    test_seed(verbose=True)
    test_derive(verbose=True)
