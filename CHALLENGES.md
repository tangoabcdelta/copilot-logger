# Challenges and Resolutions

## Challenges

### Unresolved / In-Progress

1. **Workspace Trust and Permissions**
   - Issue: File writing operations fail in untrusted workspaces or directories without write permissions.
   - Status: In progress. Extension detects untrusted state and warns, but workflow for enabling logging needs documentation and user guidance.

### Resolved / Addressed

1. **F5 Debugging Opens Empty Directory**
   - Issue: Pressing F5 (launching extension debug) opened an empty directory instead of the intended workspace folder.
   - Resolution: Fixed `.vscode/launch.json` to use `${workspaceFolder}` for `--extensionDevelopmentPath` and added the workspace folder as an argument so the debug session opens the correct project.

2. **F5 Debugging Opens Empty VS Code Window**
   - Issue: Pressing F5 to debug the extension opened a new, empty VS Code window instead of running the extension in the development workspace.
   - Resolution: Updated `.vscode/launch.json` to remove redundant workspace folder arguments in `args` and corrected the `outFiles` path to match the actual output directory (`out`). This ensured the extension launched correctly during debugging.

3. **Debounced Popup Not Working / Excessive Popups (UX)**
   - Issue: The debounced popup mechanism did not reliably aggregate actions; users saw multiple noisy notifications.
   - Resolution: Replaced modal popups with a dedicated **Output Channel** (`Copilot Logger`) that aggregates interactions without interrupting workflow.

4. **Dynamic Log File Creation / Missing Log Resource**
   - Issue: Users had to manually create `logs/` directory and `copilot-activity-log.txt`.
   - Resolution: Added command `copilot-logger.createLogResources` which creates both resources automatically and opens the log file in the editor.

5. **On-Demand Chat Session Import**
   - Issue: Chat session scanning only ran at activation; users couldn't re-import.
   - Resolution: Added command `copilot-logger.importChatSessions` to trigger `ChatSessionScanner.scanAndLog()` on demand.

6. **Separation of File Access and Interaction Handling**
   - Issue: File access logic was tightly coupled with interaction handling, making the extension less modular.
   - Resolution: Refactored the codebase to separate concerns. Introduced `CopilotChatInterceptor` for interaction handling and updated `ChatSessionScanner` to focus on scanning.

7. **Centralized Logging**
   - Issue: Redundant `console` calls and inconsistent logging behavior.
   - Resolution: Replaced all `console` calls with `LoggerUtility` methods to ensure consistent logging and optional user notifications.
   - Outcome: Improved maintainability and reduced code duplication.

8. **Windows Shell vs Bash**
   - Issue: Not sure if it is real yet, but I can keep flipflopping between type of terminals. I use git bash on windows.
   - Resolution: Want to use CMD? Go to `settings.json` and add `"terminal.integrated.defaultProfile.windows": "Command Prompt"`
   - Outcome: CMD appears as the default terminal instead of bash.

9. **LoggerUtility Misuse in Standalone Scripts**
   - Issue: The `version-check.js` script incorrectly used `LoggerUtility` for logging, which is intended for the extension's runtime.
   - Cause: A side effect of replacing all `console` calls with `LoggerUtility` methods during refactoring.
   - Resolution: Reverted to using `console.log` and `console.warn` in `version-check.js` to maintain its independence as a standalone script.
   - Outcome: Prevented unnecessary dependencies and ensured the script remains lightweight and functional.

### Suppressing Warnings

1. **DeprecationWarning for `punycode`**
   - **Issue**: The `punycode` module triggered a deprecation warning during extension activation.
   - **Attempted Fix**: Used `process.env.NODE_OPTIONS = '--no-deprecation'` to suppress the warning.
   - **Outcome**: The fix caused compatibility issues and was reverted.

2. **ExperimentalWarning for SQLite**
   - **Issue**: SQLite triggered an experimental feature warning during extension activation.
   - **Attempted Fix**: Overrode `process.emitWarning` to suppress the warning.
   - **Outcome**: The override caused type compatibility issues and was reverted.

## Next Steps / Todos

- [ ] Improve session-to-workspace path resolution by inspecting stored session metadata formats and mapping `workspace-id` to actual workspace paths when possible.
- [ ] Add unit/integration tests for `ChatSessionScanner` and `Logger` (simulate workspaceStorage inputs) and add a CI job to run lint/tests.
- [ ] Add user-facing documentation / onboarding that explains how to enable logging, create resources, and privacy considerations.


1. **Git Directory Marked as Dirty**
   - Issue: Writing a `.checksum` file caused the Git directory to appear dirty, leading to errors during `npm version patch`.
   - Resolution: Skipped writing the `.checksum` file and documented the change in `CODING-STANDARDS.md`. Also added `.checksum` to `.gitignore`.

2. **Code Maintainability (Refactor)**
   - Issue: The initial implementation lacked structure and violated SOLID principles.
   - Resolution: Refactored the code to use separate classes for logging (`Logger`), interactions (`CopilotInteractionHandler`), and chat-session scanning (`ChatSessionScanner`).

## Lessons Learned

- Always validate file and directory existence before performing operations.
- Follow SOLID principles to improve code maintainability and scalability.
- Provide clear user feedback for errors and warnings.

## Future Considerations

- Explore using the VS Code `workspace.fs` API for better cross-platform file handling.
- Add telemetry to track extension usage and identify potential issues.
