import { Box, Button, LinearProgress, TextField } from '@mui/material';
import { deleteField, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { FC, useState } from 'react';
import { genderEnum } from '../../../enum/MyEnum';
import { reject_reason, time_stamp, USERS, privacy_time_stamp, admin} from '../../../keys/firestorekeys';
import { sendPushNotificationFunction, sendTelegramNotificationFunction } from '../../../keys/functionNames';
import { APNSTokenProps } from '../../../store';
import { db, functions } from '../../../store/firebase';
import { generateFirebaseDynamicLink } from '../../../utility/GlobalFunction';
import { useTranslation } from 'react-i18next';

interface props {
    dob: string | number | null | undefined
    geoEncoding: string[] | null | undefined
    profileImage: string | undefined
    getTeleId: string | undefined
    babeAPNSToken: APNSTokenProps | undefined
    uid: string
    nickname: string | null | undefined
    userGender: genderEnum
    onClose?: () => void
}

const Approvals : FC<props> = ({dob, geoEncoding, profileImage, nickname, getTeleId, babeAPNSToken, uid, userGender, onClose}) => {

    const defaultReason = "Your application has been REJECTED as the media that you provided are unclear. We need a clear photo of your face. All photos and videos MUST be insta-worthy quality, do not put all those extra decorations that covers your face.\n\nPlease resubmit your application by clicking 'Be a Babe'."
    const [ t ] = useTranslation()
    const [loading, setLoading] = useState<boolean>(false)
    const [rejectedReason, setRejectedReason] = useState<string>(defaultReason)
  
    const onRejectedReason = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> ) => {
  
      const value = event.currentTarget.value    
      setRejectedReason(value)
  
    }

    const approveClick = async () => {
  
  
      setLoading(true)
  
      let map : {[key: string] : any} = {
  
        [admin]: true,
        [reject_reason]: deleteField(),
        [time_stamp]: serverTimestamp()
      }
      
  
      let promiseArray : any[] = []
  
      // update Doc 
      const sendTelegramMessage = httpsCallable(functions, sendTelegramNotificationFunction);
      promiseArray.push(updateDoc(doc(db, USERS, uid) , map)) 
  
      // notify user
      let welcome = `@RentBabe.: Hi, ${nickname}. Your profile is now listed on our website.`

      // const baseURI = "https://firebasedynamiclinks.googleapis.com/v1"
      // const url = `${baseURI}/shortLinks?key=${config.apiKey}`;
  
      // let profile = `https://rentbabe.com`
      // profile += `/Profile?uid=${uid}`
  
      // const response = await fetch(url, {
      //   "method": "POST",
      //   "headers": {
      //     "content-type": "application/json"
      //   },
      //   "body": JSON.stringify( {"dynamicLinkInfo": { 
  
      //     "domainUriPrefix": "https://rentbabe.com/user",
      //     "link": profile,
          
      //     "socialMetaTagInfo" :{
      //       "socialImageLink": profileImage,
      //       "socialTitle": nickname,
      //       "socialDescription": "Check me out at this Rent a Friend, Rent a Date platform."
      //     }} , "suffix": {
      //     "option": "SHORT"
      //   }} )
      // });
  
      // const data = await response.json();
      // const link = data.shortLink;

      const link = await generateFirebaseDynamicLink(
        uid, 
        nickname, 
        dob,
        geoEncoding,
        profileImage,
        `${t("social.descrip")}`)

      const channel = userGender === 0 ? "https://t.me/+mn4Nse0cJZJmYWI1" : "https://t.me/+UqyowRDB0IhiYzY1"

      welcome += `\n\nJoin our Babes Private Telegram Channel to get tips, last min meetups, latest updates and more. ${channel}`
      welcome += `\n\nPromote your profile ${link} on your social media to get Orders now!`  
  
      if(getTeleId) {
        promiseArray.push(sendTelegramMessage({
          tele_id: getTeleId,
          text: encodeURIComponent(welcome)
        }))
      }

      promiseArray.push(sendTelegramMessage({
        tele_id: "858353262",
          text: encodeURIComponent(welcome)
        }))    

      if(babeAPNSToken){
        const sendPushNotification = httpsCallable(functions, sendPushNotificationFunction);
        promiseArray.push(sendPushNotification({
          token: babeAPNSToken,
          title: "Official Admin",
          body: `Hi, ${nickname}. You are now an official EBuddy Member.`,
        }))
      }
      
      try{
        await Promise.all(promiseArray)
      }catch(error){
        console.log(error)
      }

  
      setLoading(false)
      onClose?.()
    
    }
    
    const rejectClick = async () => {
  

      if(!rejectedReason) return
  
      setLoading(true)
  
      let promiseArray : Promise<any>[] = []
  
      promiseArray.push(
          
      updateDoc(doc(db, USERS, uid) , {
        [reject_reason]: rejectedReason,
        [admin]: deleteField(),
        [time_stamp]: deleteField(),
        [privacy_time_stamp]: deleteField()
      }))
      const sendTelegramMessage = httpsCallable(functions, sendTelegramNotificationFunction);
      if(getTeleId) {
        promiseArray.push(sendTelegramMessage({
          tele_id: getTeleId,
          text: encodeURIComponent(rejectedReason)
        }))
      }

      if(babeAPNSToken){
        const sendPushNotification = httpsCallable(functions, sendPushNotificationFunction);
        promiseArray.push(sendPushNotification({
          token: babeAPNSToken,
          title: "Official Admin",
          body: rejectedReason,
        }))
      }

      promiseArray.push(sendTelegramMessage({
        tele_id: "858353262",
        text: encodeURIComponent(rejectedReason)
      }))    
  
      try{
        await Promise.all(promiseArray)
      }catch(error) {
        console.log(error)
      }
  
      setLoading(false)
      onClose?.()
    }

    return <Box padding="0 16px 16px 16px">

      {loading && <LinearProgress color="secondary" />}
        
        <br/>

        <p className='padding'>{getTeleId ? getTeleId : "No notification"}</p>

        <div className='flex justify-center align-center'>

        <Button disabled = { loading } onClick={approveClick} variant='contained' color='success'>
            APPROVE
        </Button>

        <Button sx={{marginLeft: '16px'}} disabled = { loading }
        onClick={rejectClick} variant='contained' color='error'>REJECT</Button>

        </div>

        <br/>

        <div className='flex justify-center align-center padding'>
        <TextField
            fullWidth
            defaultValue={rejectedReason}
            multiline
            onChange={onRejectedReason}
            placeholder={t("rejected.reason")}
            color='secondary'
            variant='outlined'
            rows={4}
        />
        </div>


    </Box>
 
}

export default Approvals