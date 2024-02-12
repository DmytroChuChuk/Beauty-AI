import { ChangeEvent, FC, useEffect, useState } from "react"

import { 
  analytics,
  auth
} 

from "../store/firebase";

import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import './scss/LoginPage.scss'

import { useLocation } from "react-router"

import { Card, 
  CardContent, 
  Button, 
  LinearProgress, 
  CircularProgress, 
  Checkbox, 
  DialogContentText, 
  FormControlLabel, 
  Divider,
  Typography
} from '@mui/material';

import { 
  GoogleAuthProvider,
  ConfirmationResult,
   RecaptchaVerifier, 
   signInWithPhoneNumber, 
   browserLocalPersistence, 
   setPersistence, 
   getRedirectResult,
   signInWithRedirect
} from "firebase/auth";

import { country, myUid, phoneNumber } from "../keys/localStorageKeys";
import { Helper } from "../utility/Helper";
import { useUser } from "../store";
import { isTEST } from "../keys/functionNames";
import { logEvent } from "firebase/analytics";
import { AnalyticsNames } from "../keys/analyticNames";
import LoadingScreen from "../components/Loaders/LoadingScreen";
import { ipgeolocationAPIKEYS } from "../keys/countries";
import CenterFlexBox from "../components/Box/CenterFlexBox";
import axios from 'axios';

interface LoginPageProps {
  openAdminPage: boolean
  openSubscribePage: boolean
  openBabeSignup: boolean
  openSession: string
  openVerify: string
  chooseServices: boolean
}

const backEndUrl = process.env.REACT_APP_API_URL;

