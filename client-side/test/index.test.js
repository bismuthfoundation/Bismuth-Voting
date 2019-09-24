const { mnemonicToSeedSync } = require("bip39");

const derivableKey = require("../src/derivableKey.js");
const utils = require("../src/utils.js");
var DerivableKey = derivableKey.DerivableKey;

const defaultPassword = "BismuthGVP";

const testMnemonic = "letter advice cage absurd amount doctor acoustic avoid letter advice cage above";
const testSeedHex = "95a7ecb56bda5eba808eec2407b418002b824c6c1cb159ec44b8371405629f8429419e98e1b67fc6367368f5d82871a501bbc655a62d31e8391411d7a6e74b86";
const testPubkeyHex = "0418b9908d43f503ae8ed3128c35edd8e0b9350c01a389bf5d83aece4822722b6223dbfaec15801253d658356836802a43c401fed1415a312f1a09f52d96a52ae4";


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
