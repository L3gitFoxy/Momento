/**
 * Builds release-notes-current.md for electron-builder from CHANGELOG.md
 * Usage: node scripts/prepare-release-notes.js [version]
 * Version defaults to package.json "version" (without v).
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
let version = (process.argv[2] || process.env.RELEASE_VERSION || pkg.version || "").replace(/^v/i, "");
if (!version) {
  console.error("No version");
  process.exit(1);
}

const changelogCandidates = [
  path.join(root, "docs", "CHANGELOG.md"),
  path.join(root, "CHANGELOG.md"),
];
let changelog = "";
for (const changelogPath of changelogCandidates) {
  try {
    changelog = fs.readFileSync(changelogPath, "utf8");
    if (changelog) break;
  } catch (e) {}
}

function extractSection(md, ver) {
  const lines = md.split(/\r?\n/);
  const headerRe = new RegExp("^#\\s*Momento\\s+v?" + ver.replace(/\./g, "\\.") + "\\s*$", "i");
  const anyHeader = /^#\s*Momento\s+v?\d+/i;
  let start = -1;
  for (let i = 0; i < lines.length; i++) {
    if (headerRe.test(lines[i].trim())) {
      start = i;
      break;
    }
  }
  if (start < 0) return null;
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    if (anyHeader.test(lines[i].trim())) {
      end = i;
      break;
    }
  }
  return lines.slice(start, end).join("\n").trim();
}

let body = extractSection(changelog, version);
if (!body) {
  // Fallback template so releases are never empty
  body = [
    "# Momento v" + version,
    "## Changelog",
    "* See commit history for details",
    "# `HAPPY PLANNING`"
  ].join("\n");
  console.warn("No CHANGELOG.md section for v" + version + " — using fallback.");
} else {
  console.log("Using CHANGELOG section for v" + version);
}

// Normalize bullets to * 
body = body.replace(/^\s*-\s+/gm, "* ");

const out = path.join(root, "release-notes-current.md");
fs.writeFileSync(out, body + "\n", "utf8");
console.log("Wrote", out);
