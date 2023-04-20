import { defineConfig } from "vite";

export default defineConfig({
  test: {
    coverage: {
      provider: "c8",
      reporter: ["lcov", "text"],
    },
  },
});
