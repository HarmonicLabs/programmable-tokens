// Bool Constr
pub type IBool {
  ITrue
  IFalse
}

// Transfer Manager 
pub type TransferAction {
  Transfer { registryNodes: List<Int> }
  // index of refScripts
  ThirdParty { registryNodes: List<Int> }
}

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
  globalStateUnit: ByteArray,
  // permissioned override
  thirdPartyAction: ByteArray,
}

pub type RegistryAction {
  RInsert
  RRemove
  RPrevious
  BurnHead
  OverRide // For testing ONLY
}

pub type RegistryMintAction {
  RMint {
    policy: ByteArray,
    transfer: ByteArray,
    user: ByteArray,
    global: ByteArray,
    third: ByteArray,
  }
  RBurn
}

// Global State only uses Freeze, so we will represent it as an Int 0 || 1
// // Global State
// pub type GlobalDatum {
//   freeze: IBool,
//   // list of script hashes for tokenActions
//   actions: List<ByteArray>,
// }

// pub type GlobalAction {
//   GState { freeze: IBool }
//   GUpdate { actions: List<ByteArray> }
// }

pub type GlobalMintAction {
  GMint
  // { actions: List<ByteArray> }
  GBurn
}

// User State

pub type UserStateDatum {
  admin: Int,
  kyc: Int,
  blacklist: Int,
  freeze: Int,
}

pub type UserStateMintAction {
  UMint
  UBurn
}

pub type UserStateAction {
  Admin
  KYC
  Blacklist
  Freeze
  Burn
}
