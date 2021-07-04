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

function LoadVariables(rawCode = '') {
    const variables = {};
    const variablesFree = rawCode.replace(/(\$[A-Za-z_]+)\s*=\s*(.+);/g, e => {
        const [, name, value] = e.match(/(\$[A-Za-z_]+)\s*=\s*(.+);/);
        variables[name] = value;
        return '';
    })
    // const declarations = rawCode.match(/(\$[A-Za-z_]+)\s*=\s*(.+);/g);
    // for (let v of declarations) {
    //     const [, name, value] = v.match(/(\$[A-Za-z_]+)\s*=\s*(.+);/);
    //     variables[name] = value;
    // }
    return {variablesFree, variables};
}
function ApplyVariables(rawCode = '', variables = {}) {
    return rawCode.replace(/:.*(\$[A-Za-z_]+)/g, e => {
        const [, v] = e.match(/:.*(\$[A-Za-z_]+)/);
        return e.replace(v, variables[v]) || "none";
    })
}


function ParseFile(rawCode) {
    const packedFile = ApplyImports(rawCode);
    const {variablesFree, variables} = LoadVariables(packedFile);
    const applyVars = ApplyVariables(variablesFree, variables);
    console.log(applyVars);
    return packedFile;
}


const mainFile = ReadLocalFile(filePath);

const out = ParseFile(mainFile);

// console.log(out);