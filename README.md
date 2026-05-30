# boilerforge

A blazing-fast CLI utility that scaffolds clean, ready-to-use project structures so you can skip the setup and start building instantly.

## Installation

```bash
npm install -g boilerforge
# or
yarn global add boilerforge
# or
pnpm add -g boilerforge
```

## Usage

```bash
boilerforge create <template> [options]
```

### Commands

| Command                  | Description                        |
| ------------------------ | ---------------------------------- |
| `create <template>`      | Create a project from a template   |
| `list-templates`         | List all available templates       |
| `show-config <template>` | Show a template's configuration    |
| `-v, --version`          | Output the version number          |

### Interactive Mode

Run `boilerforge create <template>` to launch an interactive prompt session:

```bash
boilerforge create create-node-app
```

You'll be guided through a series of prompts to configure your project (e.g., project name, package manager, TypeScript, etc.).

### CLI Mode

For non-interactive environments, pass options via `--cli-config`:

```bash
boilerforge create create-simple-app --cli-config "name=my-app;description=My app;version=1.0.0;author=me;packageManager=pnpm;isTypescript=true;isEslintPrettier=true"
```

The format is `key=value` pairs separated by `;`.

### Listing Templates

```bash
boilerforge list-templates
```

### Viewing Template Configuration

```bash
boilerforge show-config <template>
```

## Available Templates

| Template            | Description                          |
| ------------------- | ------------------------------------ |
| `create-node-app`   | Scaffolds a Node.js project          |

## Creating Custom Templates

See the [Creating Custom Templates](docs/creating-custom-templates.md) guide for detailed documentation on how to build and use your own templates.

## Template Structure

Templates live in the `templates/` directory and follow this structure:

```
templates/<template-name>/
├── forge.config.json     # Template metadata and file configuration
├── forge.prompt.json     # Interactive prompts definition
├── schema/               # JSON schemas for validation
└── app/                  # Template files (Handlebars)
```

- **forge.config.json** — Contains metadata (name, version) and conditional file rules using Jexl expressions (e.g., `"src/index.ts": "isTypescript == true"`).
- **forge.prompt.json** — Defines the interactive prompts (text, select, toggle) with validation rules.
- **app/** — Handlebars templates (`.hbs` files) that get compiled with user-provided values.

## Development

```bash
# Install dependencies
pnpm install

# Build
pnpm run build

# Run in dev mode
pnpm run dev -- create <template>

# Lint
pnpm run lint

# Format
pnpm run format
```

## License

[MIT](LICENSE)
