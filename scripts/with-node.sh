#!/bin/sh
# Run a command with the Node version pinned in .nvmrc.
# Git GUIs and other non-interactive shells often start with an older default Node,
# which makes pnpm and Astro refuse to run. Falls back to the current Node if nvm
# is not installed.
NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
WANT="$(tr -d 'v \n' < "$(dirname "$0")/../.nvmrc" 2>/dev/null)"
if [ -n "$WANT" ] && [ -d "$NVM_DIR/versions/node/v$WANT/bin" ]; then
  PATH="$NVM_DIR/versions/node/v$WANT/bin:$PATH"
  export PATH
fi
exec "$@"
