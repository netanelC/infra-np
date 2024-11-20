import { PluginOptions } from '@docusaurus/types';
import { RemoteContentPluginOptions } from 'docusaurus-plugin-remote-content';

interface GithubSource {
  type: 'github';
  name: string;
  repo: string;
  branch: string;
  documents: string[];
  targetDir: string;
}

interface Source {
  type: 'normal';
  name: string;
  fileDownloadPath: string;
  fileLinkPath: string;
  rawLinkPath: string;
  documents: string[];
  targetDir: string;
}

function githubSourceToSource(source: GithubSource): Source {
  return {
    type: 'normal',
    name: source.name,
    fileDownloadPath: `https://raw.githubusercontent.com/${source.repo}/refs/heads/${source.branch}`,
    fileLinkPath: `https://github.com/${source.repo}/blob/${source.branch}/`,
    documents: source.documents,
    rawLinkPath: `https://github.com/${source.repo}/raw/refs/heads/${source.branch}/`,
    targetDir: source.targetDir,
  };
}

const sources: (GithubSource | Source)[] = [
  {
    type: 'github',
    documents: ['README.md'],
    branch: 'master',
    name: 'telemetry',
    repo: 'MapColonies/telemetry',
    targetDir: 'docs/knowledge-base/packages/telemetry',
  },
  {
    type: 'github',
    documents: ['README.md'],
    branch: 'master',
    name: 'error-express-handler',
    repo: 'MapColonies/error-express-handler',
    targetDir: 'docs/knowledge-base/packages/error-express-handler',
  },
  {
    type: 'github',
    documents: ['README.md'],
    branch: 'master',
    name: 'eslint-config',
    repo: 'MapColonies/eslint-config',
    targetDir: 'docs/knowledge-base/packages/eslint-config',
  },{
    type: 'github',
    documents: ['README.md'],
    branch: 'master',
    name: 'express-access-log-middleware',
    repo: 'MapColonies/express-access-log-middleware',
    targetDir: 'docs/knowledge-base/packages/express-access-log-middleware',
  },{
    type: 'github',
    documents: ['README.md'],
    branch: 'master',
    name: 'js-logger',
    repo: 'MapColonies/js-logger',
    targetDir: 'docs/knowledge-base/packages/js-logger',
  },
  {
    type: 'github',
    documents: ['README.md'],
    branch: 'master',
    name: 'openapi-express-viewer',
    repo: 'MapColonies/openapi-express-viewer',
    targetDir: 'docs/knowledge-base/packages/openapi-express-viewer',
  },
  {
    type: 'github',
    documents: ['README.md'],
    branch: 'master',
    name: 'prettier-config',
    repo: 'MapColonies/prettier-config',
    targetDir: 'docs/knowledge-base/packages/prettier-config',
  },
  {
    type: 'github',
    documents: ['README.md'],
    branch: 'master',
    name: 'read-pkg',
    repo: 'MapColonies/read-pkg',
    targetDir: 'docs/knowledge-base/packages/read-pkg',
  },
  {
    type: 'github',
    documents: ['README.md'],
    branch: 'master',
    name: 'config',
    repo: 'MapColonies/config',
    targetDir: 'docs/knowledge-base/packages/config',
  },
  {
    type: 'github',
    documents: ['README.md'],
    branch: 'master',
    name: 'tsconfig',
    repo: 'MapColonies/tsconfig',
    targetDir: 'docs/knowledge-base/packages/tsconfig',
  },
  {
    type: 'github',
    documents: ['README.md'],
    branch: 'master',
    name: 'openapi-helpers',
    repo: 'MapColonies/openapi-helpers',
    targetDir: 'docs/knowledge-base/packages/openapi-helpers',
  }
];

type ModifyContent = (
  filename: string,
  content: string
) =>
  | {
      filename?: string;
      content?: string;
    }
  | undefined;

function modifyContentBuilder(source: Source): ModifyContent {
  return (filename, content) => {
    // const regex = /(?=\[(!\[.+?\]\(.+?\)|.+?)]\((?!https:\/\/)([^\)]+)\))/gi;

    const imageRegex = /!\[(!\[.+?\]\(.+?\)|.+?)]\((?!https?:\/\/)([^\)]+)\)/gi;

    const imageLinks = [...content.matchAll(imageRegex)].map((m) => ({
      // text: m[1],
      link: m[2],
      url: new URL(m[2], source.rawLinkPath).href,
    }));

    for (const { link, url } of imageLinks) {
      content = content.replace(link, url);
    }

    const linksRegex = /\[(!\[.+?\]\(.+?\)|.+?)]\((?!https?:\/\/)([^\)]+)\)/gi;
    const links = [...content.matchAll(linksRegex)].map((m) => ({
      // text: m[1],
      link: m[2],
      url: new URL(m[2], source.fileLinkPath).href,
    }));

    for (const { link, url } of links) {
      content = content.replace(link, url);
    }

    content =
      '---\ncustom_edit_url: null\n---\n' +
      content +
      `:::note\nThis page was generated from a remote source. you can find it on ${new URL(
        filename,
        source.fileLinkPath
      )}\n:::`;

    return { filename, content };
  };
}

export function remotePluginGenerator(): [string, PluginOptions][] {
  const processedSources = sources.map(source => {
    if (source.type === 'github') {
      return githubSourceToSource(source);
    }
    return source;
  });
  return processedSources.map(
    (source): [string, RemoteContentPluginOptions & PluginOptions] => {
      return [
        'docusaurus-plugin-remote-content',
        {
          name: source.name,
          documents: source.documents,
          outDir: source.targetDir,
          sourceBaseUrl: source.fileDownloadPath,
          modifyContent: modifyContentBuilder(source),
        },
      ];
    }
  );
}
// plugins: [["docusaurus-plugin-remote-content", {name: 'telemetry', sourceBaseUrl: 'https://raw.githubusercontent.com/MapColonies/telemetry/refs/heads/master', outDir: 'docs/telemetry', documents: ['README.md']}]],
