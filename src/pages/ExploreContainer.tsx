import React, { Suspense, lazy, useEffect, useState } from 'react';
import './ExploreContainer.scss';

import {
  DocumentData,
  DocumentSnapshot,
  Timestamp,
  collection,
  doc,
  limit,
  orderBy,
  query,
  updateDoc,
  where
} from "firebase/firestore";
import { db } from '../store/firebase';

import {
  CONVERSATION,
  club,
  deleteOn,
  info,
  push,
  recipientLastSeen,
  sender,
  senderLastSeen,
  state,
  updatedAt,
  users
} from '../keys/firestorekeys';

import { widthToOpenModal } from '../dimensions/basicSize';
import { useUser } from '../store';
import { Helper } from '../utility/Helper';

import LoadingScreen from '../components/Loaders/LoadingScreen';

import { Box } from '@mui/material';
import shallow from 'zustand/shallow';
import { useEffectCollectionQuery } from '../chats/hooks/useEffectCollectionQuery';
import AgencyHeader from '../components/Headers/AgencyHeader';
//import SocialMedias from '../components/SocialMedias';

import { user } from '../chats/shared/types';
import EMeetDialog from '../components/Dialogs/emeet/EMeetDialog';
import { incomingMessageSound } from '../data/sounds';
import { playSoundEffect } from '../utility/GlobalFunction';
import DisplayUserProfilePage from './DisplayUserProfilePage';
import LoginPage from './LoginPage';
import ChooseServicePage from './admission/ChooseServicePage';
import SetupBasicPage from './admission/SetupBasicPage';
import SetupLocationPage from './admission/SetupLocationPage';
import UploadMediaPage from './admission/UploadMediaPage';
import UploadVoicePage from './admission/UploadVoicePage';

// const ChooseServicePage = lazy(() => import('./Admission/ChooseServicePage'))
// const UploadMediaPage = lazy(() => import('./Admission/UploadMediaPage'))
// const UploadVoicePage = lazy(() => import('./Admission/UploadVoicePage'))
// const SetupLocationPage = lazy(() => import('./Admission/SetupLocationPage'))
// const SetupBasicPage = lazy(() => import('./Admission/SetupBasicPage'))

const IntroPage = lazy(() => import('./admission/IntroPage'))
const AdminProfilePage = lazy(() => import('./admission/AdminProfilePage'))
const CoverLayer = lazy(() => import('../components/Loaders/CoverLayer'))
const Terms = lazy(() => import('./policy/Terms'))
const FAQ = lazy(() => import('./policy/FAQ'))
const ProfilePage = lazy(() => import('../pages/ProfilePage'))
const ChatBox = lazy(() => import('../chats/pages/ChatBox'))
const RentPage = lazy(() => import('../pages/RentPage'))
const Chat = lazy(() => import('../chats/pages/Chat'))
const StripeCheckout = lazy(() => import('../components/Stripe/StripeCheckout'));


interface ContainerProps {
  name: string
  loading: boolean
  error: boolean
  userData: DocumentSnapshot<DocumentData> | undefined
}

export enum pages {
  rent = 'rent',
  admin = 'admin',
  private = 'private profiles',
  chatbox = 'chatbox' , 
  chat = 'chat' , 
  about = 'about',
  faq = 'faq',
  terms = 'terms',
  termsOfServices = 'terms of service',
  profile = 'profile',
  messages = 'messages',
  upgrade = 'upgrade',
  checkout = 'checkout',
  admission = 'admission',
  beababe = 'beababe',
  chooseservice = "chooseservice",
  uploadmedia = "uploadmedia",
  uploadvoice = "uploadvoice",
  setuplocation = "setuplocation",
  setupbasic = "setupbasic",
  renting = "renting"
}

export enum conversationType{
  normal, deleted
}

