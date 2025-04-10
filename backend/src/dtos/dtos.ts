import { IsNumber, IsString } from 'class-validator';

export class LockDto {
  @IsNumber()
  amount: number;

  @IsString()
  walletName: string;
}

export class UnlockDto {
  @IsNumber()
  txId: number;

  @IsString()
  txHash: string;

  @IsString()
  walletName: string;
}

export class MintBurnDto {
  @IsNumber()
  amount: number;

  @IsString()
  assetName: string;

  @IsString()
  walletName: string;
}
