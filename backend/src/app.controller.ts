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
import { LockDto, UnlockDto } from './dtos/dtos';
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
}
