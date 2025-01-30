import { TxBuilder, defaultProtocolParameters } from "@harmoniclabs/plu-ts";
import { BlockfrostPluts } from "@harmoniclabs/blockfrost-pluts";

/**
 * we don't want to do too many API call if we already have our `txBuilder`
 * 
 * so after the first call we'll store a copy here.
**/
let _cachedTxBuilder: TxBuilder | undefined = undefined

export const blockfrost = new BlockfrostPluts({
  projectId: 'previewiKYeItqp0rybitGGcRp3csHYRk01p3fd', // see: https://blockfrost.io
});

export async function getTxBuilder(blockfrost: BlockfrostPluts): Promise<TxBuilder> {
  if (!(_cachedTxBuilder instanceof TxBuilder)) {
    const parameters = await blockfrost.epochsLatestParameters();
    _cachedTxBuilder = new TxBuilder(parameters);
  }
  return _cachedTxBuilder;
}