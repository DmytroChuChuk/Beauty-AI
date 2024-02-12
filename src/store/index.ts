import { create } from "zustand";

import { 
  DocumentData, 
  QuerySnapshot 
} from "firebase/firestore";

import {
  balance,
  block,
  clientRecords,
  gender,
  nickname,
  rbac,
  stripeApproved,
  stripeConnectAccount,
  tele_id,
  video_verification,
  email,
  number_of_rents,
  points,
  club,
  name,
  state,
  clubs,
  geoEncodings,
  block_bc,
  reject_reason_after,
  ipAddress,
  paynow,
  dob,
  pref,
  app,
  emeets,
  legalName,
  currency,
  penalty,
  hasGamingProfileImageForAll,
  ratings,
  services,
  myReferrer
} from "../keys/firestorekeys";

import { 
  admin, 
  myUid, 
  timer, 
  url, 
  phoneNumber, 
  notify,
  country,
  inactive,
  selectedConversation,
  hasCreditDocument
} from "../keys/localStorageKeys";
import { RBAC } from "../enum/MyEnum";
import { ConversationInfo } from "../chats/shared/types";
import { Item } from "../keys/props/profile";
import { SnackbarProps } from "@mui/material";
import { servicesProps } from "../keys/props/services";


export type RBACType = RBAC.admin | RBAC.babe | RBAC.user | undefined

export interface APNSTokenProps {
  [deviceId: string]: string
}

export interface user {
  hasCreditDocument?: boolean | undefined
  uid?: string | undefined | null
  gender?: string | undefined | null
  profileImage?: string | undefined | null
  nickname?: string | undefined | null
  phoneNumber?: string | undefined | null
  isAdmin?: boolean | null | undefined
  isPremium?: boolean
  clientRecords?: number | undefined | null
  teleId?: string | null | undefined
  APNSToken?: APNSTokenProps | undefined
  verified?: boolean
  countryCode?:string | null | undefined 
  stripeConnectAccount? : string | null | undefined
  stripeApproved?: boolean
  isActive?: boolean
  balance?: number | undefined
  isBlock? : boolean
  blockBroadcast?: boolean
  userRBAC?: RBACType
  email?: string | null | undefined
  numberOfRents?: number | undefined | null 
  points?: number | undefined | null
  incomeCredits?: number | undefined | null
  pendingCredits?: number | undefined | null
  referralCredits?: number | undefined | null
  penaltyCredits?: number | undefined | null 
  club?: string | null | undefined
  clubState?: string | null | undefined
  clubsRBAC?: string | null | undefined
  profileAtWhichState?: string | null | undefined
  rejectedReasonAfter?: string | null | undefined
  ipaddress?: string | null | undefined
  paynow?: string | null | undefined
  dateOfBirth?: string | null | undefined
  emeetsPref?: string[] | null | undefined
  emeetsApp?: string[] | null | undefined
  hasEmeets?: boolean,
  hasGamingProfileImageForAll?: boolean,
  legalName?: string | null | undefined
  currency?: string | null | undefined
  state?: string | null | undefined
  ratings?: number | null | undefined
  services?: servicesProps | null | undefined
  myReferrer?: MyReferrer | null | undefined
}

interface SelectedUserType { 
  currentUser:  Item | undefined
  setCurrentUser: (item?: Item) => void;
}

export interface MyReferrer {
  referrer: string
  joinDate: Date
}

export const useSelectedUser = create<SelectedUserType>((set: any) => ({ 
  currentUser: undefined,
  setCurrentUser: (data) => set((state : SelectedUserType) => ( {currentUser: {...state.currentUser, ...data}} ) )
}))

interface StoreType {
  currentUser: user | undefined;
  setCurrentUser: (user?: user) => void;
}

