# https://www.typescriptlang.org/docs/handbook/declaration-files/publishing.html


https://dev.to/orabazu/how-to-bundle-a-tree-shakable-typescript-library-with-tsup-and-publish-with-npm-3c46

pnpm run build Build all apps and packages
pnpm run dev
Develop all apps and packages
pnpm run lint
Lint all apps and packages

Turborepo will cache locally by default. For an additional
speed boost, enable Remote Caching with Vercel by
entering the following command:

pnpm dlx turbo login

To connect to your Remote Cache, run the following in any turborepo:

npx turbo link

To disable Remote Caching, run `npx turbo unlink`

# Turborepo starter

This is an official starter Turborepo.

## Using this example

Run the following command:

```sh
npx create-turbo@latest
```

## What's inside?

This Turborepo includes the following packages/apps:

### Apps and Packages

-   `docs`: a [Next.js](https://nextjs.org/) app
-   `web`: another [Next.js](https://nextjs.org/) app
-   `ui`: a stub React component library shared by both `web` and `docs` applications
-   `eslint-config-custom`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
-   `tsconfig`: `tsconfig.json`s used throughout the monorepo

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

This Turborepo has some additional tools already setup for you:

-   [TypeScript](https://www.typescriptlang.org/) for static type checking
-   [ESLint](https://eslint.org/) for code linting
-   [Prettier](https://prettier.io) for code formatting

### Build

To build all apps and packages, run the following command:

```
cd my-turborepo
pnpm build
```

### Develop

To develop all apps and packages, run the following command:

```
cd my-turborepo
pnpm dev
```

### Remote Caching

Turborepo can use a technique known as [Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching) to share cache artifacts across machines, enabling you to share build caches with your team and CI/CD pipelines.

By default, Turborepo will cache locally. To enable Remote Caching you will need an account with Vercel. If you don't have an account you can [create one](https://vercel.com/signup), then enter the following commands:

```
cd my-turborepo
npx turbo login
```

This will authenticate the Turborepo CLI with your [Vercel account](https://vercel.com/docs/concepts/personal-accounts/overview).

Next, you can link your Turborepo to your Remote Cache by running the following command from the root of your Turborepo:

```
npx turbo link
```

## Useful Links

Learn more about the power of Turborepo:

-   [Tasks](https://turbo.build/repo/docs/core-concepts/monorepos/running-tasks)
-   [Caching](https://turbo.build/repo/docs/core-concepts/caching)
-   [Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching)
-   [Filtering](https://turbo.build/repo/docs/core-concepts/monorepos/filtering)
-   [Configuration Options](https://turbo.build/repo/docs/reference/configuration)
-   [CLI Usage](https://turbo.build/repo/docs/reference/command-line-reference)


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
        "target": "esnext",
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
