import React, { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";

interface MessageData {
  author: string;
  message: string;
  time: string;
}

const socket: Socket = io("http://localhost:4000");

function App() {
  const [username, setUsername] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [messageList, setMessageList] = useState<MessageData[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [typingUser, setTypingUser] = useState<string>("");

  const sendMessage = () => {
    if (message !== "" && username !== "") {
      const messageData: MessageData = {
        author: username,
        message: message,
        time:
          new Date(Date.now()).getHours() +
          ":" +
          new Date(Date.now()).getMinutes(),
      };

      socket.emit("send_message", messageData);
      setMessageList((list) => [...list, messageData]);
      setMessage("");
    }
  };

  const handleTyping = () => {
    socket.emit("typing", username);
  };

  useEffect(() => {
    socket.on("display_typing", (user: string) => {
      setTypingUser(user);
      setIsTyping(true);
    });

    socket.on("hide_typing", () => {
      setIsTyping(false);
    });

    // ทำความสะอาดเมื่อ component ถูก unmount
    return () => {
      socket.off('receive_message');
      socket.off("display_typing");
      socket.off("hide_typing");
    };
  }, []);

  return (
    <div className="App">
      <h1>ระบบแชทด้วย TypeScript</h1>
      <div>
        <input
          type="text"
          placeholder="ชื่อผู้ใช้..."
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="text"
          value={message}
          placeholder="พิมพ์ข้อความ..."
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleTyping}
          onKeyUp={() => socket.emit("stop_typing")}
          onKeyPress={(e) => {
            e.key === "Enter" && sendMessage();
          }}
        />
        <button onClick={sendMessage}>ส่ง</button>
      </div>

      {/* ส่วนที่แสดงสถานะผู้ใช้กำลังพิมพ์ */}
      {isTyping && <p>{typingUser} กำลังพิมพ์...</p>}

      <div>
        {messageList.map((msg, index) => (
          <div key={index}>
            <h4>
              {msg.author}: {msg.message}
            </h4>
            <p>{msg.time}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
