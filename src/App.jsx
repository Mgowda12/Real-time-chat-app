import List from "./components/list/List";
import Detail from "./components/detail/Detail";
import Chat from "./components/chat/Chat";
import Login from "./components/Login/Login";
import Notification from "./components/notification/Notification";
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./lib/firebase";
import useUserStore from "./lib/userStore";
import { useChatStore } from "./lib/chatStore";
const App = () => {
  // const user = false;

  const { currentUser, isLoading, fetchUserInfo } = useUserStore();
  const { chatId } = useChatStore();
  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (user) => {
      fetchUserInfo(user?.uid);
      // console.log(user);
    });
    return () => {
      unSub();
    };
  }, [fetchUserInfo]);

  console.log("current user", currentUser);

  // if (isLoading) return <div className="loading">Loading...</div>;

  return (
    <div className="container">
      {currentUser ? (
        <>
          <List></List>
          {chatId && <Chat></Chat>}
          {chatId && <Detail></Detail>}
        </>
      ) : (
        <Login></Login>
      )}
      <Notification></Notification>
    </div>
  );
};

export default App;
