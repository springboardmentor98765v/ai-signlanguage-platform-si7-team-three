import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post(
        "http://localhost:8000/auth/forgot-password",
        { email }
      );

      setMessage(res.data.message);
    } catch (err) {
      setMessage(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Something went wrong."
      );
    }

    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900">
      <div className="glass-strong w-full max-w-md rounded-[2rem] p-8 text-white">
        <h1 className="mb-6 text-2xl font-bold text-white">Forgot Password</h1>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter your email"
            className="glass-input mb-4 w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button
            className="btn-primary w-full"
            disabled={loading}
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-green-400">{message}</p>
        )}

        <div className="mt-5 text-center">
          <Link to="/login" className="text-signal-teal hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}