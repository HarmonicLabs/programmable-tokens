import { applyParamsToScript, Constr, getAddressDetails, Lucid, LucidEvolution, mintingPolicyToId, Script, validatorToAddress, validatorToScriptHash } from "@lucid-evolution/lucid"
import { readFile, writeFile } from 'fs/promises'
import { blockfrost } from './blockfrost.js'

export async function makeValidators() {
  const ownerPKH = getAddressDetails('addr_test1vpygkhec6ghfqvac76uy972rqjwplccv3rvna9qfy43tlqs57l3up')
    .paymentCredential!.hash;

  console.log(ownerPKH)

  const lucid = await blockfrost()
  const utxos = await lucid.utxosAt('addr_test1vpygkhec6ghfqvac76uy972rqjwplccv3rvna9qfy43tlqs57l3up')

  const utxo = utxos[0]

  console.log(utxo)

  const oref = new Constr(0, [utxo.txHash, BigInt(utxo.outputIndex)])
  // Validators && PolicyIds //

  const globalScript = await readGlobalValidator()
  const globalCS = mintingPolicyToId(globalScript)
  const registryScript = await readTokenRegistry()
  const registryCS = mintingPolicyToId(registryScript)
  const userScript = await readUserStateManager()
  const userCS = mintingPolicyToId(userScript)
  const transferScript = await readTransferManager()
  const aTokenScript = await readTestTokenA()
  const aTokenCS = mintingPolicyToId(aTokenScript)
  const bTokenScript = await readTestTokenB()
  const bTokenCS = mintingPolicyToId(bTokenScript)

  // Validator Addresses //

  const globalAddr = validatorToAddress('Preview', globalScript)
  const registryAddr = validatorToAddress('Preview', globalScript)
  const userAddr = validatorToAddress('Preview', globalScript)
  const transferAddr = validatorToAddress('Preview', globalScript)

  // Validator Hashes //

  const globalHash = validatorToScriptHash(globalScript)
  const registryHash = validatorToScriptHash(globalScript)
  const userHash = validatorToScriptHash(globalScript)
  const transferHash = validatorToScriptHash(globalScript)


  async function readGlobalValidator(): Promise<Script> {
    const validator = JSON.parse(await readFile('../plutus.json', { encoding: "utf-8" })).validators[0];
    return {
      type: "PlutusV3",
      script: applyParamsToScript(validator.compiledCode, [oref, ownerPKH]),
    };
  }

  async function readTokenRegistry(): Promise<Script> {
    const validator = JSON.parse(await readFile('../plutus.json', { encoding: "utf-8" })).validators[3];
    return {
      type: "PlutusV3",
      script: validator.compiledCode,
    };
  }

  async function readTransferManager(): Promise<Script> {
    const validator = JSON.parse(await readFile('../plutus.json', { encoding: "utf-8" })).validators[6];
    return {
      type: "PlutusV3",
      script: applyParamsToScript(validator.compiledCode, [registryCS, ownerPKH]),
    };
  }

  async function readUserStateManager(): Promise<Script> {
    const validator = JSON.parse(await readFile('../plutus.json', { encoding: "utf-8" })).validators[8];
    return {
      type: "PlutusV3",
      script: applyParamsToScript(validator.compiledCode, [ownerPKH]),
    };
  }

  async function readTestTokenA(): Promise<Script> {
    const validator = JSON.parse(await readFile('../plutus.json', { encoding: "utf-8" })).validators[11];
    return {
      type: "PlutusV3",
      script: applyParamsToScript(validator.compiledCode, [BigInt(1)]),
    };
  }

  async function readTestTokenB(): Promise<Script> {
    const validator = JSON.parse(await readFile('../plutus.json', { encoding: "utf-8" })).validators[11];
    return {
      type: "PlutusV3",
      script: applyParamsToScript(validator.compiledCode, [BigInt(2)]),
    };
  }

  const validators = {
    bootOref: { txHash: utxo.txHash, index: utxo.outputIndex },
    ownerPkh: ownerPKH,
    scripts: {
      registry: {
        script: registryScript,
        hash: registryHash,
        address: registryAddr,
      },
      global: {
        script: globalScript,
        hash: globalHash,
        address: globalAddr,
      },
      user: {
        script: userScript,
        hash: userHash,
        address: userAddr,
      },
      transfer: {
        script: transferScript,
        hash: transferHash,
        address: transferAddr,
      },
      aToken: {
        script: aTokenScript,
        hash: aTokenCS,
      },
      bToken: {
        script: bTokenScript,
        hash: bTokenCS,
      }
    }
  }

  return writeFile('../validators.json', JSON.stringify(validators))
}


makeValidators()