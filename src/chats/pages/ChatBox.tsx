import { Alert, Modal, Typography } from '@mui/material';
import { Box } from '@mui/system';

import { 
  doc, 
  getDoc, 
  Timestamp, 
  updateDoc
} from 'firebase/firestore';

import { 
  CONVERSATION, 
  info, 
  lastSeen, 
  mobileUrl,
  nickname,
  privacy_time_stamp, 
  recipientLastSeen, 
  senderLastSeen, 
  tele_id, time_stamp 

} from '../../keys/firestorekeys';

import { FC, Suspense, useEffect, useState } from 'react';

import ProfilePage from '../../pages/ProfilePage';
import { useSelectedConversation, useSelectedUser, useUser } from '../../store';
import { db } from '../../store/firebase';
import Conversation from '../../utility/Conversation';
import { Helper } from '../../utility/Helper';
import history from '../../utility/history';
import ChatHeader from '../components/Chat/ChatHeader';
import ChatView from '../components/Chat/ChatView';
import LoadingScreen from '../../components/Loaders/LoadingScreen';
import BasicCard from './BasicCard';
import { widthToOpenModal } from "../../dimensions/basicSize";
import { mobileWidth } from '../../dimensions/basicSize';
import { useGetUserData } from '../../hooks/useGetUserData';
import { useWindowSize } from '../../hooks/useWindowSize';

import CenterFlexBox from '../../components/Box/CenterFlexBox';
import shallow from 'zustand/shallow';
import LoginPage from '../../pages/LoginPage';
import { useTranslation } from 'react-i18next';
// import CenterFlexBox from '../../components/Box/CenterFlexBox';
// import { translate } from '../../keys/localStorageKeys';

interface props {
    loading?: boolean
}

