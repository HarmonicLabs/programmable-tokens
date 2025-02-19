// import { Address, IUTxO, IValueAsset, UTxO, Value } from "@harmoniclabs/plu-ts"
// import { blockfrost } from "./blockfrost"

// export async function getAuthUtxoWithName(address: string, hash: string, name: Uint8Array): Promise<UTxO> {
//   const utxos: UTxO[] = await blockfrost.addressUtxos(Address.fromString(address))

//   const utxo: UTxO = utxos.find(
//     utxo => {
//       const value = utxo.resolved.value

//       value.get(hash, name)
//     }
//   )!

//   return utxo

// }