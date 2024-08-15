import { useEffect, useRef, useState } from "react";
import "./Chat.css";
import EmojiPicker from "emoji-picker-react";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import upload from "../../lib/upload";
import { db } from "../../lib/firebase";
import { useChatStore } from "../../lib/chatStore";
import { arrayUnion } from "firebase/firestore";
import useUserStore from "../../lib/userStore";
// import { Timestamp } from "firebase/firestore";

const Chat = () => {
  const [open, setOpen] = useState(false);
  const [chat, setChat] = useState();
  const [text, setText] = useState("");
  const [img, setImg] = useState({
    file: null,
    url: null,
  });

  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } =
    useChatStore();
  const { currentUser } = useUserStore();
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behaviour: "Smooth" });
  });

  // useEffect(() => {
  //   const unSub = onSnapshot(
  //     doc(db, "chats", "PqO5fBTzmCTlrvB8JBRq"),
  //     (res) => {
  //       setChat(res.data());
  //     }
  //   );
  //   return () => {
  //     unSub();
  //   };
  // }, []);
  console.log(db);
  useEffect(() => {
    try {
      const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
        setChat(res.data());
      });
      return () => {
        unSub();
      };
    } catch (error) {
      console.error("Error fetching chat data:", error);
    }
  }, [chatId]);

  console.log(chat);

  const handleEmojiClick = (e) => {
    setText((prev) => prev + e.emoji);
    setOpen(false);
  };

  const handleImg = (e) => {
    if (e.target.files[0]) {
      setImg({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const handleSend = async () => {
    if (text == "") return;

    let imgUrl = null;

    try {
      if (img.file) {
        imgUrl = await upload(img.file);
      }

      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          senderId: currentUser.id,
          text: text.toString(), // Ensure text is a string
          createdAt: Date.now(),
          ...(imgUrl && { img: imgUrl }),
        }),
      });

      const userIDs = [currentUser.id, user.id];
      userIDs.forEach(async (id) => {
        const userChatRef = doc(db, "userchats", id);
        const userChatsSnapshot = await getDoc(userChatRef);
        if (userChatsSnapshot.exists()) {
          const userChatdata = userChatsSnapshot.data();
          const chatIndex = userChatdata.chats.findIndex(
            (c) => c.chatId === chatId
          );
          userChatdata.chats[chatIndex].isSeen =
            id === currentUser.id ? true : false;
          userChatdata.chats[chatIndex].lastMessage = text;
          userChatdata.chats[chatIndex].updatedAt = Date.now();

          await updateDoc(userChatRef, {
            chats: userChatdata.chats,
          });
        }
      });
    } catch (err) {
      console.log(err);
    }
    setImg({
      file: null,
      url: null,
    });
    setText("");
  };

  return (
    <div className="chat">
      <div className="top">
        <div className="user">
          <img src={user?.avatar || "./avatar.png"} alt="" />
          <div className="texts">
            <span>{user?.username}</span>
            <p>Last seen at 3:15 pm today.</p>
          </div>
        </div>
        <div className="icons">
          <img src="./phone.png" alt="" />
          <img src="./video.png" alt="" />
          <img src="./info.png" alt="" />
        </div>
      </div>
      <div className="center">
        {chat?.messages?.map((message) => (
          <div
            className={
              message.senderId === currentUser?.id ? "message own" : "message"
            }
            key={message?.createAt}
          >
            <div className="texts">
              {message.img && <img src={message.img} alt="" />}
              <p>{message.text}</p>
              {/* <span>1 min ago</span> */}
            </div>
          </div>
        ))}

        {img.url && (
          <div className="message own">
            <div className="texts">
              <img src={img.url} alt="" />
            </div>
          </div>
        )}

        <div ref={endRef}></div>
      </div>
      <div className="bottom">
        <div className="icons">
          <label htmlFor="file">
            <img src="./img.png" alt="" />
          </label>

          <input
            type="file"
            id="file"
            style={{ display: "none" }}
            onChange={handleImg}
          />
          <img src="./camera.png" alt="" />
          <img src="./mic.png" alt="" />
        </div>
        <input
          type="text"
          placeholder={
            isCurrentUserBlocked || isReceiverBlocked
              ? "You can not send message"
              : "Type a message"
          }
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
        />
        <div className="emoji">
          <img
            src="./emoji.png"
            alt=""
            onClick={() => {
              setOpen((prev) => !prev);
            }}
          />
          <div className="picker">
            <EmojiPicker
              open={open}
              onEmojiClick={handleEmojiClick}
            ></EmojiPicker>
          </div>
        </div>
        <button
          className="sendButton"
          onClick={handleSend}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
