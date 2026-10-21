import { useState } from "react";

const API_BASE_URL = import.meta.env.PUBLIC_API_URL || "/api";

interface FormState {
  name: string;
  email: string;
  message: string;
}

export default function ContactForm() {
  const [form, setForm] = useState<FormState>({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || `Request failed (${res.status})`);
      }

      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="border-2 border-retro-cyan bg-retro-bg/60 rounded-lg px-8 py-10 text-center max-w-md mx-auto">
        <div className="text-retro-cyan text-4xl mb-4">✓</div>
        <p className="font-pixel text-retro-cyan text-lg mb-2">Message Sent!</p>
        <p className="text-text-secondary text-sm">Thanks for reaching out — I'll get back to you soon.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg mx-auto flex flex-col gap-5" noValidate>
      {/* Name */}
      <div className="flex flex-col gap-1">
        <label htmlFor="cf-name" className="font-mono text-sm text-text-secondary">
          Name
        </label>
        <input
          id="cf-name"
          name="name"
          type="text"
          required
          value={form.name}
          onChange={handleChange}
          placeholder="Your name"
          className="bg-transparent border border-slate-700 focus:border-retro-cyan outline-none px-4 py-3 font-mono text-text-primary placeholder-slate-600 transition-colors duration-200"
        />
      </div>

      {/* Email */}
      <div className="flex flex-col gap-1">
        <label htmlFor="cf-email" className="font-mono text-sm text-text-secondary">
          Email
        </label>
        <input
          id="cf-email"
          name="email"
          type="email"
          required
          value={form.email}
          onChange={handleChange}
          placeholder="you@example.com"
          className="bg-transparent border border-slate-700 focus:border-retro-cyan outline-none px-4 py-3 font-mono text-text-primary placeholder-slate-600 transition-colors duration-200"
        />
      </div>

      {/* Message */}
      <div className="flex flex-col gap-1">
        <label htmlFor="cf-message" className="font-mono text-sm text-text-secondary">
          Message
        </label>
        <textarea
          id="cf-message"
          name="message"
          required
          rows={5}
          value={form.message}
          onChange={handleChange}
          placeholder="What's on your mind?"
          className="bg-transparent border border-slate-700 focus:border-retro-cyan outline-none px-4 py-3 font-mono text-text-primary placeholder-slate-600 transition-colors duration-200 resize-none"
        />
      </div>

      {/* Inline error */}
      {error && (
        <p className="font-mono text-sm text-red-400">{error}</p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="group relative px-8 py-4 bg-transparent border-2 border-retro-cyan text-retro-cyan font-mono text-lg transition-all duration-300 hover:bg-retro-cyan hover:text-retro-bg hover:shadow-neon-cyan disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="relative z-10">
          {loading ? "Sending…" : "Send Message"}
        </span>
        <div className="absolute inset-0 bg-retro-cyan opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
      </button>
    </form>
  );
}
