import { Module } from '@nestjs/common';
import { LucidService } from './lucid.service';
import { BlockfrostModule } from 'src/blockfrost/blockfrost.module';

@Module({
  imports: [BlockfrostModule],
  providers: [LucidService],
  exports: [LucidService],
})
export class LucidModule {}
