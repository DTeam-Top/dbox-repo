import dropbox = require('dropbox');
import { DropboxOptions } from 'dropbox';
import { Repository } from '../store';
import { AbstractRepositoryService } from './abctract';
import fs = require('fs');
import fetch = require('node-fetch');

export class DropBoxService extends AbstractRepositoryService {
  private readonly client: dropbox.Dropbox;

  constructor(repository: Repository) {
    super();
    const options: DropboxOptions = repository.options;
    options.fetch = fetch.default;
    this.client = new dropbox.Dropbox(options);
  }

  async readObject(objPath: string): Promise<string> {
    const requestResult: dropbox.files.FileMetadata = await this.client.filesDownload(
      { path: `/${objPath}` }
    );
    return (requestResult as any).fileBinary.toString('utf8');
  }

  async downloadObject(objPath: string, localPath: string): Promise<boolean> {
    return this.client
      .filesDownload({ path: `/${objPath}` })
      .then(result => {
        fs.writeFileSync(localPath, (result as any).fileBinary, {
          encoding: 'binary',
        });
        return true;
      })
      .catch(err => {
        return Promise.reject(err);
      });
  }
}
