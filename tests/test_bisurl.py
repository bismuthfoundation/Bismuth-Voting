#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Tests for bisurl generation, makes test vectors for js implementation

run with pytest -v
"""

from bismuthclient.bismuthutil import BismuthUtil, checksum


def test_checksum(verbose=False):
    string = "sample test string"
    check = checksum(string)
    if verbose:
        print("Checksum 1", check)
    assert (check == "%<5v~^9@2P5<8#Yuq@P;")

    string = "bis://pay/01234567890/10.00/operation/openfield/"
    check = checksum(string)
    if verbose:
        print("Checksum 2", check)
    assert (check == "Lm<_mNdW3+`@CQs1Aibm")


def test_bisurl(verbose=False):
    url = BismuthUtil.create_bis_url("abcdef0123456789abcdef0123456789abcdef0123456789abcdef01", 0, "op:test", "openfield_data")
    if verbose:
        print("url1", url)
    assert (url == "bis://pay/abcdef0123456789abcdef0123456789abcdef0123456789abcdef01/0/Z*V$vWpi`/Z*XO9W@%+?WM5=qbYT/c89#&9#h%MeO(h*k}9I|")

    url = BismuthUtil.create_bis_url("abcdef0123456789abcdef0123456789abcdef0123456789abcdef01", 0, "bgvp:vote", "0:8ZmHckBjxb0DB8skooVAMw==")
    if verbose:
        print("url2", url)
    assert (url == "bis://pay/abcdef0123456789abcdef0123456789abcdef0123456789abcdef01/0/VrO=6I(Bb#Wd/FgiF|ZAfElLTY$oFhoK)b8ByJRzXd7Jv{/e&RE#IbWW*)0CtVGcN-=")


if __name__ == "__main__":
    test_checksum(verbose=True)
    test_bisurl(verbose=True)
