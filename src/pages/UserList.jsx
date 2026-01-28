import { createClient } from "@supabase/supabase-js";
import { use, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function UserList() {
  let navigate = useNavigate();
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
    const { data: users } = await supabase
      .from("users")
      .select("*")
      .neq("username", userName);

    setUsers(users);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const timerId = setTimeout(async () => {
      const { data: users } = await supabase
        .from("users")
        .select("*")
        .neq("username", userName)
        .like("username", `%${search}%`);
      setUsers(users);
    }, 500);

    //Cleanup
    return () => {
      clearTimeout(timerId);
    };
  }, [search]);

  const normalizeUsers = (a, b) => {
    return {
      user_1: Math.min(a, b),
      user_2: Math.max(a, b),
    };
  };

  const goChat = async (user) => {
    const { data: userLogin } = await supabase
      .from("users")
      .select("*")
      .eq("username", userName)
      .single();
    const { user_1, user_2 } = normalizeUsers(userLogin.user_id, user.user_id);

    await supabase
      .from("chats")
      .upsert({ user_1, user_2 }, { onConflict: "user_1,user_2" })
      .select()
      .single()
      .then((val) => {
        navigate(`/chat/${val.data.chat_id}`);
      });
  };

  return (
    // <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
    //   <div className="w-full max-w-sm bg-zinc-800 rounded-xl p-4 shadow-lg">
    //     <div className="flex flex-row items-center">
    //       <Link to="/" className="text-white text-2xl me-1">
    //         <i class="bi bi-caret-left-fill"></i>
    //       </Link>
    //       <div>
    //         <h2 className="text-white text-xl font-semibold mb-1">
    //           Daftar User
    //         </h2>
    //         <p className="text-xs text-zinc-400 mb-2">
    //           Login sebagai: <span className="text-white">{userName}</span>
    //         </p>
    //       </div>
    //     </div>

    //     <div className="flex flex-row items-center bg-zinc-700 rounded-lg gap-4 pe-3 mb-4">
    //       <input
    //         value={search}
    //         onChange={(e) => {
    //           setSearch(e.target.value);
    //         }}
    //         placeholder="Cari User..."
    //         className="w-full bg-zinc-700 text-white px-3 py-2 rounded-lg"
    //       />
    //       <button>
    //         <i class="bi bi-search text-white text-xl -pt-2"></i>
    //       </button>
    //     </div>

    //     <div className="h-96 border border-zinc-500 rounded-lg p-3 overflow-y-auto no-scrollbar">
    //       {users.map((user) => (
    //         <div onClick={() => goChat(user)}>
    //           <div className="flex items-center gap-2 mb-2 p-2 bg-zinc-700 rounded-lg">
    //             <div className="bg-zinc-600 border-2 border-dashed rounded-xl w-16 h-16" />
    //             <div>
    //               <p className="font-medium text-white">{user.username}</p>
    //               <p className="text-xs text-zinc-300">{user.socket_id}</p>
    //             </div>
    //           </div>
    //         </div>
    //       ))}
    //     </div>

    //     {/* <div className="flex gap-2">
    //       <input
    //         value={message}
    //         onChange={(e) => setMessage(e.target.value)}
    //         placeholder="Ketik pesan..."
    //         className="flex-1 bg-zinc-700 text-white px-3 py-2 rounded-lg"
    //       />
    //       <button
    //         onClick={sendMessage}
    //         className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg"
    //       >
    //         Kirim
    //       </button>
    //     </div> */}
    //     {/* <button className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg ms-auto">
    //       Kirim
    //     </button> */}
    //   </div>
    // </div>

    <div className="min-h-screen flex items-center justify-center bg-neutral-950">
      <div
        className="w-[360px] h-[50vh] flex flex-col rounded-2xl
                   bg-neutral-800/90 backdrop-blur-xl
                   border border-white/10 shadow-2xl"
      >
        {/* HEADER */}
        <div className="flex items-center gap-3 px-3 py-3 border-b border-white/10">
          <button className="text-neutral-400 hover:text-white transition">
            ←
          </button>

          <div>
            <p className="text-white font-semibold text-sm">Daftar User</p>
            <p className="text-xs text-neutral-400">
              Login sebagai <span className="text-green-400">halo</span>
            </p>
          </div>
        </div>

        {/* SEARCH */}
        <div className="p-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Cari user..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
              }}
              className="w-full bg-neutral-700 rounded-xl pl-10 pr-3 py-2 text-sm
                         text-white placeholder-neutral-400
                         focus:outline-none focus:ring-2
                         focus:ring-green-500/40"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
              🔍
            </span>
          </div>
        </div>

        {/* USER LIST */}
        <div className="flex-1 overflow-y-auto px-3 space-y-2">
          {users.length === 0 && (
            <div className="text-center text-neutral-500 text-sm mt-20">
              User tidak ditemukan
            </div>
          )}

          {users.map((user) => (
            <div
              onClick={() => goChat(user)}
              key={user.id}
              className="flex items-center gap-3 px-3 py-2 rounded-xl
                         bg-neutral-700/40 hover:bg-neutral-700/70
                         transition cursor-pointer"
            >
              {/* Avatar */}
              <div
                className="h-10 w-10 rounded-full
                           bg-gradient-to-br from-green-400 to-emerald-600
                           flex items-center justify-center
                           text-black font-semibold"
              >
                {user.username?.charAt(0).toUpperCase()}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium truncate">
                  {user.username}
                </p>
                <p className="text-xs text-neutral-400 truncate">
                  {user.socket_id}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* footer */}
        <div className="mt-6 text-center text-xs text-neutral-500 border-t border-white/10 p-3">
          © 2026 Hush — Secure Chat
        </div>
      </div>
    </div>
  );
}
