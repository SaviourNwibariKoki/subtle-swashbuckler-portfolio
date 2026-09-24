import http from "node:http";

process.env.NODE_ENV = "production";
process.env.VERCEL = "1";

const { default: app } = await import("../api/index.ts");
const server = app.listen(0);

try {
  await new Promise((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });

  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Could not determine the test server port");

  async function request(path) {
    return new Promise((resolve, reject) => {
      const request = http.get({ hostname: "127.0.0.1", port: address.port, path }, (response) => {
        let body = "";
        response.setEncoding("utf8");
        response.on("data", (chunk) => { body += chunk; });
        response.on("end", () => resolve({ statusCode: response.statusCode, body }));
      });
      request.on("error", reject);
    });
  }

  for (const path of ["/", "/admin"]) {
    const result = await request(path);
    if (result.statusCode !== 200 || !result.body.includes('<div id="root"></div>')) {
      throw new Error(`Unexpected ${path} response: ${result.statusCode}`);
    }
  }

  console.log("Vercel runtime check passed for / and /admin");
} finally {
  server.close();
}
