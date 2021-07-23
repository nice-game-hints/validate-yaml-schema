import * as fs from 'fs';
import { TextDocument } from 'vscode-languageserver';
import { InvalidFileError } from './errors';

export const getYaml = async (filePath: string): Promise<TextDocument> => {
    try {
        let fileContents = await fs.promises.readFile(filePath, { encoding: 'utf-8' });
        const reg = /^---\s*[\n\r]+(.*)[\n\r]+---\s*/s.exec(fileContents)
        if (reg) {
            fileContents = reg[1]
        } else {
            fileContents = ''
        }
        return TextDocument.create(
            filePath,
            'yaml',
            0,
            fileContents
          );
    } catch (ex) {
        throw new InvalidFileError(filePath, ex);
    }
};


export const getJson = async (filePath: string): Promise<any> => {
    try {
        const fileContents = await fs.promises.readFile(filePath, { encoding: 'utf-8' });
        const json = JSON.parse(fileContents);
        return json;
    } catch (ex) {
        throw new InvalidFileError(filePath, ex);
    }
};