export const useUser = create<StoreType>((set: any) => ({
  currentUser: {
    hasCreditDocument: localStorage.getItem(hasCreditDocument) ? true : false,
    uid: localStorage.getItem(myUid),
    gender: localStorage.getItem(gender) ?? "0",
    profileImage: localStorage.getItem(url),
    nickname: localStorage.getItem(nickname),
    phoneNumber: localStorage.getItem(phoneNumber),
    isAdmin: localStorage.getItem(admin) === "true" ? true : localStorage.getItem(admin) === "false" ? false : undefined ,
    isPremium: localStorage.getItem(timer) === "1",
    clientRecords: parseInt(localStorage.getItem(clientRecords) ?? "0"),
    teleId : localStorage.getItem(tele_id),
    verified: localStorage.getItem(video_verification) === '1',
    countryCode: localStorage.getItem(country),
    stripeConnectAccount: localStorage.getItem(stripeConnectAccount),
    stripeApproved: localStorage.getItem(stripeApproved) === '1',
    isActive: localStorage.getItem(inactive) ? true : false,
    balance:  parseInt(localStorage.getItem(balance) ?? "0") ?? 0,
    isBlock: localStorage.getItem(block) === "1",
    blockBroadcast: localStorage.getItem(block_bc) === "1",
    userRBAC: RBAC[localStorage.getItem(rbac) as RBACType ?? RBAC.user],
    email: localStorage.getItem(email),
    numberOfRents: parseInt(localStorage.getItem(number_of_rents) ?? "0") ?? 0,
    points: parseInt(localStorage.getItem(points) ?? "0") ?? 0,
    pendingCredits: parseInt(localStorage.getItem(penalty) ?? "0") ?? 0,
    incomeCredits: parseInt(localStorage.getItem(penalty) ?? "0") ?? 0,
    penaltyCredits: parseInt(localStorage.getItem(penalty) ?? "0") ?? 0,
    club: localStorage.getItem(`${club}.${name}`),
    clubState: localStorage.getItem(`${club}.${state}`),
    clubsRBAC: localStorage.getItem(`${clubs}.${rbac}`),
    profileAtWhichState: localStorage.getItem(geoEncodings),
    rejectedReasonAfter: localStorage.getItem(reject_reason_after),
    ipaddress: localStorage.getItem(ipAddress),
    paynow: localStorage.getItem(paynow),
    dateOfBirth: localStorage.getItem(dob),
    emeetsPref: localStorage.getItem(pref)?.split(","),
    emeetsApp: localStorage.getItem(app)?.split(","),
    hasEmeets: localStorage.getItem(emeets) ? true : false,
    hasGamingProfileImageForAll: localStorage.getItem(hasGamingProfileImageForAll) ? true : false,
    legalName: localStorage.getItem(legalName),
    currency: localStorage.getItem(currency),
    state: localStorage.getItem(state),
    ratings: parseFloat(localStorage.getItem(ratings) ?? "0") ?? 0,
    services: (localStorage.getItem(services) && localStorage.getItem(services) !== "") 
    ? JSON.parse(localStorage.getItem(services) ?? "{}") : undefined,
    myReferrer: (localStorage.getItem(myReferrer) && localStorage.getItem(myReferrer) !== "")
        ? JSON.parse(localStorage.getItem(myReferrer) ?? "{}") : undefined
  },
  setCurrentUser: (data) => set((state : StoreType) => ( {currentUser: {...state.currentUser, ...data}} ) )
}));


export interface convo  {
  notification?: number | undefined
  data? : QuerySnapshot<DocumentData> | null;
}

interface StoreConversationType {
  currentConversation: convo;
  setConversation: (convo?: convo) => void;
}

export const useConversationStore = create<StoreConversationType>((set: any) => ({
  currentConversation: {
    notification: parseInt(localStorage.getItem(notify) ?? '0'),
    data: null
  },
  setConversation: (data : convo | undefined) => set(() => ( {currentConversation: data } ) )
}));

export interface conversation  {
  data : ConversationInfo | undefined
}

interface StoreSelectedConversationType {
  selectedConversation: conversation | undefined;
  setSelectedConversation: (convo?: conversation) => void;
}

export const useSelectedConversation = create<StoreSelectedConversationType>((set: any) => { 

  let _json = undefined

  try{
    const _store = sessionStorage.getItem(selectedConversation) ?? ""
    _json = JSON.parse(_store) ?? undefined
  }catch{
  }

  return {
    selectedConversation: {
      data:  _json
    },
    setSelectedConversation: (data : conversation | undefined) => set(() => {
      if(data?.data){
        const _data = data.data
        sessionStorage.setItem(selectedConversation, JSON.stringify(_data))
      }else sessionStorage.removeItem(selectedConversation)
      
      return {selectedConversation: data } 
    })
  }
});

interface AudioProps { 
  voiceUrl: string | undefined
}

interface AudioType { 
  currentAudio:  AudioProps
  setCurrentAudio: (audio?: AudioProps) => void;
}

export const useCurrentAudio = create<AudioType>((set: any) => ({ 
  currentAudio: {
    voiceUrl: undefined
  },
  setCurrentAudio: (data) => set((state : AudioType) => ( {currentAudio: {...state.currentAudio, ...data}} ) )
}))

interface CenterSnackBarProps extends SnackbarProps { 

}

interface CenterSnackBarType { 
  currentSnackbar:  CenterSnackBarProps | undefined
  setCurrentSnackbar: (centerSnackBarProps?: CenterSnackBarProps) => void;
}

export const useCenterSnackBar = create<CenterSnackBarType>((set: any) => ({ 
  currentSnackbar: undefined,
  setCurrentSnackbar: (data) => set((state : CenterSnackBarType) => ( {currentSnackbar: {...state.currentSnackbar, ...data}} ) )
}))

interface ClubAdminProps { 
  clubName?: string | null | undefined
  clubState?: string | null | undefined
  clubRBAC?: string | null | undefined
}

interface ClubAdminType { 
  current:  ClubAdminProps
  setClubAdmin: (clubAdmin?: ClubAdminProps) => void;
}

export const useClubAdmin = create<ClubAdminType>((set: any) => ({ 
  current: {
    clubName: localStorage.getItem(`${admin}.${club}.${name}`),
    clubState: localStorage.getItem(`${admin}.${club}.${state}`),
    clubRBAC: localStorage.getItem(`${admin}.${club}.${rbac}`),
  },
  setClubAdmin: (data) => set((state : ClubAdminType) => ( {current: {...state.current, ...data}} ) )
}))


// interface SoundEffectProps { 
//   url: string | undefined
// }

// interface SoundEffectType { 
//   currentSoundEffect:  SoundEffectProps
//   setCurrentSoundEffect: (audio?: SoundEffectProps) => void;
// }

// export const useSoundEffect = create<SoundEffectType>((set: any) => ({ 
//   currentSoundEffect: {
//     url: undefined
//   },
//   setCurrentSoundEffect: (data) => set((state : SoundEffectType) => ({
//     currentSoundEffect: {...state.currentSoundEffect, ...data}} ) )
// }))