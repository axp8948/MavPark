import React, { useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "motion/react";
import { Send, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";

const FORMSPREE_ENDPOINT = "https://formspree.io/f/mkovnqpp";

function BackgroundFX() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#07101F_0%,#0B1A2E_55%,#07101F_100%)]" />
      <div className="absolute -top-32 -right-32 h-[560px] w-[560px] rounded-full bg-[color:var(--uta-blue-glow)]/20 blur-[120px] animate-orb" />
      <div className="absolute -bottom-40 -left-40 h-[560px] w-[560px] rounded-full bg-[color:var(--uta-orange)]/15 blur-[120px] animate-orb delay-2" />
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.22) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.22) 1px, transparent 1px)
          `,
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse at center, black 55%, transparent 90%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 55%, transparent 90%)",
        }}
      />
    </div>
  );
}

function Contact() {
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();

    setStatus(null);
    setSubmitting(true);

    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ name, email, message }),
      });

      if (res.ok) {
        setStatus("success");
        form.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClasses =
    "w-full rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/40 px-4 py-3 backdrop-blur transition focus:outline-none focus:border-[color:var(--uta-orange)]/60 focus:ring-2 focus:ring-[color:var(--uta-orange)]/40 hover:border-white/20";

  return (
    <div className="relative isolate min-h-screen bg-[#07101F] text-white">
      <BackgroundFX />

      <div className="relative z-10">
        <section className="px-4 pt-20 pb-16 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-xl text-center"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-[color:var(--uta-orange-soft)]">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              Get in touch
            </span>
            <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">
              Contact Us
            </h1>
            <p className="mx-auto mt-3 max-w-md text-sm text-white/60 sm:text-base">
              Questions, feedback, or ideas? Drop us a note and we&apos;ll get
              back to you.
            </p>
          </motion.div>

          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="mx-auto mt-10 max-w-xl space-y-5 rounded-2xl border border-white/10 bg-[#0B1A2E]/70 p-6 backdrop-blur shadow-[0_20px_60px_-25px_rgba(0,0,0,0.9)] sm:p-8"
          >
            <div>
              <label
                htmlFor="contact-name"
                className="mb-1.5 block text-sm font-medium text-white/80"
              >
                Name
              </label>
              <input
                id="contact-name"
                type="text"
                name="name"
                autoComplete="name"
                placeholder="Your name"
                className={inputClasses}
              />
            </div>

            <div>
              <label
                htmlFor="contact-email"
                className="mb-1.5 block text-sm font-medium text-white/80"
              >
                Email
              </label>
              <input
                id="contact-email"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="you@example.com"
                className={inputClasses}
              />
            </div>

            <div>
              <label
                htmlFor="contact-message"
                className="mb-1.5 block text-sm font-medium text-white/80"
              >
                Message
              </label>
              <textarea
                id="contact-message"
                name="message"
                rows={5}
                placeholder="What's on your mind?"
                className={`${inputClasses} resize-y`}
              />
            </div>

            <div className="pt-1">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[color:var(--uta-orange)] px-6 py-3 text-sm font-semibold text-[#1a0a00] transition hover:bg-[color:var(--uta-orange-glow)] focus:outline-none focus:ring-2 focus:ring-[color:var(--uta-orange)] focus:ring-offset-2 focus:ring-offset-[#07101F] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-[color:var(--uta-orange)] sm:w-auto glow-orange"
              >
                <Send className="h-4 w-4" aria-hidden />
                {submitting ? "Sending…" : "Send Message"}
              </button>

              {status === "success" && (
                <p
                  className="mt-4 inline-flex items-center gap-2 text-sm text-emerald-300"
                  role="status"
                >
                  <CheckCircle2 className="h-4 w-4" aria-hidden />
                  Message sent. We&apos;ll get back to you soon.
                </p>
              )}
              {status === "error" && (
                <p
                  className="mt-4 inline-flex items-center gap-2 text-sm text-red-300"
                  role="alert"
                >
                  <AlertCircle className="h-4 w-4" aria-hidden />
                  Something went wrong. Please try again.
                </p>
              )}
            </div>
          </motion.form>
        </section>
      </div>
    </div>
  );
}

export default Contact;
