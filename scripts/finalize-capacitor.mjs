// Rename capacitor.html -> index.html in the static output so Capacitor /
// Android WebView can load it directly from file:///android_asset/public/.
import { rename, access, copyFile } from "node:fs/promises";
import { join } from "node:path";

const outDir = "dist-capacitor";
const src = join(outDir, "capacitor.html");
const dest = join(outDir, "index.html");

try {
  await access(src);
  try {
    await rename(src, dest);
  } catch {
    await copyFile(src, dest);
  }
  console.log(`✓ Capacitor static build ready in ./${outDir}/ (index.html)`);
} catch (err) {
  console.error("finalize-capacitor: capacitor.html not found in", outDir, err);
  process.exit(1);
}
