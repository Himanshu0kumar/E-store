import { defineConfig } from "vitest/config";
import jsconfigPaths from "vite-jsconfig-paths";

export default defineConfig({
  plugins: [jsconfigPaths()],
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./__tests__/setup.js"],
    include: ["__tests__/**/*.test.js"],
  },
});
