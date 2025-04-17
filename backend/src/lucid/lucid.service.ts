import {
  Blockfrost,
  generatePrivateKey,
  Lucid,
  LucidEvolution,
} from '@lucid-evolution/lucid';
import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as fsSync from 'fs';
import * as path from 'path';
import { BlockfrostService } from 'src/blockfrost/blockfrost.service';

@Injectable()
export class LucidService {
  private readonly walletPath = path.join(process.cwd(), 'static', 'wallets');

  constructor(private readonly blockfrostService: BlockfrostService) {}

  async getLucid(): Promise<LucidEvolution> {
    const network = this.blockfrostService.getNetwork();
    const blockfrost = this.blockfrostService.getBlockfrost();
    const lucid = await Lucid(
      new Blockfrost(blockfrost.blockfrostURL, blockfrost.projectId),
      network,
    );
    return lucid;
  }

  async getOrCreatePk(name: string) {
    const filePath = path.join(this.walletPath, `${name}.sk`);
    let privateKey: string | null = null;
    if (!fsSync.existsSync(filePath)) {
      privateKey = generatePrivateKey();
      try {
        await fs.mkdir(this.walletPath, { recursive: true });
        await fs.writeFile(filePath, privateKey, 'utf8');
      } catch (e) {
        console.log(e);
      }
    } else {
      privateKey = await fs.readFile(filePath, { encoding: 'utf-8' });
    }
    return privateKey;
  }

  async getOrCreateWallet(name: string): Promise<LucidEvolution> {
    const privateKey = await this.getOrCreatePk(name);
    console.log(privateKey);
    const lucid = await this.getLucid();
    lucid.selectWallet.fromPrivateKey(privateKey);
    return lucid;
  }
}
