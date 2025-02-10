# Programmable Token Standard

programmable token standard - development & testing

This repo is a WIP of CIP-113 implementation

---

## Draft

This contains a full set of validators as a WIP, and will include tests for them as a starting point for working on this CIP

```
draft.ak - Validator mockup
draft-test - TODO: Benchmark tests
types - Datum/Redeemer Types
utils - Helper functions
```

--- 

## Testing

I have some static transactions written in Lucid which I am using for testing. To execute 
the transactions refer to scripts in `package.json`

Generate credentials with `lucid:genCredentials` and fund them

You will need to first build the scripts `lucid:validators`, 
then register the withdrawalScript(s) with `lucid:stakeScript`

### Mint Global

```
tx Hash: https://preprod.cardanoscan.io/transaction/603660c4ec1a5d48b3d6a2626f029229f3175365c02770d81390c51f5352aafd
```
This had to be done first because I compiled the parameterised validattors and the utxo
had to be available (and consumed) in the minting transaction.

### Mint Registry

```
tx Hash: https://preprod.cardanoscan.io/transaction/d60e1814bb3c54dac253eedd36bf7236988d986587716b0102718534a7651e44
```

### Mint User State Tokens

```
Owner Tx Hash: https://preprod.cardanoscan.io/transaction/9ddf6bbe018b96b1ba2b9439d79beb69377778d80ce293a639ca962ebd18f6d1

User1 Tx Hash: https://preprod.cardanoscan.io/transaction/b0b890428acec6143e3c937265e9d2bb5f7ff3c3ee12410749f5b75d75f28c52

User2 Tx Hash: https://preprod.cardanoscan.io/transaction/a9404491c1e5459bd68ebec5d9d309ce76477930aa7fb6a466ea1dadc8e5402f
```

### KYC Users

```
Owner Tx Hash: https://preprod.cardanoscan.io/transaction/2bd4ddc302f2aa4ae633f2d9aebc23a3699a6fb600251c699c6f6517bdb6de4d

User1 Tx Hash: https://preprod.cardanoscan.io/transaction/8e3d72e584ab1b508aba914f1375190f087f92157a3f8b3e1c288f6c0846d5ec

User2 Tx Hash: https://preprod.cardanoscan.io/transaction/176f0ea57e94fa77fe3f2a021247092000a71a5320971d2bd5f3647d515050e8
```

### Mint ATokens

```
Tx Hash: https://preprod.cardanoscan.io/transaction/05d42fc41694160791c4cec79f8df56ee9692931de10b50364b23f4df5d84cb2
```

These are dummy tokens registered with the validator.

They are sent to the owner's account by default and can then be sent to the users as part
of the tests.

### Send To User1

```
Tx Hash: https://preprod.cardanoscan.io/transaction/18d840b71f1280949e0dcc9b6033e341cf68817c217849ce56da3bca5e1d1230
```

### Send From User1 To User2

```
Tx Hash: https://preprod.cardanoscan.io/transaction/bef4b363806244577d9b14c3a10b0205268c4a1d99ed2946ade8f2570875caaa
```

---

## Aiken Tests

```
    ┍━ v1/global_test ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    │ PASS [mem: 121594, cpu:  39109474] globalMint
    │ PASS [mem: 110372, cpu:  36210909] globalFreeze
    │ PASS [mem: 110973, cpu:  36382958] globalUnfreeze

    ┍━ v1/registry_test ━━━━━━━━━━━━━━━━━━━━━━━━━━
    │ PASS [mem: 478966, cpu: 152799030] mintToEnd
    │ PASS [mem: 142467, cpu:  44117046] mintHead
    │ PASS [mem: 486292, cpu: 155911696] mintInsert

    ┍━ v1/transfer_test ━━━━━━━━━━━━━━━━━━━━━━━━━━
    │ PASS [mem: 660248, cpu: 201875157] sendToOne
    │ PASS [mem: 729601, cpu: 222140143] sendToMany
    │ PASS [mem: 922704, cpu: 289982040] sendManyToOne

    ┍━ v1/user_test ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    │ PASS [mem: 141320, cpu:  43959099] mintUserState
    │ PASS [mem: 136065, cpu:  43815619] makeAdmin
    │ PASS [mem: 137299, cpu:  44217664] makeKyc
    │ PASS [mem: 138533, cpu:  44619709] makeBlacklist
    │ PASS [mem: 139667, cpu:  45005754] makeFreeze
```