import {
  load,
  save,
  updateRepositories,
  Repository,
  insertExtension,
  ExtensionInstalled,
} from '../store';
import * as path from 'path';
import * as assert from 'assert';

// don't warn in tests
console.warn = () => null;

async function throws(fn: () => Promise<any>): Promise<void> {
  let didThrow = false;

  try {
    await fn();
  } catch (err) {
    didThrow = true;
  }

  if (!didThrow) {
    throw new Error('Assertion failed');
  }
}

const fixture = (name: string) =>
  path.join(
    path.dirname(path.dirname(__dirname)),
    'src',
    'test',
    'fixtures',
    name
  );

describe('store functions', async () => {
  it('should load a well-formed store file.', async () => {
    assert.deepStrictEqual(await load(path.join(fixture(''), '.dbox')), {
      repositories: [
        { name: 'repo1', type: 'oss', options: 'auth' },
        {
          name: 'repo2',
          type: 'dropbox',
          options: {
            user: 'user1',
            password: 'password1',
          },
        },
      ],
      extensionInstalled: [
        {
          extId: 'ext1',
          version: '0.0.1',
          describe: 'ext1',
          enabled: true,
          repository: 'repo1',
        },
        {
          extId: 'ext2',
          version: '0.0.2',
          describe: 'ext2',
          enabled: true,
          repository: 'repo1',
        },
        {
          extId: 'ext3',
          version: '0.0.3',
          describe: 'ext3',
          enabled: false,
          repository: 'repo2',
        },
      ],
    });
  });

  it('should not load a bad-formed store file.', async () => {
    await throws(() => load(path.join(fixture(''), '.dbox-bad')));
  });

  it('should ok when a store file does not exist.', async () => {
    assert.deepStrictEqual(
      await load(path.join(fixture(''), '.dbox-not-existing')),
      {
        repositories: [],
        extensionInstalled: [],
      }
    );
  });

  it('should save a store object to a file.', async () => {
    const store = {
      repositories: [{ name: 'repo', type: 'oss', options: 'auth' }],
      extensionInstalled: [
        {
          extId: 'ext',
          version: '0.0.1',
          describe: 'ext',
          enabled: false,
          repository: 'repo',
        },
      ],
    };
    await save(store, path.join(fixture(''), '.dbox-saved'));
    assert.deepStrictEqual(
      await load(path.join(fixture(''), '.dbox-saved')),
      store
    );
  });

  it('should update repositories.', async () => {
    const storePath = path.join(fixture(''), '.dbox-saved');
    const repositories = [
      { name: 'repo1', type: 'oss', options: 'auth' },
      {
        name: 'repo2',
        type: 's3',
        options: {
          user: 'user1',
          password: 'password1',
        },
      },
    ];
    await updateRepositories(repositories, storePath);
    const store = await load(storePath);
    assert.deepStrictEqual(store.repositories, repositories);
  });

  it('should not update repositories with invalid datas.', async () => {
    await throws(() =>
      updateRepositories([], path.join(fixture(''), '.dbox-saved'))
    );
    await throws(() =>
      updateRepositories(
        [{} as Repository],
        path.join(fixture(''), '.dbox-saved')
      )
    );
    await throws(() =>
      updateRepositories(
        [{ name: 'test' } as Repository],
        path.join(fixture(''), '.dbox-saved')
      )
    );
    await throws(() =>
      updateRepositories(
        [{ type: 'test' } as Repository],
        path.join(fixture(''), '.dbox-saved')
      )
    );
    await throws(() =>
      updateRepositories(
        [{ options: 'test' } as Repository],
        path.join(fixture(''), '.dbox-saved')
      )
    );
    await throws(() =>
      updateRepositories(
        [{ name: 's', type: 's' } as Repository],
        path.join(fixture(''), '.dbox-saved')
      )
    );
    await throws(() =>
      updateRepositories(
        [{ name: 's', type: 's', options: '' } as Repository],
        path.join(fixture(''), '.dbox-saved')
      )
    );
    await throws(() =>
      updateRepositories(
        [{ name: '', type: '', options: 'test' } as Repository],
        path.join(fixture(''), '.dbox-saved')
      )
    );
    await throws(() =>
      updateRepositories(
        [{ name: 'repo1', type: 'ali', options: 'test' } as Repository],
        path.join(fixture(''), '.dbox-saved')
      )
    );
  });

  it('should insert extension information.', async () => {
    const storePath = path.join(fixture(''), '.dbox-saved');
    const ext = {
      extId: 'ext.new',
      version: '1.0',
      describe: 'ext.new',
      enabled: true,
      repository: 'repo1',
    };
    await insertExtension(ext, storePath);
    const store = await load(storePath);
    assert.ok(store.extensionInstalled.some(ext => ext === ext));
  });

  it('should not insert extension information with invalid data.', async () => {
    await throws(() =>
      insertExtension(
        {} as ExtensionInstalled,
        path.join(fixture(''), '.dbox-saved')
      )
    );
    await throws(() =>
      insertExtension(
        { extId: 'test' } as ExtensionInstalled,
        path.join(fixture(''), '.dbox-saved')
      )
    );
    await throws(() =>
      insertExtension(
        { repository: 'sss' } as ExtensionInstalled,
        path.join(fixture(''), '.dbox-saved')
      )
    );
    await throws(() =>
      insertExtension(
        { version: 'aa' } as ExtensionInstalled,
        path.join(fixture(''), '.dbox-saved')
      )
    );
    await throws(() =>
      insertExtension(
        { describe: 'sss' } as ExtensionInstalled,
        path.join(fixture(''), '.dbox-saved')
      )
    );
    await throws(() =>
      insertExtension(
        { extId: '', repository: '', version: '', enabled: true, describe: '' },
        path.join(fixture(''), '.dbox-saved')
      )
    );
  });
});
