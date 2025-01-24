import { Address, Credential, DataB, Script, ScriptType } from "@harmoniclabs/plu-ts";
import { parseUPLC, compileUPLC, UPLCProgram, Application, UPLCConst } from "@harmoniclabs/uplc"
import { fromHex } from '@harmoniclabs/uint8array-utils'
import plutus from '../../plutus.json'
import { Constr, UPLCTerm } from "@harmoniclabs/uplc"
import blockfrost from "./blockfrost";
import { BlockfrostPluts } from "@harmoniclabs/blockfrost-pluts";
import { BrowserWallet } from "@meshsdk/core";
import { writeFile } from 'fs/promises'

export function applyMany(func: UPLCTerm, argsData: UPLCConst[]) {
  for (let i = 0; i < argsData.length; i++) func = new Application(func, argsData[i]);

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

  return fromHex(applied.toBinStr())
}

export async function makeValidators(wallet: BrowserWallet, blockfrost: BlockfrostPluts) {
  const changeAdd = Address.fromString(
    await wallet.getChangeAddress()
  )

  const hash = fromHex(changeAdd.paymentCreds.hash.toString())
  const hashAsBytes = new DataB(hash)
  const uplcOwnerHash = UPLCConst.data(hashAsBytes)

  const utxos = await blockfrost.addressUtxos(changeAdd)
    .catch(e => { throw new Error("unable to find utxos at " + changeAdd) });

  const utxo = utxos.find(utxo => utxo.resolved.value.lovelaces >= 5_000_000)!;

  const ref = utxo.utxoRef
  const refData = ref.toData("v3");
  const uplcRefData = UPLCConst.data(refData);

  console.log(uplcRefData)

  const globalStateScript =
    new Script(
      ScriptType.PlutusV3,
      applyParams(plutus.validators[0].compiledCode, [uplcRefData, uplcOwnerHash])
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

  const validators = {
    bootOref: ref,
    ownerPkh: changeAdd.paymentCreds.hash.toString(),
    validators: {
      registry: {
        script: tokenRegistryScript.toCbor(),
        hash: registryPolicy,
        address: registryAddr,
      },
      global: {
        script: globalStateScript.toCbor(),
        hash: globalHash,
        address: globalAddr,
      },
      userState: {
        script: userManagerScript.toCbor(),
        hash: userPolicy,
        address: userStateAddr,
      },
      transfer: {
        script: transferManagerScript.toCbor(),
        hash: transferHash,
        address: registryAddr,
      },
    }
  }

  return writeFile('../validators.json', validators.toString())

}

