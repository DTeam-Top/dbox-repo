import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { home } from 'osenv';
import { ExtensionInstalled, loadFromHome, saveToHome } from './store';
import { createOrShowPage } from 'vscode-page';
import { messageMappings } from './home';

const EXTENSION_HOME = path.join(home(), '.vscode', 'extensions');

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "dbox-repo" is now active!');
  refreshStore();
  registerCommands(context);
}

export function deactivate() {}

const obsoletePath = path.join(EXTENSION_HOME, '.obsolete');
const obsolete = fs.existsSync(obsoletePath)
  ? JSON.parse(fs.readFileSync(obsoletePath, 'utf8'))
  : [];
const existingPaths = fs.readdirSync(EXTENSION_HOME);
const extEnabled = (extId: string) =>
  vscode.extensions.all.some(ext => {
    return extId.toLocaleLowerCase() === ext.id.toLocaleLowerCase();
  });
const extDisabled = (extId: string) =>
  existingPaths.some(
    path =>
      path.toLocaleLowerCase().startsWith(extId.toLocaleLowerCase()) &&
      Object.keys(obsolete).every(
        key => !key.toLocaleLowerCase().startsWith(extId.toLocaleLowerCase())
      )
  );

function refreshStore() {
  loadFromHome().then(async store => {
    const extensions: ExtensionInstalled[] = new Array();
    store.extensionInstalled.forEach(extension => {
      if (extEnabled(extension.extId)) {
        extension.enabled = true;
        extensions.push(extension);
      } else if (extDisabled(extension.extId)) {
        extension.enabled = false;
        extensions.push(extension);
      }
    });
    store.extensionInstalled = extensions;
    await saveToHome(store);
  });
}

function registerCommands(context: vscode.ExtensionContext) {
  const showExtensions = vscode.commands.registerCommand(
    'dbox.showExtensions',
    async () => {
      const store = await loadFromHome();
      vscode.commands.executeCommand(
        'workbench.extensions.action.showExtensionsWithIds',
        store.extensionInstalled.map(extension => extension.extId)
      );
    }
  );

  const showEnabled = vscode.commands.registerCommand(
    'dbox.showEnabled',
    async () => {
      const store = await loadFromHome();
      vscode.commands.executeCommand(
        'workbench.extensions.action.showExtensionsWithIds',
        store.extensionInstalled
          .filter(extension => extension.enabled)
          .map(extension => extension.extId)
      );
    }
  );

  const showDisabled = vscode.commands.registerCommand(
    'dbox.showDisabled',
    async () => {
      const store = await loadFromHome();
      vscode.commands.executeCommand(
        'workbench.extensions.action.showExtensionsWithIds',
        store.extensionInstalled
          .filter(extension => !extension.enabled)
          .map(extension => extension.extId)
      );
    }
  );

  const homePage = vscode.commands.registerCommand('dbox.home', async () => {
    createOrShowPage(
      'name',
      'dbox.home',
      'DBox Repository',
      'pages',
      'home.html',
      context,
      messageMappings
    );
  });

  context.subscriptions.push(
    showExtensions,
    showEnabled,
    showDisabled,
    homePage
  );
}
