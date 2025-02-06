use cardano/transaction.{InlineDatum, Transaction, placeholder}
use draft/variables as v
use tools as t
use v1/scripts as s
use v1/token_registry
use v1/types.{RInsert, RMint, RegistryDatum}

test mintToEnd() {
  let user = v.a
  let rec1 = v.b
  let owner = v.c
  let policy = s.tokenRegistry

  let oref = t.oref(v.id0, 1)

  let registryMintAction =
    RMint(
      #"11111111111111111111111111111111111111111111111111111111",
      s.transferManager,
      s.userStateManager,
      s.globalState,
      #"00000000000000000000000000000000000000000000000000000000",
    )

  let registryAction = RInsert

  let newRegistryValue =
    t.makeAsset(
      s.tokenRegistry,
      #"11111111111111111111111111111111111111111111111111111111",
      1,
    )

  let prevInDatum =
    RegistryDatum(
      #"00000000000000000000000000000000000000000000000000000000",
      "",
      #"00000000000000000000000000000000000000000000000000000000",
      #"00000000000000000000000000000000000000000000000000000000",
      #"00000000000000000000000000000000000000000000000000000000",
      #"00000000000000000000000000000000000000000000000000000000",
    )
  let prevOutDatum =
    RegistryDatum(
      #"00000000000000000000000000000000000000000000000000000000",
      #"11111111111111111111111111111111111111111111111111111111",
      #"00000000000000000000000000000000000000000000000000000000",
      #"00000000000000000000000000000000000000000000000000000000",
      #"00000000000000000000000000000000000000000000000000000000",
      #"00000000000000000000000000000000000000000000000000000000",
    )

  let registryDatum =
    RegistryDatum(
      #"11111111111111111111111111111111111111111111111111111111",
      "",
      s.transferManager,
      s.userStateManager,
      s.globalState,
      #"00000000000000000000000000000000000000000000000000000000",
    )

  let prevIn =
    t.input(
      oref,
      t.output(
        t.scriptAddress(s.tokenRegistry),
        t.makeAsset(
          s.tokenRegistry,
          #"00000000000000000000000000000000000000000000000000000000",
          1,
        ),
        InlineDatum(prevInDatum),
      ),
    )

  let newOut =
    t.output(
      t.scriptAddress(s.tokenRegistry),
      newRegistryValue,
      InlineDatum(registryDatum),
    )

  let prevOut =
    t.output(
      t.scriptAddress(s.tokenRegistry),
      t.makeAsset(
        s.tokenRegistry,
        #"00000000000000000000000000000000000000000000000000000000",
        1,
      ),
      InlineDatum(prevOutDatum),
    )

  let tx =
    Transaction {
      ..placeholder,
      inputs: [prevIn],
      outputs: [prevOut, newOut],
      mint: newRegistryValue,
    }

  and {
    token_registry.tokenRegistry.mint(registryMintAction, policy, tx),
    token_registry.tokenRegistry.spend(
      Some(prevInDatum),
      registryAction,
      oref,
      tx,
    ),
  }
}

test mintHead() {
  let user = v.a
  let rec1 = v.b
  let owner = v.c
  let policy = s.tokenRegistry

  let oref = t.oref(v.id0, 1)

  let registryMintAction =
    RMint(
      #"11111111111111111111111111111111111111111111111111111111",
      s.transferManager,
      s.userStateManager,
      s.globalState,
      #"00000000000000000000000000000000000000000000000000000000",
    )

  let newRegistryValue =
    t.makeAsset(
      s.tokenRegistry,
      #"11111111111111111111111111111111111111111111111111111111",
      1,
    )
  let registryDatum =
    RegistryDatum(
      #"11111111111111111111111111111111111111111111111111111111",
      "",
      s.transferManager,
      s.userStateManager,
      s.globalState,
      #"00000000000000000000000000000000000000000000000000000000",
    )

  let headOut =
    t.output(
      t.scriptAddress(s.tokenRegistry),
      newRegistryValue,
      InlineDatum(registryDatum),
    )

  let tx =
    Transaction { ..placeholder, outputs: [headOut], mint: newRegistryValue }

  token_registry.tokenRegistry.mint(registryMintAction, policy, tx)
}

