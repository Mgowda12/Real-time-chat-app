import "./List.css";
import UserInfo from "./UserInfo/UserInfo";
import ChatList from "./ChatList/ChatList";
const List = () => {
  return (
    <div className="list">
      <UserInfo></UserInfo>
      <ChatList></ChatList>
    </div>
  );
};

export default List;
