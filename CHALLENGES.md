# Challenges and Resolutions

## Challenges

### Unresolved / In-Progress

1. **Debounced Popup Not Working**
   - Issue: The debounced popup mechanism does not reliably aggregate actions into a single popup — users still see multiple notifications in some scenarios.
   - Status: In progress. Needs further debugging and possibly a different approach (use an output channel or status bar item rather than `showInformationMessage`).

2. **Dynamic Log File Creation / Missing Log Resource**
   - Issue: Automatic creation and use of multiple log files caused clutter; the current single-file approach still depends on users creating a `logs/` directory and the `copilot-activity-log.txt` file in some environments.
   - Status: In progress. Extension currently warns once when resources are missing; consider adding an explicit command to create resources or an onboarding prompt.

3. **Excessive Popups (UX)**n+   - Issue: Users reported too many popups earlier; the debounce helps but UX is still noisy for some flows.
   - Status: In progress. Consider switching to a non-modal notification method.

4. **Workspace Trust and Permissions**
   - Issue: File writing operations fail in untrusted workspaces or directories without write permissions.
   - Status: In progress. Extension detects untrusted state and warns, but workflow for enabling logging needs documentation and user guidance.

5. **F5 Debugging Opens Empty Directory**
   - Issue: Pressing F5 (launching extension debug) opens an empty directory instead of the intended workspace folder, interrupting debugging and tests.
   - Status: Unresolved. Requires investigation of `.vscode/launch.json` and `--extensionDevelopmentPath` usage; currently blocks smooth debug cycles.


### Resolved / Addressed

## Next Steps / Todos

- [ ] Inspect and fix `.vscode/launch.json` so F5 opens the intended workspace folder (ensure `--extensionDevelopmentPath` and `program` paths are correct for Windows paths).
- [ ] Add a command `copilot-logger.createLogResources` to create `logs/` and `copilot-activity-log.txt` automatically (with a confirmation prompt) for users who want convenience.
- [ ] Add a command `copilot-logger.importChatSessions` to run `ChatSessionScanner.scanAndLog()` on demand and to re-run scans as needed.
- [ ] Replace modal popups with a quieter UX: implement an output channel and/or a status bar indicator to surface aggregated Copilot interactions.
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
