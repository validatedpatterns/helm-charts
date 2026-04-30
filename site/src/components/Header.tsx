import { Link } from 'react-router-dom';
import { ThemeSwitcher } from './ThemeSwitcher';

export function Header() {
  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="header-brand">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="6" fill="#151515" />
            <path d="M7 24l5-10 5 10z" fill="#0066cc" />
            <path d="M14 24l5-10 5 10z" fill="#004080" opacity="0.7" />
            <path d="M10.5 16l3.5-7 3.5 7z" fill="#73bcf7" />
          </svg>
          <span className="header-title">Helm Charts</span>
        </Link>
        <nav className="header-nav">
          <a href="https://validatedpatterns.io" target="_blank" rel="noopener noreferrer">
            Validated Patterns
          </a>
          <a href="https://github.com/validatedpatterns/helm-charts" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          <ThemeSwitcher />
        </nav>
      </div>
    </header>
  );
}
