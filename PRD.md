# Product Requirements Document (PRD)

## Project: Copilot Logger

### Project Overview

The "Copilot Logger" is a VS Code extension designed to monitor and log interactions with GitHub Copilot. It captures user inputs (requests) and Copilot outputs (responses) and stores them in log files for auditing purposes. This extension aims to provide transparency and traceability for Copilot-assisted development sessions.

---

### Goals

1. **Primary Focus on Interaction Interception:**

   - Detect and intercept Copilot interactions (inputs and outputs) without relying on file access.
   - Ensure the extension can function in environments where file writing is restricted.

2. **Secondary Focus on Logging:**

   - Provide optional logging capabilities to store intercepted interactions in a structured format.
   - Allow users to configure log file locations and formats.

3. **Separation of Concerns:**

   - Refactor the codebase to separate interaction handling from file access.
   - Ensure modularity and maintainability of the code.

---

### Interaction Features

1. **Interaction Interception:**

   - Detect and intercept interactions with GitHub Copilot.
   - Support for environments with restricted file writing.

2. **Optional Logging:**

   - Provide logging capabilities for intercepted interactions.
   - Allow configuration of log file paths and formats.

3. **Modular Architecture:**

   - Separate modules for interaction handling and file access.
   - Easy to maintain and extend.

4. **Integration with Git:**

   - Append session summaries to Git commit messages (optional).

5. **Error Handling:**

   - Handle scenarios where logging fails (e.g., insufficient permissions).

---

### Technical Requirements

1. **Language:** TypeScript

2. **Frameworks/Tools:**

   - VS Code API
   - Webpack for bundling

3. **Directory Structure:**

   - `src/`: Source code for the extension.
   - `logs/`: Directory for storing log files.

4. **Dependencies:**

   - Node.js and npm for package management.

---

### Milestones

1. **Scaffold the Extension:**

   - Generate the base project structure using Yeoman.
   - Initialize Git repository.

2. **Implement Interaction Interception:**

   - Detect and intercept user inputs and Copilot outputs.

3. **Add Optional Logging:**

   - Provide logging capabilities for intercepted interactions.

4. **Test and Debug:**

   - Ensure the extension works as expected.
   - Fix any bugs or performance issues.

5. **Document the Extension:**

   - Write detailed usage instructions in `README.md`.
   - Provide examples and troubleshooting tips.

---

### Success Metrics

- Successful interception of 100% of Copilot interactions.
- No performance degradation in VS Code.
- Positive feedback from users regarding ease of use and reliability.

---

### Risks and Mitigation

1. **Performance Impact:**

   - Optimize interception and logging to minimize overhead.

2. **Incomplete Interceptions:**

   - Implement robust error handling to ensure interactions are always intercepted.

3. **User Privacy:**

   - Clearly document what data is logged.
   - Allow users to disable logging if desired.

4. **Misuse of Shared Utilities:**
   - Risk: Shared utilities like `LoggerUtility` were used in standalone scripts, causing dependency issues.
   - Mitigation: Reverted to standard logging methods (`console.log`) in standalone scripts to maintain independence.

5. **Feature Flag Misconfiguration:**
   - Risk: Incorrectly set feature flags could disable critical features.
   - Mitigation: Documented all feature flags in `DEVELOPMENT.md` and added default values in `.env`.

---

### Appendix

