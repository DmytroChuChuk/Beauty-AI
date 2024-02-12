import { FC, useState } from "react";
import {
  collection,
  DocumentData,
  limitToLast,
  orderBy,
  query,
  QueryDocumentSnapshot,
  Timestamp,
  where,
} from "firebase/firestore";


import { useCollectionQuery } from "../../hooks/useCollectionQuery";
import { RBACType, useSelectedConversation, useSelectedUser, useUser } from "../../../store";
import { db } from "../../../store/firebase";
import {
  CONVERSATION, 
  MESSAGES, 
  //acceptCounterKey, 
  chat_room_id, 
  club, 
  content, 
  createdAt, 
  lastSeen, 
  mobileUrl, 
  order, 
  pay_link, 
  reject_reason, 
  sender, 
  state, 
  status, 
  type, 
  url, 
  verified
} from "../../../keys/firestorekeys";

import BubbleMessage from "../Message/BubbleMessage";
import { useWindowSize } from "../../../hooks/useWindowSize";
import { Box, CircularProgress } from "@mui/material";
import InputSection from "../Input/InputSection";
import { mobileWidth } from "../../../dimensions/basicSize";
import { MessageEnum, RBAC } from "../../../enum/MyEnum";
import UpdateBubble from "../Message/UpdateBubble";
import { ListChildComponentProps } from "react-window";
import VariableWindowList from "../../../components/List/VariableWindowList";

import PaymentBubble from "../Message/PaymentBubbble";
import WarningBubble from "../Message/WarningBubble";
import PaidBubble from "../Message/PaidBubble";
import RequestOrderBubble, { option } from "../Message/RequestOrderBubble";
import SendTipDialog from "../../../components/Dialogs/Rent/SendTipDialog";
import CashBackDialog from "../../../components/Dialogs/Hints/CashBackDialog";
import { ServiceDetails } from "../../../pages/ProfilePage";
import { CancelRejectProps, ClubProps } from "../../../keys/props/common";
import GovDialog from "../../../components/Dialogs/Verification/GovDialog";
import shallow from "zustand/shallow";
import CenterFlexBox from "../../../components/Box/CenterFlexBox";
import RejectCancelDialog from "../../../components/Dialogs/Rent/RejectCancelDialog";


