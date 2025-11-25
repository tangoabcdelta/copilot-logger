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
