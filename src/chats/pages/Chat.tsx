// Official Website: [https://fireverse.pages.dev](https://fireverse.pages.dev)
import { FC, useEffect, useState } from "react";
import { ConversationInfo, user } from "../shared/types";

import { 
  doc, 
  collection, 
  DocumentData, 
  getDoc, 
  QuerySnapshot, 
  serverTimestamp, 
  Timestamp, 
  writeBatch
} from "firebase/firestore";

import history from '../../utility/history';
 
import { useConversationStore, useSelectedConversation, useUser } from "../../store";
import { db } from "../../store/firebase";

import { Box, Divider } from "@mui/material";

import {  CONVERSATION, nickname as nicknameKey, recipientLastSeen,
 senderLastSeen, url, users, uid as uidKey, mobileUrl,
  lastSeen, chat_room_id, sender, info, updatedAt, CREDIT, balance } from "../../keys/firestorekeys";

import '../styles/Chat.scss'
import { Helper } from "../../utility/Helper";
import {  useWindowSize } from "../../hooks/useWindowSize";
import SideBarItem from "../components/SideBar/SideBarItem";

import ChatBox from "./ChatBox";
import LoadingScreen from "../../components/Loaders/LoadingScreen";
import { mobileWidth } from "../../dimensions/basicSize";
import shallow from "zustand/shallow";
import Conversation from "../../utility/Conversation";
import { notify } from "../../keys/localStorageKeys";

import HeaderTab from "../components/Chat/Tabs/HeaderTab";
import TabPanel from "../components/Chat/Tabs/TabPanel";
import { useTheme } from '@mui/material/styles';
import SwipeableViews from "react-swipeable-views";
import ArchiveItem from "../components/SideBar/ArchiveItem";
import { ListChildComponentProps } from "react-window";
import WindowList from "../../components/List/WindowList";
import SkeletonItem from "../components/SideBar/SkeletonItem";
import TelegramAlert from "../../components/Notifications/TelegramAlert";
import { useDocumentQuery } from "../../hooks/useDocumentQuery";
import { conversationType } from "../../pages/ExploreContainer";
import FlexBox from "../../components/Box/FlexBox";
import LoginPage from "../../pages/LoginPage";

interface props {
  data: QuerySnapshot<DocumentData> | null
  dataArchive: QuerySnapshot<DocumentData> | null
  hidden : boolean
  loadingChat: boolean
  errorChat: boolean
  loadingArchive: boolean
  hasNextPage: boolean
  hasNextPage2: boolean
  loadNextPage: (type: conversationType) => void
}

