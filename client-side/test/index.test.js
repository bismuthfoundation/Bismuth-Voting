const { mnemonicToSeedSync } = require("bip39");

const utils = require("../src/utils");
const { DerivableKey } = require("../src/DerivableKey");
const { VotingTransaction } = require("../src/VotingTransaction");

const { bisUrl, checksum } = require("../src/bisurl");

const DEFAULT_PASSWORD = "BismuthGVP";

const TEST_MNEMONIC = "letter advice cage absurd amount doctor acoustic avoid letter advice cage above";
const TEST_SEED_HEX = "95a7ecb56bda5eba808eec2407b418002b824c6c1cb159ec44b8371405629f8429419e98e1b67fc6367368f5d82871a501bbc655a62d31e8391411d7a6e74b86";
const TEST_PUBKEY_HEX = "0418b9908d43f503ae8ed3128c35edd8e0b9350c01a389bf5d83aece4822722b6223dbfaec15801253d658356836802a43c401fed1415a312f1a09f52d96a52ae4";
const ADDRESS_KEY1HEXSEED = "c5d44637eb43b04bfa07b8cf1272e22d95a740126cd9e1ab7363840f118a9ebf6671d081ea1f89f13aad09c1a92dabd62eb1c0e81b701f8116b7401a30a98867";
const MOTION_KEY1AHEXSEED = "874b74454b3c073320fcca8aacf0b5cf606550aaa5cac0fa718078ca5ecff6b43ee220e340fbfdd51d9202c2598f2f8930777c4d146c41a2bf915101a4bd72cb";
const MOTION_KEY1BHEXSEED = "f5fef68b6e7fbc7d518506a924687e75590ff557b61f4c56f1df1b1ec7b852b80d98113e35eebd3e3df500f4caa071044043c03d47bba613ce5b68c121a62bae";

const ADDRESS_AES1HEX = "e04dd85a24c134292713e7896d67669751aca36910d134245f97b8ea3652989b";
const MOTION_AES1AHEX = "fdbe119cf50392b483e072af11b6731cfbb457e35e54e811e3f1ca1fae4ceece";
const MOTION_AES1NHEX = "59d33c0c38dd1a292245116ab2bf0911b0aa61a15523f4b7cb23be498e3bf7ce";


describe("Seed Tests", () => {
  test("should convert mnemonic to seed", () => {
    const seed = mnemonicToSeedSync(TEST_MNEMONIC, DEFAULT_PASSWORD).toString("hex");
    expect(seed).toBe(TEST_SEED_HEX);
  });
});

describe("ECDSA Tests", () => {
  test("Get pubkey from seed", () => {
    const pubkey = new DerivableKey(utils.hexToBytes(TEST_SEED_HEX)).to_pubkey();
    expect(utils.bytesToHex(pubkey)).toBe(TEST_PUBKEY_HEX);
  });
});

describe("Derivation Tests", () => {
  test("Derive test Address1", () => {
    const master_key = new DerivableKey(utils.hexToBytes(TEST_SEED_HEX));
    const address_key1 = master_key.derive("Bis_test_address1");
    expect(utils.bytesToHex(address_key1.seed)).toBe(ADDRESS_KEY1HEXSEED);
  });
  test("Derive test Motion1a", () => {
    const master_key = new DerivableKey(utils.hexToBytes(TEST_SEED_HEX));
    const address_key1 = master_key.derive("Bis_test_address1");
    const motion_key1a = address_key1.derive("motion_1_txid_this_would_be_a_b64_encoded_string");
    expect(utils.bytesToHex(motion_key1a.seed)).toBe(MOTION_KEY1AHEXSEED);
  });
  test("Derive test Motion1b", () => {
    const master_key = new DerivableKey(utils.hexToBytes(TEST_SEED_HEX));
    const address_key1 = master_key.derive("Bis_test_address1");
    const motion_key1b = address_key1.derive("motion_2_txid_this_would_be_a_b64_encoded_string");
    expect(utils.bytesToHex(motion_key1b.seed)).toBe(MOTION_KEY1BHEXSEED);
  });
});

