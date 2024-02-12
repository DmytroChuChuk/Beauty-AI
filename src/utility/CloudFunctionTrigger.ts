import { logEvent } from "@firebase/analytics";
import { httpsCallable } from "firebase/functions";
import { AnalyticsNames } from "../keys/analyticNames";
import { lockChatFunction } from "../keys/functionNames";
import { analytics, functions } from "../store/firebase";
import { playSoundEffect } from "./GlobalFunction";
import { lockSound } from "../data/sounds";

export enum LockEnum {
  LOCKED,
  UNLOCKED
}
export async function lockChat(chatRoomID: string, lockType: LockEnum): Promise<any>{
    try{
        const name = `${lockType === LockEnum.LOCKED ? "lock" : "unlock"} chat`
        logEvent(analytics, AnalyticsNames.buttons, {
          content_type: name,
          item_id: name, 
        })  
    }catch{}

    playSoundEffect(lockSound)

    const lockChat = httpsCallable(functions, lockChatFunction);
    return lockChat({
      "chatRoomId": chatRoomID
    })
}