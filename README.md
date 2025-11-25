# Copilot Logger

## Overview

The **Copilot Logger** is a Visual Studio Code extension designed to monitor and log interactions with GitHub Copilot. It captures user inputs (requests) and Copilot outputs (responses) and stores them in log files for auditing purposes. This extension provides transparency and traceability for Copilot-assisted development sessions.

## Features

- **Automatic Logging:** Captures all interactions with GitHub Copilot.

- **Session Summaries:** Generates summaries for each session.

- **Customizable Logs:** Allows users to configure log file locations and formats.

## Requirements

- Visual Studio Code version `^1.106.1` or higher.

- Node.js and npm installed on your system.

## Usage

1. Install the extension.

2. Interact with GitHub Copilot as usual.

3. Logs will be automatically generated in the `logs/` directory of your workspace.

## Logging Details

### Log File Name

The extension writes all logs to a single file named `copilot-activity-log.txt`. This file is located in the `logs/` directory within the extension's root directory.

### How It Works

1. **Activation:** When the extension is activated, it initializes a `Logger` class to handle all logging operations.
2. **Log File Check:** The extension ensures that the `logs/` directory and the `copilot-activity-log.txt` file exist. If they do not, warnings are displayed to the user.
3. **Logging Interactions:** The extension listens for changes in the active text editor. If any content related to Copilot is detected, it logs the interaction with a timestamp.
4. **Prepending Logs:** New log entries are prepended to the log file, ensuring the latest activity appears at the top.

### Important Notes

- If the `logs/` directory or `copilot-activity-log.txt` file is missing, the extension will not create them automatically. Users must create these manually if prompted.
- Ensure the workspace is trusted to enable file writing operations.

## Extension Settings

This extension does not currently provide any configurable settings.

## Known Issues

- None reported yet. Please report any issues on the [GitHub repository](https://github.com/your-repo).

## Release Notes

### 0.0.1

- Initial release of Copilot Logger.

- Added automatic logging of Copilot interactions.

### Testing the Extension

To test the extension against a specific workspace, update the `launch.json` file:

1. Locate the `--extensionDevelopmentPath` argument in the `Run Extension` configuration.
2. Replace the default `${workspaceFolder}` with the absolute path to your desired workspace. For example:

   ```json
   "args": [
       "--extensionDevelopmentPath=C:/Users/devee/Documents/PROJECTS/playing-with-github-apis"
   ]
   ```

   Ensure the path is valid and accessible.
