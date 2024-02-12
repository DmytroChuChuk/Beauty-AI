import { FC } from "react";
import { useSelectedConversation, useUser } from "../../../store";
import { Avatar, Card, CardHeader, Skeleton, Typography } from "@mui/material";
import { arrayRemove, arrayUnion, doc, DocumentData, DocumentSnapshot, 
  serverTimestamp, Timestamp, updateDoc } from "firebase/firestore";


import { Helper } from "../../../utility/Helper";
import { isOnline } from "../../../keys/firestorekeys";
import HeaderMore from "./HeaderMore";

import { 
  CONVERSATION, 
  deleteOn, 
  info, 
  mobileUrl, 
  nickname, 
  users, 
  video_verification, 
  PREMIUM,
  block,
  premium
} from "../../../keys/firestorekeys";

import { db } from "../../../store/firebase";
import Verified from "../../../components/Tooltip/Verified";
import shallow from "zustand/shallow";
import { chatGray } from "../../../keys/color";
import UserTag from "./UserTag";

import { useCallbackDocumentQuery } from "../../../hooks/useCallbackDocumentQuery";
import history from "../../../utility/history";
import FlexBox from "../../../components/Box/FlexBox";
// import UserTag from "./UserTag";

interface ChatHeaderProps {
  senderUUID: string | undefined
  myBlock: boolean
  isUserDataLoading: boolean
  chatRoomID: string | undefined
  openBackButton: boolean
  online: Timestamp | undefined
  userData? : DocumentSnapshot<DocumentData>  | null | undefined
  hasOrder: boolean
  profileClick: () => void
}

const ChatHeader: FC<ChatHeaderProps> = ({
  senderUUID,
  myBlock, 
  isUserDataLoading,
  chatRoomID, 
  openBackButton : isOpen, 
  online, 
  userData : data, 
  hasOrder,
  profileClick
}) => {

  const isChatBox = window.location.href.getQueryStringValue("cri") ? true : false

  const setSelectedConversation = useSelectedConversation(
    (state) => state.setSelectedConversation
  )
  const [
    myUID
  ] = useUser((state) =>
  [
    state.currentUser?.uid
  ] , shallow)
  
  // eslint-disable-next-line


  const { data : premData } = useCallbackDocumentQuery(
    `prem-data-${data?.id}` , data?.id ? doc(db, PREMIUM, data?.id) : undefined
  )

  const helper = new Helper()

  const deleteClick = () => {

    if (!myUID || !chatRoomID) return 

    updateDoc(doc(db, CONVERSATION, chatRoomID) , {
      [users]: arrayRemove(myUID),
      [`${info}.${myUID}.${deleteOn}`]: serverTimestamp()
    })

    const path = helper.getURLEnd().toLowerCase()
    if(path === "chatbox"){
      history.goBack()
    }

    setSelectedConversation({data: undefined})
  }

  const blockClick = () => {
    
    const otherUid = data?.id

    if (!myUID || !otherUid) return 

    if(myBlock){
      if(chatRoomID){
        updateDoc(doc(db, CONVERSATION, chatRoomID), {
          [block]: arrayRemove(myUID)
        })
      }

    }else{
      if(chatRoomID){
        updateDoc(doc(db, CONVERSATION, chatRoomID), {
          [block]: arrayUnion(myUID)
        })
      }
    }
  }


  return <Card sx={{
      maxHeight: '82px', 
      boxShadow: "none", 
      borderLeft: `1px solid ${chatGray}`, 
      borderRight: `1px solid ${chatGray}`, 
      borderBottom: `1px solid ${chatGray}`, 
      borderRadius: "0"
    }}>
    
      <CardHeader
        avatar ={
          <FlexBox alignItems="center">

            {isOpen || isChatBox ? <img onClick={() => history.goBack()} height = {16} width = {16} src = "https://images.rentbabe.com/assets/back.svg" alt="" /> : null}
            
            <Avatar
              onClick={profileClick} 
              src={data?.get(mobileUrl)?.toCloudFlareURL() ?? ""}
              alt=""
              sx={{ width: 40, height: 40, marginLeft: "1em", cursor: "pointer"}}>

                <Skeleton variant="circular" width={40} height={40}></Skeleton>
              </Avatar>
  
          </FlexBox>

        }
        title={

          <div onClick={profileClick}  className='flex'>

            {
              (isUserDataLoading || data === undefined) ? <Skeleton variant="text" width="100px" /> : <Typography fontWeight='bold' fontSize={21}> 
                { data?.get(nickname)?.capitalize() ?? "Account Deleted"}
              </Typography>
            }

            {data?.get(video_verification) as boolean ? <>
              <div className="flex-gap"/>
              <Verified />
            </> : null}
          
            {
              premData?.get(premium) as boolean &&  <>
              <div className="flex-gap"/>
                <UserTag/>
              </> 
            }

          </div>
   
        }
        subheader ={
        <> 
          { isUserDataLoading ? <>
            <Skeleton variant="text" width="40px" />
          </> :
          <>{ data ? <div  onClick={profileClick}  className="flex">
            <Typography 
              fontWeight={premData?.get(block)  ? 'bold' : 'light' } 
              color={data?.get(isOnline) ? 'secondary' : 'error'} 
              fontSize={12}>{premData?.get(block) 
            ? 'CAUTION: This user is being banned' : (data?.get(isOnline) ? "Online" : online ?  `Last seen ${helper.timeSince(online.toDate() , true)}` : "")}</Typography>

            <div className='flex-gap'/>

          </div> : <Skeleton variant="text" width="40px" />}
          
          </>
          }
        </>}
        action = {

          <HeaderMore
            senderUUID={senderUUID}
            myBlock={myBlock}
            chatRoomID={chatRoomID}
            deleteClick={deleteClick}
            blockClick={blockClick}
            reportData={{ user: data?.id, reportBy: myUID }}
            openProfile={profileClick} 
            hasOrder={hasOrder}
          />

        }
      />
     
      </Card>
};

export default ChatHeader;
