export default function Login({
  userName = "",
  handeleChange = () => {},
  goLogin = () => {},
}) {
  return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
      <div className="bg-zinc-800 p-4 rounded-xl w-80">
        <h2 className="text-white text-lg mb-2">Login</h2>
        <input
          value={userName}
          onChange={handeleChange}
          placeholder="Username"
          className="w-full mb-2 bg-zinc-700 text-white px-3 py-2 rounded"
        />
        <button
          onClick={goLogin}
          className="w-full bg-green-600 py-2 rounded text-white"
        >
          Masuk
        </button>
      </div>
    </div>
  );
}
