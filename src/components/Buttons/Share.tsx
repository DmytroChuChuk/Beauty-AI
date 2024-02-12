import Button, { ButtonProps } from '@mui/material/Button/Button';
import { logEvent } from 'firebase/analytics';
import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { analytics } from '../../store/firebase';
import { AnalyticsNames } from '../../keys/analyticNames';
import { useUser } from '../../store';
import shallow from 'zustand/shallow';
import { Helper } from '../../utility/Helper';
import { CircularProgress } from '@mui/material';
import ShareProfileDialog from '../Dialogs/Profile/ShareProfileDialog';
import { generateFirebaseDynamicLink } from '../../utility/GlobalFunction';

interface props extends ButtonProps {
  onCloseDialog?: () => void
} 

const Share : FC<props> = ({onCloseDialog, ...props}) => {

    const helper = new Helper()
    const { t } = useTranslation()

    const [
        uid, 
        myNickname,
        profileImage,
        dob,
        currentAtWhichCountry

    ] = useUser((state) => [
        state.currentUser?.uid ?? helper.getQueryStringValue("uid") ?? "",
        state.currentUser?.nickname,
        state.currentUser?.profileImage,
        state.currentUser?.dateOfBirth,
        state.currentUser?.state
    ], shallow);
    
    const [loadingShare, setLoadingShare] = useState<boolean>(false)
    const [shareLink, setShareLink] = useState<string>()

    const onCloseHandle = () => {
      onCloseDialog?.()
      setShareLink(undefined)
    }

    const copySharedLink = async ()=>{

        if(loadingShare){
            return
        }

        try{
            logEvent(analytics, AnalyticsNames.buttons, {
              content_type: "admin share button",
              item_id: "admin share button", 
            })  
        }catch{}
                        
        // const title = `${myNickname} | RentBabe`;
        // const previewImage = profileImage
    
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
        //       "socialImageLink": previewImage,
        //       "socialTitle": title,
        //       "socialDescription": "Check me out at this Rent a Friend, Rent a Date platform."
        //     }} , "suffix": {
        //     "option": "SHORT"
        //   }} )
        // });
    
        // const data = await response.json();
        // const link = data.shortLink;
    
        // if(link){
        //   try{
        //     logEvent(analytics, "share", {
        //       method: "myself",
        //       content_type: myNickname ?? "user",
        //       item_id: uid,
        //     })  
        //   }catch{}
        // }
    
        setLoadingShare(true)

        const link = await generateFirebaseDynamicLink(
          uid, 
          myNickname,
          dob ? helper.ageFromDateOfBirthday(new Date(parseInt(dob))) : undefined,
          currentAtWhichCountry ? [currentAtWhichCountry] : undefined, 
          profileImage,
          `${t("social.descrip")}`)

        if(link){
          try{
            logEvent(analytics, "share", {
              method: "myself",
              content_type: myNickname ?? "user",
              item_id: uid,
            })  
          }catch{}
        }

        setShareLink(link)
        setLoadingShare(false)
    
      }


    return <>
        <Button
        fullWidth
        onClick={copySharedLink} 
        endIcon={loadingShare && <CircularProgress size={12} />} 
        color="warning" 
        variant="contained"
        {...props}
        >
            {t("shareprofile.label")}
        </Button>

        <ShareProfileDialog 
            url={shareLink}
            open={shareLink ? true : false}
            onClose={onCloseHandle}
        />
    
    </>
 
}

export default Share