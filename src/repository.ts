import { DownloadResult, ExtensionDetails, ExtensionMetadata } from './remote';

export interface RepositoryService {
  /**
   * List remote extension informations
   * @returns Promise<ExtensionMetadata[]>
   */
  listExtensions(): Promise<ExtensionMetadata[]>;

  /**
   * Download extension to local via extId
   * @param extId format: <publisher>.<name>
   * @returns Promise<IDownloadResult>
   */
  downloadExtension(extId: string): Promise<DownloadResult>;

  /**
   * Show extension detail via extId
   * @param extId format: <publisher>.<name>
   * @param version
   * @returns Promise<ExtensionDetails>
   */
  showExtension(extId: string, version?: string): Promise<ExtensionDetails>;
}
