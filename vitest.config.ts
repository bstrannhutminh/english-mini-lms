/**
 * Default vitest config — re-exports the unit suite so IDEs/`vitest` without
 * a -c flag run the hermetic tests. Use `npm run test:integration` for the
 * DB-backed suite.
 */
export { default } from "./vitest.unit.config";
