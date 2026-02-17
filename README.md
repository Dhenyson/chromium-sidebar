# Chromium Sidebar

A powerful **thin sidebar** extension for Chromium-based browsers (Chrome, Edge, Brave). It functions as a versatile "Utilbar" to provide quick access to your favorite sites, tools, and utilities via a persistent, non-intrusive side panel.

## Features

- **Customizable Sidebar**: Add, edit, and organize sites into groups.
- **Drag & Drop**: Easily rearrange icons and create folders.
- **Smart Opening**: Choose to open links in the sidebar itself or in a new tab.
- **Sync**: Authenticate with Google to sync your configuration across devices.
- **Theming**: Automatic light/dark mode support and custom folder colors.
- **Privacy Focused**: Removing security headers locally to allow embedding, while keeping your data private.

## Installation (Developer Mode)

Since this extension is not yet in the Chrome Web Store, you must install it manually:

1.  Clone this repository.
2.  Run `npm install` to install dependencies.
3.  Run `npm run build` to generate the `dist` folder.
4.  Open your browser and navigate to `chrome://extensions`.
5.  Enable **Developer mode** (top right toggle).
6.  Click **Load unpacked** and select the `dist` folder from this project.

## Configuration

### Firebase Setup (Using Environment Variables)
This extension uses Firebase and environment variables for configuration.

1.  Copy `.env.example` to `.env`:
    ```bash
    cp .env.example .env
    ```
2.  Fill in your Firebase and OAuth credentials in `.env`.
    - You can get these from the [Firebase Console](https://console.firebase.google.com/).
    - **Never commit `.env` to version control.**

### Building
Secrets are injected during the build process:
```bash
npm run build
```
This will generate a `dist` folder with the correct `manifest.json` and bundled code.

## Technologies

- **Vite**: For bundling and development.
- **Firebase**: backend-as-a-service for authentication and real-time database.
- **Chrome Extension Manifest V3**: Utilizing the latest extension capabilities (`sidePanel`, `declarativeNetRequest`).

## License

This project is open source and available under the [MIT License](LICENSE).
# chromium-sidebar
