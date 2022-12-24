const fs = require('fs');
const fsPromises = require('fs/promises');
const path = require('path');

function getAllTypes() {
  const contents = fs.readFileSync(
    path.resolve('schema', 'Components.d.ts'),
    'utf-8'
  );
  const mismatches = ["'COLOR' | 'IMAGE'"];

  return (contents.match(/type:\s'(.*)';/g) || [])
    .map((type) => {
      const [, typeName] = type.match(/type:\s(.*);/);
      if (mismatches.includes(typeName)) {
        return null;
      }
      return typeName.replace(/'/g, '');
    })
    .filter(Boolean)
    .sort()
    .join('\n');
}

function readJSON(fileName) {
  const contents = fs.readFileSync(fileName, 'utf-8');
  return JSON.parse(contents);
}

async function writeJSON(filePath, fileContents) {
  await fsPromises.writeFile(filePath, JSON.stringify(fileContents, null, 2));
  console.log(`Wrote ${filePath}`);
}

async function writeAssetJSON(gameName, fileName, fileContents) {
  const filePath = path.join(
    'assets',
    `${gameName.toLowerCase()}.${fileName}.json`
  );

  return writeJSON(filePath, fileContents);
}

async function readAssetJSON(gameName, fileName) {
  const filePath = path.join('assets', `${gameName}.${fileName}.json`);
  return readJSON(filePath);
}

async function appendToAssetFile(gameName, fileName, contents) {
  const existing = await readAssetJSON(gameName, fileName);
  return writeAssetJSON(gameName, fileName, { ...existing, ...contents });
}

module.exports = {
  getAllTypes,
  readAssetJSON,
  readJSON,
  writeAssetJSON,
  writeJSON,
  appendToAssetFile,
};
