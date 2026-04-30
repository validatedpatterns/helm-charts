export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-links">
          <a href="https://validatedpatterns.io">Validated Patterns</a>
          <span className="footer-dot">&middot;</span>
          <a href="https://github.com/validatedpatterns">GitHub</a>
          <span className="footer-dot">&middot;</span>
          <a href="https://connect.redhat.com/en/programs/validated-patterns">Red Hat</a>
        </div>
        <div className="footer-copy">
          Copyright &copy; {new Date().getFullYear()} Red Hat, Inc. All third-party trademarks
          are the property of their respective owners.
        </div>
      </div>
    </footer>
  );
}
