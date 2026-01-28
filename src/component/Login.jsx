export default function Login({
  userName = "",
  handeleChange = () => {},
  goLogin = () => {},
}) {
  return (
    // <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
    //   <div className="bg-zinc-800 p-4 rounded-xl w-80">
    //     <h2 className="text-white text-lg mb-2">Login</h2>
    //     <input
    //       value={userName}
    //       onChange={handeleChange}
    //       placeholder="Username"
    //       className="w-full mb-2 bg-zinc-700 text-white px-3 py-2 rounded"
    //     />
    //     <button
    //       onClick={goLogin}
    //       className="w-full bg-green-600 py-2 rounded text-white"
    //     >
    //       Masuk
    //     </button>
    //   </div>
    // </div>
    <div className="relative min-h-screen bg-neutral-950 overflow-hidden">
      {/* background glow */}
      <div className="absolute inset-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-green-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl" />
      </div>

      {/* content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-8">
          {/* header */}
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 h-12 w-12 rounded-xl bg-white flex items-center justify-center">
              <img src="/images/icon.png" alt="" width={"100%"} />
            </div>
            <h1 className="text-2xl font-semibold text-white">Hush</h1>
            <p className="text-sm text-neutral-400">Login untuk mulai chat</p>
          </div>

          {/* form */}
          <form className="space-y-5">
            <div>
              <label className="block mb-1 text-sm text-neutral-300">
                Username
              </label>
              <input
                value={userName}
                onChange={handeleChange}
                type="text"
                placeholder="masukkan username"
                className="w-full rounded-xl bg-neutral-900/70 border border-white/10 px-4 py-3 text-white
                           placeholder-neutral-500 focus:outline-none focus:ring-2
                           focus:ring-green-500/60 transition"
              />
            </div>

            <button
              onClick={goLogin}
              type="button"
              className="w-full rounded-xl bg-gradient-to-r from-green-500 to-emerald-600
                         py-3 font-medium text-black hover:brightness-110
                         active:scale-[0.98] transition"
            >
              Masuk
            </button>
          </form>

          {/* footer */}
          <div className="mt-6 text-center text-xs text-neutral-500">
            © 2026 Hush — Secure Chat
          </div>
        </div>
      </div>
    </div>
  );
}
