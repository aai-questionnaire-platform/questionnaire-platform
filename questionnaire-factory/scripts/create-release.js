const fs = require('fs');
const yargs = require('yargs');
const { exec: execRaw } = require('child_process');
const { promisify } = require('util');

const argv = yargs
  .option('versionUpdate', {
    alias: 'v',
    description: 'The version argument should be one of [patch, minor, major]',
    type: 'string',
    choices: ['patch', 'minor', 'major'],
    demandOption: true,
  })
  .option('sourceBranch', {
    alias: 's',
    description: 'The source branch from whitch the release is made',
    type: 'string',
    default: 'dev',
    demandOption: false,
  })
  .help()
  .version('1.0.0')
  .alias('help', 'h').argv;

const exec = promisify(execRaw);

async function mergeDev() {
  await exec('git checkout main');
  await exec(`git pull origin ${argv.sourceBranch}`);
  return exec('git push origin main');
}

async function bumpVersion() {
  return exec(`npm version ${argv.versionUpdate} -m "Release version v%s"`);
}

function resolveVersion() {
  const contents = fs.readFileSync('package.json', 'utf-8');
  return JSON.parse(contents).version;
}

async function createRelease() {
  const newVersion = resolveVersion();
  await exec(`git checkout -b release-v${newVersion}`);
  await exec(`git push origin release-v${newVersion}`);
  await exec(`git push origin v${newVersion}`);
  return exec('git checkout -');
}

function logOutcome() {
  const newVersion = resolveVersion();

  console.log(
    '\x1b[32m%s\x1b[0m',
    `Successfully tagged version v${newVersion}`
  );
  console.log(
    '\nNavigate to https://github.com/auroraai-questionnaire-platform, select relevant project and go to the Actions tab'
  );
  console.log(
    'then select workflow "Production deployment of <project name>", push "Run workflow" dropdown'
  );
  console.log(
    'select "Tag: <new version>" and press "Run workflow". NOTE: Deploy only tags, never from branch.'
  );
  console.log('\nNOTE: Deploy only tags, never from branch!');
}

async function run() {
  await mergeDev();
  await bumpVersion();
  await createRelease();
  logOutcome();
}

run();
