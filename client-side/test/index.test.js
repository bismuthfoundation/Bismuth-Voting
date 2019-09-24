const { mnemonicToSeedSync } = require("bip39");

const derivableKey = require("../src/derivableKey.js");
const utils = require("../src/utils.js");
var DerivableKey = derivableKey.DerivableKey;

const defaultPassword = "BismuthGVP";

const testMnemonic = "letter advice cage absurd amount doctor acoustic avoid letter advice cage above";
const testSeedHex = "95a7ecb56bda5eba808eec2407b418002b824c6c1cb159ec44b8371405629f8429419e98e1b67fc6367368f5d82871a501bbc655a62d31e8391411d7a6e74b86";
const testPubkeyHex = "0418b9908d43f503ae8ed3128c35edd8e0b9350c01a389bf5d83aece4822722b6223dbfaec15801253d658356836802a43c401fed1415a312f1a09f52d96a52ae4";
const address_key1HexSeed = "c5d44637eb43b04bfa07b8cf1272e22d95a740126cd9e1ab7363840f118a9ebf6671d081ea1f89f13aad09c1a92dabd62eb1c0e81b701f8116b7401a30a98867";

describe("Seed Tests", () => {
  test("should convert mnemonic to seed", () => {
    const seed = mnemonicToSeedSync(testMnemonic, defaultPassword).toString("hex");
    expect(seed).toBe(testSeedHex);
  });
});

describe("ECDSA Tests", () => {
  test("Get pubkey from seed", () => {
    const pubkey = new DerivableKey(utils.hexToBytes(testSeedHex)).to_pubkey();
    expect(utils.bytesToHex(pubkey)).toBe(testPubkeyHex);
  });
});

describe("Derivation Tests", () => {
  test("Derive test Address1", () => {
    const master_key = new DerivableKey(utils.hexToBytes(testSeedHex));
    const address_key1 = master_key.derive("Bis_test_address1");
    expect(utils.bytesToHex(address_key1.seed)).toBe(address_key1HexSeed);
  });
});
