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
    return {variablesFree, variables};
}
function ApplyVariables(rawCode = '', variables = {}) {
    return rawCode.replace(/:.*(\$[A-Za-z_]+)/g, e => {
        const [, v] = e.match(/:.*(\$[A-Za-z_]+)/);
        return e.replace(v, variables[v]) || "none";
    })
}

function LoadMixin(rawCode = '') {
    const mixin = {};
    const mixinFree = rawCode.replace(/@mixin\s+([A-Za-z-]+)\s*{([A-Za-z-+\/*:0-9\n\s;\'\".,@]*)}/g, e => {
        const [, name, body] = e.match(/@mixin\s+([A-Za-z-]+)\s*{([A-Za-z-+\/*:0-9\n\s;\'\".,@]*)}/);
        mixin[name] = body;
        return "";
    })
    return {mixin, mixinFree};
}

function ApplyMixin(rawCode = '', mixin = {}) {
    return rawCode.replace(/@include\s+([A-Za-z-]*);/g, e => {
        const [, mixname] = e.match(/@include\s+([A-Za-z-]*);/);
        return ApplyMixin(mixin[mixname], mixin);
    })
}

function GetScope(block = '') {
    let scope = 1;
    let scopeStart = block.search(/.+\s*{/);
    let start = block.indexOf("{");
    if (start == -1) return null;
    for (let i = start + 1; i < block.length; i++) {
        if (block[i] == '{') scope++;
        if (block[i] == "}") scope--;
        if (scope == 0) return {
            raw: block.slice(scopeStart, i + 1),
            body: block.slice(start+1, i)
        };
    }
    return null;
}
function InspectScope(rawCode = '') {
    const scopes = [];
    let scope = null;
    do {
        scope = GetScope(rawCode);
        if (scope) {
            scope.children = InspectScope(scope.body);
            for (let i = 0; i < scope.children.length; i++) {
                scope.body = scope.body.replace(scope.children[i].raw, '');
            }
            scopes.push(scope);
            rawCode = rawCode.replace(scope.raw, '');
        }
    } while(scope);
    return scopes;
}

function ReduceWhitespaces(str) {
    let i = str.length - 1;
    while(str[i] == " ") i--;
    return str.slice(0, i+1);
}

function BuildScope(scopes = [], prefix = '') {
    let styles = '';
    for (let scope of scopes) {
        if (!scope) continue;
        const [, selector] = scope.raw.match(/\s*(.+)\s*{/);
        const unwrap = selector.indexOf('&') == -1 ? ReduceWhitespaces(prefix + " " + selector) : selector.replace(/&/g, prefix);
        styles += `${unwrap}{${scope.body.trim()}}`;
        styles += BuildScope(scope.children, unwrap);
    }
    return styles;
}


function ParseFile(rawCode) {
    const packedFile = ApplyImports(rawCode);
    const {variablesFree, variables} = LoadVariables(packedFile);
    const applyVars = ApplyVariables(variablesFree, variables);
    const {mixinFree, mixin} = LoadMixin(applyVars);
    const applyMixin = ApplyMixin(mixinFree, mixin);
    const scopes = InspectScope(applyMixin);
    const css = BuildScope(scopes);
    return css;
}


const mainFile = ReadLocalFile(filePath);
const out = ParseFile(mainFile);
WriteLocalFile(outFile, out);
