# Development Guide for Copilot Logger

This guide provides instructions for developers working on the **Copilot Logger** extension. It includes steps for building, packaging, and testing the extension.

---

## Building the Extension

1. **Install Dependencies:**

   ```bash
   npm install
   ```

2. **Compile the Code:**

   ```bash
   npm run compile
   ```

   This will compile the TypeScript code into JavaScript and output it to the `dist/` directory.

---

## Packaging the Extension

1. **Install `vsce`:**

   Ensure you have the Visual Studio Code Extension Manager (`vsce`) installed globally:

   ```bash
   npm install -g @vscode/vsce
   ```

2. **Generate the `.vsix` File:**

   Run the following command in the root of the project:

   ```bash
   vsce package
   ```

   The `.vsix` file will be created in the root directory of the project.

---

## Testing the Extension

1. **Launch the Extension:**

   - Open the project in VS Code:

     ```bash
     code .
     ```

   - Press `F5` to launch the extension in a new Extension Development Host window.

2. **Debugging:**

   - Use the Debug Console in the Extension Development Host to view logs.

---

## Automating the Build Process

### What We Did

We added a new task to the `tasks.json` file for `npm run compile`. This task performs a one-time compilation of the extension and is marked as the default build task. Additionally, we updated the `launch.json` file to reference this task as the `preLaunchTask`.

### Why We Did It

Previously, the build process relied on the `npm watch` task, which runs in watch mode and is not suitable for one-time compilation before launching the extension. By defining a dedicated `npm: compile` task and setting it as the default build task, we streamlined the development workflow, ensuring that the extension is compiled automatically before running or debugging. This eliminates the need for repetitive manual builds and reduces potential errors during development.

---

## Development Summary

### Initial Goals

The primary objective of this project was to create a VS Code extension named "Copilot Logger" to log GitHub Copilot interactions. The extension was designed to activate automatically and generate log files in the workspace, capturing relevant events for analysis.

### Key Milestones

1. **Scaffolding the Extension**
   - The extension was scaffolded using the VS Code Extension API.
   - Basic activation events and a "Hello World" command were implemented to verify the setup.

2. **Logging Functionality**
   - Added functionality to create a `logs/` directory in the workspace.
   - Implemented logging to capture Copilot interactions upon activation.

3. **Documentation**
   - Created a PRD (Product Requirements Document) to outline the goals and features of the extension.
   - Updated the `README.md` file with user-facing documentation.
   - Added this `DEVELOPMENT.md` file to document the development process and provide instructions for future contributors.

4. **Streamlining the Development Workflow**
   - Configured `tasks.json` to include tasks for `npm watch` and `watch-tests`.
   - Updated `launch.json` to reference the default build task for debugging.
   - Automated the build process by adding a dedicated `npm: compile` task for one-time compilation.

5. **Testing and Debugging**
   - Verified that the extension activates correctly and generates logs as expected.
   - Ensured that the development workflow is efficient, with minimal manual intervention required.

### Lessons Learned

- Automating repetitive tasks, such as builds, significantly improves the development experience and reduces errors.
- Clear documentation is essential for maintaining and extending the project in the future.
- Testing early and often helps identify and resolve issues before they become blockers.

### Next Steps

- Continue refining the logging functionality to capture more detailed Copilot interactions. This includes identifying specific events to log and ensuring logs are structured for easy analysis.
- Explore additional features, such as filtering logs or exporting them in different formats. For example, consider adding options to export logs as JSON or CSV files.
- Gather feedback from users to prioritize future improvements. This could involve creating a feedback loop through GitHub issues or surveys.

---

## Troubleshooting

Here are some common issues and their resolutions:

1. **Extension Fails to Activate:**

   ```bash
   npm install
   ```

   - Check the `activationEvents` in `package.json` to ensure they match the intended triggers.

2. **Logs Are Not Generated:**

   ```bash
   npm run compile
   ```

   - Verify that the `logs/` directory is created in the workspace.

3. **Build Errors:**

   ```bash
   npm run compile
   ```

   - Ensure the `tasks.json` file is correctly configured for the build process.

4. **Tests Fail:**

   ```bash
   npm test
   ```

   - Check the test logs for detailed error messages.

---

## Testing Details

- **Unit Tests:**
  Focus on testing individual functions and modules. Use mock data to simulate different scenarios.

- **Integration Tests:**
  Test the extension's interaction with VS Code APIs and ensure it behaves as expected in the development host.

- **Manual Testing:**
  Launch the extension in the Extension Development Host and verify its functionality, including activation and logging.

For detailed test results, refer to the output in the Debug Console or the terminal.

---

## Additional Notes

- **Updating the README:**

  Ensure the `README.md` file is updated with user-facing documentation before packaging the extension.

- **Linting:**

  Run the linter to check for code quality issues:

  ```bash
  npm run lint
  ```

- **Testing:**

  Run tests to ensure the extension works as expected:

  ```bash
  npm test
  ```

---

For any questions or issues, please refer to the project repository or contact the maintainers.
