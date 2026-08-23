"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Clock, Send, Check, Loader } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const CONTACT_DETAILS = [
  {
    icon: Mail,
    label: "Email",
    value: "support@yourstore.com",
    href: "mailto:support@yourstore.com",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+1 (555) 123-4567",
    href: "tel:+15551234567",
  },
  {
    icon: MapPin,
    label: "Address",
    value: "123 Market Street, San Francisco, CA 94103",
    href: null,
  },
  {
    icon: Clock,
    label: "Hours",
    value: "Mon–Fri, 9am–6pm PST",
    href: null,
  },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState("idle"); // idle | submitting | success

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;

    setStatus("submitting");
    // TODO: replace with a real API call, e.g.
    // await api.post("/api/contact", form);
    await new Promise((resolve) => setTimeout(resolve, 900));
    setStatus("success");
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] flex flex-col">
      <Header />

      {/* Hero */}
      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 py-14 text-center">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-2">
            Get in Touch
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            We&apos;d love to hear from you
          </h1>
          <p className="text-slate-500 mt-3 max-w-xl mx-auto">
            Questions about an order, a product, or anything else — our team
            usually replies within one business day.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Contact info */}
          <div className="lg:col-span-2 space-y-4">
            {CONTACT_DETAILS.map(({ icon: Icon, label, value, href }) => (
              <div
                key={label}
                className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    {label}
                  </p>
                  {href ? (
                    <a
                      href={href}
                      className="text-slate-900 font-medium hover:text-emerald-600 transition"
                    >
                      {value}
                    </a>
                  ) : (
                    <p className="text-slate-900 font-medium">{value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 sm:p-8">
              {status === "success" ? (
                <div className="text-center py-10">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-emerald-50 flex items-center justify-center">
                    <Check className="w-7 h-7 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">
                    Message sent
                  </h3>
                  <p className="text-slate-500 text-sm mb-6">
                    Thanks for reaching out — we&apos;ll get back to you soon.
                  </p>
                  <button
                    onClick={() => setStatus("idle")}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1.5">
                        Name *
                      </label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={handleChange("name")}
                        required
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
                        placeholder="Jane Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1.5">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={handleChange("email")}
                        required
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
                        placeholder="jane@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={form.subject}
                      onChange={handleChange("subject")}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
                      placeholder="Order question, product feedback, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">
                      Message *
                    </label>
                    <textarea
                      value={form.message}
                      onChange={handleChange("message")}
                      required
                      rows={5}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition resize-none"
                      placeholder="How can we help?"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition disabled:opacity-50"
                  >
                    {status === "submitting" ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}