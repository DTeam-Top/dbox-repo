import * as oss from 'ali-oss';
import { Repository } from '../store';
import { AbstractRepositoryService } from './abctract';

export class OssService extends AbstractRepositoryService {
  private readonly client: oss;

  constructor(repository: Repository) {
    super();
    const options: oss.Options = repository.options;
    this.client = new oss(options);
  }

  async readObject(objPath: string): Promise<string> {
    return (await this.client.get(objPath)).content.toString('utf8');
  }

  async downloadObject(objPath: string, localPath: string): Promise<boolean> {
    return this.client
      .get(objPath, localPath)
      .then(_ => {
        return true;
      })
      .catch(err => {
        return Promise.reject(err);
      });
  }
}
