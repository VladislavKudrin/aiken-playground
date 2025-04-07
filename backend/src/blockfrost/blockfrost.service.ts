import { Network } from '@lucid-evolution/lucid';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class BlockfrostService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  getNetwork() {
    const network = this.configService.get<Network>('NETWORK');
    return network;
  }

  getBlockfrost(): {
    projectId: string;
    blockfrostURL: string;
  } {
    const network = this.getNetwork();
    const projectId = this.configService.get<string>('BLOCKFROST_PROJECT_ID')!;

    let blockfrostURL: string = 'https://cardano-preprod.blockfrost.io/api/v0';

    if (network) {
      blockfrostURL = `https://cardano-${network.toLowerCase()}.blockfrost.io/api/v0`;
    }

    return {
      projectId: projectId,
      blockfrostURL: blockfrostURL,
    };
  }

  async requestBlockfrost(url: string, pages: boolean = false): Promise<any[]> {
    const blockfrost = this.getBlockfrost();
    const headers = { project_id: blockfrost.projectId };

    if (!pages) {
      try {
        const response: any = await lastValueFrom(
          this.httpService.get(`${blockfrost.blockfrostURL}/${url}`, {
            headers,
          }),
        );
        return response.data;
      } catch (e) {
        console.log(e);
        throw new Error('Error requesting blockfrost');
      }
    }

    let page = 1;
    let results: any[] = [];
    let hasMore = true;
    const pageSize = 100;

    while (hasMore) {
      try {
        const response: any = await lastValueFrom(
          this.httpService.get(`${blockfrost.blockfrostURL}/${url}`, {
            headers,
            params: { page, count: pageSize },
          }),
        );
        const data = response.data;
        if (data.length < pageSize) {
          hasMore = false;
        } else {
          page++;
        }
        results = results.concat(data);
      } catch (e) {
        console.error(e);
        throw new Error('Error requesting blockfrost');
      }
    }

    return results;
  }
}
