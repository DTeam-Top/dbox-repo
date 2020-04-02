import * as assert from 'assert';
import { getExtensionName, getPublisherName } from '../utils';

describe('getExtensionName', async () => {
  it('should get an extension name from its id.', async () => {
    assert.strictEqual(getExtensionName('db'), 'db');
    assert.strictEqual(getExtensionName('db.fox'), 'fox');
    assert.strictEqual(getExtensionName('db.fox.fox'), 'fox.fox');
    assert.strictEqual(getExtensionName('.db'), '.db');
  });
});

describe('getPublisherName', async () => {
  it('should get a publisher name from its id.', async () => {
    assert.strictEqual(getPublisherName('db'), '');
    assert.strictEqual(getPublisherName('db.fox'), 'db');
    assert.strictEqual(getPublisherName('db.fox.fox'), 'db');
    assert.strictEqual(getPublisherName('.db'), '');
  });
});
