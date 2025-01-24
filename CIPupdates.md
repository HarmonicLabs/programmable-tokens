# CIP-113 Standard - Updates

Since the recent draft, several changes have been made to the design to allow for more
control over programmable assets.

## Token Registry

We are using a linked list as a complete registry for programmable tokens.

Each of the records in the list require a specific datum that defines the validators
that manage the monetary policy of the assets.

```
// Token Registry
pub type RegistryDatum {
  // minting policy of this programmable token 
  tokenPolicy: ByteArray,
  // linked list
  nextTokenPolicy: ByteArray,
  // spending logic
  transferManagerHash: ByteArray,
  // userState (verify readonly states without transfers)
  userStateManagerHash: ByteArray,
  // nft of a global state for the programmable token
  globalStatePolicy: ByteArray,
}
```

from this point we know where to find the validators an tokens that need to be included
in transactions.

---

## Transfer Manager Hash

This is the script hash of the Transfer Manager, it holds all of the assets at utxos
which are assigned ownership by the stake credential of the address.

As they wont really be 'staked' we simply use the PKH of the owner's wallet as the
stake credential field so we can verify the person who owns those assets ( that utxo ).

to spend these assets, the transaction must be signed by the corresponding PubKeyHash.

This stake credential identifier can be used many times, so any one user could have
multiple outputs with different amounts of tokens and it would not affect their use of
the tokens.

This also makes it easy to identify by a wallet service as they know the PubKeyHash and
can easily construct the expected address to find a users assets ( if any )

---

## User State Manager Hash

There is some level of monetary control that needs to be assigned to a given user,
for example KYC or Freezing users etc. We achieve this by having a user state token
locked in a validator, that needs to be added to the transaction as a reference input.

The transfer manager verifies intputs/outputs against this UTxO to make sure there are 
no restrictions, or the expected premissions, are present for validation.

Example Datum
```
pub type UserStateDatum {
  admin: Int,
  kyc: Int,
  blacklist: Int,
  freeze: Int,
}
```

---

## Global State Policy

It isnt just individual users that require state validation.

Protocols may also need global state validation in case of some occurrance where freezing
the whole supply is needed for some reason.

This global state is also a required reference input, but it is upgradeable, and so we 
track the policyId of the global state asset instead, so that the validator can change 
in the future if needed.

