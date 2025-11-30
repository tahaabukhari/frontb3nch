import Link from 'next/link';

const links = [
  { title: 'About', items: ['Mission', 'Team', 'Press'] },
  { title: 'Contact', items: ['Support', 'Community', 'FAQs'] },
  { title: 'GitHub', items: ['Issues', 'Roadmap', 'Contribute'] },
];

const Footer = () => (
  <footer className="border-t border-dark-border bg-dark-card py-8">
    <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 sm:flex-row sm:px-6">
      <p className="text-sm text-gray-400">
        © 2024 <span className="font-semibold text-accent">parhaiGoat</span>. All rights reserved.
      </p>
      <nav className="flex flex-wrap justify-center gap-6">
        <Link href="/about" className="text-sm text-gray-400 transition hover:text-white">
          About
        </Link>
        <Link href="/privacy" className="text-sm text-gray-400 transition hover:text-white">
          Privacy
        </Link>
        <Link href="/terms" className="text-sm text-gray-400 transition hover:text-white">
          Terms
        </Link>
        <Link href="/contact" className="text-sm text-gray-400 transition hover:text-white">
          Contact
        </Link>
      </nav>
    </div>
  </footer>
);

export default Footer;