const ChatBox : FC<props> = ({loading}) => {

    const maxWidth = 1000
    const [ t ] = useTranslation()
    const isChatBox = window.location.href.getQueryStringValue("cri") ? true : false
    const conversationHelper = new Conversation()
    const helper = new Helper()


    const [ uid ] = useUser((state) => [state.currentUser?.uid], shallow)   

    const setCurrentSelecteduser = useSelectedUser((state) => state.setCurrentUser)
    const currentUser = useUser((state) => state.currentUser)

    // const [selectedConversation, setSelectedConversation] = useState<ConversationInfo | undefined>(sc)
    const setSelectedConversation = useSelectedConversation((state) => state.setSelectedConversation)
    const selectedConversation = useSelectedConversation((state) => state.selectedConversation?.data)
    const users = Object.keys(selectedConversation?.info ?? {})

    const chatUUID = selectedConversation?.id ??  window.location.href.getQueryStringValue("cri")

    const [size, windowRef] = useWindowSize()
    const _otherUid =  conversationHelper.getRecipientUID(currentUser?.uid, selectedConversation)
    const [otherUid, setOtherUid] = useState<string | undefined>(_otherUid) 

    const [online, setOnline] = useState<Timestamp | undefined>(undefined)


    const { loading: isUserDataLoading, data } = useGetUserData(otherUid)
    const [ showProfile, setShowProfile ] = useState<boolean>(false)
    const [ openAlert, setAlert ] = useState<boolean>(true)

    useEffect(() => {

      if(!selectedConversation && chatUUID){
        getDoc(doc(db, CONVERSATION, chatUUID)).then((snapshot) => {
          const convoHelper = new Conversation()
          const map = convoHelper.convertDocToConvo(snapshot)
          setSelectedConversation({data: map})
        })
      }

      setAlert(true)
      // eslint-disable-next-line 
    }, [selectedConversation, chatUUID])


    useEffect(() => {
      const value = conversationHelper.getRecipientUID(currentUser?.uid, selectedConversation)
      setOtherUid(value)
      // eslint-disable-next-line
    }, [selectedConversation])

    useEffect(() => {
        return () => {

          const helper = new Helper()

          if(helper.getURLEnd().toLowerCase() === "chat"){
             setSelectedConversation({data: undefined})
          }

          //deselect
          const _doc = selectedConversation
          const _uid = currentUser?.uid 

          if(!_uid || !_doc) return

          const isMine = currentUser?.uid === _doc?.sender as string
      
          const key = `${info}.${_uid}.${lastSeen}`
      
          const now = Timestamp.now()
      
          updateDoc(doc(db, CONVERSATION, _doc.id), {
            [ isMine ? senderLastSeen : recipientLastSeen ] : now,
            [key] : now
          })

        }
        // eslint-disable-next-line 
    }, [])

  useEffect(() => {

      let cache = selectedConversation

      if(!data || !cache ) {
        return
      }

      const isCurrent= cache.users.includes(data.id)
      const item = helper.convertToItem(data)
      setCurrentSelecteduser(item)

      if(isCurrent){

        const otherUserUUID = data.id
        const _teleId = data.get(tele_id) as string
        const _url = data.get(mobileUrl) as string
        const _username = data.get(nickname) as string

     

        const otherUserImage = cache?.info?.[otherUserUUID].mbl
        const otherUsername = cache?.info?.[otherUserUUID].nick

        let map: {
          [key: string]: any
        } = {}

        if(_url && otherUserImage && otherUserImage !== _url){
          map[`${info}.${otherUid}.${mobileUrl}`] = _url
        }

        if(_username && otherUsername && otherUsername !== _username){
          map[`${info}.${otherUid}.${nickname}`] = _username
        }

        if(Object.keys(map).length > 0){
          updateDoc(doc(db, CONVERSATION, cache.id) , map)
        }

        const _timeStamp = data.get(time_stamp) as Timestamp ?? data.get(privacy_time_stamp) as Timestamp 
        if(_timeStamp) {
          setOnline(_timeStamp)
        }

        if(cache.info && otherUserUUID && Object.keys(cache.info).includes(otherUserUUID)){
          cache.info = {...cache.info, [otherUserUUID!]: {...cache.info?.[otherUserUUID!], ...{[mobileUrl]: _url}}}
          if(_teleId) {
            cache.info = {...cache.info, [otherUserUUID!]: {...cache.info?.[otherUserUUID!], ...{[tele_id]: _teleId}}}
          }
        }
        
        setSelectedConversation({data: cache})
      }

    }, [data, selectedConversation]) // eslint-disable-line react-hooks/exhaustive-deps


    const closeModal = () => {
      setShowProfile(false)
    }


    const profileClick = () => {
    
      if(windowRef.current.width < widthToOpenModal) {

        // data
        const _item = helper.convertToItem(data)
        history.push(`/page/Profile?uid=${data?.id}&private=false`, {..._item, extras: selectedConversation})
        // history.push(`/page/Profile?uid=${data?.id}`)

      }else{
        setShowProfile(true)
      }
    }

    const onCloseAlert = () => {
      setAlert(false)
    }

    if(!uid) return <LoginPage dontRedirect/>
    else if(!selectedConversation || !users.includes(uid)) return <LoadingScreen/>
    else return <>
    <CenterFlexBox 
      className='chat-background'
      bgcolor="white"
      width="100%" 
      height="100%"
      // onClick={onCloseAlert}
    >
      <Box

        bgcolor="white"
        maxWidth={isChatBox ? maxWidth : "auto"} 
        className={`${size.width <= mobileWidth ? "chatbox" : ""} chat-box-background ${loading || !selectedConversation ? 'center-it' : ""} 
        ${size.width <= mobileWidth ? "chat-box-background-image" : ""}`}
      >

          <ChatHeader 
            senderUUID={selectedConversation.sender}
            myBlock={selectedConversation.block?.includes(currentUser?.uid ?? "-") ?? false}
            chatRoomID={chatUUID}
            isUserDataLoading={isUserDataLoading}
            userData={data}
            openBackButton={size.width <= mobileWidth}
            online={online}
            profileClick={profileClick} 
            hasOrder={selectedConversation.hasOrder} 
          />

      {
        openAlert && 
          <Alert
          onClose={onCloseAlert}
          style={{
            position: "absolute", 
            zIndex: 99, 
            maxWidth: isChatBox ? maxWidth : "auto", 
            width: isChatBox ? "auto" : `${size.width - 350}px`}} 
          severity='warning'>
            <Typography 
              variant='caption' 
              color="inherit"
              dangerouslySetInnerHTML={{ __html: `${t("off-platform.warning")}`}}
            />
          </Alert>
      }

      <>

      {loading ? (
          <>
            <BasicCard />
          </>
          
        ) : 
          !selectedConversation ? (

            <BasicCard />

        ) : (
          
            <ChatView
                myBlock={selectedConversation.block?.includes(currentUser?.uid ?? "-")  ?? false }
                otherBlock={selectedConversation.block?.includes(otherUid ?? "-")  ?? false}
                requestNewOrder={profileClick}
                onFocus={() => setAlert(false)}    
                //isDisabled={selectedConversation.hasOrder ? false : currentUser?.isAdmin ? false : true }       
              />

        )}
      
      </>

    </Box>
   </CenterFlexBox>


   <Modal
    open={showProfile} 
    onClose={closeModal}>
      <div className="react-modal">
        <Suspense fallback={<LoadingScreen/>}>
          <ProfilePage 
            isPrivate={false} 
            fromModal={true} 
            data={helper.convertToItem(data)} 
            onClose={closeModal}
            chatRoomId={chatUUID}
          />
        </Suspense>
      </div>
    </Modal> 

   </>
 
}

// !currentUser?.isPremium && !currentUser?.isAdmin && ( (selectedConversation.hasOrder ? false : true)  || 
// (currentUser?.balance ?? 0) < ( servicesHelper.getMinPrice(data?.get(services) as servicesProps ) ?? (data?.get(price) as number) * 100 ))
export default ChatBox