- **References:**

  - [VS Code API Documentation](https://code.visualstudio.com/api)
  - [Yeoman Generator for VS Code Extensions](https://code.visualstudio.com/api/get-started/your-first-extension)

- **Contact:**

  - Developer: Deveedutta Maharana
  - Email: <deveedutta@gmail.com>

---

## Extension Overview

The **Copilot Logger** is a Visual Studio Code extension designed to monitor and log interactions with GitHub Copilot. It provides transparency and traceability for Copilot-assisted development sessions by capturing user inputs and Copilot outputs.

### Aim

- Provide transparency and traceability for Copilot-assisted development.
- Enable developers to learn from one another by reviewing these logs, fostering unified thought processes within a team.

## Extension Features

1. **Automatic Logging**
   - Captures all interactions with GitHub Copilot.
   - Logs are stored in a single file named `copilot-activity-log.txt` located in the `logs/` directory.

2. **Log File Management**
   - Ensures the `logs/` directory and `copilot-activity-log.txt` file exist.
   - Displays warnings if the directory or file is missing.
   - Opens the log file in the active editor after writing to it.

3. **Prepending Logs**
   - New log entries are prepended to the log file with a timestamp.

4. **Debounced Popups**
   - Displays a single popup for Copilot queries, aggregating subsequent actions into the same popup.

5. **SOLID Principles**
   - Refactored code to use a `Logger` class for logging and a `CopilotInteractionHandler` class for handling Copilot-related events.

## How It Works

1. **Activation**
   - Initializes the `Logger` and `CopilotInteractionHandler` classes.
   - Writes an activation log entry.

2. **Logging Interactions**
   - Listens for changes in the active text editor.
   - Logs interactions containing the keyword "copilot."

3. **File Writing**
   - Ensures the log file exists before writing.
   - Opens the log file in the active editor and writes via the VS Code editor API so new entries are prepended at the top (the log file must be accessible/openable in the editor).
   - If the editor cannot be shown the extension falls back to a safe `fs` prepend write.

4. **Error Handling**
   - Displays warnings if the `logs/` directory or log file is missing.
   - Handles file writing errors gracefully.

### Copilot Chat Session Scanning

- **Location:** Scans VS Code workspace storage for Copilot chat sessions at `%APPDATA%\\Code\\User\\workspaceStorage\\[workspace-id]\\chatSessions\\`.
- **Grouping:** Sessions are grouped by their associated workspace (the `workspace-id`) so sessions map to the project/workspace that produced them.
- **Titles:** Uses custom titles when a session provides one; otherwise it generates a human-friendly title from the session's first message.
- **Paths:** Resolves and validates workspace paths from stored session configuration so chat sessions can be associated with the correct workspace directory.

Implementation notes: the extension will scan the `workspaceStorage` chat session folders, read session metadata and messages, group sessions by workspace, and surface or export them into the configured logging output (the single consolidated log file by default). This approach provides a reliable source of Copilot chat history without relying on runtime hooks into Copilot.

## Requirements

- Visual Studio Code version `^1.106.1` or higher.
- Node.js and npm installed on the system.
- If multiple logging files do not work as intended, all logs will be consolidated into a single file.

## Future Enhancements

- Add configurable settings for log file location and format.
- Support for filtering specific Copilot interactions.

---

### Recent Updates

#### New Goals

1. **Feature-Based Initialization:**
   - Introduced a design pattern to initialize features dynamically based on environment variables (feature flags).
   - Ensures modularity and prevents unnecessary resource allocation.

2. **Improved Workspace Independence:**
   - Updated the extension to function seamlessly in empty workspaces.
   - Removed hard dependencies on workspace folders for logging and other features.

3. **Enhanced Debugging and Testing:**
   - Streamlined the development workflow with updated `launch.json` and `tasks.json` configurations.
   - Ensured compatibility with empty workspaces during debugging.

#### New Features

1. **Webview for Copilot Chats:**
   - Added a webview to display past Copilot chat sessions.
   - Controlled by the `ENABLE_CHAT_WEBVIEW` feature flag.

2. **Dynamic Logging Configuration:**
   - Logging functionality is now optional and controlled by the `ENABLE_LOGGING` feature flag.
   - Users can enable or disable logging without modifying the code.

3. **Centralized Logging Utility:**
   - Replaced redundant `console` calls with `LoggerUtility` for consistent logging.
   - Supports log levels (`info`, `warn`, `error`) and optional user notifications.

#### Updated Risks and Mitigation

1. **Misuse of Shared Utilities:**
   - Risk: Shared utilities like `LoggerUtility` were used in standalone scripts, causing dependency issues.
   - Mitigation: Reverted to standard logging methods (`console.log`) in standalone scripts to maintain independence.

2. **Feature Flag Misconfiguration:**
   - Risk: Incorrectly set feature flags could disable critical features.
   - Mitigation: Documented all feature flags in `DEVELOPMENT.md` and added default values in `.env`.

---

### Summary of Changes

#### Goals and Features

- Added dynamic feature initialization.
- Improved workspace independence.
- Enhanced debugging and testing workflows.

---

### Codebase Improvements

- **Centralized Logging**: Introduced `LoggerUtility` to handle all logging and notifications, ensuring consistency and configurability.
- **Rationale**: This change simplifies the codebase, reduces duplication, and allows users to control logging behavior through environment variables.
