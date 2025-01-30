import { existsSync } from "fs";
import { mkdir, writeFile, readFile } from "fs/promises";
import { makeValidators } from "./scripts.js";
import { mintGlobalStateBuilder } from "./global.js";
import { blockfrost } from "./blockfrost.js";

async function main() {
  // if (!existsSync("./testnet")) {
  //   await mkdir("./testnet");
  // }
  makeValidators()
  // const tx = await mintGlobalStateBuilder(blockfrost)
  // console.log(tx)
  // console.log('Compiled validators with Owner as Address1')
}
main();