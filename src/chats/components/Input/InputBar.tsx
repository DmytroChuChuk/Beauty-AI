import { Button, CircularProgress, Fab } from "@mui/material";
import { Box } from "@mui/system";
import {
  FC, useState
} from "react";
import CenterFlexBox from "../../../components/Box/CenterFlexBox";
import RefundHint from "../../../components/Typography/RefundHint";

import { useWindowSize } from "../../../hooks/useWindowSize";
import { mobileWidth } from "../../../dimensions/basicSize";
import FlexGap from "../../../components/Box/FlexGap";
import { useUser } from "../../../store";
import shallow from "zustand/shallow";
import UnlockChatDialog from "../../../components/Dialogs/Chat/UnlockChatDialog";
import { LockEnum, lockChat } from "../../../utility/CloudFunctionTrigger";
import GovDialog from "../../../components/Dialogs/Verification/GovDialog";
import { useTranslation } from "react-i18next";
  
interface props {
  senderUUID: string | undefined
  chatRoomId: string | undefined
  requestNewOrder: () => void
  myBlock: boolean
  disabled: boolean
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  onKeyUp?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
  inputValue?: string | number | readonly string[] | undefined
  sendMessage?: () => void
  onInput? : (e: any) => void
  unBlockClick? :  () => void
  onFocus? :  () => void
}
  
const InputBar: FC<props> = ({
  senderUUID,
  chatRoomId,
  requestNewOrder,
  myBlock,
  disabled : isDisable,
  onChange,
  onKeyUp,
  inputValue : value,
  sendMessage,
  onInput,
  unBlockClick,
  onFocus

}) => {


  const [ t ] = useTranslation()
  const [isLoading, setLoading] = useState<boolean>(false)
  const [openUnlockDialog, setOpenUnlockDialog] = useState<boolean>(false)
  const [openGovDialog, setGovDialog] = useState<boolean>(false)

  const [ myUUID, isAdmin, isVerified, rejectedReasonAfter ] = useUser((state) => [
    state.currentUser?.uid, 
    state.currentUser?.isAdmin, 
    state.currentUser?.verified,
    state?.currentUser?.rejectedReasonAfter
  ], shallow)
  const [size] = useWindowSize()

  const showUnlockButton = isAdmin && myUUID !== senderUUID

  if(myBlock) return <div 
    id='msger-inputarea-wrapper'
    className="msger-inputarea">
    <Box width='100%'  
    height={100}
    display='flex' 
    borderRadius={3}
    justifyContent='center' 
    alignItems='center'>

      <Button variant="text" color='secondary' onClick={unBlockClick}>Unblock</Button>

    </Box> 
  </div>

  const unlockOnClick = () => {

    if(!isVerified){
      setGovDialog(true)
      return
    }

    setOpenUnlockDialog(true)
  }

  const lockClick = async () => {

    if(!chatRoomId || isLoading) {
      return
    }
    setLoading(true)
    await lockChat(chatRoomId, LockEnum.LOCKED)
    setLoading(false)
  }

  return (
  <div>

    <div 
      id='msger-inputarea-wrapper'
      className="msger-inputarea" 
    >

      { !isDisable ? <>

        {
            showUnlockButton && <>
                <CenterFlexBox className="msg-send-button" >
                
                <Button
                  onClick={lockClick} 
                  variant="contained" 
                  color="error"
                  disabled={isLoading}
                  sx={{minWidth: 60, maxWidth: 600, minHeight: "32px",  maxHeight: "32px"}}>
                    {isLoading ? <CircularProgress color="secondary" size={12} /> : `${t("lock")}`}
                  </Button>
              </CenterFlexBox> 
            
              <FlexGap />
            </>
        }
        
        
        <textarea
        onInput={onInput}
        onFocus={() => {          
          if(size.width <= mobileWidth){
            onFocus?.()
          }
        }}
   
        rows={1}
        id="msger-input" 
        className="msger-input"
        disabled={isDisable}
        autoFocus={size.width > mobileWidth}
        onChange={isDisable ? undefined :  (e) => {
 
          onChange?.(e)
          onFocus?.()

        }}
        onKeyDown={onKeyUp}/>
      

        <Fab className="msg-send-button"  disabled={isDisable ? isDisable : !value} 
        
        onTouchEnd={(e) => {

          e.preventDefault()

          if(isDisable) return
          sendMessage?.()

        }} 

        onClick={isDisable ? undefined : sendMessage} 
        color='secondary'>
        
        <img className="msg-send-button-img" width={24} height={24} src="https://images.rentbabe.com/assets/chats/arrowup.svg" alt='' ></img>

        </Fab>
        </> :
        <CenterFlexBox paddingTop={1} flexDirection="column" width="100%">
        
        <CenterFlexBox width="100%">

          <Button fullWidth={!showUnlockButton} sx={{borderRadius: 999999, maxWidth: 600}} onClick={requestNewOrder}
          variant="contained" color="warning" >{t("request.button")}</Button>

          {
            showUnlockButton && <>
              <FlexGap/>
              <Button
                onClick={unlockOnClick} 
                variant="contained" 
                color="error" 
                sx={{borderRadius: 999999, maxWidth: 600}}> {t("unlock.chat")} </Button>
            </> 
          }

        </CenterFlexBox>

        <RefundHint/>

        </CenterFlexBox>

      }

    </div>

    {chatRoomId && <UnlockChatDialog
      open={openUnlockDialog}
      chatRoomId={chatRoomId}
      onClose={() => setOpenUnlockDialog(false)}
    />}

    {openGovDialog && <GovDialog 
      open={openGovDialog}
      onClose={() => setGovDialog(false)} 
      myUID={myUUID} 
      verified={isVerified} 
      rejectedReasonAfter={rejectedReasonAfter}
    />}

  </div>
  );
};
  
export default InputBar;