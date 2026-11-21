const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';
const response = await fetch(`${baseUrl.replace(/\/$/, '')}/health`);
const body = await response.json();

if (!response.ok || body.status !== 'ok') {
  console.error(`Backend health check failed with HTTP ${response.status}.`);
  process.exit(1);
}

console.log(`Backend health check passed with HTTP ${response.status}.`);
