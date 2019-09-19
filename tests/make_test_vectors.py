#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Beware, running this will recreate some test vector json file in data directory.
Since some vectors use random padding, you'll end up with another test vector set than the official one.
"""

import json
import sys
from base64 import b64encode

sys.path.append("../")
from bismuthvoting.derivablekey import DerivableKey


TEST_MNEMONICS = [
    "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about",
    "letter advice cage absurd amount doctor acoustic avoid letter advice cage above",
    "legal winner thank year wave sausage worth useful legal winner thank yellow",
    "zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo wrong",
    "hamster diagram private dutch cause delay private meat slide toddler razor book happy fancy gospel tennis maple dilemma loan word shrug inflict delay length",
]

TEST_PATHS = [
    "Bis_test_address1/motion_1_txid_this_would_be_a_b64_encoded_string",
    "Bis_test_address1/motion_2_txid_this_would_be_a_b64_encoded_string",
    "Bis_test_address2/motion_1_txid_this_would_be_a_b64_encoded_string",
    "Bis_test_address2/motion_2_txid_this_would_be_a_b64_encoded_string",
]

TEST_VOTES = ["A", "B"]


if __name__ == "__main__":
    items = []
    for mnemonic in TEST_MNEMONICS:
        for path in TEST_PATHS:
            # Get the key
            key = DerivableKey.get_from_path(mnemonic, path)
            aes_key = key.to_aes_key()
            votes = []
            for vote in TEST_VOTES:
                encrypted_message = DerivableKey.encrypt_vote(aes_key, vote)
                b64_message = b64encode(encrypted_message).decode("utf-8")
                votes.append(
                    {
                        "vote_option": vote,
                        "vote_message_hex": encrypted_message.hex(),
                        "vote_data": "0:" + b64_message,
                        "vote_reveal_data": b64encode(aes_key).decode("utf-8"),
                    }
                )
            item = {
                "mnemonic": mnemonic,
                "path": path,
                "seed_hex": key.seed.hex(),
                "aes_key_hex": aes_key.hex(),
                "votes": votes,
            }
            items.append(item)
    with open("data/votes.json", "w") as f:
        json.dump(items, f, indent=2)
