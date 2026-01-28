import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { createClient } from "@supabase/supabase-js";
import { Link } from "react-router-dom";
import Login from "../component/Login";

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

  function normalizeUsers(a, b) {
    return {
      user_1: Math.min(a, b),
      user_2: Math.max(a, b),
    };
  }

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
    user_1:users!chats_user_1_fkey (
      user_id,
      username
    ),
    user_2:users!chats_user_2_fkey (
      user_id,
      username
    )
  `,
          )
          .or(`user_1.eq.${val.data.user_id}, user_2.eq.${val.data.user_id}`)
          .then((chats) => {
            const coba = chats.data.filter((chat) => {
              return (
                chat?.user_1?.username === userName ||
                chat?.user_2?.username === userName
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
  }, [loggedIn]);

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
      fetchData();
      // setMessages((prev) => [...prev, data]);
    });

    return () => socketRef.current.disconnect();
  }, [userName, users]);

  const login = async () => {
    if (!userName.trim()) return;
    localStorage.setItem("userName", userName);

    await supabase.from("users").upsert(
      {
        username: userName,
        socket_id: userId.current,
      },
      {
        onConflict: "username",
      },
    );

    setLoggedIn(true);
  };

  // LOGIN SCREEN
  if (!loggedIn) {
    return (
      <Login
        goLogin={login}
        handeleChange={(e) => setUserName(e.target.value)}
        userName={userName}
      />
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
        <button className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg">
          Kirim
        </button>
      </div>
    </div>
  );
}