interface ChatViewProps {
  myBlock: boolean
  otherBlock: boolean
  requestNewOrder: () => void
  onFocus: () => void
}
//   const chatRoomId = conversation?.id ?? chatRoomID 
// tipOnClick={() => setOpen(true)}
// openCashBackDialog={() => setCashBack(true)}
const Row  = (
  uid: string | null | undefined,
  chatRoomId: string | undefined, 
  userRBAC: RBACType,
  tipOnClick: () => void,
  requestNewOrder: () =>  void,
  openGovDialogHandler: () => void,
  openCashBackDialog: () => void,
  onRejectCancel: (data: CancelRejectProps) => void
  ) => (({index, style, data} : ListChildComponentProps<QueryDocumentSnapshot<DocumentData>[] | null | undefined>) => {
  
  const doc = data?.[index]

  if(!doc || !data) return null

  const _sender = (doc.get(sender) as string | undefined)
  const isMine = uid === _sender
  const msg = doc.get(content) as string
  const createAt = doc.get(createdAt) as Timestamp ??  Timestamp.now()

  const seen = (doc.get(lastSeen) as boolean) ?? false
  const _verified = doc.get(verified) as boolean | undefined
  const _url = doc.get(url) as string | undefined
  const _type = doc.get(type) as number 
  const _club = doc.get(club) as ClubProps 

  const _order = doc.get(order) as {[key: string] : any} | undefined
  const _babeUID = _order?.["babeUID"] as string | undefined
  const _babeProfileImage = _order?.["babeProfileImage"] as string | undefined
  const _clientProfileImage = _order?.["clientProfileImage"] as string | undefined

  const _profileImage = doc.get(mobileUrl) as string | undefined 
  const showProfileImage = userRBAC === RBAC.admin && window.location.href.getURLEnd().toLowerCase() === "chatview"


  if(!chatRoomId) return null

  else if(_type === MessageEnum.text) return <div style={{...style}} key = {index}>
      <BubbleMessage 
        sender={_sender}
        index={index} 
        url = {_profileImage}
        verified={_verified} 
        chatRoomID={chatRoomId} 
        messageId={doc.id} 
        seen={seen} 
        createdAt={createAt} 
        key={doc.id} 
        msg={msg} 
        isMine = {isMine} 
        showProfileImage = {showProfileImage}
      />
  </div>

  else if (_type === MessageEnum.payRequest) return  <div style={{...style}} key = {index}>
      <PaymentBubble 
        url={_url}
        index={index} 
        chatRoomID={chatRoomId} 
        messageId={doc.id} 
        seen={seen} 
        createdAt={createAt} 
        key={doc.id} 
        msg={msg} 
        isMine = {isMine} 
      />

  </div>

  else if (_type === MessageEnum.warning) return  <div style={{...style}} key = {index}>
    <WarningBubble 
      index={index} 
      msg={msg} 
    />

  </div>

  else if (_type === MessageEnum.paid) return <div style={{...style}} key = {index}>
  <PaidBubble 
    index={index} 
    data={doc} 
    tipOnClick={tipOnClick}
    openCashBackDialog={openCashBackDialog}
  />
  </div>

  else if (_type === MessageEnum.order) return <div style={{...style}} key={index}>
    <RequestOrderBubble 
      babeUID = {_babeUID}
      clientProfileImage={_clientProfileImage}
      babeProfileImage={_babeProfileImage}
      sender={_sender}
      showProfileImage = {showProfileImage}
      club = {_club}
      order={doc.get(order) as any}
      status={doc.get(status) as number ?? option.pending}
      rejectedReason={doc.get(reject_reason) as string | undefined}
      index={index} 
      chatRoomID={chatRoomId} 
      messageId={doc.id} 
      seen={seen} 
      createdAt={createAt} 
      key={doc.id} 
      msg={msg} 
      isMine={isMine} 
      requestNewOrder={requestNewOrder}
      openGovDialog={openGovDialogHandler}
      link={doc.get(pay_link) as string | undefined}
      serviceDetails={doc.get("order")["serviceDetails"] as ServiceDetails | undefined}
      onRejectCancel={onRejectCancel}
    />
  </div>

  else return <div style={style} key = {index}>

    <UpdateBubble 
      type={_type} 
      index={index}  
      isMine = {isMine}   
    />
  
  </div>
 
})

