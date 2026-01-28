import { createClient } from "@supabase/supabase-js";
import { use, useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function UserList() {
  const [userName, setUserName] = useState(
    localStorage.getItem("userName") || "",
  );
  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
  );
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    const { data: users } = await supabase.from("users").select("*");

    setUsers(users);
  };

  useEffect(() => {
    fetchData();
  }, []);
  return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
      <div className="w-full max-w-sm bg-zinc-800 rounded-xl p-4 shadow-lg">
        <h2 className="text-white text-xl font-semibold mb-1">
          💬 Private Chat
        </h2>

        <p className="text-xs text-zinc-400 mb-2">
          Login sebagai: <span className="text-white">{userName}</span>
        </p>

        <div className="flex flex-row items-center bg-zinc-700 rounded-lg gap-4 pe-3 mb-3">
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
            }}
            placeholder="Cari User..."
            className="w-full bg-zinc-700 text-white px-3 py-2 rounded-lg"
          />
          <button>
            <i class="bi bi-search text-white text-xl -pt-2"></i>
          </button>
        </div>

        <div className="h-96 border border-zinc-500 rounded-lg p-3 overflow-y-auto no-scrollbar">
          {users.map((chat) => (
            <Link to={`/chat/${chat.chat_id}`}>
              <div className="flex items-center gap-2 mb-2 p-2 bg-zinc-700 rounded-lg">
                <div className="bg-zinc-600 border-2 border-dashed rounded-xl w-16 h-16" />
                <div>
                  <p className="font-medium text-white">
                    {chat.user_1?.username == userName
                      ? chat.user_2?.username
                      : chat.user_1?.username}
                  </p>
                  <p className="text-xs text-zinc-300">{chat.pesan_terakhir}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* <div className="flex gap-2">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ketik pesan..."
            className="flex-1 bg-zinc-700 text-white px-3 py-2 rounded-lg"
          />
          <button
            onClick={sendMessage}
            className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg"
          >
            Kirim
          </button>
        </div> */}
        {/* <button className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg ms-auto">
          Kirim
        </button> */}
      </div>
    </div>
  );
}
