# Creating Custom Templates

This guide explains how to create custom templates for Boilerforge.

## Template Structure

Every template lives in the `templates/` directory and follows this structure:

```
templates/<template-name>/
├── forge.config.json      # Template metadata and conditional file rules
├── forge.prompt.json      # Interactive prompt definitions
├── schema/
│   └── prompt.schema.json # JSON Schema for prompt validation
└── app/                   # Handlebars template files (.hbs)
    ├── file1.ts.hbs
    ├── file2.ts.hbs
    └── subdir/
        └── file3.ts.hbs
```

## 1. `forge.config.json` — Template Metadata & File Configuration

Defines the template's name, version, and conditional file inclusion rules.

```json
{
    "metadata": {
        "name": "my-template",
        "version": "1.0.0"
    },
    "fileConfig": {
        "src/index.ts": "isTypescript == true",
        "src/index.js": "isTypescript == false",
        ".prettierignore": "isEslintPrettier == true",
        ".prettierrc.json": "isEslintPrettier == true",
        "eslint.config.mjs": "isEslintPrettier == true",
        "tsconfig.json": "isTypescript == true"
    }
}
```

| Field        | Required | Description                                                      |
| ------------ | -------- | ---------------------------------------------------------------- |
| `metadata`   | yes      | Template identity with `name` and `version`.                     |
| `fileConfig` | no       | Maps file paths (relative to `app/`) to Jexl conditions. If a condition evaluates to `false`, the file is excluded from the scaffolded output. |

> Files listed in `fileConfig` that lack a matching `.hbs` file will be silently ignored. Files in `app/` **not** listed in `fileConfig` are always included (unconditionally).

## 2. `forge.prompt.json` — Prompt Definitions

Defines the questions asked during `boilerforge create <template>` in interactive mode.

### Prompt Types

#### `text` — Free-form text input

```json
{
    "type": "text",
    "name": "projectName",
    "description": "Name of the project",
    "prompt": {
        "message": "Project name",
        "defaultValue": "getCwdDirName()"
    },
    "validate": {
        "expression": "matches(input, Regex.PROJECT_NAME)",
        "error": "Invalid project name format"
    }
}
```

| Field        | Required | Description                                                         |
| ------------ | -------- | ------------------------------------------------------------------- |
| `type`       | yes      | `"text"`                                                            |
| `name`       | yes      | Variable name used in Handlebars templates and Jexl expressions     |
| `description`| yes      | Human-readable description                                          |
| `prompt`     | yes      | `message` (displayed question) and optional `defaultValue` (Jexl expression) |
| `validate`   | no       | `expression` (Jexl) and `error` message                             |

#### `select` — Single-choice from a list

```json
{
    "type": "select",
    "name": "packageManager",
    "description": "Package manager to use",
    "prompt": {
        "message": "Choose a package manager",
        "defaultValue": "0"
    },
    "choices": [
        { "name": "npm", "value": "npm" },
        { "name": "yarn", "value": "yarn" },
        { "name": "pnpm", "value": "pnpm" }
    ],
    "validate": {
        "expression": "input in ['npm', 'yarn', 'pnpm']",
        "error": "Please select a valid package manager"
    }
}
```

| Field      | Required | Description                                                   |
| ---------- | -------- | ------------------------------------------------------------- |
| `type`     | yes      | `"select"`                                                    |
| `choices`  | yes      | Array of `{ name, value }` objects                            |
| `prompt.defaultValue` | no | Index of the default selection as a string (e.g. `"0"`)   |

#### `multiselect` — Multiple-choice from a list

Same structure as `select` but with `"type": "multiselect"`. The `choices` field is required.

#### `toggle` — Boolean yes/no

```json
{
    "type": "toggle",
    "name": "isTypescript",
    "description": "Enable TypeScript support",
    "prompt": {
        "message": "Use TypeScript",
        "defaultValue": "true"
    },
    "options": {
        "enabled": "Yes",
        "disabled": "No"
    },
    "validate": {
        "expression": "isBoolean(input)",
        "error": "isTypescript must be true or false"
    }
}
```

| Field     | Required | Description                                                |
| --------- | -------- | ---------------------------------------------------------- |
| `type`    | yes      | `"toggle"`                                                 |
| `options` | yes      | `enabled` and `disabled` display labels                    |

### Skip Conditions

Use the `skip` field (a Jexl expression) to conditionally skip a prompt:

```json
{
    "type": "text",
    "name": "typescriptVersion",
    "description": "TypeScript version",
    "prompt": {
        "message": "TypeScript version",
        "defaultValue": "'5.8'"
    },
    "skip": "isTypescript == false"
}
```

## 3. `schema/prompt.schema.json` — JSON Schema Validation

Boilerforge validates `forge.prompt.json` against this schema. The schema enforces:

- At least one prompt must exist
- Each prompt must have a unique `name`
- A prompt with `name: "name"` and `type: "text"` is **required** (the project name prompt)
- `select`/`multiselect` types require a `choices` array
- `toggle` type requires an `options` object

