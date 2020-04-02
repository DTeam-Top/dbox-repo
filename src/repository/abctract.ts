import * as path from 'path';
import * as tmp from 'tmp';
import { DownloadResult, ExtensionDetails, ExtensionMetadata } from '../remote';
import { RepositoryService } from '../repository';
import { getExtensionName } from '../utils';

export abstract class AbstractRepositoryService implements RepositoryService {
  private readonly metadataPath: string = 'metadatas';

  /**
   * Read the object from repository by path
   * @param objPath
   * @returns the content of the object
   */
  abstract readObject(objPath: string): Promise<string>;

  /**
   * Download the object repository by path
   * @param objPath object path
   * @param localPath local path
   * @returns succeeded
   */
  abstract downloadObject(objPath: string, localPath: string): Promise<boolean>;

  private async getMetadata(): Promise<ExtensionMetadata[]> {
    return this.readObject(this.metadataPath)
      .then(result => {
        const metadata: string = result;
        return JSON.parse(metadata);
      })
      .catch(() => {
        return [];
      });
  }

  async listExtensions(): Promise<ExtensionMetadata[]> {
    return this.getMetadata();
  }

  async downloadExtension(extId: string): Promise<DownloadResult> {
    const extension: ExtensionMetadata = await this.findExtension(extId);

    const extensionName: string = getExtensionName(extension.extId);
    // TODO: history version support
    const extensionVersion: string = extension.currentVersion;
    const vsixName = `${extensionName}-${extensionVersion}.vsix`;
    const vsixObjectPath = `${extensionName}/${extensionVersion}/${vsixName}`;
    const vsixDownloadPath: string = path.join(tmp.dirSync().name, vsixName);
    await this.downloadObject(vsixObjectPath, vsixDownloadPath);

    return Promise.resolve({
      metadata: extension,
      vsixPath: vsixDownloadPath,
    });
  }

  async showExtension(
    extId: string,
    version?: string
  ): Promise<ExtensionDetails> {
    const extensionMetadata: ExtensionMetadata = await this.findExtension(
      extId,
      version
    );

    const name: string = getExtensionName(extensionMetadata.extId);
    const extensionVersion: string = extensionMetadata.currentVersion;
    let readMe = '';
    let changeLog = '';
    const getReadMePromise: Promise<void> = this.readObject(
      `${name}/${extensionVersion}/README.md`
    )
      .then(content => {
        readMe = content;
      })
      .catch(() => {
        readMe = '';
      });
    const getChangeLogPromise: Promise<void> = this.readObject(
      `${name}/${extensionVersion}/CHANGELOG.md`
    )
      .then(content => {
        changeLog = content;
      })
      .catch(() => {
        changeLog = '';
      });
    await Promise.all([getReadMePromise, getChangeLogPromise]);

    return Promise.resolve({
      metadata: extensionMetadata,
      readme: readMe,
      changelog: changeLog,
    });
  }

  async findExtension(
    extId: string,
    version?: string
  ): Promise<ExtensionMetadata> {
    const metadatas: ExtensionMetadata[] = await this.getMetadata();
    const extensionMetadata: ExtensionMetadata | undefined = metadatas.find(
      element => {
        return element.extId === extId;
      }
    );

    if (extensionMetadata) {
      if (!version) {
        version = extensionMetadata.currentVersion;
      }
      // TODO: history version check
      if (extensionMetadata.currentVersion === version) {
        return extensionMetadata;
      } else {
        return Promise.reject(
          `Not found extension ${extId} with version ${version}`
        );
      }
    } else {
      return Promise.reject(`Not found extension ${extId}`);
    }
  }
}
