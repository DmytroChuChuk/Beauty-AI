import { FieldValue, Timestamp } from "firebase/firestore";
import { deleteOn, lastSeen, mobileUrl, nickname, push, tele_id } from "../../keys/firestorekeys";

export interface ConversationInfo {

  id: string 
  hasOrder: boolean
  orderTime: Timestamp | undefined
  order: string[] | undefined
  sender: string
  users: string[]

  updatedAt: Timestamp | FieldValue
  lastMessage: string | undefined

  info: user | undefined

  //NEW
  block: string[] | undefined

  // DEPRECIATED
  senderProfileURL: string | null | undefined
  senderNickname: string

  recipientProfileURL: string
  recipientNickname: string

  senderLastSeen: Timestamp | undefined
  recipientLastSeen: Timestamp | undefined



}

export interface user {
  [uid: string] : userInfo
}

export interface userInfo {
  [nickname]? : string | null | undefined
  [mobileUrl]? : string  | null | undefined
  [lastSeen]? : Timestamp | undefined
  [tele_id]? : string | undefined
  [deleteOn]? : Timestamp | undefined
  [push]? : Timestamp | undefined
}


export interface MessageItem {
  id?: string;
  sender: string;
  content: string;
  replyTo?: string;
  createdAt: Timestamp;
  type: "text" | "image" | "file" | "sticker" | "removed";
}