const Chat: FC<props> = ({
  data, 
  dataArchive, 
  loadingChat: loading, 
  loadingArchive, 
  hidden : hide, 
  errorChat: error,
  hasNextPage,
  hasNextPage2,
  loadNextPage
}) => {
  
  const theme = useTheme()
  const isChatBox = window.location.pathname.split('/').filter(Boolean).pop()?.toLowerCase() === "chatbox"
  const [size , windowRef] = useWindowSize()

  const setCurrentUser = useUser((state) => state.setCurrentUser)
  const [
    uid, 
    nickname, 
    isPremium, 
    isAdmin, 
    profileImage
  ] = useUser((state) => 
  [
    state.currentUser?.uid, 
    state.currentUser?.nickname, 
    state.currentUser?.isPremium, 
    state.currentUser?.isAdmin, 
    state.currentUser?.profileImage
  ] , shallow)

  const { data: creditBalance } = useDocumentQuery(`${uid}-balance`, doc(db, CREDIT, uid ?? "empty"))

  useEffect(() => {
    const balanceValue = (creditBalance?.get(balance) as number) ?? 0

    if(balanceValue) localStorage.setItem(balance, `${balanceValue}`)
    else localStorage.removeItem(balance)

    setCurrentUser({balance: balanceValue})
    
 // eslint-disable-next-line
  }, [creditBalance])


  const [hidden, setHidden] = useState<boolean>(hide)
  const [value, setValue] = useState(0)

  // setNextPage(false)

  useEffect(() => {

    const path = helper.getURLEnd().toLowerCase()

    if(path !== "profile" && path !== "chatbox"){
      setSelectedConversation({data: undefined})
    }

  }, [])  // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {

    if(!hide) {
      setUpConversation()
    }else{
      if(size.width > mobileWidth){
        setSelectedConversation({data: undefined})
      }
       // setSelectedConversation(undefined)
    }
    
    setHidden(hide)
  }, [hide]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {

    if(dataArchive?.size as number === 0){
      setValue(0)
    }

  }, [dataArchive])

  useEffect(() => {

    let notification = 0

    if(!data) return

    for (let index = 0; index < data.docs.length; index++) {
      const _doc = data.docs[index];

      const isSender = (_doc.get(sender) as string) === uid
      const isUpdatedAt = _doc.get(updatedAt) as Timestamp
      const _users = _doc.get(info) as user | undefined

      if(!uid) continue

      let myLastSeen =  _users?.[uid]?.[lastSeen] ?? _doc.get(isSender ? senderLastSeen : recipientLastSeen) as Timestamp

      if(_doc.id === selectedConversation?.id){

        const map = convoHelper.convertDocToConvo(_doc)
        setSelectedConversation({data: map})
        
        continue
      } 
      
      if(!myLastSeen || myLastSeen < isUpdatedAt){
        notification += 1
      }
    }
    

    localStorage.setItem(notify, `${notification}`)
    setConversation({data: data, notification: notification})

    // setData(data)

  }, [data]) // eslint-disable-line react-hooks/exhaustive-deps


  const setConversation = useConversationStore((state) => state.setConversation)

  const setSelectedConversation = useSelectedConversation((state) => state.setSelectedConversation)
  const selectedConversation = useSelectedConversation((state) => state.selectedConversation?.data)

 // const [selectedConversation, setSelectedConversation] = useState<ConversationInfo | undefined>()

  const [openChatView, setChatView] = useState<boolean>(size.width > mobileWidth)

  const helper = new Helper()
  const convoHelper = new Conversation()

  useEffect(() => {

    if(loading || loadingArchive) {
      return
    }
    setChatView(size.width > mobileWidth)

  }, [size]) // eslint-disable-line react-hooks/exhaustive-deps


  async function setUpConversation(){

    // please login
    if( !uid) {
      history.push("/Login")
      return
    }

    const _chat_room_id = helper.getQueryStringValue(chat_room_id)
    if(_chat_room_id){
      let chatRoom = data?.docs?.find(e => e.id === _chat_room_id)

      if(!chatRoom){
        const snap = await getDoc(doc(db, CONVERSATION, _chat_room_id))
        if(snap.exists()){
          chatRoom = snap
        }
      }

      if (chatRoom && windowRef.current.width > mobileWidth) {
        const map = convoHelper.convertDocToConvo(chatRoom)
        if(map){
          setSelectedConversation({data: map})
          openChat(map)
        }
      }
      return
    }

    const _recipientUid = helper.getQueryStringValue(uidKey)
    const _recipientProfileURL = helper.getQueryStringValue(url)
    const _recipientNickname = helper.getQueryStringValue(nicknameKey)

    if(!_recipientUid || !_recipientProfileURL || !_recipientNickname) {
      return
    }

    let isExisted = false

    // check if the conversation is aleady in the side bar panel
    const chatRoom = data?.docs?.find(e => (e.get(users) as string[])?.includes(_recipientUid))

    if (chatRoom) {
      const map = convoHelper.convertDocToConvo(chatRoom)
      setSelectedConversation({data: map})
      isExisted = true
    }
    
    if(isExisted) return

    const id = doc(collection(db, CONVERSATION)).id;

    const map : ConversationInfo = {
      id: id,
      sender: uid, 
      users:  [_recipientUid , uid],
      updatedAt: serverTimestamp(), 
      lastMessage: undefined,
      hasOrder: false,
      orderTime: undefined,
      order: undefined,
      info: {
        [uid]: {
          [nicknameKey]: nickname,
          [mobileUrl]: profileImage,
          [lastSeen]: undefined
        },
        [_recipientUid]: {
          [nicknameKey]: _recipientNickname,
          [mobileUrl]: _recipientProfileURL,
          [lastSeen]: undefined
        }
      },
      senderProfileURL: profileImage, 
      recipientNickname: _recipientNickname,
      senderLastSeen: undefined, 
      recipientLastSeen: undefined,
      senderNickname: nickname ?? "",
      recipientProfileURL: _recipientProfileURL,
      block: []
    }
  
    openChat(map)
  }

  useEffect(() => {

    if(loading || error) return

    setUpConversation()

  }, [loading]) // eslint-disable-line react-hooks/exhaustive-deps

  function setLastSeen(_doc: any){
    const conversation = convoHelper.convertDocToConvo(_doc)

    const isMine = uid === _doc.get(sender) as string

    const key = `${info}.${uid}.${lastSeen}`

    const now = Timestamp.now() // serverTimestamp()

    let batch = writeBatch(db)

    if(conversation?.id){
      const nowRef = doc(db, CONVERSATION, conversation.id)

      batch.update(nowRef, 
      {[ isMine ? senderLastSeen : recipientLastSeen ] : now,
        [key] : now
      })
    }

    if(selectedConversation?.id){
      const prevRef = doc(db, CONVERSATION, selectedConversation.id)
      batch.update(prevRef, 
        {[ isMine ? senderLastSeen : recipientLastSeen ] : now,
          [key] : now
        })
    }

    batch.commit()

  }


  const onClickConversation = (_doc: any) => {

    if(selectedConversation?.id === _doc.id) return

    const conversation = convoHelper.convertDocToConvo(_doc)
    if(!conversation) return

    setLastSeen(_doc)
    openChat(conversation)

  }

  function openChat(conversation : ConversationInfo) {
    if(windowRef.current.width <= mobileWidth){
      setSelectedConversation({data: conversation})
      // push chat box
      history.push(`./chatbox?${chat_room_id}=${conversation.id}`, conversation)
    }else{
      setSelectedConversation({data: conversation})
    }
  }

  const handleChangeIndex = (index: number) => {
    setValue(index);
  }

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  }

  function calculateSideBarWidth(){
    return  (size.width > mobileWidth  ? "350px" : "100vw")
  }

  const Row = ({index, style} : ListChildComponentProps) => {

    const doc = data?.docs[index]

    if(!doc) return <SkeletonItem style={style} index={index}/>

    return <div key={index} style={style}>

      <SideBarItem 
        uid={uid!} 
        otherUid={ convoHelper.getRecipientUID(uid, convoHelper.convertDocToConvo(doc) ) } 
        isSelected={selectedConversation?.id === doc.id} 
        doc={doc} 
        index={index}
        onClick={() => onClickConversation(doc)}
      />

    </div>
  }


  const RowDeletedChats  = ({index, style} : ListChildComponentProps) => {

    const doc = dataArchive?.docs[index]

    if (!doc) return <SkeletonItem style={style} index={index}/>

    return <div style={style} key={index}>
      <ArchiveItem 
        uid={uid!} 
        otherUid={ convoHelper.getRecipientUID(uid, convoHelper.convertDocToConvo(doc) ) } 
        isSelected={selectedConversation?.id === doc.id} 
        doc={doc} 
        index={index}
      />
    </div>
  }

  if(!uid) return <LoginPage dontRedirect />

  else return <div hidden={hidden} style={{position: "fixed", width: "100%", zIndex: -1}}>

      { loading || loadingArchive  ? <LoadingScreen/> : 

      <FlexBox 
        className={!(openChatView && selectedConversation && data?.size as number === 0 ) ? 
        "chat-box-background-image" : "chat-box-background-image"}  
      >

      <Box 
        position="relative" 
        className={`${!isPremium && !isAdmin && !openChatView && data?.size as number === 0 ? 'chat-box-background-image' : 'white-background'}`}>


        <TelegramAlert fullWidth={!openChatView}/>

        {
          dataArchive?.size as number !== 0 && <HeaderTab 
            value={value} 
            onChange={handleChange} 
            sx={{minWidth: calculateSideBarWidth(), width: calculateSideBarWidth()}}/>
        
        }

        <SwipeableViews
          axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
          index={value}
          onChangeIndex={handleChangeIndex}
          disabled={dataArchive?.size as number === 0}
        >

        <TabPanel value={value} index={0} dir={theme.direction}>

        {!(data?.size as number) && <div className="no-conversation">

        <div>

            <img
              src="https://images.rentbabe.com/assets/webp/notification.webp"
              alt=''
            />
            
            <p>You have no conversation yet.</p>

        </div>


        </div>}

   
        {!hidden && <WindowList 
            height={size.height - 56 - (dataArchive?.docs.length as number > 0 ? 48 : 0)}
            width={calculateSideBarWidth()}
            hasNextPage={hasNextPage}
            dataSize={data?.size as number}
            loadNextPage={() => loadNextPage(conversationType.normal)}
            component={Row}
            itemSize={73}
        />}
      
        </TabPanel>
        
       <TabPanel value={value} index={1} dir={theme.direction}>

       {
        !hidden && <WindowList 
            height={size.height - 56 - (dataArchive?.docs.length as number > 0 ? 48 : 0)}
            width={calculateSideBarWidth()}
            hasNextPage={hasNextPage2}
            dataSize={loading ? 0 : dataArchive?.size as number}
            loadNextPage={() => loadNextPage(conversationType.deleted)}
            component={RowDeletedChats}
            itemSize={73}
          />
        }

        </TabPanel>

        </SwipeableViews>
      </Box>

      {
        !isChatBox && <>
          <Divider orientation="vertical" flexItem />
          {(openChatView && selectedConversation) && <ChatBox loading={loading}/>}
        </>
      }
  
      </FlexBox> }

    </div>
};

export default Chat;