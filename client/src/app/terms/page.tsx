"use client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";

export default function TermsPage() {
  return (
    <div className="mesh-bg min-h-screen">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 pt-32 pb-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 md:p-12"
        >
          <h1 className="font-display text-4xl font-bold mb-2">Terms and Conditions</h1>
          <p className="text-[var(--text-muted)] mb-8">Effective Date: April 29, 2026</p>

          <div className="space-y-8 text-[var(--text)] leading-relaxed">
            <section>
              <p>By using Berd Vault, you agree to the following terms:</p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">1. Use of Service</h2>
              <p>You agree to use the platform only for educational purposes and lawful activities.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">2. User Content</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Users can upload notes and files.</li>
                <li>You are responsible for the content you upload.</li>
                <li>Do not upload illegal, harmful, or copyrighted content without permission.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">3. Content Moderation</h2>
              <p>We reserve the right to remove any content that violates our policies.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">4. Account Responsibility</h2>
              <p>You are responsible for maintaining the confidentiality of your account.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">5. Limitation of Liability</h2>
              <p>We are not responsible for any loss, damage, or misuse of content.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">6. Termination</h2>
              <p>We can suspend or terminate accounts that violate rules.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">7. Changes</h2>
              <p>We may update these terms at any time.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">8. Governing Law</h2>
              <p>These terms are governed by applicable laws in your region.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">9. Contact</h2>
              <p>For queries: <a href="mailto:narded2007@gmail.com" className="text-[var(--brand)] hover:underline">narded2007@gmail.com</a></p>
            </section>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
