import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, "dist");
const indexPath = path.join(distDir, "index.html");

if (!fs.existsSync(indexPath)) {
  console.error("❌ dist/index.html not found! Run vite build first.");
  process.exit(1);
}

// 1. Create dist/404.html (GitHub Pages SPA fallback)
const fallbackPath = path.join(distDir, "404.html");
fs.copyFileSync(indexPath, fallbackPath);
console.log("✅ Created dist/404.html for GitHub Pages SPA routing");

// 2. Create dist/admin/index.html (Direct HTTP 200 route for /admin)
const adminDir = path.join(distDir, "admin");
if (!fs.existsSync(adminDir)) {
  fs.mkdirSync(adminDir, { recursive: true });
}
const adminIndexPath = path.join(adminDir, "index.html");
fs.copyFileSync(indexPath, adminIndexPath);
console.log("✅ Created dist/admin/index.html for direct /admin URL access");

// 3. Ensure logo is in admin/ if requested relatively
const logoDist = path.join(distDir, "logo.jpg");
if (fs.existsSync(logoDist)) {
  fs.copyFileSync(logoDist, path.join(adminDir, "logo.jpg"));
}

console.log("🎉 Postbuild complete! GitHub Pages /admin and deep links ready.");
