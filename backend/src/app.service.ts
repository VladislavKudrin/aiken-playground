import { Injectable } from '@nestjs/common';
import { ValidatorService } from './validator/validator.service';
import { BlockfrostService } from './blockfrost/blockfrost.service';
import { LucidService } from './lucid/lucid.service';
import {
  Constr,
  Data,
  fromText,
  MintingPolicy,
  mintingPolicyToId,
  paymentCredentialOf,
  SpendingValidator,
  toUnit,
  validatorToAddress,
} from '@lucid-evolution/lucid';
import { ResponseDetails } from './interfaces/response-interface';
import { LockDto, MintBurnDto, UnlockDto } from './dtos/dtos';

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
    const validatorJSON = await this.valiadatorService.getValidator(5);
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

    const validatorJSON = await this.valiadatorService.getValidator(5);
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
  async mint(mintDto: MintBurnDto): Promise<ResponseDetails> {
    const { walletName, amount, assetName } = mintDto;
    const network = this.blockfrostService.getNetwork();
    const wallet = await this.lucidService.getOrCreateWallet(walletName);

    const validatorJSON = await this.valiadatorService.getValidator(0);
    const mintingValidator: MintingPolicy = {
      type: validatorJSON.plutusVersion,
      script: validatorJSON.validator.compiledCode,
    };
    console.log(validatorJSON.validator.compiledCode);
    const contractAddress = validatorToAddress(network!, mintingValidator);

    const mintRedeemer = Data.to(new Constr(0, []));

    const policyId = mintingPolicyToId(mintingValidator);
    const asset = toUnit(policyId, fromText(assetName));

    try {
      const tx = await wallet
        .newTx()
        .mintAssets({ [asset]: BigInt(amount) }, mintRedeemer)
        .attach.MintingPolicy(mintingValidator)
        .pay.ToAddress(await wallet.wallet().address(), {
          [asset]: BigInt(amount),
        })
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

  async burn(burnDto: MintBurnDto): Promise<ResponseDetails> {
    const { walletName, amount, assetName } = burnDto;
    const network = this.blockfrostService.getNetwork();
    const wallet = await this.lucidService.getOrCreateWallet(walletName);

    const validatorJSON = await this.valiadatorService.getValidator(0);
    const mintingValidator: MintingPolicy = {
      type: validatorJSON.plutusVersion,
      script: validatorJSON.validator.compiledCode,
    };
    const contractAddress = validatorToAddress(network!, mintingValidator);

    const burnRedeemer = Data.to(new Constr(1, []));

    const policyId = mintingPolicyToId(mintingValidator);
    const asset = toUnit(policyId, fromText(assetName));

    try {
      const tx = await wallet
        .newTx()
        .mintAssets({ [asset]: BigInt(-amount) }, burnRedeemer)
        .attach.MintingPolicy(mintingValidator)
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
