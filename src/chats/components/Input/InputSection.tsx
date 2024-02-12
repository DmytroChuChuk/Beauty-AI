import {
  ChangeEvent,
  FC,
  useState,
} from "react";

import {
  addDoc,
  arrayRemove,
  collection,
  doc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";

import { useSelectedUser, useUser } from "../../../store";
import { db } from "../../../store/firebase";
import { CONVERSATION, MESSAGES, recipientLastSeen, senderLastSeen, id, recipientNickname, senderNickname, senderProfileURL, 
  recipientProfileURL, sender, users, lastMessage, updatedAt, 
  content, createdAt, type, info, nickname as nicknameKey, mobileUrl, lastSeen, tele_id,
  block,
  APNSToken,
  push} from "../../../keys/firestorekeys";
import { ConversationInfo } from "../../shared/types";
import { MessageEnum } from "../../../enum/MyEnum";
import InputBar from "./InputBar";
import shallow from "zustand/shallow";

import history from '../../../utility/history';
import Conversation from "../../../utility/Conversation";
import { Snackbar } from "@mui/material";
import { Helper } from "../../../utility/Helper";
import { playSoundEffect } from "../../../utility/GlobalFunction";
import { sendMessageSound } from "../../../data/sounds";
import WarningDialog, { WarningType } from "../../../components/Dialogs/basic/WarningDialog";
import { messenger, nsfw, payment, sex } from "../../../keys/filters";

interface InputSectionProps {
  isDisabled: boolean
  myBlock: boolean
  otherBlock: boolean
  conversation: ConversationInfo
  setInputSectionOffset?: (value: number) => void
  replyInfo?: any
  setReplyInfo?: (value: any) => void
  onInput? : (e: any) => void
  sendMessageCallBack?: () => void
  requestNewOrder: () => void
  onFocus: () => void
}

const InputSection: FC<InputSectionProps> = ({
  isDisabled,
  myBlock,
  otherBlock,
  conversation,
  onInput,
  sendMessageCallBack,
  requestNewOrder,
  onFocus
}) => {

  const currentUser = useSelectedUser((state) => state.currentUser)

  const [uid, profileImage, nickname] = useUser((state) => [
    state.currentUser?.uid, 
    state.currentUser?.profileImage, 
    state.currentUser?.nickname
  ] , shallow)

  const helper = new Helper()
  const conversationHelper = new Conversation()

  const isSender = conversation?.sender === uid
  const hasMakePayment = (conversation?.order ?? []).length > 0

  const [inputValue, setInputValue] = useState("");

  const [isOpen, setOpenToast] = useState<boolean>(false)
  const [openConfirm, setOpenConfirm] = useState<boolean>(false)
  const [warningType, setWarningType] = useState<WarningType>(WarningType.NSFW)

  const updateTimestamp = (msg: string) => {

    const senderProfileURLValue = isSender ? profileImage : conversation.senderProfileURL
    const recipientProfileURLValue = isSender ? conversation.recipientProfileURL : profileImage

    const now = serverTimestamp() // Timestamp.now()

    let _users : string[] 
    const _info = conversation.info

    if(_info){

      const _keys = Object.keys(_info)
      
      if(_keys.length === 2) _users = _keys
      else if(_keys.length > 2) {

        let array : string[] = [conversation.sender]
        for (const [key, value] of Object.entries(_info)) {

          if(uid === key) continue

          if(value.delo){
            array.push(key)
          }
        }
        
        if(array.length === 2){
          _users = array
        }else{
          _users = conversation.users
        }
      }
      else _users = conversation.users

    }else{
      _users = conversation.users
    }

    const map : any = {

      [id] : conversation.id,
      [sender]: conversation.sender,
      [users] : _users,
      [lastMessage]: msg,
      [updatedAt]: now,
      [info]: {
        [uid!]: {
          [nicknameKey]: nickname?.toLowerCase() ?? "",
          [mobileUrl]: profileImage?.toCloudFlareURL() ?? "",
          [lastSeen]: now,
          [push]: now
        }
      }
    }

    // if(currentUser?.mobileUrl){
    //   map[`${info}.${currentUser.uid}.${mobileUrl}`] = currentUser.mobileUrl.toCloudFlareURL()
    // }

    //depreciated soon
    map[isSender ? senderLastSeen : recipientLastSeen] = now

    if(conversation.recipientNickname) map[recipientNickname] = conversation.recipientNickname
    if(conversation.senderNickname) map[senderNickname] = conversation.senderNickname

    if(recipientProfileURLValue) map[recipientProfileURL] = recipientProfileURLValue
    if(senderProfileURLValue) map[senderProfileURL] = senderProfileURLValue
    
    setDoc(doc(db, CONVERSATION, conversation.id), map, {merge: true})

  }

  const onCloseHandleToast = () => {
    setOpenToast(false)
  }

  const sendMessage = async (onConfirmClick: boolean) => {

    if(otherBlock){
      setOpenToast(true)
      return
    }

    if(!nickname || !profileImage 
    || nickname === 'undefined' 
    || profileImage === 'undefined'){

      history.push(`/page/Admin?uid=${uid}`)
      return
    }

    if (!inputValue.trim()) {
      return
    }

    if(!onConfirmClick){
      let arrays = sex.concat(nsfw)
      if (arrays.some((word) => { 
          return inputValue?.toLowerCase().includesInWords(word)})) {
              setWarningType(WarningType.NSFW)
              setOpenConfirm(true)
              return
      }

      if(!hasMakePayment){
        let arrays = payment.concat(messenger)
        if (arrays.some((word) => { 
          return inputValue?.toLowerCase().includesInWords(word)})) {
              setWarningType(WarningType.OFF_PLATFORM)
              setOpenConfirm(true)
              return
        }
      }
    }
    
    setInputValue("")
    
    const msgerInput = document.getElementById('msger-input') as HTMLTextAreaElement
    msgerInput.value = ""

    // reset input bar height
    sendMessageCallBack?.()


    let replacedInputValue = `${inputValue}`// .replace(/^.{1}/g, '')

    let msg : {[id: string]: any} =  {
      [sender]: uid,
      [content]: replacedInputValue.trim(),
      [type]: MessageEnum.text.valueOf(),
      [createdAt]: serverTimestamp()
    }
  
    if(currentUser?.teleId) {
      msg[tele_id] = currentUser.teleId
    }

    if(currentUser?.APNSToken){
      msg[APNSToken] = currentUser.APNSToken
    }

    //adding my details into the message
    if(nickname) {
      msg[nicknameKey] = nickname
    }
    if(profileImage) {
      msg[mobileUrl] = profileImage.toCloudFlareURL()
    }

    addDoc(
      collection(db, CONVERSATION, conversation.id, MESSAGES),
      msg
    )
    
    //.finally(scrollDown)
    
    scrollDown()

    updateTimestamp(replacedInputValue)

    playSoundEffect(sendMessageSound)

  };

  const scrollDown = () => {

      const div = document.getElementsByClassName('infinite-scroll-chatview') 
      if(div && div.length > 0) {

        div[0].scrollTop = 0 // div[0].scrollHeight + 99999
      }
  }

  const onChangeInput = (e : ChangeEvent<HTMLTextAreaElement>) => {
    if(isDisabled) return 
    
    const inputElement = (e.currentTarget) as HTMLTextAreaElement
    setInputValue(inputElement.value);
  }

  const onKeyUp = (e : React.KeyboardEvent<HTMLTextAreaElement>) => {
    
    if(e.key === "Backspace" && e.currentTarget.value === " "){
      e.preventDefault()
      return
    }

    if(isDisabled) return 


    if(helper.isMobileCheck2()){

    }else {
      if(e.key === 'Enter' && !e.shiftKey){
        e.preventDefault()
        sendMessage(false)
      }
    }
  }


  const unBlockClick = () => {

    const getRecipientUID = conversationHelper.getRecipientUID(uid, conversation)

    if(!getRecipientUID || !uid) return

    if(conversation.id){
      updateDoc(doc(db, CONVERSATION, conversation.id), {
        [block]: arrayRemove(uid)
      })
    }
  }


  return <>

    <InputBar
      senderUUID={conversation?.sender}
      chatRoomId={conversation?.id}
      disabled={isDisabled}
      myBlock = {myBlock}
      onInput={onInput}
      inputValue={inputValue}
      onChange={onChangeInput}
      unBlockClick={unBlockClick}
      onKeyUp={onKeyUp}
      sendMessage={() => sendMessage(false)}
      requestNewOrder={requestNewOrder}
      onFocus={onFocus}
    />

    <Snackbar 
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center'
      }}
      message='This user has blocked you'
      open={isOpen}
      onClose={onCloseHandleToast}
      autoHideDuration = {1500}
    />

    <WarningDialog
        type={warningType}
        open={openConfirm}
        onClose={() => {
            setOpenConfirm(false)
        }}
        onConfirm={() => {
          sendMessage(true)
        }}
    />



  </> 
   

};

export default InputSection;