test mintInsert() {
  let user = v.a
  let rec1 = v.b
  let owner = v.c
  let policy = s.tokenRegistry

  let oref = t.oref(v.id0, 1)

  let registryMintAction =
    RMint(
      #"11111111111111111111111111111111111111111111111111111111",
      s.transferManager,
      s.userStateManager,
      s.globalState,
      #"00000000000000000000000000000000000000000000000000000000",
    )

  let registryAction = RInsert

  let newRegistryValue =
    t.makeAsset(
      s.tokenRegistry,
      #"11111111111111111111111111111111111111111111111111111111",
      1,
    )

  let prevInDatum =
    RegistryDatum(
      #"00000000000000000000000000000000000000000000000000000000",
      #"22222222222222222222222222222222222222222222222222222222",
      #"00000000000000000000000000000000000000000000000000000000",
      #"00000000000000000000000000000000000000000000000000000000",
      #"00000000000000000000000000000000000000000000000000000000",
      #"00000000000000000000000000000000000000000000000000000000",
    )

  let prevOutDatum =
    RegistryDatum(
      #"00000000000000000000000000000000000000000000000000000000",
      #"11111111111111111111111111111111111111111111111111111111",
      #"00000000000000000000000000000000000000000000000000000000",
      #"00000000000000000000000000000000000000000000000000000000",
      #"00000000000000000000000000000000000000000000000000000000",
      #"00000000000000000000000000000000000000000000000000000000",
    )

  let registryDatum =
    RegistryDatum(
      #"11111111111111111111111111111111111111111111111111111111",
      #"22222222222222222222222222222222222222222222222222222222",
      s.transferManager,
      s.userStateManager,
      s.globalState,
      #"00000000000000000000000000000000000000000000000000000000",
    )

  let prevIn =
    t.input(
      oref,
      t.output(
        t.scriptAddress(s.tokenRegistry),
        t.makeAsset(
          s.tokenRegistry,
          #"00000000000000000000000000000000000000000000000000000000",
          1,
        ),
        InlineDatum(prevInDatum),
      ),
    )

  let newOut =
    t.output(
      t.scriptAddress(s.tokenRegistry),
      newRegistryValue,
      InlineDatum(registryDatum),
    )

  let prevOut =
    t.output(
      t.scriptAddress(s.tokenRegistry),
      t.makeAsset(
        s.tokenRegistry,
        #"00000000000000000000000000000000000000000000000000000000",
        1,
      ),
      InlineDatum(prevOutDatum),
    )

  let tx =
    Transaction {
      ..placeholder,
      inputs: [prevIn],
      outputs: [prevOut, newOut],
      mint: newRegistryValue,
    }

  and {
    token_registry.tokenRegistry.mint(registryMintAction, policy, tx),
    token_registry.tokenRegistry.spend(
      Some(prevInDatum),
      registryAction,
      oref,
      tx,
    ),
  }
}
// test burnRemove() {
//   let tx =
//     Transaction {
//       ..placeholder,
//       inputs: [prevIn],
//       outputs: [prevOut, newOut],
//       mint: newRegistryValue,
//     }

//   token_registry.tokenRegistry.mint(registryBurnAction, p, tx)
// }

// test burnEnd() {
//   and {
//     token_registry.tokenRegistry.mint(registryMintAction, p, tx),
//     token_registry.tokenRegistry.spend(),
//   }
// }

// test burnHead() {
//   and {
//     token_registry.tokenRegistry.mint(registryMintAction, p, tx),
//     token_registry.tokenRegistry.spend(),
//   }
// }
