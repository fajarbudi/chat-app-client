import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { createClient } from "@supabase/supabase-js";
import { Link } from "react-router-dom";

// userId tetap (tidak berubah walau reload)
function getUserId() {
  let id = localStorage.getItem("userId");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("userId", id);
  }
  return id;
}

export default function App() {
  const socketRef = useRef(null);
  const userId = useRef(getUserId());

  const [userName, setUserName] = useState(
    localStorage.getItem("userName") || "",
  );
  const [loggedIn, setLoggedIn] = useState(!!userName);

  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
  );

  const [users, setUsers] = useState([]);
  const [chats, setChats] = useState([]);

  async function fetchData() {
    const { data: users } = await supabase
      .from("users")
      .select("*")
      .eq("username", userName)
      .single()
      .then(async (val) => {
        await supabase
          .from("chats")
          .select(
            `
    *,
    pengirim:users!pesan_pengirim_id_fkey (
      user_id,
      username
    ),
    penerima:users!pesan_penerima_id_fkey (
      user_id,
      username
    )
  `,
          )
          .or(
            `pengirim_id.eq.${val.data.user_id}, penerima_id.eq.${val.data.user_id}`,
          )
          .then((chats) => {
            console.log(chats);
            const coba = chats.data.filter((chat) => {
              return (
                chat?.pengirim?.username === userName ||
                chat?.penerima?.username === userName
              );
            });
            setChats(coba);
          });

        return val;
      });

    setUsers(users);
  }

  useEffect(() => {
    fetchData();
  }, []);

  // CONNECT + REGISTER (INI KUNCI)
  useEffect(() => {
    socketRef.current = io("http://localhost:3001");

    socketRef.current.on("connect", () => {
      if (userName) {
        socketRef.current.emit("register", {
          userId: userId.current,
          userName,
        });
      }
    });

    socketRef.current.on("receive_private_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    console.log(users);

    return () => socketRef.current.disconnect();
  }, [userName, users]);

  const login = async () => {
    if (!userName.trim()) return;
    localStorage.setItem("userName", userName);

    await supabase
      .from("users")
      .insert([{ username: userName, socket_id: userId.current }]);

    setLoggedIn(true);
  };

  // LOGIN SCREEN
  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <div className="bg-zinc-800 p-4 rounded-xl w-80">
          <h2 className="text-white text-lg mb-2">Login</h2>
          <input
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Username"
            className="w-full mb-2 bg-zinc-700 text-white px-3 py-2 rounded"
          />
          <button
            onClick={login}
            className="w-full bg-green-600 py-2 rounded text-white"
          >
            Masuk
          </button>
        </div>
      </div>
    );
  }

  // CHAT SCREEN
  return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
      <div className="w-full max-w-sm bg-zinc-800 rounded-xl p-4 shadow-lg">
        <h2 className="text-white text-xl font-semibold mb-1">
          💬 Private Chat
        </h2>

        <p className="text-xs text-zinc-400 mb-2">
          Login sebagai: <span className="text-white">{userName}</span>
        </p>
        {/* 
        <input
          value={targetUserName}
          onChange={(e) => setTargetUserName(e.target.value)}
          placeholder="Chat ke username..."
          className="w-full mb-3 bg-zinc-700 text-white px-3 py-2 rounded-lg"
        /> */}

        <div className="h-96 overflow-y-auto">
          {chats.map((chat) => (
            <Link to={`/chat/${chat.chat_id}`}>
              <div className="flex items-center gap-2 mb-2 p-2 bg-zinc-700 rounded-lg">
                <div className="bg-zinc-600 border-2 border-dashed rounded-xl w-16 h-16" />
                <div>
                  <p className="font-medium text-white">
                    {chat.pengirim?.username}
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
      </div>
    </div>
  );
}
