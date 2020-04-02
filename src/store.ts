import * as fs from 'fs';
import * as denodeify from 'denodeify';
import { normalize, resolve } from 'path';
import * as path from 'path';
import { home } from 'osenv';

const readFile = denodeify<string, string, string>(fs.readFile as any);
const writeFile = denodeify<string, string, object, void>(fs.writeFile as any);
const STORE_PATH = getStorePath();

export interface Repository {
  name: string;
  type: string;
  options: any;
}

export interface ExtensionInstalled {
  extId: string;
  version: string;
  describe: string;
  enabled: boolean;
  repository: string;
}

export interface Store {
  repositories: Repository[];
  extensionInstalled: ExtensionInstalled[];
}

export async function loadFromHome(): Promise<Store> {
  return load(STORE_PATH);
}

function getStorePath(): string {
  if (process.env.VSCODE_NODE_CACHED_DATA_DIR) {
    const PATH = resolve(
      resolve(process.env.VSCODE_NODE_CACHED_DATA_DIR, '../..').concat(
        normalize('/')
      ),
      'Local Storage'
    ).concat(normalize('/.dbox-functional'));

    return PATH;
  } else {
    if (process.env.HOME) {
      return path.join(process.env.HOME, '.dbox-functional');
    } else {
      return path.join(home(), '.dbox-functional');
    }
  }
}
export async function load(path: string): Promise<Store> {
  return readFile(path, 'utf8')
    .catch<string>(err =>
      err.code !== 'ENOENT' ? Promise.reject(err) : Promise.resolve('{}')
    )
    .then<Store>(rawStore => {
      try {
        return Promise.resolve(JSON.parse(rawStore));
      } catch (e) {
        return Promise.reject(`Error parsing store: ${path}`);
      }
    })
    .then(store => {
      if (!verifyRepositories(store.repositories, true)) {
        return Promise.reject('Store file includes invalid data.');
      }
      store.repositories = store.repositories || [];
      store.extensionInstalled = store.extensionInstalled || [];
      return Promise.resolve(store);
    });
}

export async function saveToHome(store: Store): Promise<Store> {
  return save(store, STORE_PATH);
}

export async function save(store: Store, path: string): Promise<Store> {
  return writeFile(path, JSON.stringify(store), { mode: '0600' }).then(
    () => store
  );
}

function verifyRepositories(
  repositories: Repository[],
  allowEmpty = false
): boolean {
  if (!repositories || repositories.length === 0) {
    if (allowEmpty) {
      return true;
    } else {
      return false;
    }
  }

  return repositories.every(
    repo =>
      repo.type &&
      repo.name &&
      repo.options &&
      [
        'oss',
        's3',
        'github',
        'gitlab',
        'google-driver',
        'dropbox',
        'npm',
      ].includes(repo.type)
  );
}

export async function updateRepositoriesToHome(repositories: Repository[]) {
  return updateRepositories(repositories, STORE_PATH);
}

export async function updateRepositories(
  repositories: Repository[],
  path: string
): Promise<any> {
  if (!verifyRepositories(repositories)) {
    return Promise.reject(
      'Empty Data or keys(name, type, options) of data included empty or invalid values.'
    );
  }

  const store = await load(path);
  store.repositories = repositories;
  return save(store, path);
}

function verifyExtension(extension: ExtensionInstalled): boolean {
  if (!extension) {
    return false;
  }

  return extension.extId &&
    extension.repository &&
    extension.version &&
    extension.describe
    ? true
    : false;
}

export async function insertExtensionToHome(
  extension: ExtensionInstalled
): Promise<any> {
  return insertExtension(extension, STORE_PATH);
}

export async function insertExtension(
  extension: ExtensionInstalled,
  path: string
): Promise<any> {
  if (!verifyExtension(extension)) {
    return Promise.reject(
      'Empty Data or keys(extId, repository, version, describe) of data included empty values.'
    );
  }

  const store = await load(path);
  extension.enabled = true;
  const index = store.extensionInstalled.findIndex(
    ext => ext.extId === extension.extId
  );
  if (index > -1) {
    store.extensionInstalled[index] = extension;
  } else {
    store.extensionInstalled.push(extension);
  }
  return save(store, path);
}
