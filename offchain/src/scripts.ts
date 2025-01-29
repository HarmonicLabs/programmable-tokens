import { Address, ByteString, Credential, DataB, Script, ScriptType } from "@harmoniclabs/plu-ts";
import { parseUPLC, compileUPLC, UPLCProgram, Application, UPLCConst } from "@harmoniclabs/uplc"
import { fromHex } from '@harmoniclabs/uint8array-utils'
import { Constr, UPLCTerm, showUPLC } from "@harmoniclabs/uplc"
import { blockfrost } from "./blockfrost.js";
import { BlockfrostPluts } from "@harmoniclabs/blockfrost-pluts";
import { BrowserWallet } from "@meshsdk/core";
import { readFile, writeFile } from 'fs/promises'
import { wallets } from "./wallets.js";

export function applyMany(func: UPLCTerm, argsData: UPLCConst[]) {
  for (let i = 0; i < argsData.length; i++) {
    func = new Application(func, argsData[i]);
  }

  return func
}

export function applyParams(compiledCode: string, params: any[]) {
  const program = parseUPLC(fromHex(compiledCode))

  const applied = compileUPLC(
    new UPLCProgram(
      program.version,
      applyMany(program.body, params)
    )
  )

  const res = new UPLCProgram(
    program.version,
    applyMany(program.body, params)
  )

  console.log(showUPLC(res.body))

  return fromHex(applied.toBinStr())
}

export async function makeValidators() {
  const plutus = JSON.parse(await readFile('../plutus.json', { encoding: "utf-8" }))
  const wallet = await wallets()

  const owner = wallet.owner

  const hash = owner.pub.toBuffer()
  const hashAsBytes = new DataB(hash)
  const uplcOwnerHash = UPLCConst.byteString(new ByteString(hash))

  const utxos = await blockfrost.addressUtxos(owner.address)
    .catch(e => { throw new Error("unable to find utxos at " + owner.address) });

  console.log(utxos)
  const utxo = utxos.find(utxo => utxo.resolved.value.lovelaces >= 5_000_000)!;

  const ref = utxo.utxoRef
  // const refData = ref.toData("v3");
  // const uplcRefData = UPLCConst.data(refData);

  const refConstr = new Constr(0, [UPLCConst.byteString(new ByteString(ref.id.toBuffer())), UPLCConst.int(ref.index)])

  console.log(refConstr)

  // const globalStateScript =
  //   new Script(
  //     ScriptType.PlutusV3,
  //     applyParams(plutus.validators[0].compiledCode, [uplcRefData, uplcOwnerHash])
  //   )

  const globalStateScript =
    new Script(
      ScriptType.PlutusV3,
      applyParams(plutus.validators[0].compiledCode, [refConstr, uplcOwnerHash])
    )

  const globalHash = globalStateScript.hash

  const globalAddr = new Address(
    "testnet",
    Credential.script(globalHash)
  );

  const tokenRegistryScript = new Script(
    ScriptType.PlutusV3,
    fromHex(plutus.validators[3].compiledCode)
  );

  const registryPolicy = tokenRegistryScript.hash
  const registryPolicyData = new DataB(registryPolicy.toString())
  const uplcRegistryPolicy = UPLCConst.data(registryPolicyData)

  const registryAddr = new Address(
    "testnet",
    Credential.script(registryPolicy)
  );

  const userManagerScript = new Script(
    ScriptType.PlutusV3,
    applyParams(plutus.validators[8].compiledCode, [uplcOwnerHash])
  );

  const userPolicy = userManagerScript.hash

  const userStateAddr = new Address(
    "testnet",
    Credential.script(userPolicy)
  )

  const transferManagerScript = new Script(
    ScriptType.PlutusV3,
    applyParams(plutus.validators[6].compiledCode, [uplcRegistryPolicy, uplcOwnerHash])
  );

  const transferHash = transferManagerScript.hash

  const transferAddr = new Address(
    "testnet",
    Credential.script(transferHash)
  )

  const aTokenParam = UPLCConst.int(1)

  const aTokenScript = new Script(
    ScriptType.PlutusV3,
    applyParams(plutus.validators[11].compiledCode, [aTokenParam])
  )

  const aTokenHash = aTokenScript.hash

  const validators = {
    bootOref: ref,
    ownerPkh: owner.address.paymentCreds.hash.toString(),
    validators: {
      registry: {
        script: tokenRegistryScript,
        hash: registryPolicy.toString(),
        address: registryAddr,
      },
      global: {
        script: globalStateScript,
        hash: globalHash.toString(),
        address: globalAddr,
      },
      userState: {
        script: userManagerScript,
        hash: userPolicy.toString(),
        address: userStateAddr,
      },
      transfer: {
        script: transferManagerScript,
        hash: transferHash.toString(),
        address: transferAddr,
      },
      aToken: {
        script: aTokenScript,
        hash: aTokenHash.toString(),
      }
    }
  }

  return writeFile('../validators.json', JSON.stringify(validators))
  // return validators
}

