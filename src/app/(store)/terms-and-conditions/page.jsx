"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const SECTIONS = [
  {
    id: "acceptance",
    title: "1. Acceptance of Terms",
    body: [
      "By accessing or using this site, you agree to be bound by these Terms and Conditions. If you don't agree, please don't use the site.",
    ],
  },
  {
    id: "accounts",
    title: "2. Accounts",
    body: [
      "You're responsible for maintaining the confidentiality of your account credentials and for all activity under your account. Notify us immediately if you suspect unauthorized access.",
      "You must provide accurate, current information when creating an account and keep it up to date.",
    ],
  },
  {
    id: "orders-and-payment",
    title: "3. Orders and Payment",
    body: [
      "All orders are subject to acceptance and availability. We reserve the right to refuse or cancel any order for reasons including suspected fraud or pricing errors.",
      "Prices are listed in USD and may change without notice, though changes won't affect orders already placed.",
    ],
  },
  {
    id: "shipping-returns",
    title: "4. Shipping and Returns",
    body: [
      "Shipping timelines are estimates, not guarantees. We're not responsible for carrier delays outside our control.",
      "Returns are accepted within 30 days of delivery on unworn items with tags attached, as described on our Returns page.",
    ],
  },
  {
    id: "intellectual-property",
    title: "5. Intellectual Property",
    body: [
      "All content on this site — including text, graphics, logos, and images — is our property or licensed to us, and may not be used without written permission.",
    ],
  },
  {
    id: "prohibited-uses",
    title: "6. Prohibited Uses",
    body: [
      "You agree not to use the site for any unlawful purpose, to attempt unauthorized access to our systems, or to interfere with the site's normal operation.",
    ],
  },
  {
    id: "limitation-of-liability",
    title: "7. Limitation of Liability",
    body: [
      "To the fullest extent permitted by law, we're not liable for any indirect, incidental, or consequential damages arising from your use of the site or products purchased through it.",
    ],
  },
  {
    id: "changes-to-terms",
    title: "8. Changes to These Terms",
    body: [
      "We may revise these terms from time to time. Continued use of the site after changes take effect constitutes acceptance of the revised terms.",
    ],
  },
  {
    id: "contact",
    title: "9. Contact Us",
    body: [
      "Questions about these terms can be sent to legal@yourstore.com.",
    ],
  },
];

const LAST_UPDATED = "July 1, 2026";

export default function TermsAndConditionsPage() {
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
            Terms and Conditions
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