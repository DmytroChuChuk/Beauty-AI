import { FieldValue, Timestamp } from "firebase/firestore"
import { app, bio, category, chat_room_id, content, host, joined, messageId, mobileUrl, pay_link, pref, price, reason, reject_reason, status, suffix, time_stamp, title, type, uid, url } from "../firestorekeys"
import { id, nickname, sender, short_link, tele_id } from "../firestorekeys";
import { 
  annonymous, 
  comments, 
  ratings, 
  ratings2, 
  reply,
  services} from '../../keys/firestorekeys';
import { ServiceDetails } from "../../pages/ProfilePage";
import { CancelOrReject } from "../../enum/MyEnum";

export interface ClubProps {
    name?: string
    state?: string
    t?: Timestamp
  }
  
export interface ClubsRBAC {
  [club: string]: ClubRBACProps
}
  
export interface ClubRBACProps {
    name?: string
    state?: string
    rbac?: string
    t?: Timestamp
}

export interface EmeetsProps {
  [pref]: string[] | undefined
  [app]: string[] | undefined
}

export interface UserInfoProps {
    [uid: string]: InfoProps | undefined
}

export interface InfoProps {
  [id]: string | undefined,
  [short_link] : string | undefined,
  [sender]: string | undefined,
  [nickname]: string | undefined,
  [tele_id]: string | undefined
  [url]: string | undefined,
  [reject_reason]: string | undefined,
  [host]: string | undefined,
  [mobileUrl]: string | undefined,
}

export interface RequestRefundProps {
  [sendBy: string] : {
      [url]: string,
      [reason]: string
      // [reject_reason]: string
  } | undefined
}

export interface HistoryProps {
  [nickname]?: string | undefined
  [url]?: string | undefined
  [uid]?: string | undefined
  [time_stamp]?: Timestamp | FieldValue | undefined
}

export interface Reviews{
  [ratings]: number
  [ratings2]: number
  [comments]: string
  [time_stamp]: Timestamp
  [reply]: string | undefined
  [nickname] : string | undefined
  [annonymous] : boolean
  [sender] : string | undefined
  [services] : ServiceDetails | undefined
}

export interface InviteProps {
  [sender]: string | undefined
  [price]: number | undefined
  [bio]: string | undefined
  [time_stamp]: FieldValue | Timestamp | undefined
  [type]: string | undefined
  [category]: string | undefined
  [suffix]: number | undefined
  [joined]?: boolean | undefined
}

export interface CancelRejectProps {
  [chat_room_id]: string
  [messageId]: string
  [pay_link]: string | null | undefined
  [status]: CancelOrReject
}