const ua = process.env.npm_config_user_agent || "";
const pkgMgr = process.env.npm_execpath || "";

const isPnpm = ua.startsWith("pnpm/") || pkgMgr.includes("pnpm");

if (!isPnpm) {
  console.error("ERROR: Please use pnpm to install dependencies.");
  console.error("Run: pnpm install");
  process.exit(1);
}
