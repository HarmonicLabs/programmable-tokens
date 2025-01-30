import { Blockfrost, Lucid } from "@lucid-evolution/lucid";

export async function blockfrost() {
  const lucid = await Lucid(
    new Blockfrost(
      "https://cardano-preview.blockfrost.io/api/v0",
      '',
    ),
    "Preview",
  );

  return lucid
}