You can extend the schema to add custom validation rules. See `templates/create-node-app/schema/prompt.schema.json` for the full reference.

## 4. `app/` — Handlebars Templates

Template files use the `.hbs` extension. They are compiled with [Handlebars](https://handlebarsjs.com/) using the values collected from the prompts.

### Basic variable substitution

```hbs
// src/index.ts
async function main() {
    console.log('Hello from {{projectName}}');
}
main().catch((error) => console.error(error));
```

### Conditionals

```hbs
{
    "name": "{{projectName}}",
    "version": "{{version}}"
    {{#if isTypescript}}
    "main": "dist/index.js",
    {{/if}}
}
```

### File naming convention

The `.hbs` extension is stripped from the output filename. For example:

| Template file               | Output file              |
| --------------------------- | ------------------------ |
| `app/src/index.ts.hbs`      | `src/index.ts`           |
| `app/package.json.hbs`      | `package.json`           |
| `app/.gitignore.hbs`        | `.gitignore`             |

## 5. Jexl Expression Reference

Boilerforge uses [Jexl](https://github.com/TomFrost/Jexl) for dynamic expressions in:

- `forge.prompt.json` — `validate.expression`, `skip`, `prompt.defaultValue`
- `forge.config.json` — `fileConfig` conditions

### Built-in Functions

| Function          | Description                                         | Example                                      |
| ----------------- | --------------------------------------------------- | -------------------------------------------- |
| `getCwdDirName()` | Returns the current working directory name          | `"defaultValue": "getCwdDirName()"`          |
| `matches()`       | Tests a value against a regex                       | `"expression": "matches(input, Regex.VERSION)"` |
| `isBoolean()`     | Checks if a value is `true` or `false` (case-insensitive) | `"expression": "isBoolean(input)"`            |

### Available Context Variables

| Variable               | Description                              | Example usage                                     |
| ---------------------- | ---------------------------------------- | ------------------------------------------------- |
| `input`                | The user's current answer (in validation)| `"expression": "input in ['npm', 'yarn']"`    |
| `Regex.PROJECT_NAME`   | `/^[a-zA-Z][a-zA-Z0-9-]*$/`              | `"expression": "matches(input, Regex.PROJECT_NAME)"` |
| `Regex.VERSION`        | Semver regex                             | `"expression": "matches(input, Regex.VERSION)"`     |
| `cwd`                  | Current working directory path           | For use in default values                          |
| `platform`             | Node.js platform string                  | For use in default values                          |

Any prompt variable collected earlier in the session is also available. For example, after a prompt with `name: "isTypescript"`, you can reference `isTypescript` in subsequent prompts.

### Skip condition example

```json
{
    "type": "text",
    "name": "eslintConfig",
    "description": "Custom ESLint config",
    "prompt": {
        "message": "ESLint config file",
        "defaultValue": "'eslint.config.mjs'"
    },
    "skip": "isEslintPrettier == false"
}
```

## 6. CLI Mode

Users can bypass interactive prompts by passing `--cli-config`:

```bash
boilerforge create my-template --cli-config "name=my-app;isTypescript=true;packageManager=pnpm"
```

Values are parsed as strings. For `toggle` type prompts, case-insensitive `"true"`/`"false"` strings are automatically converted to booleans.

The `name` key is always required. All other keys defined in `forge.prompt.json` must be provided; otherwise the process exits with an error listing the missing configs.

## 7. Complete Example — Minimal Template

```
templates/hello-world/
├── forge.config.json
├── forge.prompt.json
├── schema/
│   └── prompt.schema.json
└── app/
    └── index.js.hbs
```

**forge.config.json**

```json
{
    "metadata": {
        "name": "hello-world",
        "version": "1.0.0"
    }
}
```

**forge.prompt.json**

```json
{
    "prompts": [
        {
            "type": "text",
            "name": "name",
            "description": "Name of the application",
            "prompt": {
                "message": "Project name",
                "defaultValue": "getCwdDirName()"
            }
        },
        {
            "type": "toggle",
            "name": "isTypescript",
            "description": "Use TypeScript",
            "prompt": {
                "message": "Use TypeScript",
                "defaultValue": "false"
            },
            "options": {
                "enabled": "Yes",
                "disabled": "No"
            }
        }
    ]
}
```

**app/index.js.hbs**

```hbs
async function main() {
    console.log('Hello from {{name}}');
}
main().catch((error) => console.error(error));
```

Copy the `schema/prompt.schema.json` from `templates/create-node-app/schema/prompt.schema.json` to reuse the standard validation schema.

## 8. Testing Your Template

```bash
# List available templates to confirm it's registered
boilerforge list-templates

# View template configuration
boilerforge show-config hello-world

# Create a project from the template (interactive)
boilerforge create hello-world

# Create a project from the template (CLI mode)
boilerforge create hello-world --cli-config "name=test-project;isTypescript=false"
```
