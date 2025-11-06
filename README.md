# Electron DSM Client Monorepo

A monorepo containing Electron wrapper applications for Synology services: DSM, Audio Station, and Photos.

## Project Structure

```
electron-dsm-client/
├── package.json              # Root package with workspaces configuration
├── tsconfig.json            # Root TypeScript configuration
├── apps/
│   ├── dsm/                 # Synology DSM wrapper application
│   ├── audio/               # Synology Audio Station wrapper application
│   └── photos/              # Synology Photos wrapper application
└── shared/                  # Shared utilities and services
```

Each application follows the same structure:

- `main.ts` - Main process code
- `preload.ts` - Preload script for security
- `index.html` - Basic UI for authentication
- `package.json` - Application-specific dependencies and build scripts
- `tsconfig.json` - TypeScript configuration

## Features

- **Electron Wrapper**: Provides native application experience for Synology web services
- **Secure Storage**: Uses Electron's `safeStorage` to securely store user credentials
- **Cross-platform**: Builds for Windows, macOS, and Linux
- **Monorepo**: Managed with npm workspaces for efficient development

## Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)

## Getting Started

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Build the shared library:**

   ```bash
   cd shared
   npm run build
   cd ..
   ```

3. **Build an application (e.g., DSM):**
   ```bash
   cd apps/dsm
   npm run build
   npm start
   ```

## Development

### Building All Applications

Use the provided build script:

```bash
chmod +x scripts/build.sh
./scripts/build.sh
```

### Running in Development Mode

```bash
# For DSM app
cd apps/dsm
npm run dev

# For Audio app
cd apps/audio
npm run dev

# For Photos app
cd apps/photos
npm run dev
```

### Distribution

Create distributable packages:

```bash
chmod +x scripts/dist.sh
./scripts/dist.sh
```

## Security

The application uses Electron's `safeStorage` API to securely encrypt user credentials on supported platforms (Windows and macOS). On Linux, where `safeStorage` is not available, consider alternative secure storage solutions.

## Configuration

Each application can be configured by modifying:

- The application's `package.json` for build settings
- The main process file (`main.ts`) for window configuration
- The renderer process files (`index.html`, preload scripts) for UI and functionality

## License

GPL-3.0
