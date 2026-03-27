import React, { useState } from "react";

const FORMSPREE_ENDPOINT = "https://formspree.io/f/mkovnqpp";

function Contact() {
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null); // null | 'success' | 'error'

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

  return (
    <div className="min-h-[60vh] bg-white dark:bg-slate-950">
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <header className="text-center mb-12">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 border-b-2 border-blue-500 pb-2 inline-block">
            Contact Us
          </h1>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            MavPark • UT Arlington CSE Senior Design 2026
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="contact-name"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Name
            </label>
            <input
              id="contact-name"
              type="text"
              name="name"
              autoComplete="name"
              placeholder="Your name"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:focus:ring-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="contact-email"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Email
            </label>
            <input
              id="contact-email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:focus:ring-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="contact-message"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Message
            </label>
            <textarea
              id="contact-message"
              name="message"
              rows={4}
              placeholder="Your message..."
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 px-4 py-3 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:focus:ring-blue-500"
            />
          </div>
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto min-w-[140px] rounded-lg bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-medium py-3 px-5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950 transition-colors disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-blue-600 dark:disabled:hover:bg-blue-600"
            >
              <svg
                className="w-4 h-4"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
              {submitting ? "Sending…" : "Send Message"}
            </button>
            {status === "success" && (
              <p
                className="mt-3 text-sm text-green-600 dark:text-green-400"
                role="status"
              >
                Message sent. We’ll get back to you soon.
              </p>
            )}
            {status === "error" && (
              <p
                className="mt-3 text-sm text-red-600 dark:text-red-400"
                role="alert"
              >
                Something went wrong. Please try again.
              </p>
            )}
          </div>
        </form>

        <div className="mt-14 pt-10 border-t border-slate-200 dark:border-slate-700 text-center text-sm text-slate-600 dark:text-slate-400 space-y-1">
          <p className="font-medium text-slate-700 dark:text-slate-300">
            CSE Department
          </p>
          <p>Mail: Box 19015, Arlington, TX 76019</p>
          <p>Phone: 817-272-3785</p>
        </div>
      </div>
    </div>
  );
}

export default Contact;
