/**
 * Routes that render an errorElement on current main (React Router 6.30),
 * keyed by pattern → the errors their errorElement receives. These are
 * pre-existing bugs, not harness artifacts; they are listed so the suite is
 * green on main and any change (a new error, or one fixed) fails loudly.
 */
export const EXPECTED_ROUTE_ERRORS: Record<string, string[]> = {}