const ExploreContainer: React.FC<ContainerProps> = ({
  name,
  loading,
  error,
  userData
}) => {

  const helper = new Helper()

  const type = window.location.href.getQueryStringValue("usertype")

  const clubName = sessionStorage.getItem(club)
  const clubState = sessionStorage.getItem(state)

  const [
    _uid, 
    _isBlock,
    isAdmin, 
    emeetsApp,
    emeetsPref,
    hasEmeets
  ] = useUser((state) => [
    state.currentUser?.uid, 
    state.currentUser?.isBlock,
    state.currentUser?.isAdmin,
    state.currentUser?.emeetsApp,
    state.currentUser?.emeetsPref,
    state.currentUser?.hasEmeets
  ], shallow)


  const defaultSize = Math.ceil( window.innerHeight/50 ) 

  const [limitCount, setLimitCount] = useState<number>(defaultSize)
  const [limitCount2, setLimitCount2] = useState<number>(defaultSize) //(defaultSize)

  const {loading: loadingChat , error: errorChat, data: dataConversation} = useEffectCollectionQuery( _uid? `${_uid}-chat` : undefined, 
  _uid ? query(collection(db, CONVERSATION), where(users, 'array-contains' ,  _uid  ?? "empty"), 
  orderBy(updatedAt, 'desc'), limit(limitCount)) : undefined, limitCount)

  const {loading : loadingArchive , data: dataArchive} = useEffectCollectionQuery( _uid? `${_uid}-del` : undefined, 
  _uid? query(collection(db, CONVERSATION), 
  orderBy(`${info}.${_uid}.${deleteOn}`, 'desc'), limit(limitCount2)) : undefined, limitCount2)

  const [hasNextPage, setNextPage] = useState<boolean>(true)
  const [hasNextPage2, setNextPage2] = useState<boolean>(true)

  // const setCurrentUser = useUser((state) => state.setCurrentUser)
  // check on conversation
  useEffect(() => {
    // console.log("iajsiajsid")
    const docs = dataConversation?.docs ?? []
    let playSound = false
    let promises = []

    for (let index = 0; index < docs.length; index++) {
      const _doc = docs[index]

      const _info = _doc.get(info) as user | undefined
      const isUpdatedAt = _doc.get(updatedAt) as Timestamp | undefined
      if(!_info || !_uid || !isUpdatedAt){
        continue
      }

      const isSender = (_doc.get(sender) as string) === _uid

      let myLastSeen =  _info?.[_uid]?.[push] ?? _doc.get(isSender ? senderLastSeen : recipientLastSeen) as Timestamp
      const hasMessage = !myLastSeen ? true : myLastSeen < isUpdatedAt ? true : false


      if(hasMessage){
        playSound = true
     
        // console.log(`myLastSeen: ${myLastSeen.toDate()}`)
        // console.log(`isUpdatedAt: ${isUpdatedAt.toDate()}`)

        promises.push(updateDoc(doc(db, CONVERSATION, _doc.id), {
          [`${info}.${_uid}.${push}`]: Timestamp.fromDate(isUpdatedAt.toDate().addSeconds(0.5))
        }))
      }
    }

    if(playSound){
      // console.log(`play sound for: ${_uid}`)
      playSoundEffect(incomingMessageSound)
    }

    if(promises.length > 0){
      Promise.all(promises)
    }

      // console.log(dataConversation)
      // eslint-disable-next-line
  }, [dataConversation])

  useEffect(() => {
    const logic = name === pages.chatbox.valueOf() || name === pages.chat.valueOf() || name === pages.profile.valueOf()
    document.body.style.overflow = logic ? "hidden" : "auto";
    
    return () => {
      document.body.style.overflow = "auto";
    }
  })


  function getPage(name:string): any{

    if ( name === pages.admin.valueOf() ) return loading || error || !userData ? 
      <LoadingScreen/> : 
      <Suspense fallback={<LoadingScreen/>}>
        <AdminProfilePage data={userData} />
      </Suspense>
  
    else if (name === pages.about.valueOf() || name === pages.faq.valueOf()) return <Suspense fallback={<LoadingScreen/>}>
      <FAQ/>
    </Suspense>

    else if (name === pages.termsOfServices.valueOf() || name === pages.terms.valueOf() ) return <Suspense fallback={<LoadingScreen/>}>
        <Terms/>
      </Suspense>
    
    else if (name === pages.profile.valueOf()) return <Suspense fallback={<LoadingScreen/>}>
        <ProfilePage isPrivate = {undefined} />
      </Suspense>

    else if (name === pages.checkout.valueOf()) return <Suspense fallback={<LoadingScreen/>}>
      <StripeCheckout/>
    </Suspense>

    else if (name === pages.chatbox.valueOf()) return <ChatBox />

    else if (name === pages.upgrade.valueOf()) return <Suspense fallback={<LoadingScreen/>}>
        <CoverLayer/>
    </Suspense>

    // services [START]
    else if (
      name === pages.admission.valueOf() || name === pages.beababe.valueOf()
    ) return <Suspense fallback={<LoadingScreen/>}>
      <IntroPage data={userData}/>
    </Suspense>

    else if (name === pages.chooseservice.valueOf()) return loading || error || !userData ? 
    <LoadingScreen/> : <ChooseServicePage data={userData}/>

    else if (name === pages.uploadmedia.valueOf()) return loading || error || !userData ? 
    <LoadingScreen/> : <UploadMediaPage data={userData}/>

    else if (name === pages.uploadvoice.valueOf()) return loading || error || !userData ? 
    <LoadingScreen/> : <UploadVoicePage data={userData}/>

    else if (name === pages.setuplocation.valueOf()) return loading || error || !userData ? 
    <LoadingScreen/> : <SetupLocationPage data={userData}/>

    else if (name === pages.setupbasic.valueOf()) return loading || error || !userData ? 
    <LoadingScreen/> : <SetupBasicPage data={userData}/>

    //else if (name === pages.renting.valueOf()) return <DisplayUserProfilePage />
    // services [END]
    // return custom page name
    else return null
  }

  function shouldHide(pageName: string){

    const value = helper.getQueryStringValue('private')
    const isPrivate =  value ? value === 'true' : false

    if(name === pageName ){
      return false
    }
    
    else if(pageName === pages.rent.valueOf() && name === pages.profile.valueOf() && !isPrivate) {
      if(window.innerWidth < widthToOpenModal) return false
    }else{
      for(const v of Object.values(pages)){
        if(name === v.toString()){
          return true
        }
      }
    }
    return false
  }

  function loadNextPage(type: conversationType) {

    switch (type) {
      case conversationType.normal:
  
        if(dataConversation?.size as number >= limitCount){
       
          setNextPage(true)
      
          setLimitCount((prev) => {
            return prev + defaultSize
          })


        }else{
          setNextPage(false)
        }
        break;

      case conversationType.deleted:
  
        if(dataArchive?.size as number >= limitCount2){
          setNextPage2(true)

          setLimitCount2((prev) => {
            return prev + defaultSize
          })

        }else{
       
          setNextPage2(false)
        }
        break;
    }

  }

  function hasEmeetsPref(): boolean{
    if(!emeetsApp || !emeetsPref){
      return false
    }else if(emeetsApp.length === 0 || emeetsPref.length === 0){
      return false
    }else return true
  }

  return <Box>

      <AgencyHeader clubName={clubName} clubState={clubState}/>

      <Suspense fallback={<LoadingScreen/>}>
        
        {
        
        !_isBlock  ? <>  
            <>

            {
            
            helper.getQueryStringValue("exact") === 'true' ||
            name === pages.checkout
            ? null : <>
    
              {type && <DisplayUserProfilePage hidden={ shouldHide(pages.renting)} /> }
              <RentPage hidden={ shouldHide(pages.rent)} />
            </>

            }

            { _uid ? <Chat  
              hidden={!(name === "chat" || name === 'messages' || name === 'chatbox')}
              loadNextPage={loadNextPage}
              dataArchive={dataArchive}
              loadingChat={loadingChat}
              errorChat={errorChat}
              loadingArchive={loadingArchive}
              hasNextPage={hasNextPage}
              hasNextPage2={hasNextPage2} 
              data={dataConversation}            
            /> : (name === "chat" || name === 'messages' || name === 'chatbox') && <LoginPage dontRedirect />}
         
            {getPage(name)} 

            </>

        </> : null
        
        }

      </Suspense>

     <EMeetDialog
        enableCancel = {false}
        open = {
          !!hasEmeets &&
          !hasEmeetsPref()
          && !!isAdmin && !!_uid}
      />

    </Box>
};

export default ExploreContainer