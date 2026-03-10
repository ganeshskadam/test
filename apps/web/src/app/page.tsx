import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700 px-4 text-white">
      <div className="max-w-3xl text-center">
        <h1 className="mb-4 text-5xl font-extrabold tracking-tight">
          FlowQueue
        </h1>
        <p className="mb-8 text-xl text-blue-100">
          Submit your project. Get it reviewed. Watch it come to life.
        </p>

        <div className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { icon: '📋', title: 'Submit Projects', desc: 'Fill out a simple form and submit your project for review.' },
            { icon: '⚡', title: 'Admin Review', desc: 'Our team reviews and approves every project personally.' },
            { icon: '🚀', title: 'Queue & Deliver', desc: 'Approved projects enter the queue and get delivered on time.' },
          ].map((f) => (
            <div key={f.title} className="rounded-xl bg-white/10 p-6 backdrop-blur">
              <div className="mb-2 text-3xl">{f.icon}</div>
              <h3 className="mb-1 font-bold">{f.title}</h3>
              <p className="text-sm text-blue-100">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/register"
            className="rounded-lg bg-white px-8 py-3 font-semibold text-blue-700 shadow transition hover:bg-blue-50"
          >
            Get Started Free
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-white/50 px-8 py-3 font-semibold text-white transition hover:bg-white/10"
          >
            Sign In
          </Link>
        </div>

        <p className="mt-8 text-sm text-blue-200">
          💰 3 free projects for every new client · No credit card required
        </p>
      </div>
    </main>
  );
}
