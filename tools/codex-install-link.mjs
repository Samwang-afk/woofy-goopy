// Generates an official install link for a URL you control; uploads nothing.
const input = process.argv[2];
if (!input) {
  console.error('Usage: node tools/codex-install-link.mjs https://your-host/spritesheet.png');
  process.exit(1);
}
let source;
try { source = new URL(input); } catch { console.error('Provide an absolute HTTPS URL.'); process.exit(1); }
if (source.protocol !== 'https:' || source.username || source.password) {
  console.error('Provide an HTTPS URL without embedded login credentials.');
  process.exit(1);
}
const query = new URLSearchParams({
  name: 'Crown', imageUrl: source.href,
  description: 'A curious big-eyed crowned bird.', spriteVersionNumber: '2'
});
console.log(`codex://pets/install?${query}`);
