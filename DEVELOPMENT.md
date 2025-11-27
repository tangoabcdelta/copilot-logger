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
   npm run package
   ```

   This will trigger the `prepackage` script to bundle the extension using Webpack and then use `vsce package` to generate the `.vsix` file. The `.vsix` file will be created in the root directory of the project.

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

6. **Handling Missing Workspace Folders**
   - Implemented a feature to handle cases where no workspace folder is open.
   - Displays a warning message if no workspace folder is found.
   - Prompts the user with an option to create a default logs directory.

### Refactoring Notes

- **Separation of Concerns:**
  - Introduced `CopilotChatInterceptor` to handle interaction detection independently of file access.
  - Refactored `ChatSessionScanner` to separate scanning logic from logging.

- **Updated File Structure:**
  - `src/handlers/`: Contains logic for interaction handling and scanning.
  - `src/logger/`: Contains logic for logging to files.
  - `src/views/`: Contains UI-related components like the TreeDataProvider.

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

### Logging and Notifications

- **Centralized Logging**: All `console` calls have been replaced with `LoggerUtility` methods to ensure consistent logging and optional user notifications.
- **Rationale**: This change reduces redundancy and ensures that logging behavior is configurable via environment variables (`LOG_TO_CONSOLE`, `SHOW_POPUPS`).

### Logger vs LoggerUtility

- **Logger**:
  - Handles file-based logging operations.
  - Writes logs to the `copilot-activity-log.txt` file.
  - Ensures the log directory and file exist, creating them if necessary.
  - Used for persistent storage of logs.

- **LoggerUtility**:
  - Provides utility methods for logging messages to the console and showing popups in the VS Code UI.
  - Respects environment variables (`LOG_LEVEL`, `LOG_TO_CONSOLE`, `SHOW_POPUPS`) to control log verbosity and behavior.
  - Does not handle file-based logging.

Use `Logger` for persistent logs and `LoggerUtility` for real-time notifications and debugging.

---

### Coding Guidelines

To maintain code quality and readability, the following linting rules are enforced using ESLint:

1. **Function Length**:
   - Functions should not exceed 50 lines of code (excluding comments).
   - This ensures functions remain focused and easier to understand.

2. **Cyclomatic Complexity**:
   - Functions should have a maximum cyclomatic complexity of 10.
   - This helps reduce overly complex logic and improves maintainability.

3. **Maximum Depth**:
   - Code blocks should not exceed a nesting depth of 4 levels.
   - This avoids deeply nested structures that are hard to follow.

4. **Maximum Parameters**:
   - Functions should accept no more than 3 parameters.
   - This encourages simpler function signatures.

5. **Maximum Statements**:
   - Functions should contain no more than 15 statements.
   - This ensures functions remain concise and focused.

These rules are configured in the `.eslintrc.json` file and are automatically checked during development. Run the following command to check for linting issues:

```bash
npm run lint
```

Adhering to these guidelines ensures the codebase remains clean, maintainable, and easy to extend.

---

For any questions or issues, please refer to the project repository or contact the maintainers.

---

## Debugging Self-Help Guide: Debugging a Webview Extension in Visual Studio Code

**Analogy for Understanding:** Debugging a webview in VS Code using these steps is like opening the hood of a specialized piece of machinery (your extension) that uses a standard, familiar engine (the HTML/CSS/JavaScript web code). Although the machine is inside a larger chassis (VS Code), the tools you use to diagnose the engine (Chrome DevTools) are the same standard tools you use for any typical web engine.

---

This guide provides specific instructions on how to debug a webview extension within Visual Studio Code (VS Code), drawing on the steps described in the sources.

### When to Use This Debugging Method

This method is specifically designed for debugging **a webview extension in Visual Studio Code** that utilizes an HTML page to display its content. If your extension is using an HTML page, this process allows you to inspect and interact with the underlying structure, styling, and scripting.

### The Steps of Debugging a Webview Extension

Follow these steps to initiate the debugging process:

#### Step 1: Run and Open the Extension

First, you must **run the extension and open it** within Visual Studio Code.

#### Step 2: Open Developer Tools

Once the extension is running and visible, you need to open the specialized debugging tools.

1. **Open the command prompt** within the VS Code environment.
2. From the command prompt, **select the "open webfield developer tools command"**.

#### Step 3: Utilizing Chrome DevTools

Executing the command in Step 2 will immediately **open a Chrome DevTools window**. This window serves as your primary debugging interface.

### What to Use (Debugging Tools and Techniques)

The experience of debugging the webview within Chrome DevTools is described as being **"pretty much the same as a normal html page"**. You have access to the standard tools expected when debugging web content:

| Debugging Tool/Action   | Purpose and Application                                                                 |
|-------------------------|-----------------------------------------------------------------------------------------|
| **Select Element Button** | This button allows you to **choose any HTML element on the page** for direct inspection. This is useful for identifying structural issues or ensuring the correct elements are being loaded. |
| **CSS Access**          | You have **access to the CSS** used by the extension. This enables you to inspect, modify, and troubleshoot styling issues. |
| **JavaScript Access**   | You have **access to the JavaScript** used by the extension. This is crucial for debugging the functional logic and behavior of the webview. |

In essence, using the Chrome DevTools gives you the full capability to analyze the HTML, CSS, and JavaScript that constitute the webview content.

---

### Recent Refactoring: Feature Flags and Initialization

#### Context

To improve modularity and maintainability, we refactored the extension to use feature flags and object-oriented design patterns for initialization. This ensures that only the necessary modules are instantiated based on the environment configuration.

#### Key Changes

1. **Feature Flags:**

   - Introduced feature flags to control the initialization of various components.
   - Flags include:
     - `ENABLE_CHAT_WEBVIEW`: Enables the chat webview feature.
     - `ENABLE_SIDEBAR`: Enables the sidebar view for logs.
     - `ENABLE_LOGGING`: Enables logging functionality.

2. **Object-Oriented Initialization:**

   - Replaced `if-else` statements with a `FeatureInitializer` class.
   - The `FeatureInitializer` class encapsulates the initialization logic for each feature.
   - Features are initialized dynamically based on the active flags.

#### Benefits

- **Modularity:** Each feature's initialization logic is encapsulated, making the code easier to maintain and extend.
- **Performance:** Prevents unnecessary instantiation of modules when their corresponding features are disabled.
- **Readability:** Eliminates nested `if-else` blocks, improving code clarity.

#### Implementation Details

- The `FeatureInitializer` class dynamically initializes features based on the `featureFlags` object.
- Each feature's initialization logic is encapsulated in a private method within the class.
- The `activate` function creates an instance of `FeatureInitializer` and invokes its `initialize` method.

#### Example

Here is an example of how the `FeatureInitializer` class works:

```typescript
class FeatureInitializer {
  constructor(private context: vscode.ExtensionContext) {}

  initialize() {
    const initializers = [
      featureFlags.ENABLE_CHAT_WEBVIEW && this.initializeChatWebview,
      featureFlags.ENABLE_SIDEBAR && this.initializeSidebar,
      featureFlags.ENABLE_LOGGING && this.initializeLogging,
    ].filter(Boolean) as (() => void)[];

    initializers.forEach((initializer) => initializer.call(this));
  }

  private initializeChatWebview() {
    // Chat webview initialization logic
  }

  private initializeSidebar() {
    // Sidebar initialization logic
  }

  private initializeLogging() {
    // Logging initialization logic
  }
}
```

#### Future Recommendations

- Use this pattern for any new features that require conditional initialization.
- Document new feature flags in this file to ensure consistency across the development team.
