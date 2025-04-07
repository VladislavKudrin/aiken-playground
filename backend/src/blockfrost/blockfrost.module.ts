import { Module } from '@nestjs/common';
import { BlockfrostService } from './blockfrost.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [BlockfrostService],
  exports: [BlockfrostService],
})
export class BlockfrostModule {}
