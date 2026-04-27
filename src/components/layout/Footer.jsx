"use client";

import { useState } from "react";
import Link from "next/link";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [openSection, setOpenSection] = useState(null);

  const handleSubscribe = (e) => {
    e.preventDefault();
    console.log("Subscribed:", email);
    setEmail("");
  };

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <footer className="w-full mt-20 text-white bg-gradient-to-br from-gray-950 via-gray-900 to-black border-t border-white/10">

      <div className="max-w-6xl mx-auto px-4 py-12">

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div>
            <h2 className="text-xl font-bold">
              Shop<span className="text-green-400">X</span>
            </h2>
            <p className="text-sm text-gray-400 mt-3">
              Modern e-commerce built for performance and scalability.
            </p>
          </div>

          {/* Accordion Section - Links */}
          <div>
            <button
              onClick={() => toggleSection("links")}
              className="md:cursor-default w-full text-left font-semibold mb-3"
            >
              Quick Links
            </button>

            <div className={`flex flex-col gap-2 text-sm text-gray-400 md:flex ${openSection === "links" ? "block" : "hidden md:block"}`}>
              <Link href="/" className="hover:text-white">Home</Link>
              <Link href="/products" className="hover:text-white">Products</Link>
              <Link href="/about" className="hover:text-white">About</Link>
              <Link href="/contact" className="hover:text-white">Contact</Link>
            </div>
          </div>

          {/* Accordion Section - Account */}
          <div>
            <button
              onClick={() => toggleSection("account")}
              className="md:cursor-default w-full text-left font-semibold mb-3"
            >
              Account
            </button>

            <div className={`flex flex-col gap-2 text-sm text-gray-400 md:flex ${openSection === "account" ? "block" : "hidden md:block"}`}>
              <Link href="/login" className="hover:text-white">Login</Link>
              <Link href="/register" className="hover:text-white">Register</Link>
              <Link href="/dashboard" className="hover:text-white">Dashboard</Link>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-semibold mb-3">Newsletter</h3>
            <p className="text-sm text-gray-400 mb-3">
              Get updates on new products and offers.
            </p>

            <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
              <input
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="p-2 rounded-lg bg-black/30 border border-white/10 focus:border-green-400 outline-none text-sm"
                required
              />

              <button
                type="submit"
                className="bg-green-500 text-black font-medium py-2 rounded-lg hover:bg-green-400 transition"
              >
                Subscribe
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">

          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} ShopX. All rights reserved.
          </p>

          <div className="flex gap-4 text-sm text-gray-400">
            <a className="hover:text-white">GitHub</a>
            <a className="hover:text-white">LinkedIn</a>
            <a className="hover:text-white">Twitter</a>
          </div>

        </div>

      </div>
    </footer>
  );
}