import { spawnSync } from "node:child_process";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();
const packagesDir = path.join(rootDir, "packages");
const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const provenance = args.has("--provenance");
const planOnly = args.has("--plan");
const skipExisting = !args.has("--no-skip-existing");
const dependencyBlocks = ["dependencies", "optionalDependencies", "peerDependencies"];

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
    const packageJson = await readJson(path.join(directory, "package.json"));

    if (!packageJson.private) {
      packages.push({
        directory,
        name: packageJson.name,
        version: packageJson.version,
        packageJson
      });
    }
  }

  return packages;
}

function getInternalDependencies(workspacePackage, names) {
  const dependencies = new Set();

  for (const blockName of dependencyBlocks) {
    const dependencyBlock = workspacePackage.packageJson[blockName];

    if (!dependencyBlock) {
      continue;
    }

    for (const dependencyName of Object.keys(dependencyBlock)) {
      if (names.has(dependencyName)) {
        dependencies.add(dependencyName);
      }
    }
  }

  return dependencies;
}

function sortByInternalDependencies(packages) {
  const names = new Set(packages.map((workspacePackage) => workspacePackage.name));
  const pending = new Map(
    packages.map((workspacePackage) => [
      workspacePackage.name,
      {
        ...workspacePackage,
        internalDependencies: getInternalDependencies(workspacePackage, names)
      }
    ])
  );
  const published = new Set();
  const sorted = [];

  while (pending.size > 0) {
    let progressed = false;

    for (const [packageName, workspacePackage] of pending) {
      const ready = [...workspacePackage.internalDependencies].every((dependencyName) =>
        published.has(dependencyName)
      );

      if (!ready) {
        continue;
      }

      sorted.push(workspacePackage);
      published.add(packageName);
      pending.delete(packageName);
      progressed = true;
    }

    if (!progressed) {
      const cycle = [...pending.values()]
        .map((workspacePackage) => `${workspacePackage.name} -> ${[...workspacePackage.internalDependencies].join(", ")}`)
        .join("\n");

      throw new Error(`Cannot resolve internal package publish order:\n${cycle}`);
    }
  }

  return sorted;
}

function run(command, commandArgs, options = {}) {
  const result = spawnSync(command, commandArgs, {
    stdio: options.stdio ?? "inherit",
    shell: process.platform === "win32",
    env: process.env
  });

  if (result.error) {
    throw result.error;
  }

  return result.status ?? 1;
}

function validatePublishableDependencies(workspacePackages, names) {
  const invalidDependencies = [];

  for (const workspacePackage of workspacePackages) {
    for (const blockName of dependencyBlocks) {
      const dependencyBlock = workspacePackage.packageJson[blockName];

      if (!dependencyBlock) {
        continue;
      }

      for (const [dependencyName, specifier] of Object.entries(dependencyBlock)) {
        if (names.has(dependencyName) && typeof specifier === "string" && /^(file|workspace):/.test(specifier)) {
          invalidDependencies.push(`${workspacePackage.name} ${blockName}.${dependencyName}=${specifier}`);
        }
      }
    }
  }

  if (invalidDependencies.length > 0) {
    throw new Error(
      [
        "Internal dependencies still use local workspace specifiers.",
        "Run `npm run prepare:publish` before publishing.",
        ...invalidDependencies.map((dependency) => `- ${dependency}`)
      ].join("\n")
    );
  }
}

function packageVersionExists(workspacePackage) {
  const status = run("npm", ["view", `${workspacePackage.name}@${workspacePackage.version}`, "version"], {
    stdio: "ignore"
  });

  return status === 0;
}

const workspacePackages = await getWorkspacePackages();
const sortedPackages = sortByInternalDependencies(workspacePackages);
const names = new Set(workspacePackages.map((workspacePackage) => workspacePackage.name));

console.log("Workspace publish order:");
for (const workspacePackage of sortedPackages) {
  console.log(`- ${workspacePackage.name}@${workspacePackage.version}`);
}

if (planOnly) {
  process.exit(0);
}

validatePublishableDependencies(workspacePackages, names);

if (!dryRun && !process.env.NODE_AUTH_TOKEN) {
  throw new Error("NODE_AUTH_TOKEN is required for npm publish. Add the NPM_TOKEN GitHub secret.");
}

for (const workspacePackage of sortedPackages) {
  if (!dryRun && skipExisting && packageVersionExists(workspacePackage)) {
    console.log(`Skipping ${workspacePackage.name}@${workspacePackage.version}: already published.`);
    continue;
  }

  const publishArgs = ["publish", "--workspace", workspacePackage.name, "--access", "public"];

  if (dryRun) {
    publishArgs.push("--dry-run");
  }

  if (provenance && !dryRun) {
    publishArgs.push("--provenance");
  }

  const status = run("npm", publishArgs);

  if (status !== 0) {
    process.exit(status);
  }
}
