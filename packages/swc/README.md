# `swc`

> **SWC** is a high-speed compiler used for JavaScript and TypeScript. Unlike **Babel** and **tsc**
> (TypeScript Compiler),
> SWC outperforms them in terms of speed.
> However, it does not include type checking capabilities.

In this repository, you will find only the dependencies required for the **SWC** compiler.
Since the `.swcrc` JSON schema does not have support for the **extend** option as found in a
tsconfig.json file, during
development in the workspace **apps**, you should create a
`.swcrc` file in the root directory of each app.

Customize the `.swcrc` file according to your specific needs and preferences.

```json
{
    "$schema": "https://json.schemastore.org/swcrc",
    "jsc": {
        "parser": {
            "syntax": "typescript",
            "tsx": false,
            "decorators": true,
            "dynamicImport": true
        },
        "target": "es2020",
        "paths": {
            "@/*": ["./src/*"],
            "@controllers/*": ["./src/controllers/*"],
            "@database/*": ["./src/database/*"],
            "@middleware/*": ["./src/middleware/*"],
            "@router/*": ["./src/router/*"],
            "@services/*": ["./src/services/*"],
            "@custom-types/*": ["./src/types/*"],
            "@utils/*": ["./src/utils/*"],
            "@tests/*": ["./tests/*"]
        },
        "baseUrl": "./"
    },
    "module": {
        "type": "commonjs"
    }
}
```
