import { existsSync } from "fs";
import { mkdir, writeFile, readFile } from "fs/promises";
import { makeValidators } from "./scripts.js";
import { blockfrost } from "./blockfrost.js";

async function main() {
  if (!existsSync("./testnet")) {
    await mkdir("./testnet");
  }
  await makeValidators()
  console.log('Compiled validators with Owner as Address1')
}
main();