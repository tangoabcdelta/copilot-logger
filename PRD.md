# Product Requirements Document (PRD)

## Project: Copilot Logger

### Overview

The "Copilot Logger" is a VS Code extension designed to monitor and log interactions with GitHub Copilot. It captures user inputs (requests) and Copilot outputs (responses) and stores them in log files for auditing purposes. This extension aims to provide transparency and traceability for Copilot-assisted development sessions.

---

### Goals

1. **Log User Inputs and Copilot Outputs:**

   - Capture all user requests made to Copilot.
   - Record Copilot's responses to those requests.
   - Store the logs in a structured format in a designated `logs/` directory.

2. **Automate Logging:**

   - Ensure logging happens automatically without manual intervention.
   - Create a new log file for each session, uniquely identified by a timestamp.

3. **Provide Session Summaries:**

   - Generate a summary of each session.
   - Optionally append the summary to Git commit messages.

4. **Maintain Performance:**

   - Ensure the extension does not degrade the performance of VS Code or Copilot.

5. **User-Friendly Configuration:**

   - Allow users to configure log file locations and formats.
   - Provide clear documentation for setup and usage.

---

### Features

1. **Logging Mechanism:**

   - Automatically capture and log interactions.
   - Support plain text or JSON log formats.

2. **Session Management:**

   - Create a new log file for each session.
   - Include metadata such as timestamps and session IDs.

3. **Configuration Options:**

   - Allow users to specify log file paths.
   - Enable or disable specific logging features.

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

2. **Implement Logging Functionality:**

   - Capture user inputs and Copilot outputs.
   - Write logs to files.

3. **Add Configuration Options:**

   - Allow users to customize logging behavior.

4. **Test and Debug:**

   - Ensure the extension works as expected.
   - Fix any bugs or performance issues.

5. **Document the Extension:**

   - Write detailed usage instructions in `README.md`.
   - Provide examples and troubleshooting tips.

---

### Success Metrics

- Logs are generated for 100% of Copilot interactions.
- No performance degradation in VS Code.
- Positive feedback from users regarding ease of use and reliability.

---

### Risks and Mitigation

1. **Performance Impact:**

   - Optimize logging to minimize overhead.

2. **Incomplete Logs:**

   - Implement robust error handling to ensure logs are always written.

3. **User Privacy:**

   - Clearly document what data is logged.
   - Allow users to disable logging if desired.

---

### Appendix

- **References:**

  - [VS Code API Documentation](https://code.visualstudio.com/api)
  - [Yeoman Generator for VS Code Extensions](https://code.visualstudio.com/api/get-started/your-first-extension)

- **Contact:**

  - Developer: Deveedutta Maharana
  - Email: <deveedutta@gmail.com>

---

## Overview

The **Copilot Logger** is a Visual Studio Code extension designed to monitor and log interactions with GitHub Copilot. It provides transparency and traceability for Copilot-assisted development sessions by capturing user inputs and Copilot outputs.

### Aim

- Provide transparency and traceability for Copilot-assisted development.
- Enable developers to learn from one another by reviewing these logs, fostering unified thought processes within a team.

## Features

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
