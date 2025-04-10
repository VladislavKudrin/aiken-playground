import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';
import { LockDto, MintBurnDto, UnlockDto } from './dtos/dtos';
import { Response } from './interfaces/response-interface';

@Controller()
export class AppController {
  constructor(
    private readonly configService: ConfigService,
    private readonly appService: AppService,
  ) {}

  @Post('lock/')
  async lock(@Body() lockDto: LockDto): Promise<Response> {
    try {
      if (lockDto.walletName.length == 0 || lockDto.amount == 0) {
        throw new Error('Define amount or wallet name');
      }

      const lockResult = await this.appService.lock(lockDto);

      return {
        action: 'LOCK',
        walletName: lockDto.walletName,
        status: lockResult.errorMessage ? 'ERROR' : 'OK',
        details: lockResult,
      };
    } catch (e) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: `${e}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('unlock/')
  async unlock(@Body() unlockDto: UnlockDto): Promise<Response> {
    try {
      if (unlockDto.walletName.length == 0 || unlockDto.txHash.length == 0) {
        throw new Error('Define tx hash or wallet name');
      }

      const unlockResult = await this.appService.unlock(unlockDto);

      return {
        action: 'UNLOCK',
        walletName: unlockDto.walletName,
        status: unlockResult.errorMessage ? 'ERROR' : 'OK',
        details: unlockResult,
      };
    } catch (e) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: `${e}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('mint/')
  async mint(@Body() mintDto: MintBurnDto): Promise<Response> {
    try {
      if (
        mintDto.walletName.length == 0 ||
        mintDto.amount == 0 ||
        mintDto.assetName.length == 0
      ) {
        throw new Error('Define amount or wallet name or asset name');
      }

      const mintResult = await this.appService.mint(mintDto);

      return {
        action: 'MINT',
        walletName: mintDto.walletName,
        status: mintResult.errorMessage ? 'ERROR' : 'OK',
        details: mintResult,
      };
    } catch (e) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: `${e}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('burn/')
  async burn(@Body() burnDto: MintBurnDto): Promise<Response> {
    try {
      if (
        burnDto.walletName.length == 0 ||
        burnDto.amount == 0 ||
        burnDto.assetName.length == 0
      ) {
        throw new Error('Define amount or wallet name or asset name');
      }

      const mintResult = await this.appService.burn(burnDto);

      return {
        action: 'BURN',
        walletName: burnDto.walletName,
        status: mintResult.errorMessage ? 'ERROR' : 'OK',
        details: mintResult,
      };
    } catch (e) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: `${e}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
