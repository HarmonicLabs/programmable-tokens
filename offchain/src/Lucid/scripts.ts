import { applyParamsToScript, Constr, Data, getAddressDetails, Lucid, LucidEvolution, mintingPolicyToId, Script, validatorToAddress, validatorToScriptHash } from "@lucid-evolution/lucid"
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
  console.log(utxo.txHash)
  console.log(utxo.outputIndex)

  const oref = new Constr(0, [utxo.txHash, BigInt(utxo.outputIndex)])
  // Validators && PolicyIds //

  const aTokenScript = await readTestTokenA()
  const aTokenCS = mintingPolicyToId(aTokenScript)
  const bTokenScript = await readTestTokenB()
  const bTokenCS = mintingPolicyToId(bTokenScript)
  const globalScript = await readGlobalValidator()
  const globalCS = mintingPolicyToId(globalScript)
  const registryScript = await readTokenRegistry()
  const registryCS = mintingPolicyToId(registryScript)
  const userScript = await readUserStateManager()
  const userCS = mintingPolicyToId(userScript)
  const transferScript = await readTransferManager()

  // Validator Addresses //

  const globalAddr = validatorToAddress('Preprod', globalScript)
  const registryAddr = validatorToAddress('Preprod', registryScript)
  const userAddr = validatorToAddress('Preprod', userScript)
  const transferAddr = validatorToAddress('Preprod', transferScript)
  const thirdPartyAddr = validatorToAddress('Preprod', aTokenScript)

  // Validator Hashes //

  const globalHash = validatorToScriptHash(globalScript)
  const registryHash = validatorToScriptHash(registryScript)
  const userHash = validatorToScriptHash(userScript)
  const transferHash = validatorToScriptHash(transferScript)


  async function readGlobalValidator(): Promise<Script> {
    const validator = JSON.parse(await readFile('../plutus.json', { encoding: "utf-8" })).validators[14];
    return {
      type: "PlutusV3",
      script: applyParamsToScript(validator.compiledCode, [oref, ownerPKH]),
    };
  }

  async function readTokenRegistry(): Promise<Script> {
    const validator = JSON.parse(await readFile('../plutus.json', { encoding: "utf-8" })).validators[17];
    return {
      type: "PlutusV3",
      script: validator.compiledCode,
    };
  }

  async function readTransferManager(): Promise<Script> {
    const validator = JSON.parse(await readFile('../plutus.json', { encoding: "utf-8" })).validators[20];
    return {
      type: "PlutusV3",
      script: applyParamsToScript(validator.compiledCode, [registryCS]),
    };
  }

  async function readUserStateManager(): Promise<Script> {
    const validator = JSON.parse(await readFile('../plutus.json', { encoding: "utf-8" })).validators[23];
    return {
      type: "PlutusV3",
      script: applyParamsToScript(validator.compiledCode, [ownerPKH, aTokenCS]),
    };
  }

  async function readTestTokenA(): Promise<Script> {
    const validator = JSON.parse(await readFile('../plutus.json', { encoding: "utf-8" })).validators[12];
    return {
      type: "PlutusV3",
      script: applyParamsToScript(validator.compiledCode, [BigInt(1)]),
    };
  }

  async function readTestTokenB(): Promise<Script> {
    const validator = JSON.parse(await readFile('../plutus.json', { encoding: "utf-8" })).validators[12];
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
      },
      thirdParty: {
        script: aTokenScript,
        hash: aTokenCS,
        address: thirdPartyAddr
      }
    }
  }

  return writeFile('../validators.json', JSON.stringify(validators))
}


makeValidators()