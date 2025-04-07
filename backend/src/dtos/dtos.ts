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
