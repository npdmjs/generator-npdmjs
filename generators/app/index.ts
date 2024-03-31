import { Generator } from '@metagen/yeoman-generator';
import { simpleGit } from 'simple-git';
import type { BaseOptions } from 'yeoman-generator';

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
      const gitConfig = await simpleGit().getConfig('remote.origin.url');
      this.options.repositoryUrl = gitConfig.value ?? '';
    } catch (e) {
      console.error(e);
      process.exit();
    }
  }

  async prompting() {
    const { baseRepoUrl } = await this.prompt([{
      type: 'input',
      name: 'baseRepoUrl',
      message: 'Base repository URL',
      store: true,
      default: 'https://github.com/npdmjs/generator-npdmjs'
    }]);
  
    const answers = await this.prompt([
      {
        type: 'input',
        name: 'homepage',
        message: 'Homepage',
        default: `${baseRepoUrl}#readme`
      }, {
        type: 'input',
        name: 'bugsUrl',
        message: 'Bug reporting URL',
        default: `${baseRepoUrl}/issues`
      }, {
        type: 'input',
        name: 'author',
        store: true,
        message: 'Author',
      }, {
        type: 'input',
        name: 'license',
        store: true,
        default: 'MIT',
        message: 'License',
      }
    ]);
    this.options.homepage = answers.homepage;
    this.options.bugsUrl = answers.bugsUrl;
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