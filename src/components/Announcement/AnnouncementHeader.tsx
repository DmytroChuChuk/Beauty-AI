import { 
    FC, 
    useEffect, 
    useRef, 
    useState, 
    ChangeEvent 
} from 'react';

import { 
    CircularProgress, 
    Button, 
    Snackbar, 
    LinearProgress, 
    Avatar,
    Typography,
    Box,
    TextField
} from '@mui/material';

import { 
    deleteDoc, 
    doc, 
    DocumentData, 
    getDoc, 
    onSnapshot, 
    QueryDocumentSnapshot, 
    setDoc, 
    Timestamp 
} from 'firebase/firestore';

import shallow from 'zustand/shallow';

import { 
    additional_info, 
    admin, 
    apply_time_stamp, 
    customer_id, 
    reject_reason, 
    status, 
    nickname as nicknameKey, url,
    USERS, ANNOUNCE, sender as senderKey, 
    telegram_message_id, 
    time_stamp, 
    services, 
    date, 
    activity, 
    time, 
    location, 
    additional_fees, 
    category} from '../../keys/firestorekeys';

import { useUser } from '../../store';

import history from '../../utility/history';
import SendBroadcast from '../Dialogs/Rent/SendBroadcast';

import './AnnouncementHeader.scss'
import CloseAnnouncementDialog from '../Dialogs/Rent/CloseAnnouncementDialog';
import { Announcement } from '../../utility/Announcement';
import FlexGap from '../Box/FlexGap';
import CenterFlexBox from '../Box/CenterFlexBox';
import { ServiceType } from '../../keys/props/services';
import { Helper } from '../../utility/Helper';
import { useTranslation } from 'react-i18next';
import { sendTelegramNotificationToAdmin } from '../../keys/filters';
import { country } from '../../keys/firestorekeys';
import { channels } from '../../enum/MyEnum';

interface props {
    id: string
    db: any
    profiles: number
    removed: number
    serviceCallBack: (service: ServiceType | undefined, serviceId: number | undefined) => void
    msgCallBack: (msg: string) => void
}

