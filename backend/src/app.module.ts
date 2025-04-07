import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ValidatorModule } from './validator/validator.module';
import { BlockfrostModule } from './blockfrost/blockfrost.module';
import { ConfigModule } from '@nestjs/config';
import { LucidModule } from './lucid/lucid.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    // ServeStaticModule.forRoot({
    //   rootPath: join(__dirname, '..', 'static'),
    // }),
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    ValidatorModule,
    BlockfrostModule,
    LucidModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
