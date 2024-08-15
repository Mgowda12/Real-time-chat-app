import "./addUser.css";
import { db } from "../../lib/firebase";
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { useState } from "react";
import useUserStore from "../../lib/userStore";
import { toast } from "react-toastify";

const AddUser = () => {
  const [user, setUser] = useState(null);

  const { currentUser } = useUserStore();

  const handleSearch = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get("username");

    try {
      const userRef = collection(db, "users");

      const q = query(userRef, where("username", "==", username));

      const querySnapShot = await getDocs(q);

      if (!querySnapShot.empty) {
        setUser(querySnapShot.docs[0].data());
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleAdd = async () => {
    const chatRef = collection(db, "chats");
    const userChatsRef = collection(db, "userchats");

    try {
      // Get the current user's chats
      const currentUserChatDocRef = doc(userChatsRef, currentUser.id);
      const currentUserChatSnap = await getDoc(currentUserChatDocRef);

      if (currentUserChatSnap.exists()) {
        const existingChats = currentUserChatSnap.data().chats;

        // Check if a chat with the selected user already exists
        const chatExists = existingChats.some(
          (chat) => chat.receiverId === user.id
        );

        if (chatExists) {
          toast.error("User is already in your chat list.");
          return;
        }
      }

      // If chat doesn't exist, create a new one
      const newChatRef = doc(chatRef);
      await setDoc(newChatRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });

      const updateUserChats = async (userId, otherUserId) => {
        const userChatDocRef = doc(userChatsRef, userId);
        const userChatSnap = await getDoc(userChatDocRef);

        const newChatData = {
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: otherUserId,
          updatedAt: Date.now(),
        };

        if (userChatSnap.exists()) {
          // Update existing document
          await updateDoc(userChatDocRef, {
            chats: arrayUnion(newChatData),
          });
        } else {
          // Create new document
          await setDoc(userChatDocRef, {
            chats: [newChatData],
          });
        }
      };

      // Update userchats for both the current user and the other user
      await updateUserChats(currentUser.id, user.id);
      await updateUserChats(user.id, currentUser.id);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="addUser">
      <form onSubmit={handleSearch}>
        <input type="text" placeholder="Username" name="username" />
        <button>Search</button>
      </form>
      {user && (
        <div className="user">
          <div className="detail">
            <img src={user.avatar || "./avatar.png"} alt="" />
            <span>{user.username}</span>
          </div>
          <button onClick={handleAdd}>Add User</button>
        </div>
      )}
    </div>
  );
};

export default AddUser;
