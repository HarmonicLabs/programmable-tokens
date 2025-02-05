// use cardano/transaction.{Transaction, placeholder}
// use v1/token_registry

// test mintToEnd() {
//   let tx =
//     Transaction {
//       ..placeholder,
//       inputs: [prevIn],
//       outputs: [prevOut, newOut],
//       mint: newRegistryValue,
//     }

//   and {
//     token_registry.tokenRegistry.mint(registryMintAction, p, tx),
//     token_registry.tokenRegistry.spend(),
//   }
// }

// test mintHead() {
//   let tx =
//     Transaction { ..placeholder, outputs: [headOut], mint: newRegistryValue }

//   token_registry.tokenRegistry.mint(registryMintAction, p, tx)
// }

// test mintInsert() {
//   let tx =
//     Transaction {
//       ..placeholder,
//       inputs: [prevIn],
//       outputs: [prevOut, newOut],
//       mint: newRegistryValue,
//     }

//   and {
//     token_registry.tokenRegistry.mint(registryMintAction, p, tx),
//     token_registry.tokenRegistry.spend(),
//   }
// }

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
