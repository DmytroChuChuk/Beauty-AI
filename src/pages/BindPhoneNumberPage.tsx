import { FC, useEffect, useState } from 'react';
import CenterFlexBox from '../components/Box/CenterFlexBox';
import { Box, Button, Card, CardContent, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, LinearProgress, Typography } from '@mui/material';
import PhoneInput from 'react-phone-input-2';

import 'react-phone-input-2/lib/style.css'
import { logEvent } from 'firebase/analytics';
import { analytics, auth } from '../store/firebase';
import { AnalyticsNames } from '../keys/analyticNames';
import { country, myUid, phoneNumber } from "../keys/localStorageKeys";
import { Helper } from '../utility/Helper';
import { ipgeolocationAPIKEYS } from '../keys/countries';
import { ConfirmationResult, RecaptchaVerifier, User, linkWithPhoneNumber } from 'firebase/auth';
import LoadingScreen from '../components/Loaders/LoadingScreen';
import { isTEST } from '../keys/functionNames';
import { useUser } from '../store';
import shallow from 'zustand/shallow';
import FlexBox from '../components/Box/FlexBox';
import history from '../utility/history';
import { logOutFunction } from '../components/Dialogs/SignOutDialog';
import { useTranslation } from 'react-i18next';
import { bindPhoneNumberLimit } from '../dimensions/limit';

interface BindPhoneProps {
  user: User | null | undefined
}

