import { Link } from 'react-router-dom';

function Home() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white">
            {/* Top navigation */}
            <header>
                <nav className="container mx-auto px-6 py-6 flex justify-between items-center" aria-label="Primary">
                    <Link to="/" className="flex items-center gap-2.5 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900">
                        <span className="grid place-items-center w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl font-bold text-xl shadow-lg shadow-orange-900/30">
                            P
                        </span>
                        <span className="text-2xl font-bold tracking-tight">PayPulse</span>
                    </Link>
                    <div className="flex items-center gap-2 sm:gap-3">
                        <Link
                            to="/signin"
                            className="px-4 sm:px-5 py-2 text-sm font-medium text-gray-300 hover:text-white rounded-lg transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                        >
                            Sign in
                        </Link>
                        {/* Quiet nav CTA — the hero CTA owns the single pulse on this fold */}
                        <Link
                            to="/signup"
                            className="px-4 sm:px-5 py-2 text-sm font-semibold rounded-lg border border-slate-600 text-white bg-slate-800/60 hover:border-orange-500/60 hover:bg-slate-800 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                        >
                            Get started
                        </Link>
                    </div>
                </nav>
            </header>

            <main>
                {/* Hero */}
                <section className="relative overflow-hidden">
                    {/* Static ambient glow — no animation, low distraction */}
                    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
                        <div className="absolute -top-24 -left-24 w-[28rem] h-[28rem] rounded-full bg-orange-600/20 blur-[120px]" />
                        <div className="absolute top-32 right-0 w-[30rem] h-[30rem] rounded-full bg-red-600/10 blur-[130px]" />
                    </div>

                    <div className="relative container mx-auto px-6 pt-12 pb-20 lg:pt-20 lg:pb-28">
                        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                            {/* Copy */}
                            <div className="max-w-xl">
                                <h1 className="pp-reveal text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight text-balance">
                                    Send money{' '}
                                    <span className="text-orange-500">instantly.</span>
                                </h1>
                                <p className="pp-reveal text-lg sm:text-xl text-gray-300 leading-relaxed mt-6 text-pretty" style={{ animationDelay: '90ms' }}>
                                    Fast, secure transfers in a tap. PayPulse keeps your money
                                    moving and your balance always in view.
                                </p>
                                <div className="pp-reveal flex flex-col sm:flex-row gap-3 sm:gap-4 mt-9" style={{ animationDelay: '180ms' }}>
                                    {/* The single pulse: the one primary action on this fold */}
                                    <Link
                                        to="/signup"
                                        className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-base font-semibold text-white bg-gradient-to-r from-orange-500 to-red-600 shadow-lg shadow-orange-900/30 hover:shadow-xl hover:shadow-orange-700/40 motion-safe:hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                                    >
                                        Create your account
                                        <svg className="w-4 h-4 motion-safe:transition-transform motion-safe:duration-200 motion-safe:group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </Link>
                                    <Link
                                        to="/signin"
                                        className="inline-flex items-center justify-center px-7 py-3.5 rounded-xl text-base font-semibold text-gray-200 bg-slate-800/60 border border-slate-700 hover:border-slate-500 hover:text-white transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                                    >
                                        Sign in
                                    </Link>
                                </div>
                                <p className="pp-reveal text-sm text-gray-400 mt-6" style={{ animationDelay: '240ms' }}>
                                    Free to join · No transfer fees between PayPulse accounts
                                </p>
                            </div>

                            {/* Product preview — a real PayPulse screen, our own money-state vocabulary */}
                            <div className="pp-reveal lg:justify-self-end w-full max-w-md mx-auto lg:mx-0" style={{ animationDelay: '160ms' }}>
                                <AppPreview />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Value props — differentiated bento, not a uniform card grid */}
                <section className="container mx-auto px-6 py-16 lg:py-24" aria-labelledby="features-heading">
                    <div className="max-w-2xl">
                        <h2 id="features-heading" className="text-3xl sm:text-4xl font-bold tracking-tight text-balance">
                            Built for moving money, not waiting on it.
                        </h2>
                        <p className="text-lg text-gray-300 mt-4 text-pretty">
                            Everything you need to send, receive, and keep track — without the friction of a bank.
                        </p>
                    </div>

                    <div className="grid gap-4 sm:gap-5 mt-12 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        {/* Lead tile — wide, with a live-feeling status detail */}
                        <article className="sm:col-span-2 group relative flex flex-col justify-between gap-8 rounded-2xl border border-slate-700 bg-slate-800/40 p-7 sm:p-8 hover:border-orange-500/50 transition-colors duration-300">
                            <div>
                                <FeatureIcon>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </FeatureIcon>
                                <h3 className="text-2xl font-bold mt-5">Instant transfers</h3>
                                <p className="text-gray-300 leading-relaxed mt-2 max-w-md">
                                    Money lands the moment you hit send. No clearing windows,
                                    no three-day pending limbo — just done.
                                </p>
                            </div>
                            <div className="inline-flex items-center gap-2.5 self-start rounded-full border border-slate-700 bg-slate-900/60 px-3.5 py-1.5 text-sm">
                                <span className="grid place-items-center w-5 h-5 rounded-full bg-green-500/20 text-green-400">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                </span>
                                <span className="text-gray-300">Sent to Neha · <span className="text-white font-medium">0.8s</span></span>
                            </div>
                        </article>

                        {/* Security tile — compact */}
                        <article className="group rounded-2xl border border-slate-700 bg-slate-800/40 p-7 hover:border-orange-500/50 transition-colors duration-300">
                            <FeatureIcon>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </FeatureIcon>
                            <h3 className="text-xl font-bold mt-5">Bank-level security</h3>
                            <p className="text-gray-300 leading-relaxed mt-2">
                                Encrypted end to end, with bot protection on every sign-in.
                            </p>
                        </article>

                        {/* Balance-in-view tile — compact */}
                        <article className="group rounded-2xl border border-slate-700 bg-slate-800/40 p-7 hover:border-orange-500/50 transition-colors duration-300">
                            <FeatureIcon>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l9-3 9 3v6c0 5-3.8 8-9 9-5.2-1-9-4-9-9V6z" />
                            </FeatureIcon>
                            <h3 className="text-xl font-bold mt-5">Always in view</h3>
                            <p className="text-gray-300 leading-relaxed mt-2">
                                Your balance and every transaction, one glance from anywhere.
                            </p>
                        </article>

                        {/* People tile — wide, with a search detail (mirrors the lead) */}
                        <article className="sm:col-span-2 group relative flex flex-col justify-between gap-8 rounded-2xl border border-slate-700 bg-slate-800/40 p-7 sm:p-8 hover:border-orange-500/50 transition-colors duration-300">
                            <div>
                                <FeatureIcon>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 10-4-4 4 4 0 004 4zm6 0a3 3 0 10-2.5-4.5" />
                                </FeatureIcon>
                                <h3 className="text-2xl font-bold mt-5">Find anyone, fast</h3>
                                <p className="text-gray-300 leading-relaxed mt-2 max-w-md">
                                    Search the directory by name and send in seconds — no account
                                    numbers, IFSC codes, or copy-paste.
                                </p>
                            </div>
                            <div className="flex items-center gap-2.5 self-start rounded-lg border border-slate-700 bg-slate-900/60 px-3.5 py-2 text-sm text-gray-400 w-full max-w-xs">
                                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.3-4.3m1.3-5.4a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                Search people…
                            </div>
                        </article>
                    </div>
                </section>

                {/* Closing CTA */}
                <section className="container mx-auto px-6 pb-24">
                    <div className="relative overflow-hidden rounded-3xl border border-slate-700 bg-slate-800/40 px-8 py-16 sm:px-16 sm:py-20 text-center">
                        <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 left-1/2 -translate-x-1/2 w-[36rem] h-[24rem] rounded-full bg-orange-600/15 blur-[120px]" />
                        <div className="relative max-w-xl mx-auto">
                            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-balance">
                                Ready when you are.
                            </h2>
                            <p className="text-lg text-gray-300 mt-4 text-pretty">
                                Set up an account in under a minute and send your first transfer today.
                            </p>
                            <Link
                                to="/signup"
                                className="inline-flex items-center justify-center gap-2 mt-8 px-8 py-4 rounded-xl text-base font-semibold text-white bg-gradient-to-r from-orange-500 to-red-600 shadow-lg shadow-orange-900/30 hover:shadow-xl hover:shadow-orange-700/40 motion-safe:hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                            >
                                Create your free account
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="border-t border-slate-800">
                <div className="container mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                        <span className="grid place-items-center w-6 h-6 bg-gradient-to-br from-orange-500 to-red-600 rounded-md font-bold text-xs">P</span>
                        <span className="font-semibold text-gray-300">PayPulse</span>
                    </div>
                    <p>&copy; 2026 PayPulse. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}

