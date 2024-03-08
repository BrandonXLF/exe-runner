# Change Log

## 1.1.0

- "Run Executable" command now works on the unsupported text encoding page
- "exe Runner" terminal now uses a custom icon

## 1.0.0

- No longer force the use of `cmd.exe` on windows when creating the terminal
- Added an option to run `.exe` files in the directory they are located in (`exeRunner.runInFileDirectory`)
- Added an option to clear the terminal before each run (`exeRunner.clearTerminal`)
- Added an option to customize the compatibility layer used in non-Windows environments (`exeRunner.compatibilityLayer`)
- Reuse persistent terminals when `terminal.integrated.enablePersistentSessions` is enabled

## 0.2.1

- "Run Executable" now works as expected from the command palette

## 0.2.0

- Optimized code
- exe Runner terminal is only discarded when it is closed, rather than any terminal
- "Run Executable" added to editor tab context menu

## 0.1.0

- Terminal always uses cmd.exe on windows
- On non-Windows OSes, wine is used

## 0.0.2

- Updated LICENSE filename

## 0.0.1

- Initial release