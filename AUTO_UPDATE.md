# Momento auto-updates

Installed desktop builds check GitHub Releases for a newer version, download it, and prompt to restart.

Users do not reinstall manually. You still publish a build when the version changes (can be a single git tag).

## Flow

1. Bump `version` in package.json
2. Commit and push
3. `git tag vX.Y.Z` and `git push origin vX.Y.Z`
4. GitHub Actions builds the installer and publishes a Release
5. Installed apps auto-detect within ~8s of launch (and every ~4 hours)

## Notes

- Only packaged installs update (`npm start` does not)
- Repo in package.json publish config must match your GitHub repo
- Optional later: Windows code signing to reduce SmartScreen prompts
