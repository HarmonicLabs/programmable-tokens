# Programmable Token Standard

programmable token standard - development & testing

This repo is a WIP of CIP-113 implementation

--- 

## Testing

I have some static transactions written in Lucid which I am using for testing. To execute 
the transactions refer to scripts in `package.json`

Generate credentials with `lucid:genCredentials` and fund them

You will need to first build the scripts `lucid:validators`, 
> Note: Take down the logged token policies
> You will need to make sure they are inserted into the list lexicographically

```
// A is the HEAD of the registry here, you may need to adjust the registry Tx's
AToken: d88150ea550dc3ddaef71eb582a365d740cf2ac1d65740659bff9f5a
BToken: a724a26f6840a7a263357f93296115a948f5d8ea7d33f5627ac55311
CToken: 7d4917c0fb86660e29cc3625c097f514af597a2b80b968a4ea2e1dfd
```

then register the withdrawalScript(s) with `lucid:stakeScript`

```
aTransferAddress:
stake_test17zjpjy0gdy5wzqlnk2lz7d5akr5mx3k5y60mw20gwplrrhq7uxexj

tx Hash: https://preprod.cardanoscan.io/transaction/1c5f1e62ab84393574eb8688c2343a5d855e0f12e1a613baafdd4f88599f7fad

bTransferAddress:
stake_test17p8deyjfhjcq37mfrdk59gwujzsghgs8x7dyhwl36uer9zsm5vepc

tx Hash: https://preprod.cardanoscan.io/transaction/1c5f1e62ab84393574eb8688c2343a5d855e0f12e1a613baafdd4f88599f7fad

cTransferAddress:
stake_test17zprcyrxz62mmvfhf9euk4xf8kc29frd05afjfkfv8yg2lqy3mlf8

tx Hash: https://preprod.cardanoscan.io/transaction/2f09d66260f65ae3844455b2455ac08fdf291f363b8e484b4b9fca87bfe13834
```

We will mint 3 different assets for this test and try out several transactions with
various amounts, so we can understand the impact on exUnits.
So we will need to register 3 TransferManagerScripts

### Mint Global

```
A Global:
tx Hash: https://preprod.cardanoscan.io/transaction/8b2f11146722ce26134b6dad0526ca582051a22232a70f561401be918d923269

B Global:
tx Hash: https://preprod.cardanoscan.io/transaction/c8b56478b78dc156e85f500c8d96de7fedac73ed51507edd3fbd2dd1c9b73857

C Global:
tx Hash: https://preprod.cardanoscan.io/transaction/5beca31dda3ee89c64e101155ec558384727973e010ad80ed3aafbf0199fc4fe
```
This had to be done first because I compiled the parameterised validators and the utxo
had to be available (and consumed) in the minting transaction.

### Mint Registry

```
CToken Registry
tx Hash: https://preprod.cardanoscan.io/transaction/2200a894d946272414b03426032136c56fa1012805a56a5beac96ed3fc85b7a0

BToken Registry
tx Hash: https://preprod.cardanoscan.io/transaction/443fc4f304bdad23a7e2e01093ac49e07613511356a560d40d8c67bac2444161

AToken Registry
tx Hash: https://preprod.cardanoscan.io/transaction/82966a1a009122a3c827a2a2717490770b6bf73a8bea2574e779d143fcb53dc4
```

### Mint User State Tokens

```
Owner States for each token
Tx Hash: https://preprod.cardanoscan.io/transaction/6370136900d61671f5dd97e442ddff85edacc53803cbddc4a0655c35e995ef7a

User1 
Tx Hash: https://preprod.cardanoscan.io/transaction/4ceb74fa888844d22e1f1dbf548b06a8311804eb41147b978a55121f532f40df

User2 
Tx Hash: https://preprod.cardanoscan.io/transaction/a9404491c1e5459bd68ebec5d9d309ce76477930aa7fb6a466ea1dadc8e5402f
```

### KYC Users

```
KYC All aToken UserStates 
Tx Hash: https://preprod.cardanoscan.io/transaction/d967197a361459949c6c5a6e478701cf9f2f54ce3f7bf4a4a5b9be0b528283e1

KYC All bToken UserStates
Tx Hash: https://preprod.cardanoscan.io/transaction/0f1110b73de5a33d6d6e54f30396690b9d9de7dd6777cb9a101baa2540da837b

KYC All cToken UserStates
Tx Hash: https://preprod.cardanoscan.io/transaction/a11f1a39a8538d11dc73c5e46698f811ff5030087552c11896c625cb45620858
```

### Mint Programmable Tokens

```
aTokens
Tx Hash: https://preprod.cardanoscan.io/transaction/2be0562393849eb1d2fc2c6a11cb3cdd9e7df006dbd6a86719cb1caeb5354b90

bTokens
Tx Hash: https://preprod.cardanoscan.io/transaction/f631a868232cde89b996720d04ec88f50e18fe466ea03c6347e9ea11ac48c463

cTokens
Tx Hash: https://preprod.cardanoscan.io/transaction/5576f5c3da965c20ff9c527060f48d3e771304dc1a92947797b6122f59aa0be9
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