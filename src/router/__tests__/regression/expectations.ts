/**
 * Routes that render an errorElement on current main (React Router 6.30),
 * keyed by pattern → the errors their errorElement receives. These are
 * pre-existing bugs, not harness artifacts; they are listed so the suite is
 * green on main and any change (a new error, or one fixed) fails loudly.
 */
export const EXPECTED_ROUTE_ERRORS: Record<string, string[]> = {
  // CustomerPage → CustomerList reads `.length` of the customers/members
  // response before checking it loaded; with the API answering 404 the render
  // throws, Page.tsx redirects to /error?message=…&target=….
  "/customers": [
    "TypeError: Cannot read properties of undefined (reading 'length')",
  ],
  "/org/:contractor_id/members": [
    "TypeError: Cannot read properties of undefined (reading 'length')",
  ],
}
