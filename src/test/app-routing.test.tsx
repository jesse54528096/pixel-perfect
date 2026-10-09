import { matchRoutes } from "react-router";
import { describe, expect, it } from "vitest";

import { routes } from "@/App";

// Match routes without rendering: pages may need network access the test run lacks.
describe("App routing", () => {
  it.each(["/", "/app", "/auth", "/signup", "/sign-in", "/sign-up"])(
    "matches a page for %s instead of falling back to not found",
    (pathname) => {
      const matches = matchRoutes(routes, pathname);

      expect(matches?.at(-1)?.route.path).not.toBe("*");
    },
  );
});
