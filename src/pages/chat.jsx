import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { createClient } from "@supabase/supabase-js";
import { Link, useParams } from "react-router-dom";

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
  const { id } = useParams();
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

  const [targetUserName, setTargetUserName] = useState("");
  const [message, setMessage] = useState("");
  const [users, setUsers] = useState([]);
  const [pesans, setPesan] = useState([{}]);
  const [chats, setChats] = useState({});
  const [sender, setSender] = useState({});
  const [receiver, setReceiver] = useState({});

  const fetchMessage = async () => {
    await supabase
      .from("messages")
      .select(
        `*, 
        pengirim:users!messages_pengirim_id_fkey (
           user_id,
           username
        )`,
      )
      .eq("chat_id", id)
      .then((val) => {
        console.log(val);
        setPesan(val.data);
      });
  };

  async function fetchData() {
    const { data: users } = await supabase
      .from("users")
      .select("*")
      .eq("username", userName)
      .single();
    //     .then(async (val) => {
    //       const { data: pesan, error } = await supabase
    //         .from("pesan")
    //         .select(
    //           `
    //   *,
    //   pengirim:users!pesan_pengirim_id_fkey (
    //     user_id,
    //     username
    //   ),
    //   penerima:users!pesan_penerima_id_fkey (
    //     user_id,
    //     username
    //   )
    // `,
    //         )
    //         .or(
    //           `pengirim_id.eq.${val.data.user_id}, penerima_id.eq.${val.data.user_id}`,
    //         );

    //       setPesan(pesan);
    //       return val;
    //     });

    setUsers(users);
    await supabase
      .from("chats")
      .select(
        `
        *,

        data_user_1:users!chats_user_1_fkey (
          user_id,
          username
        ),
        data_user_2:users!chats_user_2_fkey (
          user_id,
          username
        )

        `,
      )
      .eq("chat_id", id)
      .single()
      .then((val) => {
        setChats(val.data);

        if (val.data.data_user_1.username === userName) {
          setSender(val.data.data_user_1);
          setReceiver(val.data.data_user_2);
        } else {
          setSender(val.data.data_user_2);
          setReceiver(val.data.data_user_1);
        }
      });
  }

  useEffect(() => {
    fetchData();
    fetchMessage();
  }, []);

  // CONNECT + REGISTER (INI KUNCI)
  useEffect(() => {
    socketRef.current = io("https://hush-chat-server.vercel.app:3001");

    socketRef.current.on("connect", () => {
      if (userName) {
        socketRef.current.emit("register", {
          userId: userId.current,
          userName,
        });
      }
    });

    socketRef.current.on("receive_private_message", (data) => {
      fetchMessage();
      console.log("menerima");
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

  // Warning!!!
  // Jangan diubah
  // Nanti error lagi
  // Saya sudah pusing ini

  const sendMessage = async () => {
    if (!message.trim()) return;

    await supabase
      .from("messages")
      .insert([
        {
          chat_id: chats.chat_id,
          pengirim_id: sender.user_id,
          message: message,
        },
      ])
      .then(() => {
        socketRef.current.emit("private_message", {
          toUserName: receiver.username,
          text: message,
        });

        fetchMessage();
      });

    await supabase
      .from("chats")
      .update({
        pesan_terakhir: message,
        updated_at: new Date().toISOString(),
      })
      .eq("chat_id", id)
      .select();

    setMessage("");
  };

  const bottomRef = useRef(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [pesans]);

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
        {/* <h2 className="text-white text-xl font-semibold mb-1">
          💬 Private Chat {id}
        </h2> */}

        <div className="flex mb-3 flex-row items-center">
          <Link to="/" className="text-white text-2xl me-1">
            <i class="bi bi-caret-left-fill"></i>
          </Link>
          <div className="bg-zinc-600 border-2 border-dashed border-zinc-300 rounded-lg w-14 h-14 flex flex-row justify-center items-center me-2">
            <p className="text-zinc-400 text-3xl">
              {receiver?.username?.charAt(0).toUpperCase()}
            </p>
          </div>
          <div>
            <h1 className="text-white text-xl">{receiver.username}</h1>
            <p className="text-sm text-white">Online</p>
          </div>
        </div>

        {/* <p className="text-xs text-zinc-400 mb-2">
          Login sebagai: <span className="text-white">{userName}</span>
        </p> */}

        {/* <h1 className="text-white text-xl text-center">{receiver.username}</h1> */}

        {/* <input
          value={targetUserName}
          onChange={(e) => setTargetUserName(e.target.value)}
          placeholder="Chat ke username..."
          className="w-full mb-3 bg-zinc-700 text-white px-3 py-2 rounded-lg"
        /> */}

        <div className="h-96 overflow-y-auto border border-zinc-500 rounded-lg p-3 flex flex-col gap-2 mb-3 bg-zinc-700 no-scrollbar">
          {pesans?.map((msg, i) => {
            const isMe = msg.pengirim?.username === userName;
            return (
              <div
                key={i}
                className={`max-w-[75%] px-3 py-2 rounded-lg text-sm text-white
                  ${
                    isMe
                      ? "self-end bg-green-600 rounded-br-none"
                      : "self-start bg-zinc-500 rounded-bl-none"
                  }
                `}
              >
                <span className="text-xs opacity-70">
                  {msg.pengirim?.username}
                </span>
                <br />
                {msg.message}
              </div>
            );
          })}
          {/* anchor di paling bawah */}
          <div ref={bottomRef} />
        </div>

        <div className="flex gap-2">
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
        </div>
      </div>
    </div>
  );
}
