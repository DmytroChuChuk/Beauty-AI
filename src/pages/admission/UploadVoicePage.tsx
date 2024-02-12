import { Card, CardHeader, Box, Typography } from '@mui/material';
import { doc, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import shallow from 'zustand/shallow';
import VoicePanel from '../../components/adminpage/panels/VoicePanel';
import CenterFlexBox from '../../components/Box/CenterFlexBox';
import FlexBox from '../../components/Box/FlexBox';
import { USERS, voice_url } from '../../keys/firestorekeys';
import { useUser } from '../../store';
import { db, storage } from '../../store/firebase';
import history from '../../utility/history';
import { version } from '../../version/basic';
import AdmissionButton from './components/AdmissionButton';
import ApplyDescription from './components/ApplyDescription';
import { RecorderProps } from '../../components/audio/src/Pages/Recorder';

interface props {
    data: any
}

const UploadVoicePage : FC<props> = ({data}) => {

    const [ t ] = useTranslation()

    const [uid, isAdmin] = useUser((state) => [
        state?.currentUser?.uid, 
        state?.currentUser?.isAdmin
    ], shallow)

    const [voiceUrl, setVoiceUrl] = useState<string | undefined>(data?.get(voice_url) as string)
    const [errorMessage, setErrorMessage] = useState<string>("")
    const [isLoading, setLoading] = useState<boolean>(false)
    const [voiceDetails, setVoiceDetails] = useState<RecorderProps | null>()

    useEffect(() => {
        if(isAdmin){
            window.location.href = `/page/Admin?uid${uid}`
        }
        // eslint-disable-next-line
    }, [isAdmin])

    const onVoiceHandle = (data: RecorderProps | null) => {
        setErrorMessage("")
        setVoiceDetails(data)
    }

    const onClickNext = async () => {
        if(isLoading){
            return
        }

        setErrorMessage("")
        
        if(!uid){
            window.location.href = "/Login"
            return
        }


        function goToNext(){
            history.push(`/page/setupbasic?v=${version}`)
        }

        if(!voiceDetails && !voiceUrl){
            // no longer require anymore...
            goToNext()
            //setErrorMessage("Voice recording is required.")
            return
        }
        if(!voiceDetails && voiceUrl){
            //user did not record anything, we keep the previous url
            goToNext()
            return
        }
        // validation
        const blob = voiceDetails?.blob
        const fileType = voiceDetails?.fileType
        if(!blob){
            return
        }

        const uploadRef = ref(storage, `VOICE/${uid}/${Date.now()}.wav`)
        const type = fileType ? {type: fileType} : {}
        const file = new File([blob], "filename", type)

        const uploadVoice = uploadBytes(uploadRef, file).then(async (uploadTask) => {
            
            var url = await getDownloadURL(uploadTask.ref) as string
            const today = new Date()
            const seconds = voiceDetails.duration as number

            const voiceUrl =`${url.toCloudFlareURL()}&t=${today.getTime()}&duration=${seconds}`
            setVoiceUrl(voiceUrl)
            return voiceUrl
        })

        setLoading(true)

        try{

            const voiceUrl = await uploadVoice
            await updateDoc(doc(db, USERS, uid) , {
                [voice_url]: voiceUrl
            }) 

            setLoading(false)
            goToNext()

        }catch(error){
            setErrorMessage(`${error}`)
        }

        setLoading(false)

    }
    const openVoiceRule = () => {
        history.push("/voicerule")
    }

    return <FlexBox justifyContent="center" height="100vh" bgcolor="#efeff3" paddingTop={4}>

        <Card style={{width: "100%", maxWidth: 500, minWidth: 330, height: 550, position: "relative"}}>

            <CardHeader
                title={t("upload.voice")}
                subheader={
                    <Typography sx={{textDecoration: 'underline', cursor: "pointer"}} color="secondary" onClick={openVoiceRule}>
                       {t('voice.rules')}
                    </Typography>
                }
            />

            <Box padding={2}>
                <VoicePanel
                    hideRule 
                    expanded={true} 
                    voiceUrl={voiceUrl}
                    onVoiceHandle={onVoiceHandle}
                />
            </Box>

        </Card>

        <CenterFlexBox bgcolor="white" position="fixed" bottom={0} left={0} right={0} flexDirection="column" padding={4}>
       
       {errorMessage && <Typography color="error" variant="caption">{errorMessage}</Typography>}

       <AdmissionButton 
           index={4} 
           isLoading={isLoading} 
           onClickNext={onClickNext}                
       />

       <ApplyDescription/>

       {/* <Button 
           fullWidth 
           color="secondary" 
           onClick={onClickNext}
           variant='contained'
       >{isLoading ? <CircularProgress size={24}/> : "Next 3/5"}</Button> */}

    </CenterFlexBox>

    </FlexBox>
 
}

export default UploadVoicePage