/**
 * What the SPA shell (index.html) shows until the app's first render: the
 * app frame (sidebar, top bar, bottom nav on phones) and a neutral page
 * placeholder, as plain elements styled by document.html. It's the root
 * route's HydrateFallback, so it's in the static HTML (visible before any
 * JS runs) and stays until the app commits, however long the first render
 * takes. Same markup on every path, so hydrating it never mismatches.
 */
export function ShellFallback() {
  return (
    <div className="scm-shell" aria-hidden="true" data-shell-fallback="">
      <div className="scm-shell-side" />
      <div className="scm-shell-col">
        <div className="scm-shell-bar" />
        <div className="scm-shell-page">
          <div className="scm-shell-line scm-shell-title" />
          <div className="scm-shell-line scm-shell-sub" />
          <div className="scm-shell-grid">
            <div className="scm-shell-card" />
            <div className="scm-shell-card" />
            <div className="scm-shell-card" />
            <div className="scm-shell-card" />
            <div className="scm-shell-card" />
            <div className="scm-shell-card" />
          </div>
        </div>
        <div className="scm-shell-bottom" />
      </div>
    </div>
  )
}
