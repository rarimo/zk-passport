import fs from 'fs';

const replaceWorkspaceVersion = (obj, version) => {
  for (const key in obj.dependencies) {
    if (obj.dependencies[key].startsWith('workspace:^')) {
      obj.dependencies[key] = `^${version}`;
    }
  }
};

const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
replaceWorkspaceVersion(packageJson, '1.0.0');
fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 2) + '\n', 'utf8');