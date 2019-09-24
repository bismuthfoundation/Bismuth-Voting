#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Tests for DerivableKey and AES encryption/decryption class

run with pytest -v
"""

import sys
from base64 import b64encode, b64decode

sys.path.append("../")
from bismuthvoting.derivablekey import DerivableKey


TEST_MNEMONIC = (
    "letter advice cage absurd amount doctor acoustic avoid letter advice cage above"
)
# Matching seed
TEST_SEED_HEX = "95a7ecb56bda5eba808eec2407b418002b824c6c1cb159ec44b8371405629f8429419e98e1b67fc6367368f5d82871a501bbc655a62d31e8391411d7a6e74b86"


def test_encrypt(verbose=False):
    # Get the master key from mnemonic
    master_key = DerivableKey(seed=bytes.fromhex(TEST_SEED_HEX))
    # Derive the test address key
    address_key1 = master_key.derive("Bis_test_address1")
    # And the test motion key
    motion_key1a = address_key1.derive(
        "motion_1_txid_this_would_be_a_b64_encoded_string"
    )
    assert (
        motion_key1a.to_aes_key().hex()
        == "fdbe119cf50392b483e072af11b6731cfbb457e35e54e811e3f1ca1fae4ceece"
    )
    # here we pad with zeroes for reproducible tests
    encrypted = DerivableKey.encrypt_vote(
        motion_key1a.to_aes_key(), "B", pad_with_zeroes=True
    )
    if verbose:
        print("Encrypted motion_key1a B", encrypted.hex())
    assert encrypted == b"{tP\x1dW{\xc8Le[\xfc\xb3\xc9\x1f\xc5\xf3"
    message = b64encode(encrypted).decode("utf-8")
    if verbose:
        print("Message B", message)
    assert message == "e3RQHVd7yExlW/yzyR/F8w=="

    encrypted = DerivableKey.encrypt_vote(
        motion_key1a.to_aes_key(), "A", pad_with_zeroes=True
    )
    if verbose:
        print("Encrypted motion_key1a A", encrypted.hex())
    message = b64encode(encrypted).decode("utf-8")
    if verbose:
        print("Message A", message)
    assert message == "Qf6gnj8uEohsaiT/c8ID0g=="
    if verbose:
        # here we pad with random
        encrypted = DerivableKey.encrypt_vote(motion_key1a.to_aes_key(), "B")
        print("Encrypted Random padding ", encrypted)
        message = b64encode(encrypted).decode("utf-8")
        print("Message Random padding", message)


def test_decrypt(verbose=False):
    aes_key = bytes.fromhex(
        "fdbe119cf50392b483e072af11b6731cfbb457e35e54e811e3f1ca1fae4ceece"
    )
    message = "e3RQHVd7yExlW/yzyR/F8w=="  # test vector, with 0 padding
    message = b64decode(message)
    clear_text = DerivableKey.decrypt_vote(aes_key, message)
    print("Clear text", clear_text)
    message_random = "o6V4cc5ExWNRzpRx18agkA=="  # Same vote, with random padding
    message_random = b64decode(message_random)
    clear_text = DerivableKey.decrypt_vote(aes_key, message_random)
    print("Clear text random", clear_text)


if __name__ == "__main__":
    test_encrypt(verbose=True)
    test_decrypt(verbose=True)
