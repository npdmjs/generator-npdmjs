import { Generator } from '@metagen/yeoman-generator';
import { simpleGit } from 'simple-git';
import type { BaseOptions } from 'yeoman-generator';
import { convertGitOriginToUrl } from './convertGitOriginToUrl.js';

type PackageOptions = BaseOptions & {
  packageName: string; // @npdmjs/core
  homepage: string; // https://github.com/npdmjs/core#readme
  bugsUrl: string; // https://github.com/npdmjs/core/issues
  repositoryUrl: string; // git+https://github.com/npdmjs/core.git
  author: string;
  license: string;
}

export default class extends Generator<PackageOptions> {
  constructor(args: string[], opts: PackageOptions) {
    super(args, opts);
    this.argument('packageName', { type: String, required: true });
    this.options.skipInstall = opts.skipInstall ?? true;
  }

  async initializing() {
    try {
      const { value } = await simpleGit().getConfig('remote.origin.url');
      if (!value) {
        throw new Error('No remote origin URL found');
      }
      this.options.repositoryUrl = value;
      const baseRepoUrl = convertGitOriginToUrl(this.options.repositoryUrl);
      this.options.repositoryUrl = `${baseRepoUrl}.git`;
      this.options.homepage = `${baseRepoUrl}#readme`;
      this.options.bugsUrl = `${baseRepoUrl}/issues`;
    } catch (e) {
      console.error((e as Error).message);
      process.exit();
    }
  }

  async prompting() {
    const answers = await this.prompt([
      {
        type: 'input',
        name: 'author',
        store: true,
        message: 'Author',
      },
      {
        type: 'input',
        name: 'license',
        store: true,
        default: 'MIT',
        message: 'License',
      }
    ]);
    this.options.author = answers.author;
    this.options.license = answers.license;
  }

  writing() {
    this.renderMetaTemplate(
      this.templatePath(),
      this.destinationPath(),
      {
        packageName: this.options.packageName,
        homepage: this.options.homepage,
        bugsUrl: this.options.bugsUrl,
        repositoryUrl: this.options.repositoryUrl,
        author: this.options.author,
        license: this.options.license,
      }
    )
  }

  install() {
    const runSync = (this.spawnSync ?? this.spawnCommandSync).bind(this);
    runSync('bun', ['install']);
  }

  end() {
    if (this.options.repositoryUrl === null) {
      console.log('Repository URL was not set, please add it manually into package.json file');
    }
  }
}