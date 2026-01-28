import { Link } from "react-router-dom";

export default function ChatItem({ username, message, data }) {
  return (
    <Link
      to={`/chat/${data.chat_id}`}
      className="flex items-center gap-3 rounded-xl bg-neutral-700/40
                 hover:bg-neutral-700/70 transition px-3 py-2 cursor-pointer"
    >
      {/* Avatar */}
      <div
        className="h-10 w-10 rounded-full bg-gradient-to-br
                   from-green-400 to-emerald-600
                   flex items-center justify-center
                   text-black font-semibold"
      >
        {username[0].toUpperCase()}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white font-medium truncate">{username}</p>
        <p className="text-xs text-neutral-400 truncate">{message}</p>
      </div>
    </Link>
  );
}
