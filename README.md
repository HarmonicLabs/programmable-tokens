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
AToken: 41a9566ef6672f006ef455bbd2c0599e74ba36351b3fbe92cb223f4b
BToken: 228659c1380d7a0f54d62e6c156f204afbb1eaefe18259b550c70d44
CToken: f5f579d93bfabb39d9ff012142b7ca9685b13c9d24baf75b4dbfc41
```

then register the withdrawalScript(s) with `lucid:stakeScript`

```
aTransferAddress:
transferRewardAddress: stake_test17pfgn27xzgguneezvqq855pa4vfph2d308egpsh75d2pr8q0ypyvp
9c48fa9b2653eedb16c4c046d3c4d65791787992c63fc74d93bf768ed700845f

tx Hash: https://preprod.cardanoscan.io/transaction/1c5f1e62ab84393574eb8688c2343a5d855e0f12e1a613baafdd4f88599f7fad

bTransferAddress:
stake_test17p8deyjfhjcq37mfrdk59gwujzsghgs8x7dyhwl36uer9zsm5vepc

tx Hash: https://preprod.cardanoscan.io/transaction/dcf6c22ec42d3ee657542adb965f9acc1387c9efd88caa6bf93f0acea555924e

cTransferAddress:
transferRewardAddress: stake_test17pqg0zdkdv33hytjuelwxaquve3m85a4zemmg8q86txe88qjtsjj2
7643f9d754d5cc10774e8d968ab12c39be6d436492b18c4df91eea37f726712e

tx Hash: https://preprod.cardanoscan.io/transaction/2f09d66260f65ae3844455b2455ac08fdf291f363b8e484b4b9fca87bfe13834
```

We will mint 3 different assets for this test and try out several transactions with
various amounts, so we can understand the impact on exUnits.
So we will need to register 3 TransferManagerScripts

### Mint Global

```
A Global:
tx Hash: https://preprod.cardanoscan.io/transaction/e29259c5ff9ae449556f06daf17476aa4ef500fcfeb1c72f8f4660a821bcf95a

B Global:
tx Hash: https://preprod.cardanoscan.io/transaction/8169cd89461d0deae1fe6a1a964ee89a46eb0442f68c708bf846d28e5a9d1a40

C Global:
tx Hash: https://preprod.cardanoscan.io/transaction/1ea93f733820c0cedc24b087851c0ded452fa1627f2d512ec795fc64a6566399
```
This had to be done first because I compiled the parameterised validators and the utxo
had to be available (and consumed) in the minting transaction.

### Mint Registry

```
CToken Registry
tx Hash: https://preprod.cardanoscan.io/transaction/c45ffe6fc451d302c1dd15cebf951e70828247537a697e74ed847e7edac7e214

BToken Registry
tx Hash: https://preprod.cardanoscan.io/transaction/ea0f9164b9f0c081bc3f3921e87191707c93e89370f29cf123c6af650a4ce946

AToken Registry
tx Hash: https://preprod.cardanoscan.io/transaction/044de3bf0cf930f2e180dcf252926e3f2adb19a545f1ce496458529863fa28ec
```

### Mint User State Tokens

```
Owner States for each token
Tx Hash: https://preprod.cardanoscan.io/transaction/6a83fb96220688916b3484dabd9423d7079418610d4bb87465dd6c83f006bc17

User1 
Tx Hash: https://preprod.cardanoscan.io/transaction/d7ce77f1c3efac8ad2f47dbd33d165cc99f89da8821992b15bcdf6bb5fb7206e

User2 
Tx Hash: https://preprod.cardanoscan.io/transaction/9562a71f4d06a0f93b8c78fa70cea72c9da2a4de1a89fa3aaabd2a86f3a856a2
```

### KYC Users

```
KYC All aToken UserStates 
Tx Hash: https://preprod.cardanoscan.io/transaction/8066abb45c7cb0c38050aa5491f4c60e17b6be800c38824707052660a5e4f3b4

KYC All bToken UserStates
Tx Hash: https://preprod.cardanoscan.io/transaction/cdce32f3d26a99ff407c358b60ebec28131b04bbed11a2c3b337021598f932dc

KYC All cToken UserStates
Tx Hash: https://preprod.cardanoscan.io/transaction/b3ad083ed4a5a495d86c4fd15afc771452d800cd71faee9466848265897b7161
```

### Mint Programmable Tokens

```
aTokens
Tx Hash: https://preprod.cardanoscan.io/transaction/721c3cdba4d232527b553faf5c8cbe0b3405126f2db7a4e10a34785fb414da12

