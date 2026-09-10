import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const sourcePath = join(root, "deploy", "source", "Motzi Travel.dc.html");
const indexPath = join(root, "deploy", "index.html");
const logoPath = join(root, "deploy", "images", "motzi-logo.png");

const source = readFileSync(sourcePath, "utf8");
const index = readFileSync(indexPath, "utf8");

const checks = [
  {
    name: "original logo asset exists",
    pass: existsSync(logoPath),
  },
  {
    name: "source uses the logo image",
    pass: source.includes("images/motzi-logo.png"),
  },
  {
    name: "generated index uses the logo image",
    pass: index.includes("images/motzi-logo.png"),
  },
  {
    name: "hero has a readable text panel",
    pass: source.includes("hero-copy-panel") && index.includes("hero-copy-panel"),
  },
  {
    name: "hero text has shadow treatment",
    pass: source.includes("hero-text-shadow") && index.includes("hero-text-shadow"),
  },
  {
    name: "hero panel uses backdrop blur",
    pass: /backdrop-filter:\s*blur\(/.test(source) && /backdrop-filter:\s*blur\(/.test(index),
  },
  {
    name: "hero background has left-side contrast gradient",
    pass: source.includes("hero-contrast-gradient") && index.includes("hero-contrast-gradient"),
  },
];

const failed = checks.filter((check) => !check.pass);

for (const check of checks) {
  console.log(`${check.pass ? "PASS" : "FAIL"} ${check.name}`);
}

if (failed.length > 0) {
  process.exitCode = 1;
}
