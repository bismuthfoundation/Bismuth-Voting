const { mnemonicToSeedSync } = require("bip39");

describe("Seed Tests", () => {
  test("should convert mnemonic to seed", () => {
    const seed = mnemonicToSeedSync(
      "letter advice cage absurd amount doctor acoustic avoid letter advice cage above",
      "BismuthGVP"
    ).toString("hex");
    expect(seed).toBe(
      "95a7ecb56bda5eba808eec2407b418002b824c6c1cb159ec44b8371405629f8429419e98e1b67fc6367368f5d82871a501bbc655a62d31e8391411d7a6e74b86"
    );
  });
});
