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

pub type RegistryAction {
  RInsert
  RRemove
  RPrevious
}

pub type RegistryMintAction {
  RMint {
    policy: ByteArray,
    transfer: ByteArray,
    user: ByteArray,
    global: ByteArray,
  }
  RBurn
}

// Global State

pub type GlobalDatum {
  freeze: Bool,
  // list of script hashes for tokenActions
  actions: List<ByteArray>,
}

pub type GlobalAction {
  GState { freeze: Bool }
  GUpdate { actions: List<ByteArray> }
}

pub type GlobalMintAction {
  GMint { actions: List<ByteArray> }
  GBurn
}

// User State

pub type UserStateDatum {
  admin: Bool,
  kyc: Bool,
  blacklist: Bool,
  freeze: Bool,
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