describe("AES Tests", () => {
  test("AES gen from Address1", () => {
    const master_key = new DerivableKey(utils.hexToBytes(TEST_SEED_HEX));
    const address_key1 = master_key.derive("Bis_test_address1");
    expect(utils.bytesToHex(address_key1.to_aes_key())).toBe(ADDRESS_AES1HEX);
  });
  test("AES gen from Motion1a", () => {
    const master_key = new DerivableKey(utils.hexToBytes(TEST_SEED_HEX));
    const address_key1 = master_key.derive("Bis_test_address1");
    const motion_key1a = address_key1.derive("motion_1_txid_this_would_be_a_b64_encoded_string");
    expect(utils.bytesToHex(motion_key1a.to_aes_key())).toBe(MOTION_AES1AHEX);
  });
  test("AES gen from Motion1b", () => {
    const master_key = new DerivableKey(utils.hexToBytes(TEST_SEED_HEX));
    const address_key1 = master_key.derive("Bis_test_address1");
    const motion_key1b = address_key1.derive("motion_2_txid_this_would_be_a_b64_encoded_string");
    expect(utils.bytesToHex(motion_key1b.to_aes_key())).toBe(MOTION_AES1NHEX);
  });
  test("AES encrypt Motion1a A", () => {
    const master_key = new DerivableKey(utils.hexToBytes(TEST_SEED_HEX));
    const address_key1 = master_key.derive("Bis_test_address1");
    const motion_key1a = address_key1.derive("motion_1_txid_this_would_be_a_b64_encoded_string");
    const encrypted = motion_key1a.encrypt_vote('A', true);
    expect(utils.bytesToHex(encrypted)).toBe("41fea09e3f2e12886c6a24ff73c203d2");
  });
  test("AES encrypt Motion1a B", () => {
    const master_key = new DerivableKey(utils.hexToBytes(TEST_SEED_HEX));
    const address_key1 = master_key.derive("Bis_test_address1");
    const motion_key1a = address_key1.derive("motion_1_txid_this_would_be_a_b64_encoded_string");
    const encrypted = motion_key1a.encrypt_vote('B', true);
    expect(utils.bytesToHex(encrypted)).toBe("7b74501d577bc84c655bfcb3c91fc5f3");
  });
  test("AES encrypt+b64 Motion1a A", () => {
    const master_key = new DerivableKey(utils.hexToBytes(TEST_SEED_HEX));
    const address_key1 = master_key.derive("Bis_test_address1");
    const motion_key1a = address_key1.derive("motion_1_txid_this_would_be_a_b64_encoded_string");
    const b64 = motion_key1a.encrypt_vote_b64('A', true);
    expect(b64).toBe("Qf6gnj8uEohsaiT/c8ID0g==");
  });
  test("AES encrypt+b64 Motion1a B", () => {
    const master_key = new DerivableKey(utils.hexToBytes(TEST_SEED_HEX));
    const address_key1 = master_key.derive("Bis_test_address1");
    const motion_key1a = address_key1.derive("motion_1_txid_this_would_be_a_b64_encoded_string");
    const b64 = motion_key1a.encrypt_vote_b64('B', true);
    expect(b64).toBe("e3RQHVd7yExlW/yzyR/F8w==");
  });
  test("AES decryptA", () => {
    const aes_key_hex = "4f877e349ff1cec77bd0bfdff32b6c13c109980d273db79bf6a396f67c85f690";
    const b64_message = "aP7J10RJnU7oURHP4poemQ=="
    const key = new DerivableKey();
    const vote = key.decrypt_vote_b64(b64_message, utils.hexToBytes(aes_key_hex));
    expect(vote).toBe("A");
  });
  test("AES decryptB", () => {
    const aes_key_hex = "4f877e349ff1cec77bd0bfdff32b6c13c109980d273db79bf6a396f67c85f690";
    const b64_message = "ohoaXVTBeg/cVutC+tW5zQ=="
    const key = new DerivableKey();
    const vote = key.decrypt_vote_b64(b64_message, utils.hexToBytes(aes_key_hex));
    expect(vote).toBe("B");
  });
});

describe("Key reveal Tests", () => {
  // We could run all vectors from ../tests/data/votes.json
  test("Key reveal 1", () => {
    const aes_key_hex = "4f877e349ff1cec77bd0bfdff32b6c13c109980d273db79bf6a396f67c85f690";
    const expected_b64_message = "T4d+NJ/xzsd70L/f8ytsE8EJmA0nPbeb9qOW9nyF9pA="
    const key = new DerivableKey();
    const message = key.reveal_key_b64(utils.hexToBytes(aes_key_hex));
    expect(message).toBe(expected_b64_message);
  });
  test("Key reveal 1b", () => {
    // Full test from mnemonic and derivation path
    const mnemonic = "letter advice cage absurd amount doctor acoustic avoid letter advice cage above";
    const seed = mnemonicToSeedSync(mnemonic, DEFAULT_PASSWORD);
    const key = new DerivableKey(seed).derive("Bis_test_address1").derive("motion_1_txid_this_would_be_a_b64_encoded_string");
    const expected_b64_message = "/b4RnPUDkrSD4HKvEbZzHPu0V+NeVOgR4/HKH65M7s4="
    const message = key.reveal_key_b64();
    expect(message).toBe(expected_b64_message);
  });
  test("Key reveal 2", () => {
    const aes_key_hex = "39ac5b64f8618cc76c80eb618c4af69c83613b29eec535ab1e1867a2935dd961";
    const expected_b64_message = "OaxbZPhhjMdsgOthjEr2nINhOynuxTWrHhhnopNd2WE="
    const key = new DerivableKey();
    const message = key.reveal_key_b64(utils.hexToBytes(aes_key_hex));
    expect(message).toBe(expected_b64_message);
  });
});

