import { Repository } from '../store';
import { AbstractRepositoryService } from './abctract';
import S3 = require('aws-sdk/clients/s3');
import fs = require('fs');

export class S3Service extends AbstractRepositoryService {
  private readonly client: S3;
  private bucket: string;

  constructor(repository: Repository) {
    super();
    const options: S3.Types.ClientConfiguration = repository.options;
    if (options.hasOwnProperty('bucket')) {
      if (!options.params) {
        options.params = {};
      }
      options.params.Bucket = (options as any)['bucket'];
    }

    if (!(options.params && options.params.Bucket)) {
      throw new Error('Not set Bucket yet');
    }
    this.bucket = options.params.Bucket;
    this.client = new S3(options);
  }

  async readObject(objPath: string): Promise<string> {
    const getObjectPromise = this.client
      .getObject({ Bucket: this.bucket, Key: objPath })
      .promise();

    return getObjectPromise
      .then(result => {
        if (result.Body) {
          return result.Body.toString('utf8');
        } else {
          return '';
        }
      })
      .catch(err => {
        return Promise.reject(err);
      });
  }

  async downloadObject(objPath: string, localPath: string): Promise<boolean> {
    const getObjectPromise = this.client
      .getObject({ Bucket: this.bucket, Key: objPath })
      .promise();

    return getObjectPromise
      .then(result => {
        if (result.Body) {
          fs.writeFileSync(localPath, result.Body, { encoding: 'binary' });
        }
        return true;
      })
      .catch(err => {
        return Promise.reject(err);
      });
  }
}