const LoginPage: FC<{
  goToLink?: string | undefined
  dontRedirect?: boolean | undefined
}> = ({goToLink, dontRedirect = false}) => {

  const REFERRER_STORAGE_KEY = "referringUserID";

  const ENTER_KEY_CODE = 13

  const helper = new Helper()

  const [phone, setPhone] = useState<string>()
  const location = useLocation<LoginPageProps>()

  const openBabeSignup = location.state?.openBabeSignup ?? false
  const openAdminPage = location.state?.openAdminPage ?? false
  const openSubscribePage = location.state?.openSubscribePage ?? false
  const openSession = location.state?.openSession
  const openVerify = location.state?.openVerify
  const chooseServices = location.state?.chooseServices ?? false

  const setCurrentUser = useUser((state) => state.setCurrentUser)

  const [isLoading, setLoading] = useState<boolean>(false);
  const [verificationCode, setVerificationCode] = useState<string>();
  const [msg, setMsg] = useState<string>();

  const [verifying, setVerifying] = useState<boolean>(false);

  const [send, setSend] = useState<boolean>(false);

  const [result, setResult] = useState<ConfirmationResult | undefined>(undefined);
  const [ageLimit, setAgeLimit] = useState<boolean>(true);
  const [google, setGoogle] = useState<boolean>(false)

  const [countryCode, setCountryCode] = useState<string>()


  const sendPressed = async () => {

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
    setPersistence(auth, browserLocalPersistence)

    .then(async function() {
        
        const result = await signInWithPhoneNumber(auth, total, 
        new RecaptchaVerifier('recaptcha-container', {
          'size': 'invisible'
        }, auth))

        setResult(result);

        setTimeout(() => {
          (document.getElementById("input-code") as HTMLInputElement).focus()
        }, 400)
        
        return result;
    })
    .catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      if (window.confirm(errorCode + " " + errorMessage)){
        window.location.reload();
      }
      setSend(false)

    })
  };


  const googleSignInClick = () => {

    const provider = new GoogleAuthProvider();

    setVerifying(true)
    setGoogle(true) 

    signInWithRedirect(auth, provider)
    .catch((error) => {
      console.log(error)
      setMsg("Google sign in error")
      setVerifying(false)
      setGoogle(false)
    })
  }

  const verifyPressed = async () => {

    setVerifying(true)
    setMsg("")
    setSend(false)

    if(verificationCode !== undefined && result !== (null || undefined)) {

      result!.confirm(verificationCode as string).then(async status => {

        if(status.operationType !== "signIn"){
      
          alert("Add country code (Eg. 65)")
          setVerifying(false)
          return
        }

        const myUUID = status.user?.uid
        const myPhoneNumber = status.user?.phoneNumber

        if(myPhoneNumber){
          localStorage.setItem(phoneNumber, myPhoneNumber)
        }

        const referrerId = sessionStorage.getItem(REFERRER_STORAGE_KEY);
        const createdTime = status.user?.metadata.creationTime

        await saveReferrerId(referrerId, createdTime);

        await logined(myUUID, myPhoneNumber)

        setVerifying(false)
   

      }).catch(() => {
        setMsg("Wrong verification code")
        setVerifying(false)
      
      })
    }
  };

  async function saveReferrerId(referrerId: string | null, createdTime: string | undefined) {
    try {
      const createdTimeBuffer = 300000; // 5 minutes

      if (!referrerId || !createdTime || Date.now() - Date.parse(createdTime) > createdTimeBuffer) {
        return
      }

      const url = `${backEndUrl}/v1/referrals/save`
      const token = await auth.currentUser?.getIdToken();

      await axios.post(url, {
        referrerId: referrerId
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      sessionStorage.removeItem(REFERRER_STORAGE_KEY);
    } catch (error) {
      console.log(error);
    }
  }

  async function logined (myUUID: string | null, myPhoneNumber: string | null) {
    const noCache = (new Date().getTime())

    if(myUUID){

      localStorage.setItem(myUid, myUUID)


      const myCountryCode = countryCode

      setCurrentUser({countryCode: myCountryCode})
      if(myCountryCode) localStorage.setItem(country, myCountryCode)

      
      if(openBabeSignup){
        window.location.href = `/page/Admin?uid=${myUUID}&babe=true&no=${noCache}`
      }else if(openAdminPage){
        window.location.href = `/page/Admin?uid=${myUUID}&no=${noCache}`
      }else if (openSubscribePage){

        // to make sure that user will get their customer id
        setTimeout(() => {
          window.location.href = `/Subscribe?uid=${myUUID}&no=${noCache}`
        }, 1000)

      }else if (openSession){
        window.location.href = `/page/Rent?session=${openSession}&apply=true&no=${noCache}`

      }else if(openVerify){
        window.location.href = `/${openVerify}`
        
      }else if(chooseServices){
        window.location.href = `/page/setuplocation`
      }else if(goToLink){
        window.location.href = goToLink
      }else if(dontRedirect){
        
      }
      else{
        window.location.href = `page/Rent?no=${noCache}`
      }
    }else{
      window.location.href = `page/Rent?no=${noCache}`
    }
  }

  const onChangeHandle = (event: ChangeEvent<HTMLInputElement>, checked: boolean) => {
    setAgeLimit(checked)
  } 

  useEffect(() => {

    setLoading(true)

    getRedirectResult(auth)
    .then(async (result) => {

      if(!result) {
        setLoading(false)
        return
      }

      // This gives you a Google Access Token. You can use it to access Google APIs.
      const credential = GoogleAuthProvider.credentialFromResult(result)

      if(!credential) {
        setLoading(false)
        return
      }

      const myUUID = result.user.uid;
      if(myUUID){

        setVerifying(true)
        setGoogle(true)

        const referrerId = sessionStorage.getItem(REFERRER_STORAGE_KEY);
        const createdTime = result.user?.metadata.creationTime

        await saveReferrerId(referrerId, createdTime);

        await logined(myUUID, null)

        setVerifying(false)
        setGoogle(false)
      }
      
      setTimeout(() => {
        setLoading(false)
      }, 500)
 
      // IdP data available using getAdditionalUserInfo(result)
      // ...
    }).catch((error) => {
      console.log(error)
      if(error.code === "auth/credential-already-in-use"){
        setMsg("Gmail is already in used")
      }
      setLoading(false)
    })

    const controller = new AbortController()
    const { signal } = controller;

    const myDefaultPhoneCode = helper.getDefaultPhoneCode();
    const API = ipgeolocationAPIKEYS.shuffle()[(Math.random() * ipgeolocationAPIKEYS.length) | 0];
   
    fetch(`https://api.ipgeolocation.io/ipgeo?apiKey=${API}`, 
    { signal })
    .then(async (data) => {

      const jsonData = await data.json()

      const countryName = jsonData.country_name

      try{
        logEvent(analytics, AnalyticsNames.ipaddress, {
          country_type: countryName,
          content_type: countryName,
          item_id: countryName, 
        })  
      }catch{}
      const countryCode = jsonData.country_code2
      if(countryCode){
        setCountryCode(countryCode)
        localStorage.setItem(country, countryCode)
        setCurrentUser({countryCode: countryCode})
      }else{
        setCountryCode(myDefaultPhoneCode)
      }
      
    }).catch(() => {
      setCountryCode(myDefaultPhoneCode)
    })

    return () => {
      controller.abort(); // abort on unmount for cleanup
    };
// eslint-disable-next-line
  }, [])

  if(isLoading) return <CenterFlexBox>
    <LoadingScreen/>
  </CenterFlexBox>
  else { // @ts-ignore
    // @ts-ignore
    // @ts-ignore
    return (

        <div>
          <div>

          <div className = "center-main">
            <Card className="card">

            {verifying && <LinearProgress color="secondary" />}

            <div className="center">

            <div>
                <div className="center">
                  <img  height = "156px" width = "156px" src = "https://images.rentbabe.com/assets/rentblogo.svg" alt="rentbabe logo"/>
                  <Typography variant="caption" color = "error" >{msg}</Typography>
                </div>

              </div>

            </div>

            <div id="recaptcha-container" className = "center" ></div>
              <CardContent>

                <div >
                {!countryCode && <LinearProgress color="secondary"/>}
              <PhoneInput
                onKeyDown ={(e) =>{
                  if(e.keyCode === ENTER_KEY_CODE && ageLimit){
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

              {/*  </PhoneInput>*/}

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


                <FormControlLabel control={<Checkbox checked={ageLimit}  color='secondary' onChange={onChangeHandle} />} label={<DialogContentText fontSize={14}>I am 18 and above</DialogContentText>} />

                <div className="btn-container">
                  <Button variant="contained"  color="secondary"  disabled = {result !== undefined || !ageLimit || google} onClick= {sendPressed}>Send</Button>
                  <Button variant="contained"  color="secondary" disabled = {result === undefined || verifying || google} onClick={verifyPressed}>Verify</Button>
                  <Button  variant="contained" color="secondary"  disabled = {result === undefined || google} onClick={() => {window.location.reload()}}>RETRY</Button>
                </div>

                <br/>
                <Divider />
                <br/>

                  <Button
                    fullWidth
                    disabled={google || verifying}
                    startIcon={
                      <img
                      width={21}
                      height={21}
                      src="https://images.rentbabe.com/assets/logo/google.svg"
                      alt=""
                      />
                    }
                    variant="contained"
                    color="primary"
                    onClick={googleSignInClick}
                  >
                  Sign {openAdminPage ? "up" : "in"} with Google

                  </Button>

                  {/* <Button color="primary" variant="contained" fullWidth
                  disabled={google || verifying}
                  startIcon={
                    <img
                    width={21}
                    height={21}
                      src="https://images.rentbabe.com/assets/logo/google.svg"
                      alt=""
                    />
                  }
                  endIcon={
                    <>
                      {google && <CircularProgress size={12} color="secondary"/>}
                    </>
                  }
                    onClick={googleSignInClick}></Button> */}

              </CardContent>
            </Card>

          </div>

          <br/>

          <div className = "center-main">
            <p className = "policy-label" >By signing up, you agree to our <a href = "/Terms" target = "_blank" >Terms</a> and that you have read our <a href = "/Privacy" target = "_blank">Data Use Policy</a></p>
            <p className = "policy-label" >Promoting illegal commercial activities is prohibited.</p>
          </div>

          </div>

        </div>

      );
  }
}


export default LoginPage;