describe("Voting Transaction Tests", () => {
  // We could run all vectors from ../tests/data/votes.json
  test("Voting tx 1", () => {
    //seed, address, motion_id, motion_txid, motion_address
    const votingtransaction = new VotingTransaction(utils.hexToBytes(TEST_SEED_HEX), 'Bis_test_address1', 0, "motion_1_txid_this_would_be_a_b64_encoded_string", "test_motion_address");
    const transaction = votingtransaction.get_vote_transaction('A', 10);
    // console.log(transaction);
    expect(transaction['amount']).toBe(10);
    expect(transaction['recipient']).toBe("test_motion_address");
    expect(transaction['operation']).toBe("bgvp:vote");
    const message = transaction["openfield"].split(":")[1];
    const seed = mnemonicToSeedSync(TEST_MNEMONIC, DEFAULT_PASSWORD);
    const key = new DerivableKey(seed).derive("Bis_test_address1").derive("motion_1_txid_this_would_be_a_b64_encoded_string");
    const vote = key.decrypt_vote_b64(message);
    expect(vote).toBe("A");
  });
  test("Voting tx 2", () => {
    //seed, address, motion_id, motion_txid, motion_address
    const votingtransaction = new VotingTransaction(utils.hexToBytes(TEST_SEED_HEX), 'Bis_test_address1', 0, "motion_1_txid_this_would_be_a_b64_encoded_string", "test_motion_address");
    const transaction = votingtransaction.get_vote_transaction('B', 101);
    // console.log(transaction);
    expect(transaction['amount']).toBe(101);
    expect(transaction['recipient']).toBe("test_motion_address");
    expect(transaction['operation']).toBe("bgvp:vote");
    const message = transaction["openfield"].split(":")[1];
    const seed = mnemonicToSeedSync(TEST_MNEMONIC, DEFAULT_PASSWORD);
    const key = new DerivableKey(seed).derive("Bis_test_address1").derive("motion_1_txid_this_would_be_a_b64_encoded_string");
    const vote = key.decrypt_vote_b64(message);
    expect(vote).toBe("B");
  });
});

describe("BisUrl Tests", () => {
  test("checksum 1", () => {
    const string = "sample test string";
    const check = checksum(string);
    expect(check).toBe("%<5v~^9@2P5<8#Yuq@P;");
  });
  test("checksum 2", () => {
    const string = "bis://pay/01234567890/10.00/operation/openfield/";
    const check = checksum(string);
    expect(check).toBe("Lm<_mNdW3+`@CQs1Aibm");
  });
  test("Bisurl 1", () => {
    const transaction = {
      "recipient": "abcdef0123456789abcdef0123456789abcdef0123456789abcdef01",
      "amount": 0,
      "operation": "op:test",
      "openfield": "openfield_data"
    };
    const expected = "bis://pay/abcdef0123456789abcdef0123456789abcdef0123456789abcdef01/0/Z*V$vWpi`/Z*XO9W@%+?WM5=qbYT/c89#&9#h%MeO(h*k}9I|";
    const check = bisUrl(transaction);
    expect(check).toBe(expected);
  });
  test("Bisurl 2", () => {
    const transaction = {
      "recipient": "abcdef0123456789abcdef0123456789abcdef0123456789abcdef01",
      "amount": 0,
      "operation": "bgvp:vote",
      "openfield": "0:8ZmHckBjxb0DB8skooVAMw=="
    };
    const expected = "bis://pay/abcdef0123456789abcdef0123456789abcdef0123456789abcdef01/0/VrO=6I(Bb#Wd/FgiF|ZAfElLTY$oFhoK)b8ByJRzXd7Jv{/e&RE#IbWW*)0CtVGcN-=";
    const check = bisUrl(transaction);
    expect(check).toBe(expected);
  });
});
