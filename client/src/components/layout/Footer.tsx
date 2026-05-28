import Link from "next/link";
import { Zap, Heart, Globe, MessageCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6C63FF] to-[#00D4AA] flex items-center justify-center">
                <Zap size={16} className="text-white" />
              </div>
              <span className="font-display font-bold text-xl gradient-text">Berd Vault</span>
            </Link>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              The premier platform for engineering students to share knowledge and ace exams.
            </p>
            <div className="flex gap-3 pt-1">
              <a href="https://github.com/Bernardo-e" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[#6C63FF]/50 transition">
                <Globe size={14} />
              </a>
              <a href="https://discord.gg/qSmhgSzB" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[#6C63FF]/50 transition">
                <MessageCircle size={14} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4 text-[var(--text)]">Platform</h4>
            <ul className="space-y-2 text-sm text-[var(--text-muted)]">
              <li><Link href="/browse" className="hover:text-[#6C63FF] transition">Browse Notes</Link></li>
              <li><Link href="/upload" className="hover:text-[#6C63FF] transition">Upload Notes</Link></li>
              <li><Link href="/dashboard" className="hover:text-[#6C63FF] transition">Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4 text-[var(--text)]">Community</h4>
            <ul className="space-y-2 text-sm text-[var(--text-muted)]">
              <li><a href="https://discord.gg/qSmhgSzB" target="_blank" rel="noopener noreferrer" className="hover:text-[#6C63FF] transition">Discord</a></li>
              <li><a href="https://github.com/Bernardo-e" target="_blank" rel="noopener noreferrer" className="hover:text-[#6C63FF] transition">GitHub</a></li>
              <li><a href="#" className="hover:text-[#6C63FF] transition">Blog</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4 text-[var(--text)]">Legal</h4>
            <ul className="space-y-2 text-sm text-[var(--text-muted)]">
              <li><Link href="/privacy" className="hover:text-[#6C63FF] transition">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-[#6C63FF] transition">Terms of Service</Link></li>
              <li><Link href="/cookies" className="hover:text-[#6C63FF] transition">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-[var(--text-muted)]">
          <p>© 2026 Berd Vault. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart size={13} className="text-red-500 fill-red-500" /> for students by Berd
          </p>
        </div>
      </div>
    </footer>
  );
}
