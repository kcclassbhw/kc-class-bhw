const ua = process.env.npm_config_user_agent || '';
if (!ua.startsWith('pnpm/')) {
  console.error('');
  console.error('  ERROR: Please use pnpm to install dependencies.');
  console.error('');
  console.error('  Run:  pnpm install');
  console.error('');
  process.exit(1);
}
