import { Address, Credential, Script, ScriptType } from "@harmoniclabs/plu-ts";
import { parseUPLC, compileUPLC, UPLCProgram, Application } from "@harmoniclabs/uplc"
import { fromHex } from '@harmoniclabs/uint8array-utils'
import plutus from '../../plutus.json'

// const program = parseUPLC(contractBytes);

// const applied = compileUPLC(
//   new UPLCProgram(
//     program.version,
//     new Application(
//       program.body,
//       // here your value to apply
//     )
//   )
// )

export const globalStateScript =
  new Script(
    ScriptType.PlutusV3,
    fromHex(plutus.validators[0].compiledCode)
  )

export const tokenRegistryScript = new Script(
  ScriptType.PlutusV3,
  fromHex(plutus.validators[3].compiledCode)
);

export const transferManagerScript = new Script(
  ScriptType.PlutusV3,
  fromHex(plutus.validators[6].compiledCode)
);

export const userManagerScript = new Script(
  ScriptType.PlutusV3,
  fromHex(plutus.validators[8].compiledCode)
);

export const globalAddr = new Address(
  "testnet",
  Credential.script(globalStateScript.hash)
);

export const registryAddr = new Address(
  "testnet",
  Credential.script(tokenRegistryScript.hash)
);

export const userStateAddr = new Address(
  "testnet",
  Credential.script(userManagerScript.hash)
)

export const globalPolicy = globalStateScript.hash
export const registryPolicy = tokenRegistryScript.hash
export const userPolicy = userManagerScript.hash