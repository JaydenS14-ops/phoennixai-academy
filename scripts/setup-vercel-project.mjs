const token = process.env.VERCEL_TOKEN;
if (!token) throw new Error("VERCEL_TOKEN is required");

const projectName = "phoennixai-academy";
const response = await fetch("https://api.vercel.com/v11/projects", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    name: projectName,
    framework: "vite",
    buildCommand: "pnpm build",
    outputDirectory: "dist/public",
    gitRepository: {
      type: "github",
      repo: "JaydenS14-ops/phoennixai-academy",
    },
  }),
});

const payload = await response.json();
if (!response.ok) {
  throw new Error(`Vercel project setup failed (${response.status}): ${payload.error?.message ?? JSON.stringify(payload)}`);
}

console.log(JSON.stringify({ id: payload.id, name: payload.name, accountId: payload.accountId, link: payload.link }, null, 2));
