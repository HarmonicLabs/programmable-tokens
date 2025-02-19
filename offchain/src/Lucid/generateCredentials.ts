import { Lucid, LucidEvolution, generatePrivateKey } from '@lucid-evolution/lucid';
import { writeFile } from 'fs/promises'
import { blockfrost } from './blockfrost.js'

async function generateKeys(lucid: LucidEvolution, i: string) {

  const privateKey = generatePrivateKey();
  await writeFile(`${i}.sk`, privateKey);
  lucid.selectWallet.fromPrivateKey(privateKey)

  const address = await lucid.wallet().address()
  await writeFile(`${i}.addr`, address);

  console.log(`Wallet & Key made for: ${i}`)

}

export async function generateCredentials() {
  const lucid = await blockfrost();

  await generateKeys(lucid, 'owner')
  await generateKeys(lucid, 'user1')
  await generateKeys(lucid, 'user2')

}

generateCredentials()