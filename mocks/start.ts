import { GitHubMocks } from "./github";
import { setupServer } from "msw/node";

const server = setupServer(...GitHubMocks);

server.listen({ onUnhandledRequest: "bypass" });
console.info("🔶 Mock server running");

process.once("SIGINT", () => server.close());
process.once("SIGTERM", () => server.close());
