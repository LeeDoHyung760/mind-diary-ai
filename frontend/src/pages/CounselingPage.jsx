import { useOutletContext } from "react-router-dom";
import ChatPanel from "../sections/ChatPanel";

function CounselingPage() {
  const { selectedChat, currentUser, theme, chatStatus, chatError, onSendMessage } =
    useOutletContext();

  return (
    <div className="h-full min-h-0">
      <ChatPanel
        selectedChat={selectedChat}
        currentUser={currentUser}
        theme={theme}
        chatStatus={chatStatus}
        chatError={chatError}
        onSendMessage={onSendMessage}
      />
    </div>
  );
}

export default CounselingPage;
