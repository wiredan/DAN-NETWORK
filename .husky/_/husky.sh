#!/bin/sh
# Husky script, automatically sourced by hooks

if [ -z "$husky_skip_init" ]; then
  debug () {
    [ "$HUSKY_DEBUG" = "1" ] && echo "husky (debug) - $1"
  }

  readonly hook_name="$(basename "$0")"
  debug "starting $hook_name..."

  readonly husky_skip_init=1
  export husky_skip_init

  if [ "$HUSKY" = "0" ]; then
    debug "HUSKY env variable is set to 0, skipping hook"
    exit 0
  fi

  if [ ! -f package.json ]; then
    debug "package.json not found, skipping hook"
    exit 0
  fi

  command -v npx >/dev/null 2>&1 || {
    echo "husky - npx not found, skipping $hook_name hook"
    exit 0
  }

  exec npx --no-install husky-run $hook_name "$@"
fi