bTokens
Tx Hash: https://preprod.cardanoscan.io/transaction/42740e7767614221886d123d9de69c18dce1892ded6f85e86f12a771ac30fdb3

cTokens
Tx Hash: https://preprod.cardanoscan.io/transaction/cf1bd8867f90144672e719c0b2cbf4e2d13322d95122792afa89d634e4aeeb40
```

These are dummy tokens registered with the validator.

They are sent to the owner's account by default and can then be sent to the users as part
of the tests.

### All Send To All

The first real token transfer we do is the biggest.

We have all 3 users sending each other 100 of their tokens.

```
AllSendToAll
TxHash: https://preprod.cardanoscan.io/transaction/83eb33894b3171951faa83917f8be45f68202d7acb86cd42bc13e813628c9075
```

Tx mem   5653004    (45.22%)
Tx steps 1838937675 (18.39%)

Owner manages `aToken` and sends 100n to each of the Users.

User 1 manages `bToken` and sends 100 to each of the others.

User 2 manages `cTokens` and does the same

### Split Asset UTxOs

```
TxHash: https://preprod.cardanoscan.io/transaction/532858a1cb6de515d945a755850fc3d9712ea598fd5290a576b8930907d0a896
```

This transaction splits 1 utxo into 5 smaller ones, 4 x 100n && 1 x 400n

Total Mem:   978702     (7.83%)
Total Steps: 312966234  (3.12%)

### Collect multiUTxOs Send To One

```
TxHash: https://preprod.cardanoscan.io/transaction/fb953215bdf53d2f43da1cfd6246cebb80e017405351d2f35c0a007fa3720683
``` 

This UTXO collects 4 inputs and sends the total to User1

Total Mem:   1294573    (10.36%)
Total Steps: 431740873  (4.32%)

### Multi Asset Outputs

```
TxHash: https://preprod.cardanoscan.io/transaction/b468a6150fcb995b84849d1926a6fe2ee5d9d9996b27ddcb40d78c8f1acb8715
```

This transaction has multi-asset outputs, 2 programmable tokens in one output.

Total Mem: 2241340     (17.93%)
Total Steps: 731866858 (7.32%)

### Send 1 Asset From MultiAssetUTxO

```
TxHash: https://preprod.cardanoscan.io/transaction/27918e84c782983a10f85df8acfc405bdc7596017d492994e070297e084a3e67
```

In this transaction we send 1 of 2 programmable tokens at a UTxO to User2, returning the remaining asset to origin

Total Mem: 1687169     (13.5%)
Total Steps: 560767003 (5.61%)

---

## Aiken Tests

```sh
    ┍━ v1/account_test ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    │ PASS [mem: 1154137, cpu: 346129447] sendToOne_Inclusive
    │ PASS [mem:  288588, cpu:  83023472] sendToOne
    │ PASS [mem:  212460, cpu:  59781557] sendToOneFail
    │ | the validator crashed / exited prematurely
    │ | expect rDatum: RegistryDatum = datum
    ┕━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 3 tests | 3 passed | 0 failed


    ┍━ v1/global_test ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    │ PASS [mem:  114545, cpu:  36907036] globalMint
    │ PASS [mem:  110372, cpu:  36210909] globalFreeze
    │ PASS [mem:  110973, cpu:  36382958] globalUnfreeze
    ┕━━━━━━━━━━━━━━━━━━━━━ 3 tests | 3 passed | 0 failed


    ┍━ v1/registry_test ━━━━━━━━━━━━━━━━━━━━━━━━━━━
    │ PASS [mem:  478966, cpu: 152799030] mintToEnd
    │ PASS [mem:  142467, cpu:  44117046] mintHead
    │ PASS [mem:  486292, cpu: 155911696] mintInsert
    ┕━━━━━━━━━━━━━━━━━ 3 tests | 3 passed | 0 failed


    ┍━ v1/transfer_test ━━━━━━━━━━━━━━━━━━━━━━━━━━━
    │ PASS [mem: 1013266, cpu: 300885845] sendToOne
    ┕━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 1 tests | 1 passed | 0 failed


    ┍━ v1/user_test ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    │ PASS [mem:  141320, cpu:  43959099] mintUserState
    │ PASS [mem:  136065, cpu:  43815619] makeAdmin
    │ PASS [mem:  137299, cpu:  44217664] makeKyc
    │ PASS [mem:  138533, cpu:  44619709] makeBlacklist
    │ PASS [mem:  139667, cpu:  45005754] makeFreeze
    ┕━━━━━━━━━━━━━━━━━━━━ 5 tests | 5 passed | 0 failed
```

