#!/bin/bash
# Pelagic Atlas: create a dedicated GitHub repository and publish from macOS.
set -euo pipefail
cd "$(dirname "$0")"

REPO_OWNER="celineasher"
REPO_NAME="pelagic-atlas"
REPO="$REPO_OWNER/$REPO_NAME"

printf '\n====================================================\n'
printf ' Pelagic Atlas — GitHub publisher\n'
printf '====================================================\n\n'

if ! command -v gh >/dev/null 2>&1; then
  printf 'GitHub CLI (gh) is not installed.\n'
  printf 'Install it with: brew install gh\n'
  printf 'Then double-click this publisher again.\n'
  read -r -p 'Press Enter to close... ' _
  exit 1
fi
if ! command -v git >/dev/null 2>&1; then
  printf 'Git is not installed. Install Xcode Command Line Tools: xcode-select --install\n'
  read -r -p 'Press Enter to close... ' _
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  printf 'Sign in to GitHub.\n'
  gh auth login --hostname github.com --git-protocol https --web
fi

ACTUAL_USER="$(gh api user --jq .login)"
if [ "$ACTUAL_USER" != "$REPO_OWNER" ]; then
  printf 'Signed in as "%s", expected "%s".\n' "$ACTUAL_USER" "$REPO_OWNER"
  printf 'Run: gh auth switch\n'
  read -r -p 'Press Enter to close... ' _
  exit 1
fi

if gh repo view "$REPO" >/dev/null 2>&1; then
  printf 'A repository already exists at https://github.com/%s\n' "$REPO"
  printf 'Publisher will not overwrite an existing repository.\n'
  read -r -p 'Press Enter to close... ' _
  exit 1
fi

printf 'Creating public repository: https://github.com/%s\n' "$REPO"
read -r -p 'Publish this site to GitHub now? [y/N] ' CONFIRM
case "$CONFIRM" in
  y|Y|yes|YES) ;;
  *) printf 'Cancelled; no changes made.\n'; exit 0 ;;
esac

if [ ! -d .git ]; then
  git init -b main
fi
if ! git rev-parse --verify HEAD >/dev/null 2>&1; then
  git add -A
  USER_ID="$(gh api user --jq .id)"
  git -c user.name="$ACTUAL_USER" -c user.email="${USER_ID}+${ACTUAL_USER}@users.noreply.github.com" commit -m "Launch Pelagic Atlas"
fi

gh repo create "$REPO" --public --source=. --remote=origin --push

printf '\nRepository created: https://github.com/%s\n' "$REPO"
# GitHub Pages setup may require a permission that the CLI connection doesn't have.
if gh api -X POST "repos/$REPO/pages" -f build_type=workflow >/dev/null 2>&1; then
  printf 'GitHub Pages source configured for Actions.\n'
  gh workflow run pages.yml --repo "$REPO" >/dev/null 2>&1 || true
else
  printf 'Enable GitHub Pages manually:\n'
  printf 'https://github.com/%s/settings/pages\n' "$REPO"
  printf 'Select Build and deployment -> GitHub Actions.\n'
fi
printf '\nWebsite after successful deployment:\n'
printf 'https://%s.github.io/%s/\n' "$REPO_OWNER" "$REPO_NAME"
printf 'Check Actions for deployment status: https://github.com/%s/actions\n' "$REPO"
read -r -p 'Press Enter to close... ' _
