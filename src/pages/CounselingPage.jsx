import { useOutletContext } from "react-router-dom";
import ChatPanel from "../sections/ChatPanel";
import CompanionPanel from "../sections/CompanionPanel";

function CounselingPage() {
  const { selectedChat, currentUser, theme } = useOutletContext();

  return (
    <div className="grid h-full min-h-0 gap-4 xl:grid-cols-[2fr_1fr]">
      <ChatPanel selectedChat={selectedChat} currentUser={currentUser} theme={theme} />
      <CompanionPanel currentUser={currentUser} theme={theme} />
    </div>
  );
}

export default CounselingPage;
