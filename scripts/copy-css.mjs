import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";

const [, , sourceArg, targetArg] = process.argv;

if (!sourceArg || !targetArg) {
  console.error("Usage: node scripts/copy-css.mjs <source> <target>");
  process.exit(1);
}

const source = resolve(sourceArg);
const target = resolve(targetArg);

if (!existsSync(source)) {
  process.exit(0);
}

mkdirSync(dirname(target), { recursive: true });
rmSync(target, { recursive: true, force: true });
cpSync(source, target, { recursive: true, force: true });
