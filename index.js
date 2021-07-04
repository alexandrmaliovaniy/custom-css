const path = require('path');
const fs = require("fs");
const localPath = process.cwd();
const filePath = process.argv[2]?.toLocaleLowerCase();
const outFile = process.argv[3]?.toLocaleLowerCase() || "./out.css";


function ReadLocalFile(filePath) {
    return fs.readFileSync(path.join(localPath, filePath), 'utf-8');
}

function WriteLocalFile(filePath, data) {
    fs.writeFileSync(path.join(localPath, filePath), data);
}


function ApplyImports(rawCode = '') {
    return rawCode.replace(/(@import '(.*)';)|(@import "(.*)";)/g, e => {
        const test = e.match(/(@import '(?<one>.*)';)|(@import "(?<two>.*)";)/);
        const filePath = test.groups.one || test.groups.two;
        return ApplyImports(ReadLocalFile(filePath));
    })
}

function LoadVariables(rawCode) {
    const variables = {};
}

function ParseFile(rawCode) {
    const packedFile = ApplyImports(rawCode);

    return packedFile;
}


const mainFile = ReadLocalFile(filePath);

const out = ParseFile(mainFile);

console.log(out);