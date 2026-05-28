"use client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";

export default function PrivacyPage() {
  return (
    <div className="mesh-bg min-h-screen">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 pt-32 pb-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 md:p-12"
        >
          <h1 className="font-display text-4xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-[var(--text-muted)] mb-8">Effective Date: April 29, 2026</p>

          <div className="space-y-8 text-[var(--text)] leading-relaxed">
            <section>
              <h2 className="text-xl font-bold mb-3">Welcome to Berd Vault</h2>
              <p>We respect your privacy and are committed to protecting your personal data.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">1. Information We Collect</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Personal information (name, email) during signup</li>
                <li>Uploaded content (notes, PDFs)</li>
                <li>Usage data (pages visited, downloads, interactions)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">2. How We Use Your Information</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>To provide and improve our services</li>
                <li>To manage user accounts</li>
                <li>To display and organize uploaded content</li>
                <li>To communicate important updates</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">3. File Uploads</h2>
              <p>Any notes or files uploaded by users may be visible to other users of the platform. Please do not upload sensitive or copyrighted material without permission.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">4. Data Storage</h2>
              <p>We store your data securely using trusted third-party services.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">5. Sharing of Data</h2>
              <p>We do not sell your personal data. We may share data only when required by law or to protect our platform.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">6. Security</h2>
              <p>We take reasonable steps to protect your data, but no system is completely secure.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">7. Your Rights</h2>
              <p>You can request to delete your account or data at any time.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">8. Changes to Policy</h2>
              <p>We may update this policy. Continued use means you accept the changes.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">9. Contact</h2>
              <p>For any questions, contact us at: <a href="mailto:narded2007@gmail.com" className="text-[var(--brand)] hover:underline">narded2007@gmail.com</a></p>
            </section>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
