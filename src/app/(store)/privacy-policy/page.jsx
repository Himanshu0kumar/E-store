"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const SECTIONS = [
  {
    id: "information-we-collect",
    title: "1. Information We Collect",
    body: [
      "We collect information you provide directly, such as your name, email address, shipping address, and payment details when you create an account or place an order.",
      "We also automatically collect certain technical information, including your IP address, browser type, and pages visited, to help us understand how our site is used and to keep it secure.",
    ],
  },
  {
    id: "how-we-use-information",
    title: "2. How We Use Your Information",
    body: [
      "We use the information we collect to process orders, provide customer support, and communicate with you about your account or purchases.",
      "With your consent, we may also use your email to send product updates or promotional offers. You can opt out of these at any time.",
    ],
  },
  {
    id: "sharing-your-information",
    title: "3. Sharing Your Information",
    body: [
      "We do not sell your personal information. We share it only with service providers who help us operate our business — such as payment processors and shipping carriers — and only to the extent necessary for them to perform their services.",
      "We may disclose information if required by law, or to protect our rights, property, or safety, or that of our users.",
    ],
  },
  {
    id: "cookies",
    title: "4. Cookies and Tracking",
    body: [
      "We use cookies to keep you logged in, remember items in your cart, and understand site usage patterns. You can control cookies through your browser settings, though disabling them may affect site functionality.",
    ],
  },
  {
    id: "data-security",
    title: "5. Data Security",
    body: [
      "We use industry-standard measures — including encryption in transit and at rest — to protect your information. No method of transmission over the internet is completely secure, so we can't guarantee absolute security.",
    ],
  },
  {
    id: "your-rights",
    title: "6. Your Rights",
    body: [
      "Depending on your location, you may have the right to access, correct, or delete your personal information, or to object to certain processing. To exercise these rights, contact us using the details below.",
    ],
  },
  {
    id: "changes",
    title: "7. Changes to This Policy",
    body: [
      "We may update this policy from time to time. If we make material changes, we'll notify you by email or with a notice on our site before the changes take effect.",
    ],
  },
  {
    id: "contact",
    title: "8. Contact Us",
    body: [
      "If you have questions about this policy or how we handle your data, reach out at privacy@yourstore.com.",
    ],
  },
];

const LAST_UPDATED = "July 1, 2026";

export default function PrivacyPolicyPage() {
  const [activeSection, setActiveSection] = useState(SECTIONS[0].id);

  const scrollToSection = (id) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] flex flex-col">
      <Header />

      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-sm text-slate-500 mt-2">Last updated: {LAST_UPDATED}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Table of contents */}
          <aside className="hidden lg:block lg:col-span-1">
            <nav className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4 sticky top-24 space-y-1">
              {SECTIONS.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                    activeSection === section.id
                      ? "bg-emerald-50 text-emerald-700 font-medium"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {section.title}
                </button>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 sm:p-8 space-y-10">
              {SECTIONS.map((section) => (
                <section key={section.id} id={section.id} className="scroll-mt-24">
                  <h2 className="text-lg font-bold text-slate-900 mb-3">
                    {section.title}
                  </h2>
                  <div className="space-y-3">
                    {section.body.map((paragraph, idx) => (
                      <p key={idx} className="text-slate-600 leading-relaxed text-sm">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}