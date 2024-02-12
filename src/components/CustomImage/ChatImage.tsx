import { Badge } from "@mui/material";
import { FC } from "react";
import shallow from "zustand/shallow";
import { ChatIcon } from "../../icons/materialUiSvg";
import "../../scss/components/ChatImage.scss";
import { useConversationStore } from "../../store";
import CenterFlexBox from "../Box/CenterFlexBox";


interface props {
  className?: string;
  onClick?: () => void;
  width?: number;
}

const ChatImage: FC<props> = ({ className, onClick, width }) => {
  const [notification] = useConversationStore(
    (state) => [state.currentConversation?.notification ?? 0],
    shallow
  );

  return (
    <CenterFlexBox className={`chat-image ${className}`} onClick={onClick}>
   
      <Badge
        overlap="circular"
        color="secondary"
        className="badge"
        anchorOrigin={{
          horizontal: 'right',
          vertical: 'bottom'
        }}
        badgeContent={notification > 0 ? notification : null}
      >
        <ChatIcon />

      </Badge>
    </CenterFlexBox>
  );
};

export default ChatImage;
