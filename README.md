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
AToken: 1fca0ff51b759e7154e074f6b780cf1e99fec100a60753f927978eba
BToken: ad19a7fe4413136c9ce3c2fdcbdb5c5409729e18dd2ac3768a52570f
CToken: 2479fed221783578e41a0d8bcf3ee1b4c39783af69d080bc56f7eb6d
```

then register the withdrawalScript(s) with `lucid:stakeScript`

```
aTransferAddress: stake_test17qckaxwzddzjd0ah84fgt0r8ma28hgw3k0902kwuv7qu04sjfauzf
1d8f166cc78ac2da718010af9984fad2bed13bbb7b434d5aaf4dc1460903e804

tx Hash: https://preprod.cardanoscan.io/transaction/1c5f1e62ab84393574eb8688c2343a5d855e0f12e1a613baafdd4f88599f7fad

bTransferAddress:
transferRewardAddress: stake_test17qckaxwzddzjd0ah84fgt0r8ma28hgw3k0902kwuv7qu04sjfauzf
e5e12718ccb01a3bd3c9f5c118288fb09651c5a1ddb434a8c248cdd5f2926d62

tx Hash: https://preprod.cardanoscan.io/transaction/dcf6c22ec42d3ee657542adb965f9acc1387c9efd88caa6bf93f0acea555924e

cTransferAddress: stake_test17qckaxwzddzjd0ah84fgt0r8ma28hgw3k0902kwuv7qu04sjfauzf
0f52f37f259e54d5c871c1cf0d19e7bd52a94d5f3cbefc4b28101f3b96f3a409

tx Hash: https://preprod.cardanoscan.io/transaction/2f09d66260f65ae3844455b2455ac08fdf291f363b8e484b4b9fca87bfe13834
```

We will mint 3 different assets for this test and try out several transactions with
various amounts, so we can understand the impact on exUnits.
So we will need to register 3 TransferManagerScripts

### Mint Global

```
A Global:
tx Hash: https://preprod.cardanoscan.io/transaction/7946fb810402d59123e2bb03a6f856abd28e59c796f7efa8093fc5f9a423af4b

B Global:
tx Hash: https://preprod.cardanoscan.io/transaction/aa85d7bf367d7478736f6dd5d2afc80ca58874dc9f6a39db493c8695a310df0a

C Global:
tx Hash: https://preprod.cardanoscan.io/transaction/8bfad82633cd528b0ad9033bd0bd42862d36d7b45dd3e8553fb90fc198892854
```
This had to be done first because I compiled the parameterised validators and the utxo
had to be available (and consumed) in the minting transaction.

### Mint Registry

```
AToken Registry
tx Hash: https://preprod.cardanoscan.io/transaction/136082db95fd256516ac72e010f9f42875bcbc9f6d2f6cd97f6dbd3e43aad428

CToken Registry
tx Hash: https://preprod.cardanoscan.io/transaction/b429a9af0aae2f40e6485770fc97cf88d58b10e798cc787907735dc3aa4e8862

BToken Registry
tx Hash: https://preprod.cardanoscan.io/transaction/cc7b2c15691fcc9bc2f26f28fcb63c002d296b7669f687826ec210994c00a467
```

### Mint User State Tokens

```
Owner States for each token
Tx Hash: https://preprod.cardanoscan.io/transaction/3b159cf7054e118614da2fe5247cce9c6cfff8d05bd74936ea12c2c202216b38

User1 
Tx Hash: https://preprod.cardanoscan.io/transaction/fbcab65d22ef661c5abd77022bc4d2efaa7139fb78f756c44ade9daec6ca6740

User2 
Tx Hash: https://preprod.cardanoscan.io/transaction/a1d455b38c7283d2bb5ca28f6a58f811224cdaccb2ddd13c7eadc7e9f1203f56
```

### KYC Users

```
KYC All aToken UserStates 
Tx Hash: https://preprod.cardanoscan.io/transaction/3766332a97f91d386e4272e6dedbe629b4f9653734ffca7c7121323faf8e81be

KYC All bToken UserStates
Tx Hash: https://preprod.cardanoscan.io/transaction/086e2421773c8b0fe9d08db5a1f43dc1528c52cd923197bc94251d9921e3d510

KYC All cToken UserStates
Tx Hash: https://preprod.cardanoscan.io/transaction/780073f2b7f2f7f3d835de44c908d9c643ffb7fbe1244a2499e1c56f0612a24b
```

### Mint Programmable Tokens

```
aTokens
Tx Hash: https://preprod.cardanoscan.io/transaction/20718bc00840132ec7cf481175615430bce666476e1ae36b9fa4b51f3ca19317

bTokens
Tx Hash: https://preprod.cardanoscan.io/transaction/345126c589d12921b765a9e1902a9d0791abab891faf91181f54f8a3bbb299ad

cTokens
Tx Hash: https://preprod.cardanoscan.io/transaction/dde3c3a00baa7cb345f3ef49f3a70a6537e6192b6925e6ae72723f87ff8f6270
```

These are dummy tokens registered with the validator.

They are sent to the owner's account by default and can then be sent to the users as part
of the tests.

### Simple Transfer

```
Simple Transfer
TxHash: https://preprod.cardanoscan.io/transaction/60e5303ad0556f540d0c55701b62030a81344a76de98a7abb9e0ef87bca1d7a8
```

Tx mem   5653004    (45.22%)
Tx steps 1838937675 (18.39%)

### Realistic Transfer

```
Realistic Transfer
TxHash: https://preprod.cardanoscan.io/transaction/16319505727c617d5c2b88f4fb80071f4828b55986a3067c2f301b5f70fb9369
```

Tx mem   5653004    (45.22%)
Tx steps 1838937675 (18.39%)

### Aggregate Transfer

```
Realistic Transfer
TxHash: https://preprod.cardanoscan.io/transaction/a75eb62de3274647df4212e366cf40921238c927583b8aaebb922233c81f2ffd
```

Tx mem   5653004    (45.22%)
Tx steps 1838937675 (18.39%)

### Batcher Pool Example

```
Batcher Pool Example
TxHash: https://preprod.cardanoscan.io/transaction/69cd1a0effdb8aed291b201d186b6f6d3d1ee6092339dd0fb74e64fe127a496a
```

Tx mem   5653004    (45.22%)
Tx steps 1838937675 (18.39%)

69cd1a0effdb8aed291b201d186b6f6d3d1ee6092339dd0fb74e64fe127a496a
---

## Older Tests

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

