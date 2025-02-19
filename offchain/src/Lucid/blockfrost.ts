import { Blockfrost, Lucid } from "@lucid-evolution/lucid";

export async function blockfrost() {
  const lucid = await Lucid(
    new Blockfrost(
      "https://cardano-preprod.blockfrost.io/api/v0",
      'preprodx670GWOQ6OC85fETu6xd0Gbu7nZuZI6W',
    ),
    "Preprod",
  );

  return lucid
}