const BindPhoneNumberPage : FC<BindPhoneProps> = ({user}) => {

    const ENTER_KEY_CODE = 13

    const helper = new Helper()

    const [ t ] = useTranslation()

    const [phone, setPhone] = useState<string>()
    const [verificationCode, setVerificationCode] = useState<string>();
    const [msg, setMsg] = useState<string>();
  
    const [verifying, setVerifying] = useState<boolean>(false);
    const [openSkipThis, setOpenSkipThis] = useState<boolean>(false);
    const [close, setClose] = useState<boolean>(false);
  
    const [send, setSend] = useState<boolean>(false);
  
    const [result, setResult] = useState<ConfirmationResult | undefined>(undefined)

    const [countryCode, setCountryCode] = useState<string>()

    const [myPhoneNumber] = useUser((state) => [state.currentUser?.phoneNumber], shallow)

    useEffect(() => {
      if(myPhoneNumber){
        window.location.href = ""
      }
    }, [myPhoneNumber])

    useEffect(() => {
        const controller = new AbortController()
        const { signal } = controller;
    
        const _default = helper.getDefaultPhoneCode();
        const API = ipgeolocationAPIKEYS.shuffle()[(Math.random() * ipgeolocationAPIKEYS.length) | 0];
       
        fetch(`https://api.ipgeolocation.io/ipgeo?apiKey=${API}`, 
        { signal })
        .then(async (data) => {
    
          const _json = await data.json()
    
          const countryName = _json.country_name
    
          try{
            logEvent(analytics, AnalyticsNames.ipaddress, {
              country_type: countryName,
              content_type: countryName,
              item_id: countryName, 
            })  
          }catch{}
          const countryCode = _json.country_code2
          if(countryCode){
            setCountryCode(countryCode)
            localStorage.setItem(country, countryCode)
            //setCurrentUser({country: countryCode})
          }else{
            setCountryCode(_default)
          }
          
        }).catch(() => {
          setCountryCode(_default)
        })
    
        return () => {
          controller.abort(); // abort on unmount for cleanup
        };
        // eslint-disable-next-line
    } , [])

    const sendPressed = async () => {

        if(!user){
            return
        }

        setMsg("")
        if(phone === null || phone === undefined){
          alert("Phone nuber is required")
          return;
        }
        
        let re = /\+/gi;
        let result = phone.replace(re, "");
    
        const total = "+" + result
        setPhone(total)

        const disable = isTEST
        auth.settings.appVerificationDisabledForTesting = disable

        setSend(true)
        if(send){
          return
        }

        try {

          const link = await linkWithPhoneNumber(user, total, 
            new RecaptchaVerifier('recaptcha-container', {
              'size': 'invisible'
            }, auth))
    
          setResult(link);
      
          setTimeout(() => {
              (document.getElementById("input-code") as HTMLInputElement).focus()
          }, 400)

        }catch(error){
          console.log(error)
          alert(`${error}`)
          setSend(true)
        }
    };
    
    const verifyPressed = async () => {
        setVerifying(true)
        setMsg("")
        setSend(false)
        if(verificationCode !== undefined && result !== (null || undefined)) {
    
          result!.confirm(verificationCode as string).then(async status => {
    
            if(status.operationType !== "signIn" && status.operationType !== "link"){
              console.log(status.operationType)
              alert("ERROR:")
              setVerifying(false)
              return
            }
    
            const _uid = status.user?.uid
            const _phoneNumber = status.user?.phoneNumber
            if(_phoneNumber){
              localStorage.setItem(phoneNumber, _phoneNumber)
            }
    
            await logined(_uid, _phoneNumber)
    
            setVerifying(false)
       
    
          }).catch((error) => {
            let errorMessage = "Unexpected error"
            if(error.message === "Firebase: Error (auth/account-exists-with-different-credential)."){
              errorMessage = t("phone.existed")
            }else if(error.message === "FirebaseError: Firebase: Error (auth/invalid-verification-code)."){
              errorMessage = t("wrong.code")
            }

            setMsg(errorMessage)
            setVerifying(false)
          
          })
        }
      };

      async function logined (_uid: string | null, _phoneNumber: string | null) {
        const noCache = (new Date().getTime())
    
        if(_uid){
    
          localStorage.setItem(myUid, _uid)
    
          try{

    
            //if (!_phoneNumber){
    
              const _country = countryCode
    
              //setCurrentUser({country: _country})
              if(_country) localStorage.setItem(country, _country)
    
            //}


          }catch(error){
            console.log(error)
          }
          
          window.location.href = `page/Rent?no=${noCache}`
      }
    }

    const onClose = () => {
      setOpenSkipThis(false)
    }

    const subscribe = () => {
      history.push("/subscribe")
    }

    const recharge = () => {
      history.push("/credit")
    }

    const logOut = async () => {
      setClose(true)
      await auth.signOut()
      logOutFunction()
      window.location.href = `${window.location.origin}`
   
    }

    if(!user || close) return <LoadingScreen/>

    else if(myPhoneNumber) return <></>

    else { // @ts-ignore
        // @ts-ignore
        // @ts-ignore
        // @ts-ignore
        // @ts-ignore
        // @ts-ignore
        return <CenterFlexBox height="100vh" className='chat-background'>

              <Box sx={{position: "relative"}} className = "center-main">

                <Box position="absolute" top={40} right={-10} zIndex={999}>
                  <img
                      style={{cursor: "pointer"}}
                      width={32}
                      src = "https://images.rentbabe.com/assets/closewhite.svg?v=2"
                      alt=""
                      onClick={logOut}
                  />
                </Box>

                <Card  className="card">

                {verifying && <LinearProgress color="secondary" />}

                <Box padding={2}>
                    <Typography fontWeight="bolder" variant="h5">{t("bind.phone")}</Typography>
                    <Typography variant="caption" color = "error" >{msg}</Typography>
                </Box>

                <div id="recaptcha-container" className = "center" ></div>
                  <CardContent>

                    <div >
                    {!countryCode && <LinearProgress color="secondary"/>}
                  <PhoneInput
                    onKeyDown ={(e) =>{
                      if(e.keyCode === ENTER_KEY_CODE){
                        sendPressed()
                      }
                    }}

                    disabled={countryCode ? false : true}
                    inputStyle={{color: "black", opacity: countryCode ? "1.0" : "0.32"}}
                    country={countryCode?.toLowerCase()}
                    value={phone}
                    onChange={phone => {
                      setPhone(phone)
                    }}
                  />

                    {/*</PhoneInput>*/}

                    </div>

                    <br/>

                    <div className="div-code">

                        <input
                        id="input-code"
                        required type = "tel" className = "ion-input-verify" placeholder = "code"
                        disabled = {result === undefined}
                        onKeyUp ={(e) =>{

                          if(e.keyCode === ENTER_KEY_CODE){
                              verifyPressed();
                          }
                        }}
                        onChange = {event =>

                          {
                            setVerificationCode((event.target as HTMLInputElement).value)
                          }
                        }></input>

                        <div hidden={!send}>
                          <CircularProgress  className="loading-circle" color="secondary"/>
                        </div>


                    </div>

                    <hr/>

                    <div className="btn-container">
                      <Button variant="contained"  color="secondary"  disabled = {!!result} onClick= {sendPressed}>Send</Button>
                      <Button variant="contained"  color="secondary" disabled = {!result } onClick={verifyPressed}>Verify</Button>
                      <Button  variant="contained" color="secondary"  disabled = {!result} onClick={() => {window.location.reload()}}>RETRY</Button>
                    </div>



                  </CardContent>

                  <CardContent>

                    <CenterFlexBox>

                      <Button color="secondary" variant='text'
                      onClick={() => setOpenSkipThis(true)}>{t("skip.step")}</Button>

                    </CenterFlexBox>

                  </CardContent>
                </Card>

              </Box>

              <Dialog open={openSkipThis} onClose={onClose}>
                <FlexBox>
                  <DialogTitle>{t("bind.title")}</DialogTitle>

                  <Box marginLeft="auto" padding={2}>
                    <img
                        style={{cursor: "pointer"}}
                        onClick={onClose}
                        width={24}
                        src = "https://images.rentbabe.com/assets/closewhite.svg?v=2"
                        alt=""
                    />
                  </Box>

                </FlexBox>

                <DialogContent>
                  <DialogContentText>
                  {t("bind.description", {credit: `${bindPhoneNumberLimit/100}`})}
                  </DialogContentText>
                </DialogContent>

                <DialogActions>
                        <Button variant='contained' color="warning" onClick={subscribe}>{t("subscribe")}</Button>
                        <Button variant='contained' color="error" onClick={recharge}>{t("recharge")}</Button>
                </DialogActions>
              </Dialog>


            </CenterFlexBox>
    }
 
}

export default BindPhoneNumberPage