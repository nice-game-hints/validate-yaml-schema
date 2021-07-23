import * as core from '@actions/core';
import { validateYaml } from './yaml-validator';
import { getJson } from './file-reader';
import * as path from 'path';
import * as fs from 'fs';
import { prettyLog } from './logger';

async function run() {
  try {

    const workspaceRoot = <string>process.env['GITHUB_WORKSPACE'] || process.cwd();

    const settingsFile = core.getInput('settingsfile');
    const yamlGlob = core.getInput('mdGlob') || '**/*.md';
    const yamlSchemasJson = core.getInput('yamlSchemasJson');

    // Settings checking

    let inlineYamlSchemas;
    if (yamlSchemasJson)
    {
      inlineYamlSchemas =  JSON.parse(yamlSchemasJson)
    }

    let settingsYamlSchemas;
    if (fs.existsSync(settingsFile)){
      const settings  = await getJson(path.join(workspaceRoot, settingsFile));
      settingsYamlSchemas = settings ? settings['yaml.schemas'] : null;
    }
    const schemas = {...settingsYamlSchemas, ...inlineYamlSchemas };

    prettyLog('workspaceroot ' + workspaceRoot)
    prettyLog('schemas')
    prettyLog(JSON.stringify(schemas))

    const validationResults = await validateYaml(workspaceRoot, schemas, yamlGlob);

    const invalidResults = validationResults.filter(res => !res.valid).map(res => res.filePath);

    const invalidFiles = invalidResults.length > 0 ? invalidResults.join(',') : '';

    core.setOutput('invalidFiles', invalidFiles);

    if (invalidResults.length > 0) {
        core.warning('Invalid Files: ' + invalidFiles);
        core.setFailed('Schema validation failed on one or more YAML files.');
    } else {
        core.info(`✅ YAML Schema validation completed successfully`);
    }

  } catch (error) {
    core.setFailed(error.message);
  }

}

run();