/* Consistent feature icon chip — single style across the value props */
function FeatureIcon({ children }) {
    return (
        <span className="grid place-items-center w-12 h-12 rounded-xl bg-slate-900/70 border border-slate-700 text-orange-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                {children}
            </svg>
        </span>
    );
}

/* A believable PayPulse app screen — shows the real product, on-brand,
   using the money-state vocabulary (green = received, red = sent). */
function AppPreview() {
    return (
        <div
            className="rounded-2xl border border-slate-700 bg-slate-800/70 backdrop-blur-sm shadow-2xl shadow-black/40 overflow-hidden"
            role="img"
            aria-label="Preview of the PayPulse app: a balance of ₹24,500 above a list of recent received and sent transfers."
        >
            {/* App bar */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/80">
                <div className="flex items-center gap-2.5">
                    <span className="grid place-items-center w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg font-bold text-sm">P</span>
                    <span className="text-sm text-gray-300">Hello, <span className="text-white font-semibold">Aisha</span></span>
                </div>
                <span className="grid place-items-center w-8 h-8 rounded-full bg-slate-700 text-sm font-bold text-white" aria-hidden="true">A</span>
            </div>

            {/* Balance region — the focal figure, solid (the CTA owns the pulse) */}
            <div className="px-5 pt-5 pb-4">
                <p className="text-sm text-gray-400">Your balance</p>
                <p className="text-3xl font-bold tracking-tight mt-1">₹ 24,500</p>
            </div>

            {/* Recent activity */}
            <div className="px-5 pb-5">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-2.5">Recent activity</p>
                <ul className="space-y-2">
                    <PreviewTxn direction="received" name="Rahul Verma" time="2 hours ago" amount="+₹1,200" />
                    <PreviewTxn direction="sent" name="Neha Kapoor" time="Yesterday" amount="-₹450" />
                </ul>
            </div>
        </div>
    );
}

function PreviewTxn({ direction, name, time, amount }) {
    const received = direction === 'received';
    return (
        <li className="flex items-center gap-3 rounded-xl bg-slate-900/50 border border-slate-700/40 px-3.5 py-3">
            <span
                className={`grid place-items-center w-9 h-9 rounded-full shrink-0 ${
                    received ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}
                aria-hidden="true"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    {received ? (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 11l5-5m0 0l5 5m-5-5v12" />
                    ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                    )}
                </svg>
            </span>
            <div className="min-w-0 flex-1">
                <p className="text-sm text-white font-medium truncate">
                    {received ? 'Received from' : 'Sent to'} {name}
                </p>
                <p className="text-xs text-gray-400">{time}</p>
            </div>
            <span className={`text-sm font-bold shrink-0 ${received ? 'text-green-400' : 'text-red-400'}`}>
                {amount}
            </span>
        </li>
    );
}

export default Home;
