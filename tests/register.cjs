const fs = require("node:fs");
const ts = require("typescript");
for (const ext of [".ts",".tsx"]) require.extensions[ext] = (module, filename) => {
  const source = ts.transpileModule(fs.readFileSync(filename,"utf8"), { compilerOptions: { module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true } }).outputText;
  module._compile(source,filename);
};
