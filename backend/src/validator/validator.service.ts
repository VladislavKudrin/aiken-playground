import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ValidatorService {
  private readonly validatorPath = path.join(
    process.cwd(),
    'static',
    'validators',
    'plutus.json',
  );

  async getValidator(index: number = 0): Promise<any> {
    try {
      const jsonContent = JSON.parse(
        fs.readFileSync(this.validatorPath, 'utf8'),
      );

      let plutusVersion: string;
      const validator = jsonContent.validators[index];

      switch (jsonContent.preamble.plutusVersion) {
        case 'v2':
          plutusVersion = 'PlutusV2';
          break;
        case 'v3':
          plutusVersion = 'PlutusV3';
          break;
        default:
          plutusVersion = 'PlutusV3';
      }

      return {
        plutusVersion: plutusVersion,
        validator: validator,
      };
    } catch (e) {
      console.log(e);
    }
  }
}
