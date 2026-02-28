Bridgit Frontend Coding Challenge

Problem: Implement a File Explorer Interface
You are building part of a client-facing file explorer web application. The backend returns a list of files and directories. Your task is to implement both a simple API contract and the corresponding UI to render these files in a browser.

Part 1: Basic File Listing
Requirements:

Define an API contract to retrieve file tree data as a local, in-memory data structure that represents a list of files and directories.
This can either be statically defined, or a mocked API call
Each file should contain the following fields:
name (string)
type (either "file" or "directory")
content (string, only applicable to files)
Fetch the list of files in the frontend (using fetch or a simulated equivalent).
Render the list of files in the UI using HTML (plain JavaScript or any frontend framework).
The UI should clearly distinguish between files and directories.

Part 2: Grouping Files into Directories
Requirements:

Extend the API to support directories that contain files.
Modify the frontend to render directories and allow users to "open" a directory to view its contents.
Only one level of nesting is required for this step.
Part 3: Infinite Directory Nesting
Requirements:

Extend the API to support recursive nesting of directories (i.e., directories can contain other directories/files to any depth).
Update the frontend to support this:
Render directories recursively.
Allow users to expand/collapse nested directories.
Ensure good performance and clarity in deeply nested structures.
