import { Injectable } from '@nestjs/common';
import { ValidatorService } from './validator/validator.service';
import { BlockfrostService } from './blockfrost/blockfrost.service';
import { LucidService } from './lucid/lucid.service';
import {
  Constr,
  Data,
  paymentCredentialOf,
  SpendingValidator,
  validatorToAddress,
} from '@lucid-evolution/lucid';
import { ResponseDetails } from './interfaces/response-interface';
import { LockDto, UnlockDto } from './dtos/dtos';

@Injectable()
export class AppService {
  constructor(
    private readonly lucidService: LucidService,
    private readonly valiadatorService: ValidatorService,
    private readonly blockfrostService: BlockfrostService,
  ) {}
  async lock(lockDto: LockDto): Promise<ResponseDetails> {
    const { walletName, amount } = lockDto;
    const network = this.blockfrostService.getNetwork();
    const wallet = await this.lucidService.getOrCreateWallet(walletName);

    const validatorJSON = await this.valiadatorService.getValidator(0);
    const spendingValidator: SpendingValidator = {
      type: validatorJSON.plutusVersion,
      script: validatorJSON.validator.compiledCode,
    };
    const contractAddress = validatorToAddress(network!, spendingValidator);

    const lockDatum = Data.to(
      new Constr(0, [
        paymentCredentialOf(await wallet.wallet().address()).hash,
      ]),
    );

    try {
      const tx = await wallet
        .newTx()
        .pay.ToContract(
          contractAddress,
          { kind: 'inline', value: lockDatum },
          { lovelace: BigInt(amount * 1000000) },
        )
        .complete();
      const signedTx = await tx.sign.withWallet().complete();
      const txHash = await signedTx.submit();

      return {
        walletAddress: await wallet.wallet().address(),
        scriptAddress: contractAddress,
        txHash: txHash,
        amount: amount,
      };
    } catch (e) {
      return {
        walletAddress: await wallet.wallet().address(),
        scriptAddress: contractAddress,
        amount: amount,
        errorMessage: `${e}`,
      };
    }
  }

  async unlock(unlockDto: UnlockDto): Promise<ResponseDetails> {
    const { walletName, txHash, txId } = unlockDto;
    const network = this.blockfrostService.getNetwork();
    const wallet = await this.lucidService.getOrCreateWallet(walletName);

    const validatorJSON = await this.valiadatorService.getValidator(0);
    const spendingValidator: SpendingValidator = {
      type: validatorJSON.plutusVersion,
      script: validatorJSON.validator.compiledCode,
    };
    const contractAddress = validatorToAddress(network!, spendingValidator);

    const redeemer = Data.to(new Constr(0, []));

    const scriptUtxos = await wallet.utxosAt(contractAddress);
    const utxoToSpend = scriptUtxos.find(
      (utxo) => utxo.txHash == txHash && utxo.outputIndex == txId,
    );

    try {
      if (!utxoToSpend) {
        throw new Error('No utxo found');
      }

      const tx = await wallet
        .newTx()
        .collectFrom([utxoToSpend], redeemer)
        .attach.SpendingValidator(spendingValidator)
        .addSignerKey(paymentCredentialOf(await wallet.wallet().address()).hash)
        .complete();

      const signedTx = await tx.sign.withWallet().complete();
      const txHash = await signedTx.submit();

      return {
        walletAddress: await wallet.wallet().address(),
        scriptAddress: contractAddress,
        txHash: txHash,
      };
    } catch (e) {
      return {
        walletAddress: await wallet.wallet().address(),
        scriptAddress: contractAddress,
        errorMessage: `${e}`,
      };
    }
  }
}
