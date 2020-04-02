import * as vscode from 'vscode';
import { RepositoryService } from './repository';
import { DropBoxService } from './repository/dropbox';
import { OssService } from './repository/oss';
import { S3Service } from './repository/s3';
import { insertExtensionToHome, Repository, loadFromHome } from './store';

export interface ExtensionMetadata {
  extId: string;
  currentVersion: string;
  // base64 encode of an icon
  icon: string;
  describe: string;
  dateCreated: Date;
  lastUpdate: Date;
}

export interface DownloadResult {
  metadata: ExtensionMetadata;
  vsixPath: string;
}

export interface ExtensionDetails {
  metadata: ExtensionMetadata;
  readme: string;
  changelog: string;
}

const repositoryServiceFactory = {
  getService(repository: Repository): RepositoryService {
    if (repository.type === 'oss') {
      return new OssService(repository);
    } else if (repository.type === 'dropbox') {
      return new DropBoxService(repository);
    } else if (repository.type === 's3') {
      return new S3Service(repository);
    }

    throw new Error(`Unknown repository type ${repository.type}`);
  },
};

export async function listExtensions(
  repository: string
): Promise<ExtensionMetadata[]> {
  const store = await loadFromHome();
  const repo = store.repositories.find(repo => repo.name === repository);
  if (repo) {
    return repositoryServiceFactory.getService(repo).listExtensions();
  } else {
    return Promise.reject(
      `Can not get a respository service for ${repository}`
    );
  }
}

export async function installExtension(extId: string, repository: string) {
  const store = await loadFromHome();
  const repo = store.repositories.find(repo => repo.name === repository);
  if (repo) {
    return repositoryServiceFactory
      .getService(repo)
      .downloadExtension(extId)
      .then(result => {
        vscode.commands
          .executeCommand(
            'workbench.extensions.installExtension',
            vscode.Uri.file(result.vsixPath)
          )
          .then(async val => {
            await insertExtensionToHome({
              extId,
              version: result.metadata.currentVersion,
              describe: result.metadata.describe,
              enabled: true,
              repository,
            });
            vscode.window.showInformationMessage(
              `${extId} installed successfully, please restart.`
            );
            return;
          });
      })
      .catch(e => {
        return Promise.reject(
          `Can not download extension(${extId}), caused by: ${e}`
        );
      });
  } else {
    return Promise.reject(
      `Can not get a respository service for ${repository}`
    );
  }
}

export async function showExtension(
  extId: string,
  repository: string
): Promise<ExtensionDetails> {
  const store = await loadFromHome();
  const repo = store.repositories.find(repo => repo.name === repository);
  if (repo) {
    return repositoryServiceFactory.getService(repo).showExtension(extId);
  } else {
    return Promise.reject(
      `Can not get a respository service for ${repository}`
    );
  }
}
