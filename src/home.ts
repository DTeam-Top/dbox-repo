import * as vscode from 'vscode';
import { updateRepositoriesToHome, loadFromHome } from './store';
import { listExtensions, showExtension, installExtension } from './remote';
import { MesssageMaping } from 'vscode-page';
import * as handlebars from 'handlebars';
import { getPublisherName, getExtensionName } from './utils';
import localize from './localize';

handlebars.registerHelper('formatDate', dateTime =>
  new Date(dateTime).toLocaleDateString()
);

handlebars.registerHelper('localize', tag => localize(tag));

handlebars.registerHelper('repoSource', type => {
  let repoSource = '';
  switch (type) {
    case 's3':
      repoSource = 'Amazon S3';
      break;
    case 'github':
      repoSource = 'GitHub';
      break;
    case 'gitlab':
      repoSource = 'GitLab';
      break;
    case 'google-driver':
      repoSource = 'Google Driver';
      break;
    case 'dropbox':
      repoSource = 'Dropbox';
      break;
    case 'npm':
      repoSource = 'npm';
      break;
    default:
      repoSource = 'Aliyun OSS';
      break;
  }
  return repoSource;
});

export const messageMappings: MesssageMaping[] = [
  {
    command: 'ready',
    handler: async () => {
      const result = await loadFromHome();
      return {
        repositories: result.repositories,
        extensionInstalled: result.extensionInstalled,
        title: localize('title.installed'),
        setting: localize('title.setting'),
        pageTitle: localize('title.pageTitle'),
      };
    },
    templates: [
      {
        id: 'repos',
        content: `
  {{#each repositories}}
    <li>
      <div class="row align-items-center repo-li">
        <div class="col-md-3 col-xl-2 no-padding">
          <a onclick="listExtensions('{{name}}','{{type}}')" href="#">
            <img src="shared/imgs/logo/{{type}}.png" class="repos_logo">
          </a>
        </div>
        <div class="col-md-9 col-xl-10 no-padding">
          <a onclick="listExtensions('{{name}}','{{type}}')" href="#">
            <span class="name-span">{{name}}</span>
          </a>
        </div>
      </div>
    </li>
  {{/each}}
  `,
      },
      { id: 'title', content: '{{title}}' },
      { id: 'setting', content: '{{setting}}' },
      { id: 'pageTitle', content: '{{pageTitle}}' },
      { id: 'source', content: '&nbsp' },
      {
        id: 'content',
        contentUrl: 'pages/list_intalled.hb',
      },
    ],
  },
  {
    command: 'listExtensions',
    handler: async parameters => {
      const result = await listExtensions(parameters.repo);
      const installedExtIds = (await loadFromHome()).extensionInstalled.map(
        extension => extension.extId
      );
      const finalResult = new Array();
      result.forEach(extensionMetadata => {
        finalResult.push({
          extension: extensionMetadata,
          extensionName: getExtensionName(extensionMetadata.extId),
          publisher: getPublisherName(extensionMetadata.extId),
          installed: installedExtIds.some(id => id === extensionMetadata.extId),
        });
      });

      return {
        title: parameters.repo,
        type: parameters.type,
        extensions: finalResult,
      };
    },
    templates: [
      { id: 'title', content: '{{title}}' },
      {
        id: 'source',
        content: "{{localize 'title.repoSource'}} {{repoSource type}}",
      },
      {
        id: 'content',
        contentUrl: 'pages/list_extension.hb',
      },
    ],
  },
  {
    command: 'showExtension',
    handler: async parameters => {
      const result = await showExtension(parameters.extId, parameters.repo);
      const readMe = (await vscode.commands.executeCommand(
        'markdown.api.render',
        result.readme
      )) as string;
      const changelog = (await vscode.commands.executeCommand(
        'markdown.api.render',
        result.changelog
      )) as string;
      return {
        title: `${parameters.repo} / ${parameters.extId}`,
        repo: parameters.repo,
        details: result,
        readMe,
        changelog,
        installed: parameters.installed,
        extensionName: getExtensionName(parameters.extId),
        publisher: getPublisherName(parameters.extId),
      };
    },
    templates: [
      { id: 'title', content: '{{title}}' },
      { id: 'source', content: '&nbsp' },
      {
        id: 'content',
        contentUrl: 'pages/detail_extension.hb',
      },
    ],
  },
  {
    command: 'installExtension',
    handler: async parameters => {
      await installExtension(parameters.extId, parameters.repo);
    },
  },
  {
    command: 'loadRepositories',
    handler: async () => {
      const result = await loadFromHome();
      const example = [
        {
          name: 'oss-repo',
          options: {
            accessKeyId: '...',
            accessKeySecret: '...',
            bucket: 'dbox-repo',
            region: '...',
          },
          type: 'oss',
        },
        {
          name: 'dropbox-repo',
          options: {
            accessToken: '...',
            root: 'dbox-repo',
          },
          type: 'dropbox',
        },
        {
          name: 's3-repo',
          options: {
            bucket: 'dbox-repo',
            credentials: {
              accessKeyId: '...',
              secretAccessKey: '...',
            },
            region: '...',
          },
          type: 's3',
        },
      ];
      return {
        repositories: JSON.stringify(result.repositories, undefined, 4),
        title: localize('title.repositoriesSetting'),
        example: JSON.stringify(example, undefined, 2),
      };
    },
    templates: [
      { id: 'title', content: '{{title}}' },
      { id: 'source', content: '&nbsp' },
      {
        id: 'content',
        contentUrl: 'pages/setting.hb',
      },
    ],
  },
  {
    command: 'submitRepositories',
    handler: async parameters => {
      await updateRepositoriesToHome(parameters.repositories);
      vscode.window.showInformationMessage(
        localize('title.submitRepositories')
      );
    },
    forward: 'ready',
  },
  {
    command: 'openExtension',
    handler: async parameters => {
      vscode.commands.executeCommand('extension.open', parameters.extId);
    },
  },
  {
    command: 'copy',
    handler: async parameters => {
      vscode.window.showInformationMessage(localize('title.copySuccess'));
    },
  },
];
