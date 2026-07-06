import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();
const packagesDir = path.join(rootDir, "packages");
const checkOnly = process.argv.includes("--check");
const dependencyBlocks = ["dependencies", "devDependencies", "optionalDependencies", "peerDependencies"];

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

async function getWorkspacePackages() {
  const entries = await readdir(packagesDir, { withFileTypes: true });
  const packages = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const directory = path.join(packagesDir, entry.name);
    const packageJsonPath = path.join(directory, "package.json");
    const packageJson = await readJson(packageJsonPath);

    packages.push({
      directory,
      packageJsonPath,
      packageJson
    });
  }

  return packages;
}

function normalizeInternalVersion(specifier, version) {
  if (specifier.startsWith("file:")) {
    return version;
  }

  if (specifier === "workspace:*") {
    return version;
  }

  if (specifier === "workspace:^") {
    return `^${version}`;
  }

  if (specifier === "workspace:~") {
    return `~${version}`;
  }

  if (specifier.startsWith("workspace:")) {
    return specifier.slice("workspace:".length);
  }

  return specifier;
}

const workspacePackages = await getWorkspacePackages();
const versionsByName = new Map(
  workspacePackages.map(({ packageJson }) => [packageJson.name, packageJson.version])
);
const changes = [];

for (const workspacePackage of workspacePackages) {
  const { packageJson, packageJsonPath } = workspacePackage;
  const packageChanges = [];

  for (const blockName of dependencyBlocks) {
    const dependencies = packageJson[blockName];

    if (!dependencies) {
      continue;
    }

    for (const [dependencyName, specifier] of Object.entries(dependencies)) {
      const internalVersion = versionsByName.get(dependencyName);

      if (!internalVersion || typeof specifier !== "string") {
        continue;
      }

      const normalizedSpecifier = normalizeInternalVersion(specifier, internalVersion);

      if (normalizedSpecifier !== specifier) {
        dependencies[dependencyName] = normalizedSpecifier;
        packageChanges.push(`${blockName}.${dependencyName}: ${specifier} -> ${normalizedSpecifier}`);
      }
    }
  }

  if (packageChanges.length > 0) {
    changes.push({
      packageName: packageJson.name,
      packageJsonPath,
      packageChanges
    });

    if (!checkOnly) {
      await writeFile(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`, "utf8");
    }
  }
}

if (changes.length === 0) {
  console.log("No publish dependency rewrites are needed.");
  process.exit(0);
}

for (const change of changes) {
  console.log(`${change.packageName}`);
  for (const packageChange of change.packageChanges) {
    console.log(`  ${packageChange}`);
  }
}

if (checkOnly) {
  console.log("Check-only mode: no package.json files were changed.");
} else {
  console.log("Internal workspace dependencies were rewritten for npm publish.");
}
