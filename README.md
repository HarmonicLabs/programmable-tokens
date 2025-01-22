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