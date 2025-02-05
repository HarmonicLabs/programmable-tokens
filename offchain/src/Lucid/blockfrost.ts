import { Blockfrost, Lucid } from "@lucid-evolution/lucid";

export async function blockfrost() {
  const lucid = await Lucid(
    new Blockfrost(
      "https://cardano-preview.blockfrost.io/api/v0",
      'previewiKYeItqp0rybitGGcRp3csHYRk01p3fd',
    ),
    "Preview",
  );

  return lucid
}