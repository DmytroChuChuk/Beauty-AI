import { FC, useEffect, useState } from 'react';
import './Menu.scss';

import { AppBar, MenuItem, Slide, Toolbar, Typography, useScrollTrigger } from '@mui/material';

import { NavLink } from 'react-router-dom';

import { area, pageArea } from '../keys/localStorageKeys';

import { useUser } from '../store';
import CountriesDialog from './Dialogs/Rent/CountriesDialog';


import { logEvent } from 'firebase/analytics';
import { collection, limit, query, Timestamp, where } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import shallow from 'zustand/shallow';
import { useEffectCollectionQuery } from '../chats/hooks/useEffectCollectionQuery';
import { OrderStatusEnum } from '../enum/OrderEnum';
import { useWindowSize } from '../hooks/useWindowSize';
import { AnalyticsNames } from '../keys/analyticNames';
import { TelegramLink } from '../keys/contactList';
import { clientUID, club, ORDER, state as stateKey, status, time_stamp } from '../keys/firestorekeys';
import { analytics, db } from '../store/firebase';
import { Helper } from '../utility/Helper';
import history from '../utility/history';
import { version } from '../version/basic';
import { BabeButton, LoginButton } from './Buttons';
import ChatImage from './CustomImage/ChatImage';
import GovDialog from './Dialogs/Verification/GovDialog';
import { DropDownMenu } from './DropDownMenu';
import Translation from './Select/Translation';

const MyAppBar: FC = () => {  
  const helper = new Helper()

  const clubName = sessionStorage.getItem(club)
  const clubState = sessionStorage.getItem(stateKey)

  const { t , i18n } = useTranslation()
  
  const [size] = useWindowSize()

  const [ 
    uid, 
    isAdmin, 
    isVerified,
    rejectedReasonAfter
   ] = useUser((state) => [
    state.currentUser?.uid, 
    state.currentUser?.isAdmin,
    state?.currentUser?.verified,
    state?.currentUser?.rejectedReasonAfter
  ],shallow)

    const {data} = useEffectCollectionQuery(`${uid}-order`, uid ? query(collection(db, ORDER), 
    where(status, "==", OrderStatusEnum.pending),
    where(clientUID, "==", uid),
    where(time_stamp, ">=", Timestamp.fromDate( (new Date()).addMinutes(-12 * 60))),
    limit(1)) 
    : undefined, 1)

  const trigger = useScrollTrigger();

  const navData: {
    [key: string]: number
  } = {
    "es": 1000,
    "zh" : 770
  }

  const offsetData: {
    [key: string]: number
  } = {
    "es": 175,
    "zh" : 50
  }

  const addClassData: {
    [key: string]: number
  } = {
    "es": 490,
    "th": 490,
    "en": 370,
    "zh" : 385,
    "id": 460
  }

  const babeFontSize: {
    [key: string]: number
  } = {
    "es": 2.8,
    "en" : 2.4,
    "th" : 2.4,
    "zh" : 3.8,
    "id": 1.8
  }

  const shouldChangeFontSize = size.width < ((addClassData[i18n.language] ?? 420) - (uid ? 150 : 0))
  const addClassName = shouldChangeFontSize ? 'resize-button-text' : ""

  const nav = ((navData[i18n.language] ?? 880) + (uid ? 0 : (offsetData[i18n.language] ?? 50)))

  const [mobileScreen,setMobileScreen] = useState(helper.isMobileCheck2());

  const [showAlert, setShowAlert] = useState(false)
  const [openGovDialog, setGovDialog] = useState(false)

  const closeCountryDialog = () => {
    setShowAlert(false)
  }

  const openCountryDialog = () => {

    try{
      logEvent(analytics, AnalyticsNames.buttons, {
        content_type: "appbar location",
        item_id: "appbar location", 
      })  
    }catch{}

    setShowAlert(true)
  }

  const chatbubbleOnClick = () => {
    if(!uid){
      history.push('/login')
    } else {

      if(isAdmin && !isVerified){
        setGovDialog(true)
      }else{
        history.push(`/page/chat?v=${version}`)
      }

    }
  }

  useEffect(() => {
    if (size.width < 426) {
      setMobileScreen(true);
    } else {
      setMobileScreen(false);
    }
  },[size.width]);


  return (  
    <>
    <div>
      <Toolbar />

      <Slide appear={false} direction="down" in={ !trigger }>

      <AppBar className="app-bar" >

        <Toolbar disableGutters >
          <a href="/">
                <div>
                  <img className = "img-click" 
                  height={42} 
                  width={42}
                  src="https://images.rentbabe.com/assets/rentblogo.svg"
                  alt="logo"></img> 
                </div>
            </a>
          {size.width  < nav ? <nav className= "nav-header"/> : <nav className= "nav-header">{[ 
            'rent.toolbar', 
            'FAQ.toolbar', 
            'terms.toolbar', 
            'location.toolbar', 
            'contactus.toolbar'
          ].map((key : string, index : number) => {

              const text = t(key)
              const enText  = (i18n.getResource('en', 'translation', key) as string).toLowerCase()

              if(index === 3) return (<MenuItem 
                
                onClick={openCountryDialog}
                key={index}>
            
                  <Typography>{text.toUpperCase()}</Typography>
                </MenuItem>) 

              else if (index === 4) return (<MenuItem 
                
                onClick={() => {
                  window.open(TelegramLink, '_blank')
                }}
                key={index}>
            
                  <Typography>{text.toUpperCase()}</Typography>
                </MenuItem>) 
                
              else return ( <MenuItem
                
                onClick={(e : any) => {
              
                  const helper = new Helper()
                  
                  if (index === 0){
                    const isAnnouncement = helper.getQueryStringValue("session") !== ""
      
                    if(isAnnouncement){
    
                      window.location.href = `/page/${enText}`
                    }
                  }
                
                }}

                component={NavLink}
                to={`/page/${enText}`}
                key={index}>
        
                  <Typography>{text.toUpperCase()}</Typography>
                </MenuItem>
                
              )
            } 
            
            )}</nav>
          
          }
          <div className='right-side-menu'>

            <Translation 
              onChange={(value) => {
                i18n.changeLanguage(value)

              }}
            />
   
          {(!mobileScreen && (!uid || !isAdmin)) && <BabeButton sx={{
            fontSize: shouldChangeFontSize ? `${babeFontSize[i18n.language]}vw!important` : ""
          }} marginRight={!uid ? ".5rem" : "10px"}/>}

          { 
           uid && <ChatImage 
                onClick={chatbubbleOnClick} 
                className='chat-btn'
              /> 
          }

          {!mobileScreen && !uid && <LoginButton className={addClassName} />}
          {(mobileScreen || (!mobileScreen && uid)) && <DropDownMenu hasOrder={data?.size as number > 0}/>}
        </div>
        </Toolbar>

      </AppBar>

      </Slide>
    </div>
      <CountriesDialog  
        keepMounted
        open={showAlert}
        onClose={closeCountryDialog}
        value={ localStorage.getItem((clubName && clubState) ? pageArea : area ) ?? "Singapore" }
      /> 

    { openGovDialog && <GovDialog 
      open={openGovDialog}
      onClose={() => setGovDialog(false)} 
      myUID={uid} 
      verified={isVerified} 
      rejectedReasonAfter={rejectedReasonAfter}
    /> }
    </>
)};

export default MyAppBar;
