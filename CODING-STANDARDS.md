# Development Notes

## Skipping Checksum File

The `.checksum` file is no longer written to avoid marking the Git directory as dirty. This change ensures smoother version bumping and packaging workflows without unnecessary interruptions.

### Rationale

- Writing the `.checksum` file caused the Git directory to appear dirty, leading to repeated errors during `npm version patch`.
- By skipping the write operation, we maintain a clean Git state while still detecting changes for version bumps.

### Implementation

- The `fs.writeFileSync(checksumFile, currentChecksum)` line in `tools/version-check.js` has been commented out.
- This prevents the `.checksum` file from being created or updated.

### Alternatives Considered

- **Gitignore the `.checksum` file**: This was deemed less effective as it still creates unnecessary file writes.
- **Environment-based toggling**: Adding a flag to conditionally write the file was considered but not implemented for simplicity.

### Impact

- The checksum comparison still works as intended, but the `.checksum` file is no longer persisted.
- Developers should ensure the `checkForChanges` function is used responsibly to avoid unintended skips.