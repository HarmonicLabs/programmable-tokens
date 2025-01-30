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

### Mint Global

```
tx Hash: c3d3b7640639d9d1ba93fb02e8380d266efe308dd7f65c95f57061299bdf75be
```
This had to be done first because I compiled the parameterised validattors and the utxo
had to be available (and consumed) in the minting transaction.

### Mint Registry

```
tx Hash: 5e637afbb6699687ea060d8a5e8ba66f42958662dbe8ba248b297db415eb210e
```

### Mint User State Tokens

```
Owner Tx Hash: 267ea9238ffc1899f08e7532264633689c4ccc05d2a8287b6b9ccf9aa1d282c2

User1 Tx Hash: 12a66734d00b416d3b505e5e742367c0f1c58d6480b427ce13eaf72213262398

User2 Tx Hash: c29d816cef61e03b9c44ddb4204b3c06d8dc74232ec030a305d0b285943cbd60
```

### Mint ATokens

```
Tx Hash: 0e7f0b6361d840bbd9393106c4e68d0065408e50b71324fad418574f43c11265
```

These are dummy tokens registered with the validator.

They are sent to the owner's account by default and can then be sent to the users as part
of the tests.

### Send To User1

```
Tx Hash: 8ec569b3832b135c1d90dfe22f99d1348f99989e883c12e96953f4d88e66e3bd
```

### Send From User1 To User2

```
Tx Hash: 34951b89403131ec4d37f1c43a7aaa30faabca887fa67f142e317de3a9cc9aea
```

## Transfer Manager

The most important validator here is the TransferManager, it holds the assets.
Each user UTxO is identified by a StakeCredential that matches the user PKH.

Currently we have a spending validator that forces one in and allows multiple outs.

Spending Checks:

  - Only 1 input

  - All tokens stay in validator
  
  - Sender isnt Blacklist or Frozen
  
  - No Recipient is blacklisted
  
  - globalState isn't frozen

Clawback Checks:

  - tx signed by owner.

---