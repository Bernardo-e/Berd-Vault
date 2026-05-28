"use client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";

export default function CookiesPage() {
  return (
    <div className="mesh-bg min-h-screen">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 pt-32 pb-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 md:p-12"
        >
          <h1 className="font-display text-4xl font-bold mb-2">Cookie Policy</h1>
          <p className="text-[var(--text-muted)] mb-8">Effective Date: April 29, 2026</p>

          <div className="space-y-8 text-[var(--text)] leading-relaxed">
            <section>
              <h2 className="text-xl font-bold mb-3">1. What Are Cookies</h2>
              <p>Cookies are small files stored on your device to improve your experience.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">2. How We Use Cookies</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>To keep you logged in</li>
                <li>To remember preferences</li>
                <li>To analyze usage and improve performance</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">3. Third-Party Cookies</h2>
              <p>We may use services like analytics or storage providers that use cookies.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">4. Managing Cookies</h2>
              <p>You can disable cookies in your browser settings, but some features may not work properly.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">5. Updates</h2>
              <p>We may update this policy from time to time.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">6. Contact</h2>
              <p>For questions: <a href="mailto:narded2007@gmail.com" className="text-[var(--brand)] hover:underline">narded2007@gmail.com</a></p>
            </section>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