const ChatView: FC<ChatViewProps> = ({
  myBlock,
  otherBlock,
  requestNewOrder,
  onFocus
}) => {

  const clubName = sessionStorage.getItem(club)
  const clubState = sessionStorage.getItem(state)
  const headerSize = clubName && clubState ? 44 : 0

  const textAreaHeight = 42
  const textAreaWrapperHeight = 80

  const [ size ] = useWindowSize()

  const currentUser = useSelectedUser((state) => state.currentUser)

  const chatRoomID = window.location.href.getQueryStringValue(chat_room_id)

  const conversation = useSelectedConversation((state) => state.selectedConversation?.data)

  const [ uid, isVerified, rejectedReasonAfter, userRBAC] = useUser((state) => 
  [
    state.currentUser?.uid, 
    state.currentUser?.verified,
    state.currentUser?.rejectedReasonAfter,
    state.currentUser?.userRBAC

  ], shallow)

  const [ limitCount, setLimitCount ] = useState<number>(calculateChats())
  const [ heightIncrease, setHeightIncrease ] = useState<number>(0)

  const [openRejectCancelDialog, setRejectCancelDialog] = useState< CancelRejectProps | null >(null)
  const [open, setOpen] = useState<boolean>(false)
  const [openCashBack, setCashBack] = useState<boolean>(false)
  const [openGovDialog, setGovDialog] = useState<boolean>(false)

  const { loading, error, data, hasNextPage } = useCollectionQuery(
    `${conversation?.id}-chatview`,
    uid && conversation?.info && conversation?.info[uid]?.delo ? query(
      collection(db, CONVERSATION, conversation.id, MESSAGES),
      where(createdAt , ">", new Timestamp(conversation.info?.[uid].delo?.seconds! , conversation.info?.[uid].delo?.nanoseconds!) ),
      orderBy(createdAt),
      limitToLast(limitCount)
    ) 
    
    : 

    query(
      collection(db, CONVERSATION, `${conversation?.id ?? chatRoomID}`, MESSAGES),
      orderBy(createdAt),
      limitToLast(limitCount)
    ),
    limitCount,
    true
  )

  const tipOnClick = () => {
    setOpen(true)
  }

  const openCashBackDialog = () => {
    setCashBack(true)
  }

  const onCancelRejectHandler = (data: CancelRejectProps) => {
    setRejectCancelDialog(data)
  }

  const openGovDialogHandler = () => {
    setGovDialog(true)
  }

  function calculateChats(){
    const calculation =  (size.height - 144 - 116 - 56) / 38
    const numOfChats = Math.floor(calculation) + 2
    // const count =  numOfChats < 12 ? 12 : numOfChats

    return numOfChats // count + 2
  }
  
  const auto_grow = (value : any) => {

    const element = (value.target)

    element.style.height = "auto";
    // WARNING: Must set height to auto first to get scroll height
    const scrollHeight = element.scrollHeight > 150 ? 150 : element.scrollHeight
    element.style.height = `${scrollHeight}px`

    const increaseBy = scrollHeight - textAreaHeight

    const wrapper = document.getElementById('msger-inputarea-wrapper') as HTMLDivElement

    if(wrapper && scrollHeight > textAreaHeight) wrapper.style.height = `${textAreaWrapperHeight + increaseBy }px`
    else if(wrapper) wrapper.style.height = `${textAreaWrapperHeight}px`

    if(scrollHeight > textAreaHeight) setHeightIncrease(increaseBy)
    else setHeightIncrease(0)

  }

  const sendMessage = () => {

    const textarea = document.getElementById('msger-input') as HTMLAreaElement
    if(textarea) textarea.style.height = `${textAreaHeight}px`

    const wrapper = document.getElementById('msger-inputarea-wrapper') as HTMLDivElement
    if(wrapper) wrapper.style.height = `${textAreaWrapperHeight}px`

    setHeightIncrease(0)
  }

  function loadNextPage() {
    if(hasNextPage){
      setLimitCount((prev) => {
        return prev +  10 // calculateChats()  //10
      })
    }
  }

  if (loading || data?.length as number === 0)
  return (
    <CenterFlexBox style={{height: '100vh'}}>
      <CircularProgress color="secondary"/>
    </CenterFlexBox>
  );

  else if (error)
    return (
      <div style={{height: '100vh'}}>
        <p>Something went wrong</p>
      </div>
    )

  else return <>

    <Box position="relative" bgcolor="white" className="chat-background">

    <VariableWindowList 
        style={{transform: 'scaleY(-1)'}}
        height={
          size.width > mobileWidth ? size.height - 80 - 50 - 90 - heightIncrease - headerSize : 
          size.height - 48 - 24 - 80 - heightIncrease - headerSize
        }
        width={'100%'}
        hasNextPage={hasNextPage}
        data={data}
        overScan={4}
        loadNextPage={loadNextPage}
        component={Row(
          uid,
          conversation?.id ?? chatRoomID,
          userRBAC,
          tipOnClick,
          requestNewOrder,
          openGovDialogHandler,
          openCashBackDialog,
          onCancelRejectHandler
        )}
        scrollReversed
    /> 

    <InputSection
      myBlock={myBlock}
      otherBlock={otherBlock}
      sendMessageCallBack={sendMessage}
      onInput={auto_grow}
      conversation={conversation!} 
      requestNewOrder={requestNewOrder} 
      isDisabled={conversation?.hasOrder ? false : true}
      onFocus={onFocus}
    />

  </Box>

  {(currentUser?.nickname && currentUser?.uid) && <SendTipDialog
        chatRoomId={conversation!.id}
        open={open}    
        onClose={() => setOpen(false)}  
    />}

  <RejectCancelDialog 
    data={openRejectCancelDialog}
    open={!!openRejectCancelDialog}
    onClose={() => setRejectCancelDialog(null)}
  />

    <CashBackDialog 
      open={openCashBack}
      onClose={() => setCashBack(false)}
    />

    { openGovDialog && <GovDialog 
      open={openGovDialog}
      onClose={() => setGovDialog(false)} 
      myUID={uid} 
      verified={isVerified} 
      rejectedReasonAfter={rejectedReasonAfter}
    /> }
  </>
  
};

export default  ChatView;
