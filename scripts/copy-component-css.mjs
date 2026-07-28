import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const [, , sourceArg, targetArg] = process.argv;

if (!sourceArg || !targetArg) {
  console.error("Usage: node scripts/copy-component-css.mjs <source-root> <target-root>");
  process.exit(1);
}

const sourceRoot = resolve(sourceArg);
const targetRoot = resolve(targetArg);

if (!existsSync(sourceRoot)) {
  process.exit(0);
}

mkdirSync(targetRoot, { recursive: true });

for (const entry of readdirSync(sourceRoot, { withFileTypes: true })) {
  if (!entry.isDirectory()) {
    continue;
  }

  const sourceStyles = join(sourceRoot, entry.name, "styles");
  if (!existsSync(sourceStyles) || !statSync(sourceStyles).isDirectory()) {
    continue;
  }

  const targetStyles = join(targetRoot, entry.name, "styles");

  rmSync(targetStyles, { recursive: true, force: true });
  cpSync(sourceStyles, targetStyles, {
    recursive: true,
    force: true,
  });
}
