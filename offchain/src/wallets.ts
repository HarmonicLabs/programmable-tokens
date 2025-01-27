import { BlockfrostPluts } from "@harmoniclabs/blockfrost-pluts";
import { PrivateKey, Address, PublicKey } from "@harmoniclabs/plu-ts";
import { readFile } from "fs/promises";

async function getWalletDetails(i: string) {
  const privateKeyFile = await readFile(`./testnet/payment${i}.skey`, { encoding: "utf-8" });
  const privateKey = PrivateKey.fromCbor(JSON.parse(privateKeyFile).cborHex).toString();

  const addr = await readFile(`./testnet/address${i}.addr`, { encoding: "utf-8" });
  const address = Address.fromString(addr);

  const publicKeyFile = await readFile(`./testnet/payment${i}.vkey`, { encoding: "utf-8" });
  const pkh = PublicKey.fromCbor(JSON.parse(publicKeyFile).cborHex).hash.toString();

  return {
    address: address,
    priv: privateKey,
    pub: pkh,
  }
}

export async function wallets() {
  const owner = await getWalletDetails('1')
  const user1 = await getWalletDetails('2')
  const user2 = await getWalletDetails('3')

  return {
    owner: owner,
    user1: user1,
    user2: user2
  }
}