const AnnouncementHeader: FC<props> = ({id, db, profiles, removed, serviceCallBack, msgCallBack}) => {

    const { t } = useTranslation()
    const [myUid, isAdmin, myNickname, state] = useUser((state) => [
        state.currentUser?.uid, 
        state.currentUser?.isAdmin, 
        state.currentUser?.nickname,
        state.currentUser?.state], shallow)

    const helper = new Helper()
    const announcementHelper = new Announcement()
    const [openBroadcast, setBroadcast] = useState<boolean>(false)
    const [open, setOpen] = useState<boolean>(false)

    const isApply = helper.getQueryStringValue("apply") === "true"

    function getStatusMessage (index: number | undefined) {

        switch (index) {
            case 0:
                return 'Searching...'
        
            case 1: 
                return 'FOUND, JOB CLOSED'

            default: 
                return 'Searching...'
        }

    }

    const openBroadcastClick = () => {
        setBroadcast(true)
    }
    
    const closeBroadcastClick = () => {
        setBroadcast(false)
    }

    const [countryState, setCountry] = useState<number>()

    const [telegramMessageID, setTelegramMessageID] = useState<number>()

    const [serviceType, setServiceType] = useState<ServiceType>()

    const [data, setData] = useState<QueryDocumentSnapshot<DocumentData>>()

    const [msg, setMsg] = useState<string>()
    const [nickname, setNickname] = useState<string>()
    const [profileImage, setProfileImage] = useState<string>()
    const [sender, setSender] = useState<string>()
    const [toastMessage, setToastMessage] = useState<string>()
    const [getStatus, setStatus] = useState<number | undefined>()

    const [profileNumber, setProfileNumber] = useState<number>(0)
    const [profilesRemoved, setProfileRemoved] = useState<number>(removed)

    const [isLoading, setLoading] = useState<boolean>(false)
    const [showToast, setToast] = useState<boolean>(false)

    useEffect(() => {

        setProfileNumber(profiles)
        setProfileRemoved(removed)

    },[profiles, removed])

    const info = useRef<string>()

    function successfullyApplied() {
        setToastMessage("Apply success!")
        setToast(true)
    }

    function cannotApply(msg : string = "Cannot apply, please try again") {
        setToastMessage(msg)
        setToast(true)
        setLoading(false)
    }

    const onClose = () => {
        setToast(false)
    }

    const onCloseDialog = () => {
        setOpen(false)
    }


    useEffect(()=>{
        setLoading(true)

        const unsub = onSnapshot(doc(db, ANNOUNCE, id) , (snapShot) => {

            setLoading(false)

            if(!snapShot.exists()) return

            const _serviceType = snapShot.get(services) as ServiceType | undefined
            const _serviceId = snapShot.get(category) as number | undefined

            const _status = snapShot.get(status) as number
            const _nickname = snapShot.get(nicknameKey) as string
            const _url = snapShot.get(url) as string
            const _otherUid = snapShot.get(senderKey) as string
            const _telegramMessageID = snapShot.get(telegram_message_id) as number
            const _country = (snapShot.get(country) as number) ?? 0
            
            setData(snapShot)
            setServiceType(_serviceType)

            const post = announcementHelper.convertToAnnouncementMsg(snapShot)
            
            msgCallBack(post)

            if(_nickname) setNickname(_nickname)
            if(_url) setProfileImage(_url)
            if(_otherUid) setSender(_otherUid)
         
            setCountry(_country)
            setTelegramMessageID(_telegramMessageID)
            setMsg(post)

            if(_status !== undefined) setStatus( _status )

            serviceCallBack(_serviceType, _serviceId)            

        })
     
       return () => {
            unsub()
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[])

    const removeOnClick = async () => {

        setLoading(true)

        if(myUid){
            
            await deleteDoc(doc(db, ANNOUNCE, id, USERS, myUid))

            setToastMessage("Removed")
            setToast(true)

            window.location.reload()
        }

        setLoading(false)
    }
    const applyOnClick = async () => {

        const sg = "Singapore"
        const kl = "Kuala Lumpur"
        const sen = "Client is looking for someone who is currently staying in "
        if(state){
            if(serviceType === ServiceType.meetup){
                if(countryState === channels.GLOBAL_SG){
                    if(state !== sg){
                        cannotApply(`${sen}${sg}`)
                        return
                    }
                }else if(countryState === channels.KL_ONLY){
                    if(state !== kl){
                        cannotApply(`${sen}${kl}`)
                        return
                    }
                }
            }
        }

        setLoading(true)

        if(!myUid) {
            history.push("/Login", {openSession: id})
            return
        }

        try{

            const profile = await getDoc(doc(db, USERS, myUid ))
            if ( profile.exists() ){

                // check if this person is listed on the website
                const _admin = (profile.get(admin) as boolean) ?? false
                const _timeStamp = profile.get(time_stamp) as Timestamp

                if(!_admin){
                    cannotApply("Cannot apply, you are not a rentbabe member")
                    setLoading(false)
                    return
                }else if(_admin && !_timeStamp){
                    cannotApply("Inactive profile can't apply, switch to LIVE")
                    setLoading(false)
                    return
                }

                let promises: Promise<any>[] = []
                var map = profile.data()

                delete map[reject_reason]
                delete map[customer_id]

                if(!profile.get(apply_time_stamp)){
                    const date = new Date();

                    date.setDate(date.getDate() - 2);

                    map[apply_time_stamp] = Timestamp.fromDate(date) // serverTimestamp()
                }
                const update = setDoc(doc(db, ANNOUNCE, id, USERS, myUid), map , {merge: true})
                promises.push(update)

                if(info.current){
                    map[additional_info] = info.current

                    const profileLink = `${window.location.origin}/Profile?uid=${myUid}` 
                    
                    const send = sendTelegramNotificationToAdmin(
                        `Announcement info: ${info.current}\n\n${profileLink}`)
                    if(send) {
                        promises.push(send)
                    }
                }

                await Promise.all(promises)

                successfullyApplied()
                //window.location.reload()

            } else{
                cannotApply()
            }

        }catch (error) {
            cannotApply()
        }
  
        setLoading(false)      
    }

    const onChange = (e :ChangeEvent<HTMLTextAreaElement>) => {
        info.current = ((e.target as HTMLTextAreaElement).value)
    }

    const profileClick = () => {
        const profileURL = `${window.location.origin}/Profile?uid=${sender}`
        window.open(profileURL, "_blank")
    }

    return <div className='wrapper'>
        
        <div>

            <div className="talk-bubble round tri-right left-in">

            <div className='flex align-center'>
                {profileImage ? <Avatar
                    onClick={profileClick} 
                    src={profileImage?.toCloudFlareURL() ?? ""}
                    alt=""
                    sx={{ width: 56, height: 56, marginLeft: "1em", marginRight: ".5em", cursor: "pointer" }}/> : null}
                {nickname ? <b>{nickname}</b> : null}
            </div>

                <div className="talktext">
                    {!isLoading ? <p>{msg}</p> : null}
                    {(isLoading && !isAdmin) ? <CircularProgress className="loading" color = "secondary"/> : null}
                    
                </div>
            </div>

            {(isAdmin || isApply) && <Box maxWidth={280} className='announcement-wrapper' style={{opacity:  !isLoading ? 1: 0.32}}> 

                {isLoading && <LinearProgress color = "secondary"/>}

                <div className='apply-wrapper'>
                    <Button disabled = {isLoading} className='apply-btn' variant='contained' onClick={applyOnClick}>APPLY</Button>
                    <Button  disabled = {isLoading} className='remove-btn' variant='contained' onClick={removeOnClick}>REMOVE</Button>
                </div>

                <p className = "apply-label" >Additional information to client</p>

                <div className='apply-wrapper'>
                    <TextField 
                        fullWidth
                        helperText={<Typography variant='inherit' color="error">{t("rules.warning")}</Typography>} 
                        disabled = {isLoading} 
                        rows={4} 
                        onChange={onChange}
                    />
                </div>

                {/* <Typography color='error' variant='caption'>
                    {t("rules.warning")}
                </Typography> */}


            </Box> }

            {!isAdmin && <Box className='announcement-wrapper flex justify-center align-center'>

                <div>
                    <div className='flex justify-center align-center'>
                        {getStatus === 1 ? <p>{getStatusMessage(getStatus)}</p> : <div>
                            <p>Searching... <CircularProgress size={12} color = 'secondary'/></p>
                        </div> }
                    </div> 

                    <br/>

                    <div className='flex justify-center align-center'>
                        <div>
                            {isLoading ? null : <p style={{textAlign: "center"}}>{profileNumber} profile{profileNumber === 0 ? "" : "s"} {profileNumber === 0 ? "has" : "have"} applied</p>}
                            {isLoading || !profilesRemoved  ? null : <p style={{textAlign: "center"}}>{profilesRemoved} profile{profilesRemoved === 0 ? "" : "s"} {profilesRemoved === 0 ? "is" : "are"} not available anymore</p>}
                        </div> 
                    </div> 

                    <br/>

                </div> 
            </Box> }



            {
                (myUid === sender && getStatus === 0) && <CenterFlexBox marginTop="1rem">
                <Button variant='contained' color="warning" onClick={openBroadcastClick}>UPDATE</Button>
                <FlexGap/>
                <Button variant='contained' color="error" onClick={() => setOpen(true)}>FOUND</Button>
            </CenterFlexBox>
            } 
            <br/>
        </div>

        <Snackbar
            anchorOrigin={{
                vertical: "bottom",
                horizontal: "center"
            }}
            open={showToast}
            message = {toastMessage}
            onClose={onClose}
            autoHideDuration={2000}/>
            
        {
            myUid &&
                <SendBroadcast 
                serviceType={serviceType} 
                documentID={id} 
                prevCabfare={data?.get(additional_fees)}
                preVenue={data?.get(location)}
                preDate={data?.get(date)}
                preActivity={data?.get(activity)}
                preTime={data?.get(time)}
                prevInfo={data?.get(additional_info)}
                message_id ={telegramMessageID} 
                open={openBroadcast} 
                handleClose = {closeBroadcastClick}
            />
        }


        <CloseAnnouncementDialog 
            id={id} 
            nickname={myNickname}
            telegramMessageID={telegramMessageID} 
            msg={msg} 
            country={countryState ?? 0}
            open={open} 
            onClose={onCloseDialog}        
        />

    </div>
}

export default (AnnouncementHeader);
