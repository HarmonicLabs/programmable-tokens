import { applyParamsToScript, Constr, Data, getAddressDetails, Lucid, LucidEvolution, mintingPolicyToId, Script, validatorToAddress, validatorToScriptHash } from "@lucid-evolution/lucid"
import { readFile, writeFile } from 'fs/promises'
import { blockfrost } from './blockfrost.js'

export async function makeValidators() {
  const lucid = await blockfrost()

  const ownerPKH = getAddressDetails('addr_test1vpygkhec6ghfqvac76uy972rqjwplccv3rvna9qfy43tlqs57l3up')
    .paymentCredential!.hash;
  const atxos = await lucid.utxosAt('addr_test1vpygkhec6ghfqvac76uy972rqjwplccv3rvna9qfy43tlqs57l3up')
  const atxo = atxos[0]

  const orefA = new Constr(0, [atxo.txHash, BigInt(atxo.outputIndex)])

  const user1PKH = getAddressDetails('addr_test1vzrpepre3t5k05w6plk4z9tc0c4yjlsqqfk8pn7uwdhzl5ge8g32s')
    .paymentCredential!.hash;
  const btxos = await lucid.utxosAt('addr_test1vzrpepre3t5k05w6plk4z9tc0c4yjlsqqfk8pn7uwdhzl5ge8g32s')
  const btxo = btxos[0]

  const orefB = new Constr(0, [btxo.txHash, BigInt(btxo.outputIndex)])

  const user2PKH = getAddressDetails('addr_test1vph88mwyh3uf38t4tzedtq9gvszxax4lqnq7wacxjh8uawg3wunka')
    .paymentCredential!.hash;
  const ctxos = await lucid.utxosAt('addr_test1vph88mwyh3uf38t4tzedtq9gvszxax4lqnq7wacxjh8uawg3wunka')
  const ctxo = ctxos[0]

  const orefC = new Constr(0, [ctxo.txHash, BigInt(ctxo.outputIndex)])

  // Validators && PolicyIds //

  const aTokenScript = await readTestTokenA()
  const aTokenCS = mintingPolicyToId(aTokenScript)
  console.log(`AToken: ${aTokenCS}`)
  const bTokenScript = await readTestTokenB()
  const bTokenCS = mintingPolicyToId(bTokenScript)
  console.log(`BToken: ${bTokenCS}`)
  const cTokenScript = await readTestTokenC()
  const cTokenCS = mintingPolicyToId(cTokenScript)
  console.log(`CToken: ${cTokenCS}`)
  const account = await readAccountValidator()
  const accountHash = validatorToScriptHash(account)
  const aGlobalScript = await readGlobalValidatorA()
  const bGlobalScript = await readGlobalValidatorB()
  const cGlobalScript = await readGlobalValidatorC()

  // const globalCS = mintingPolicyToId(globalScript)
  const registryScript = await readTokenRegistry()
  const registryCS = mintingPolicyToId(registryScript)
  const aUserScript = await readUserStateManagerA()
  const bUserScript = await readUserStateManagerB()
  const cUserScript = await readUserStateManagerC()
  // const userCS = mintingPolicyToId(userScript)
  const aTransferScript = await readTransferManagerA()
  const bTransferScript = await readTransferManagerB()
  const cTransferScript = await readTransferManagerC()

  // Validator Addresses //

  // const globalAddr = validatorToAddress('Preprod', globalScript)
  // const registryAddr = validatorToAddress('Preprod', registryScript)
  // const userAddr = validatorToAddress('Preprod', userScript)
  // const transferAddr = validatorToAddress('Preprod', transferScript)
  // const thirdPartyAddr = validatorToAddress('Preprod', aTokenScript)

  // Validator Hashes //

  // const globalHash = validatorToScriptHash(globalScript)
  // const registryHash = validatorToScriptHash(registryScript)
  // const userHash = validatorToScriptHash(userScript)
  // const transferHash = validatorToScriptHash(transferScript)

  async function readAccountValidator(): Promise<Script> {
    const validator = JSON.parse(await readFile('../plutus.json', { encoding: "utf-8" })).validators[3];
    return {
      type: "PlutusV3",
      script: validator.compiledCode,
    };
  }

  async function readGlobalValidatorA(): Promise<Script> {
    const validator = JSON.parse(await readFile('../plutus.json', { encoding: "utf-8" })).validators[5];
    return {
      type: "PlutusV3",
      script: applyParamsToScript(validator.compiledCode, [orefA, ownerPKH]),
    };
  }

  async function readGlobalValidatorB(): Promise<Script> {
    const validator = JSON.parse(await readFile('../plutus.json', { encoding: "utf-8" })).validators[5];
    return {
      type: "PlutusV3",
      script: applyParamsToScript(validator.compiledCode, [orefB, user1PKH]),
    };
  }

  async function readGlobalValidatorC(): Promise<Script> {
    const validator = JSON.parse(await readFile('../plutus.json', { encoding: "utf-8" })).validators[5];
    return {
      type: "PlutusV3",
      script: applyParamsToScript(validator.compiledCode, [orefC, user2PKH]),
    };
  }

  async function readTokenRegistry(): Promise<Script> {
    const validator = JSON.parse(await readFile('../plutus.json', { encoding: "utf-8" })).validators[8];
    return {
      type: "PlutusV3",
      script: validator.compiledCode
    };
  }

  async function readTransferManagerA(): Promise<Script> {
    const validator = JSON.parse(await readFile('../plutus.json', { encoding: "utf-8" })).validators[11];
    return {
      type: "PlutusV3",
      script: applyParamsToScript(validator.compiledCode, [registryCS, accountHash, aTokenCS]),
    };
  }

  async function readTransferManagerB(): Promise<Script> {
    const validator = JSON.parse(await readFile('../plutus.json', { encoding: "utf-8" })).validators[11];
    return {
      type: "PlutusV3",
      script: applyParamsToScript(validator.compiledCode, [registryCS, accountHash, bTokenCS]),
    };
  }

  async function readTransferManagerC(): Promise<Script> {
    const validator = JSON.parse(await readFile('../plutus.json', { encoding: "utf-8" })).validators[11];
    return {
      type: "PlutusV3",
      script: applyParamsToScript(validator.compiledCode, [registryCS, accountHash, cTokenCS]),
    };
  }

  async function readUserStateManagerA(): Promise<Script> {
    const validator = JSON.parse(await readFile('../plutus.json', { encoding: "utf-8" })).validators[13];
    return {
      type: "PlutusV3",
      script: applyParamsToScript(validator.compiledCode, [ownerPKH, aTokenCS]),
    };
  }

  async function readUserStateManagerB(): Promise<Script> {
    const validator = JSON.parse(await readFile('../plutus.json', { encoding: "utf-8" })).validators[13];
    return {
      type: "PlutusV3",
      script: applyParamsToScript(validator.compiledCode, [user1PKH, bTokenCS]),
    };
  }

  async function readUserStateManagerC(): Promise<Script> {
    const validator = JSON.parse(await readFile('../plutus.json', { encoding: "utf-8" })).validators[13];
    return {
      type: "PlutusV3",
      script: applyParamsToScript(validator.compiledCode, [user2PKH, cTokenCS]),
    };
  }

  async function readTestTokenA(): Promise<Script> {
    const validator = JSON.parse(await readFile('../plutus.json', { encoding: "utf-8" })).validators[0];
    return {
      type: "PlutusV3",
      script: applyParamsToScript(validator.compiledCode, [BigInt(3)]),
    };
  }

  async function readTestTokenB(): Promise<Script> {
    const validator = JSON.parse(await readFile('../plutus.json', { encoding: "utf-8" })).validators[0];
    return {
      type: "PlutusV3",
      script: applyParamsToScript(validator.compiledCode, [BigInt(4)]),
    };
  }

  async function readTestTokenC(): Promise<Script> {
    const validator = JSON.parse(await readFile('../plutus.json', { encoding: "utf-8" })).validators[0];
    return {
      type: "PlutusV3",
      script: applyParamsToScript(validator.compiledCode, [BigInt(5)]),
    };
  }

  const validators = {
    a: {
      bootOref: { txHash: atxo.txHash, index: atxo.outputIndex },
      aPkh: ownerPKH,
    },
    b: {
      bootOref: { txHash: btxo.txHash, index: btxo.outputIndex },
      bPkh: user1PKH,
    },
    c: {
      bootOref: { txHash: ctxo.txHash, index: ctxo.outputIndex },
      cPkh: user2PKH,
    },
    scripts: {
      account: {
        script: account,
      },
      registry: {
        script: registryScript,
      },
      aGlobal: {
        script: aGlobalScript,
      },
      aTransfer: {
        script: aTransferScript,
      },
      aToken: {
        script: aTokenScript,
      },
      aUser: {
        script: aUserScript,
      },
      bGlobal: {
        script: bGlobalScript,
      },
      bUser: {
        script: bUserScript,
      },
      bTransfer: {
        script: bTransferScript,
      },
      bToken: {
        script: bTokenScript,
      },
      cGlobal: {
        script: cGlobalScript,
      },
      cUser: {
        script: cUserScript,
      },
      cTransfer: {
        script: cTransferScript,
      },
      cToken: {
        script: cTokenScript,
      },
      thirdParty: {
        script: aTokenScript,
      }
    }
  }

  return writeFile('../validators.json', JSON.stringify(validators))
}


makeValidators()