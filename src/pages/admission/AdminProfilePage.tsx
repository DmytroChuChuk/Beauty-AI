import { FC, useRef, useEffect } from 'react'

import * as keys from "../../keys/firestorekeys"
import * as storageKeys from "../../keys/storagekeys"

import {
    url as urlKey, 
    admin as adminSKey,
    inactive as inactiveSKey,
    adminPageTab
} from "../../keys/localStorageKeys"

import { auth, firebaseApp, functions } from "../../store/firebase"
import { storage } from "../../store/firebase"
import { genderEnum } from '../../enum/MyEnum'

import { 
    getDownloadURL, 
    getStorage, 
    ref, 
    uploadBytes 
} from "firebase/storage"

import { 
    collection, 
    deleteField, 
    doc, 
    DocumentData, 
    DocumentSnapshot, 
    getDocs, 
    limit, 
    query, 
    serverTimestamp, 
    setDoc, 
    Timestamp, 
    updateDoc, 
    where
} from "firebase/firestore"

import { Helper } from '../../utility/Helper'

import { 
    Button, 
    Select, 
    Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
    MenuItem,
    Accordion, AccordionDetails,
    Typography, 
    Box,
    TextField,
    Tabs,
    Tab,
    FormControl,
    InputLabel,
    CardHeader,
    Avatar
} from '@mui/material'

import useState from 'react-usestateref'

import { db } from '../../store/firebase'
import { useUser } from '../../store';

import shallow from 'zustand/shallow';

import Compressor from 'compressorjs'

import '../scss/AdminProfilePage.scss'


import PhotoPanel from '../../components/adminpage/panels/PhotoPanel';
import VideoPanel from '../../components/adminpage/panels/VideoPanel';
import VoicePanel from '../../components/adminpage/panels/VoicePanel';

import AdminPhotos from '../../components/adminpage/components/AdminPhotos'
import Nickname from '../../components/adminpage/components/Nickname';
import DateOfBirth from '../../components/adminpage/components/DateOfBirth';
import ReviewReject from '../../components/adminpage/components/ReviewReject';

import { AdminAccordionSummary } from '../../components/adminpage/components/AdminAccordionSummary';
import AccordionIcon from '../../components/adminpage/components/AccordionIcon';
import AdminInput from '../../components/adminpage/components/AdminInput';
import ReviewForm from '../../components/Reviews/ReviewForm';

import GoNowDialog from '../../components/Dialogs/Rent/GoNowDialog'
import BroadcastList from '../../components/Announcement/BroadcastList'
import { useTranslation } from 'react-i18next'
import BlockUserPanel from '../../components/adminpage/panels/BlockUserPanel'
import { httpsCallable } from 'firebase/functions'
import OrientationInput from '../../components/Inputs/OrientationInput'
import { TelegramLink } from '../../keys/contactList'
// import AttireRule from '../../components/Dialogs/Rule/AttireRule'
import ServicesPanel from '../../components/adminpage/panels/ServicesPanel'
import { servicesProps } from '../../keys/props/services'
import { ServicesHelper } from '../../utility/ServicesHelper'
import FlexGap from '../../components/Box/FlexGap'
import CenterSnackBar from '../../chats/components/Snackbar/CenterSnackBar'
import SelectRace from '../../components/adminpage/components/SelectRace'
import { PriceLimitProps } from '../../components/Services/PriceLimit'
import MobileTooltip from '../../components/Tooltip/MobileTooltip'
import DeleteAccountDialog from '../../components/Dialogs/basic/DeleteAccountDialog'
import AdminPageFooter from './components/AdminPageFooter'
import CenterFlexBox from '../../components/Box/CenterFlexBox'
import FlexBox from '../../components/Box/FlexBox'
import PrivacyPanel from '../../components/adminpage/panels/PrivacyPanel'
import GmailPanel from '../../components/adminpage/panels/GmailPanel'
import InstagramVerificationPanel from '../../components/adminpage/panels/InstagramVerificationPanel'
import GovIDPanel from '../../components/adminpage/panels/GovIDPanel'
import LocationPanel from '../../components/adminpage/panels/LocationPanel'
import history from '../../utility/history'
import { messenger, nsfw, sendTelegramNotificationToAdmin } from '../../keys/filters'
import TelegramNotificationPanel from '../../components/adminpage/panels/TelegramNotificationPanel'
import { useWindowSize } from '../../hooks/useWindowSize'
import EmeetsPanel from '../../components/adminpage/panels/EmeetsPanel'
import Share from '../../components/Buttons/Share'
import { getRedirectResult, GoogleAuthProvider } from 'firebase/auth'
import ActiveSwitchPanel from '../../components/adminpage/panels/ActiveSwitchPanel'
import StatusTag from '../../components/menuList/components/StatusTag'
import TelegramAlert from '../../components/Notifications/TelegramAlert'
import { RecorderProps } from '../../components/audio/src/Pages/Recorder'
import { BabeButton } from '../../components/Buttons'
import ReferralDialog from '../../components/Dialogs/Profile/ReferralDialog';

interface props {
    data: DocumentSnapshot<DocumentData> | undefined;
}

const AdminProfilePage: FC<props> = ({data}) => {

    enum dialogIndexEnum{
        deleteVoiceUrl = 1,
        isg = 2,
        deleteAccount = 3,
        loading = 4,
        warning = 5
    }

    enum tabEnum {
        profile="profile",
        privacy="privacy",
        media="media",
        location="location",
        chats="chats",
        notification="notification"
    }

    enum panels {
        voice = "voice",
        photo = "photo",
        video = 'video',
        location = 'location',
        security = 'security',
        switches = 'switches',
        bank = 'bank',
        block = 'block',
        inactive = 'inactive',
        general = 'general',
        additional = 'additional',
        price = "price",
        services = "services",
        gmail = "gmail",
        isg = "isg",
        gov = "gov",
        notification="notification"
    }
    
    const maxWidth = 500
    const helper = new Helper();
    const serviceHelper = new ServicesHelper()
    const join = (helper.getQueryStringValue("babe") === "true");

    //const history = useHistory();

    const { t } = useTranslation();
    const setUser = useUser((state) => state.setCurrentUser);

    
    const [
        isPremium, 
        isAdmin, 
        uid, 
        myNickname,
        currentUser,
        isVerified,
        doesUserHasCreditDocument
    ] = useUser((state) => [
        state.currentUser?.isPremium, 
        state.currentUser?.isAdmin, 
        state.currentUser?.uid ?? helper.getQueryStringValue(keys.uid) ?? "",
        state.currentUser?.nickname,
        state.currentUser,
        state.currentUser?.verified,
        state.currentUser?.hasCreditDocument
    ], shallow);

    const [ size ] = useWindowSize()
    const [tab, setTab] = useState<string>( localStorage.getItem(adminPageTab) ?? tabEnum.profile )

    const uploadingFiles = useRef<Map<string,File>>(new Map());
    const readerMap = useRef<Map<string,FileReader>>(new Map());
    const uploadingVideos = useRef<Map<string,File>>(new Map());

    const [openDeleteDialog, setDeleteDialog] = useState(false)
    const [openReferralDialog, setReferralDialog] = useState(false)

    const defaultUrls = helper.configureURL(data, join, isAdmin)
    const [urls, setUrls] = useState<string[]>(defaultUrls)

    const [mobileUrlState, setMobileUrlState, mobileUrl] = useState<string | undefined>(
        data?.get(keys.mobileUrl) as string ?? defaultUrls.length > 0 ? defaultUrls[0] : undefined
    )

    useEffect(() => {
        setMobileUrlState(data?.get(keys.mobileUrl) as string ?? urls.length > 0 ? urls[0] : undefined)
         // eslint-disable-next-line 
    }, [urls])

    useEffect(() => {
        getRedirectResult(auth).then((result) => {
          if(!result){
              return
          }
          const credential = GoogleAuthProvider.credentialFromResult(result);
          if (credential) {
              // Accounts successfully linked.
              const user = result.user
              const _email = user.email
              if(user.email){
                  setToastMsg(`Logined with ${user.email}`)
                  setShowToast(true)
              }
  
              if(_email){
                  localStorage.setItem(keys.email, _email)
                  setUser({email: user.email})
                  setToastMsg("Gmail connected")
                  setShowToast(true)
              }else {
                  localStorage.removeItem(keys.email)
                  setUser({email: undefined})
                  setToastMsg("Connection error")
                  setShowToast(true)
              }
          }
        }).catch((error) => {
          console.log(error.code)
          if(error.code === "auth/credential-already-in-use"){
            setToastMsg("Gmail is already in used")
            setShowToast(true)
          }
        })
        // eslint-disable-next-line
      }, [])


    const [videos, setVideos, videoRef] = useState<string[]>( data?.get(keys.cache_video_urls) as string[] ??  ["", ""])
    const [voiceDetails, setVoiceDetails] = useState<RecorderProps | null>(null);
    const [nickname, setNickname] = useState<string | undefined>(data?.get(keys.nickname) as string)
    const [bio, setBio] = useState<string>(data?.get(keys.bio) as string)
    const [orientationArray, setOrientationArray] = useState<string[]>( data?.get(keys.orientation) as string[] )

    const priceState = (data?.get(keys.price) as number)
    //const [priceLimit, setPriceLimit] = useState<PriceLimitProps | undefined>(data?.get(keys.priceLimit) as PriceLimitProps)
    // const [services, setServices] = useState<servicesProps | undefined>()

    const priceLimit = data?.get(keys.priceLimit) as PriceLimitProps | undefined
    const services = data?.get(keys.services) as servicesProps | undefined

    const [food, setFood] = useState<string>(data?.get(keys.foodPref) as string)
    const [genderState, setGender] = useState<number | undefined>( data?.get(keys.gender) as number  )
    const [height, setHeight] = useState<number>(data?.get(keys.height) as number)
    
    const _race = data?.get(`${keys.race}2`) as {[key: string] : boolean}
    const _raceKeys = _race ? Object.keys(_race).length > 0 : false
    const _raceK = _raceKeys ? Object.keys(_race)[0] : undefined

    const [raceState, setRace] = useState<string | undefined>(_raceK)

    const [availability, setAvailability] = useState<string>(data?.get(keys.availability) as string)

    const [isChecked, setChecked] = useState<boolean>( 
        data?.metadata.hasPendingWrites ? true : (data?.get(keys.time_stamp) as Timestamp ) ? true : false
    )
  
    const [loadingStatus, setLoadingStatus] = useState<boolean>(false)

    const numOfRents = useRef<number>(data?.get(keys.number_of_rents) as number ?? data?.get(keys.cache_number_of_rents) as number)

    const [voiceUrl, setVoiceUrl, voiceUrlRef] = useState<string | undefined>(data?.get(keys.voice_url) as string)

    const [area, setArea] = useState<string>();

    const [alertTitle, showAlertTitle] = useState<string>()
    const [alertInfo, setAlertInfo] = useState<string>()
    const [showAlert, setAlert] = useState(false)

    const [openReview, setOpenReview] = useState<boolean>(false)

    const dialogIndex = useRef<dialogIndexEnum | undefined>()

    const [DOB, setDOB] = useState<Timestamp | undefined>(data?.get(keys.dob) as Timestamp)


    const [goNowBio, setGoNowBio] = useState<string | undefined>(helper.amIFreeToday(data?.get(keys.end) as Timestamp) ? data?.get(keys.gonow_bio) as string : undefined)
    
    const [isBlock, setBlock] = useState<boolean>((data?.get(keys.gonow_block) as boolean) ?? false);

    const [toastMsg, setToastMsg] = useState<string>("Saved")
    const [showToast, setShowToast] = useState<boolean>();
    
    const [showGoNow, setGoNow] = useState<boolean>(false)
    const [buttonName, setButtonName] = useState<string>()
    
    const [isg, setIsg] = useState<string | undefined>(data?.get(keys.isg_access_token) as string)

    const [isgUsername, setIsgUsername] = useState<string>()

    const rejectedReason : string | undefined  = (data?.get(keys.reject_reason) as string)

    const width_height_array =  useRef<{[key : number] : string }>({})
    const video_width_height_array =  useRef<{[key : number] : string }>({})

    const [privacy, setPrivacy] = useState<number>(data?.get(keys.privacy) as number ?? 0)

    function openAlert(index:dialogIndexEnum, title: string, info: string){
        dialogIndex.current = index

        switch (index) {
            case dialogIndexEnum.deleteAccount:
                setButtonName("Delete")
                break;

            case dialogIndexEnum.deleteVoiceUrl:
                setButtonName("Delete")
                break;

            case dialogIndexEnum.isg:
                setButtonName("Disconnect")
                break;
        
            default:
                break;
        }

        showAlertTitle(title)
        setAlertInfo(info)
        setAlert(true)
    }

    const onChangeTabHandler = (event: React.SyntheticEvent, newValue: string) => {
        setTab(newValue)
        localStorage.setItem(adminPageTab, newValue)
    }

    const executeDialog = async () =>  {

        switch (dialogIndex.current) {

            case dialogIndexEnum.deleteVoiceUrl:
                if(!uid){
                    break
                }
                
                await updateDoc(doc(db, keys.USERS, uid) , {[keys.voice_url] : deleteField()})
                setVoiceUrl(undefined)

                setAlert(false)

                break;

            case dialogIndexEnum.isg:

                await updateDoc(doc(db, keys.USERS, uid) , {[keys.isg_access_token] : deleteField()})
                setIsg(undefined)
                window.location.href = ""

                setAlert(false)

                break;
                    
            default:
                break;
        }
    }

    const onChangeDOB = (d : Date | undefined) => {
        if(d) setDOB(Timestamp.fromDate(d))
    }

    const closeDialog = (event?: any, reason?: any) => {
        if (reason && reason === "backdropClick") return;
        setAlert(false) 
    }

    const EndComponent = () => {
        return  <AdminPageFooter
            join = {join}
            isAdmin = {isAdmin}
            loadingStatus = {loadingStatus}
            myNickname={myNickname}
            onSaveButtonClick={save}
            onDeleteButtonClick={() => setDeleteDialog(true)}
        />
    }

    const mainForm = () => {
        return <Box >

        <Nickname 
            myUid={uid}
            currentNickname={nickname} 
            disabled={false} 
            onSuccess={(nick) => {
                setNickname(nick)
            }}
        />

        <br/>
        
        <TextField
            margin='dense' 
            fullWidth
            type="text"  
            color="secondary"
            label={t("availability.label")}
            placeholder={t("availability.example")}
            defaultValue={availability} 
            onChange={(e) => {
                setAvailability((e.target as HTMLInputElement).value)
            }}
        />

        <br/>
        <br/>

        <Box display="flex">

            <DateOfBirth DOB={DOB} onChange={onChangeDOB} />
            <FlexGap/>
            <TextField
                color="secondary"
                fullWidth
                label={`${t("height.label")} (cm)`}
                type="number" 
                style={{maxWidth: "200px"}} 
                placeholder='160' 
                defaultValue={height} 
                onChange={(e) => {
                    setHeight((e.target as HTMLInputElement).valueAsNumber)
                }}
            />
        </Box>

        <br/>

        <FlexBox>

            <FormControl fullWidth>
                <InputLabel color="secondary">{t("gender.label")}</InputLabel>
                <Select color="secondary"
                        size='small' 
                        label={t("gender.label")} 
                        defaultValue={genderState} 
                        placeholder="Select One" 
                        onChange={e => {
                            const v = e.target.value as number;
                            setGender(v)
                        }}>
                            <MenuItem value={genderEnum.female}>Female</MenuItem>
                            <MenuItem value={genderEnum.male}>Male</MenuItem>
                </Select> 
            </FormControl>

            <FlexGap/>
            <FlexGap/>

            <FormControl fullWidth>
                <InputLabel color='secondary'>{t("ethnicity.label")}</InputLabel>
                <SelectRace
                    label={t("ethnicity.label")}
                    color='secondary'
                    selected={raceState}
                    onChange={e => {
                        const v = e.target.value as string;
                        setRace(v)
                    }}
                />
            </FormControl>
        </FlexBox>
    </Box>};
    
    const [connectISG, setConnect] = useState(false)

    async function connectToInstagram () {
        const isg_code = helper.getQueryStringValue("code")

        if(isg_code ){
            setConnect(true)
            setExpanded(panels.isg)

            try{

                const isgGenerator3 = httpsCallable(functions, "isgGenerator3");

                const redirect = window.location.origin === "http://localhost:3000" 
                ? "https://localhost:3000/Admin" : `${window.location.origin}/page/Admin`;

                const res = await isgGenerator3({
                    isgCode: isg_code,
                    redirect: redirect
                });
        
                const data = res.data as any;
                const accessToken = data.access_token


                setUsername(accessToken)
    
                setToastMsg("Instagram connected")
                setShowToast(true)

            }catch(error){
                setToastMsg("Error, cannot connect")
                setShowToast(true)
            
            }
        }

        setConnect(false)
    }

    useEffect(() => {
        // helper.recentlyActive(isActive, isAdmin, uid)
        setProfile()
        connectToInstagram()
    }, [])  // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {

        if(data?.metadata.hasPendingWrites) {
            return
        }

        const isCheck = (data?.get(keys.time_stamp) as Timestamp)  ? true : false
        setChecked(isCheck)

        const _voiceUrl = data?.get(keys.voice_url) as string
        setVoiceUrl(_voiceUrl)
        // eslint-disable-next-line
    }, [data])

    useEffect(() => { 
        setUrls(helper.configureURL(data, join, isAdmin))
        // eslint-disable-next-line 
    }, [isAdmin])

    function setUsername (_isg : string) {
        setIsg(_isg)
        if (_isg) {
            //set isg username
            const isgUrl = `https://graph.instagram.com/me?fields=username&access_token=${_isg}`
            fetch(isgUrl).then(response => response.json())
            .then(data => data.username === undefined ? setIsgUsername("Please reconnect") : setIsgUsername("@" + data.username))
            .catch(() => {
                setIsgUsername("Please reconnect!")
            })                
        }
    }

    function setProfile(){

        // const admin = data?.get(keys.admin) as boolean | undefined
        const geoEncodings = data?.get(keys.geoEncodings) as string[]
        const _end = data?.get(keys.end) as Timestamp
        const _gonow = data?.get(keys.gonow_bio) as string
        const isg_code = helper.getQueryStringValue("code")
        
        let _area = ""

        function getArea (value : string) {
            if (_area === "") _area += value
            else _area += `, ${value}`
        }

         if(geoEncodings && geoEncodings.length !== 0 && Array.isArray(geoEncodings)){

            geoEncodings?.forEach((value) => {
                getArea(value)
            })

            setArea(_area)
        }

        const free = helper.amIFreeToday(_end)
        if(free) setGoNowBio(_gonow)

        if(isg_code === "" && isg) setUsername(isg)

    }

    async function uploadImage(uploadImageRef: any, result: Blob, key : number , folder:string) : Promise<void>{
        
        return uploadBytes(uploadImageRef, result).then(async (uploadTask) => {
            
            var url = await getDownloadURL(uploadTask.ref) as string

            const d = width_height_array.current[key]

            
            if (url) {
                const now = new Date()
      
                const imageURL = `${url}?${d}&t=${now.getTime()}`.toCloudFlareURL()

                if(folder === storageKeys.MOBILE)
                {
                    setMobileUrlState(imageURL)
                
                }else{
                    setUrls((prev) =>  {
                        let array = prev
                        array[key] = imageURL

                        return array
                    })
                   
                }
            }
        }).catch((error) => {
            console.log(error)
            setToastMsg(`Photo ${key + 1} cannot be uploaded`)
            setShowToast(true)
        })
        
    }

    function uploadPhoto(folder: string, file: File, key:number): Promise<void>{
        return new Promise((resolve, reject) => {
            let ext = file.name.slice((file.name.lastIndexOf(".") - 1 >>> 0) + 2)
            // const _storage = storageKeys.MOBILE ? getStorage(firebaseApp, "gs://rentb-sg-small-images") : storage

            const uploadImageRef = ref(storage, (`${folder}/${uid}/${new Date().getTime()}_${key}.${ext}`))
    
            const _maxHeight = folder ===  storageKeys.MOBILE ? Infinity : 1500
            const _maxWidth = folder === storageKeys.MOBILE ? 500 : 1200
    
            new Compressor(file, {
                maxHeight: _maxHeight,
                maxWidth: _maxWidth,
                quality: 0.85,
                async success(result){
               
                    await uploadImage(uploadImageRef, result, key, folder)
                    resolve()
                },
                async error(){
                    uploadImage(uploadImageRef, file, key, folder)
                    reject("error")
                }
            })

        })
    }

    function validation():string | null{

        if(!isAdmin){

            const errorMessage = helper.validateNickname(nickname)
            if(errorMessage) return errorMessage

        }

        const hasService = helper.serviceValidation(services)

        if(!availability) return "Availability is required" 
        
        else if(!DOB) return "Date of birth is required" 
        
        else if(raceState === undefined) return "Ethnicity is required" 
        
        else if (!area) return "Location is required" 

        else if (!hasService) return "Service/Price is required" 

        else if (genderState === undefined) return "Gender is required"

        
        const errorMessage = helper.validateDOB(DOB.toDate())
        if(errorMessage) return errorMessage

        return null
    }


    function validatePhotos () : string | null {
        if(validateNumberOfPhotos(urls)) return "Fill up all 6 photos"
        return null
    }

    function validateNumberOfPhotos (urls : string[]) : boolean{
        var countPhoto = 0

        for (let index = 0; index < urls.length; index++) {
            const url = urls[index];
            if(url !== ""){
                countPhoto += 1
            }
        }

        countPhoto += uploadingFiles.current.size
        
        return (countPhoto < urls.length)
    }

    function totalValidation() : string | null{

        const _validatePhotos = validatePhotos()

        if(_validatePhotos !== null) return _validatePhotos

        const _validate = validation()
 
        if(_validate !== null) return _validate
        
        return null
    }

    const save = async () => {

        function get(){
            const errorMessage = validatePhotos() 
            ?? helper.validateNickname(nickname) 
            ?? helper.validateDOB(DOB?.toDate()) 
            ?? helper.validateBio(bio)
            ?? helper.validateGender(genderState)

            if(errorMessage) return (errorMessage)
        }

        function updateAsBabe () {
            if(isAdmin === false || isAdmin === true){
                return true
            }else if (join){
         
                return true
            }else if (isPremium) {
                // this is premium user
                return false
            }else if (!join && uid){
                // this is when user wants to just Rent a Date
                return false
            }
        }

        function update(){
            updateAsBabe() ? updateLast() : updateLastPrem() 
        }
    
        let msg = updateAsBabe() ? totalValidation() : get()


        if(msg){
            openAlert(dialogIndexEnum.warning, isAdmin ? "Cannot save profile" : "Cannot create profile" , msg)
            return 
        }

        if( !isAdmin || ( !myNickname && isPremium) ){ 
    
            const snap = await getDocs(query(collection(db, keys.USERS) 
            , where(keys.nickname, "==" , nickname) 
            , limit(1))) 

            if(snap.docs.length !== 0){
                const _uid = snap.docs[0].id
                if(_uid !== uid){
                    const msg = `${nickname} is not available already. Please try again.`

                    openAlert(dialogIndexEnum.warning, "Not available" , msg)

                    return
                }
                
            }
        }

        openAlert(dialogIndexEnum.loading, "Do not close" , 
        "This might take some time, please wait!")

        let promises : Promise<void> [] = []
        const blob = voiceDetails?.blob
        if(voiceDetails && blob){

            // let meme = ""
            // if(voiceDetails.chunks.length !== 0){
            //     meme = (voiceDetails.chunks[0].type)
            // }
            const fileType = voiceDetails?.fileType
            //const ext = fileType ? `.${fileType}` : ""
            const uploadRef = ref(storage, `VOICE/${uid}/${Date.now()}.wav`)
            const type = fileType ? {type: fileType} : {}
            const file = new File([voiceDetails.blob], "filename", type)

            const uploadVoice = uploadBytes(uploadRef, file).then(async (uploadTask) => {
                
                var url = await getDownloadURL(uploadTask.ref) as string
                
                const today = new Date()
                const seconds = voiceDetails.duration as number
                // const min = voiceDetails.duration.m as number
    
                // const total = `${(min * 60) + seconds}`

                const voiceUrl =`${url.toCloudFlareURL()}&t=${today.getTime()}&duration=${seconds}`

                setVoiceUrl(voiceUrl)
     
            })

            promises.push(uploadVoice)
        }

        if(uploadingFiles.current.has("0")){
            
            let key:number = 0
            let file:File = uploadingFiles.current.get("0")!

            const uploadSmallPhoto =  uploadPhoto(storageKeys.MOBILE,file, key)
            promises.push(uploadSmallPhoto)

        }

        let map = uploadingFiles.current
        for (let entry of Array.from(map.entries())) {
            let key = parseInt(entry[0])
            let file:File  = entry[1]

            const uploadOriginalPhoto = uploadPhoto(storageKeys.TOD_PROFILES_IMAGES , file, key)
            promises.push(uploadOriginalPhoto)
        }

        let videoMap = uploadingVideos.current
        for (let entry of Array.from(videoMap.entries())) {

            let key:number = parseInt(entry[0])
            let file:File = entry[1];

            let ext = file.name.slice((file.name.lastIndexOf(".") - 1 >>> 0) + 2);


            const storage = getStorage(firebaseApp, "gs://rentb-sg-videos");

            const now = (new Date()).getTime()
            const uploadVideoRef = ref(storage, `video/${uid}/${key}.${ext}`);

            const uploadVideos = uploadBytes(uploadVideoRef, file).then(async (uploadTask) => {
                
                let url = await getDownloadURL(uploadTask.ref) as string
                const d = video_width_height_array.current[key]
                if (url) {
                    const videoURL = `${url}?${d}&t=${now}`
                    setVideos((prev) => {
                        const array = prev
                        array[key] = videoURL
                        return array
                    })
                }
     
            })

            promises.push(uploadVideos)
        }

        try{
            await Promise.all(promises)
            update()
        }catch(error){
            console.log(error)
            setAlert(false)
            setToastMsg(`${error}`)
            setShowToast(true)
        }
    }

    async function updateLastPrem(){

        const msg =  "Saved";
        
        // isApproved ? "Saved" : "Submitted. Please wait for review"

      
        uploadingFiles.current = new Map()
        // setUploadingFiles(new Map())
        setUrls(urls) 

        let map : { [id:string] : any } = 
        {
         [keys.bio] : bio,
         [keys.nickname] : nickname, 
         [keys.mobileUrl] : mobileUrl.current, 
         [keys.dob]: DOB,
         [keys.urls] : urls 
        }

        if(genderState !== undefined){
            map[keys.gender] = genderState
            setUser({gender: genderState.toString()})
        }

        if(nickname){
            localStorage.setItem(keys.nickname, nickname)
            setUser({nickname: nickname})
        } 

        if(mobileUrl.current) {
            localStorage.setItem(urlKey, mobileUrl.current)
            setUser({profileImage: mobileUrl.current})
        }

        const promise = checkForThirdParty(bio)
        let promises = []

        try{
            if(promise) promises.push(promise)
            const upload = setDoc(doc(db, keys.USERS, uid) , map, { merge: true }) 
            promises.push(upload)
            //await setDoc(doc(db, keys.USERS, uid) , map, { merge: true }) 

            await Promise.all(promises)

            setAlert(false)
            setToastMsg(msg)
            setShowToast(true)
        }catch(error){
            setToastMsg(`ERROR: ${error}`)
            setShowToast(true)
        }
    }

    async function updateLast(){
        
        const msg = (isAdmin === undefined) ? "Submitted. Please wait for review" : "Saved"

        //reset
        uploadingFiles.current = new Map()
        uploadingVideos.current = new Map()
        
        width_height_array.current = {}
        video_width_height_array.current = {}

        let state = ""
        let _area : string[] = []

        area?.split(', ').forEach((value) => {
            if(state === "") state = value
            _area.push(value)
        })


        var map : { [id:string] : any } = 
        {
            [keys.urls]: urls, 
            [keys.cache_video_urls]: videoRef.current,
            [keys.nickname]: nickname?.toLowerCase(),
            [keys.dob]: DOB,
            [keys.geoEncodings]: _area,
            [keys.state] : state,
            [keys.privacy]: privacy,
            [keys.reject_reason] : deleteField()
        }


        if(genderState !== undefined) {
            map[keys.gender]  = genderState
        }

        if(raceState !== undefined){
            map[`${keys.race}2`] = {
                [raceState] : true
            }
        }

        if(height) map[keys.height] = height
        else map[keys.height] = deleteField()
        
        if(availability) map[keys.availability]  = availability

        if(services){
            map[keys.services]  = services
        } else map[keys.services]  = deleteField()

        if(priceLimit){
            map[keys.priceLimit]  = priceLimit
        } else map[keys.priceLimit]  = deleteField()

        if(food) map[keys.foodPref]  = food
        else map[keys.foodPref]  = deleteField()

        if(orientationArray && orientationArray.length > 0) map[keys.orientation]  = orientationArray
        else map[keys.orientation]  = deleteField()
        

        if(mobileUrl.current){
            map[keys.mobileUrl]  = mobileUrl.current
            localStorage.setItem(urlKey, mobileUrl.current)
            setUser({ profileImage: mobileUrl.current})
        }
        
        if(voiceUrlRef.current) {
            map[keys.voice_url] = voiceUrlRef.current 
        }else{
            map[keys.voice_url] = deleteField()
        } 
        
        let isSubmitting = false
        if(isAdmin === undefined || isAdmin === null){
            
            map[keys.admin] = false 
            isSubmitting = true

        }else if (isAdmin && isChecked) {
            map[keys.time_stamp] =  serverTimestamp() 
        }

        let bios = ""

        if(services){
            const values = Object.values(services)
            for (let index = 0; index < values.length; index++) {
                const value = values[index]
                const _services = Object.values(value)

                for (let index = 0; index < _services.length; index++) {
                    const _ser = _services[index]
                    if(typeof _ser !== "string"){
                        const detail = _ser.bio
                        if(detail) bios += `${detail} `
                    }
                }
            }
        }

        const content = `${availability} ${bios} ${food}`
        const promise = checkForThirdParty(content)
        
        let promises = []
        
        try{    

            const upload = updateDoc(doc(db, keys.USERS, uid) , map) 
            promises.push(upload)
            if(promise) {
                promises.push(promise)
            }
            //await updateDoc(doc(db, keys.USERS, uid) , map) 
            await Promise.all(promises)

            if(isSubmitting){
                setUser({isAdmin:false})
                localStorage.setItem(adminSKey, String(false))
            }

            setToastMsg(msg)

        }catch(error){
            setToastMsg(`${error}`)
        }finally{
            setAlert(false)
            setShowToast(true)
        }

    }

    function checkForThirdParty(content: string | undefined): Promise<void> | undefined{

        if(!content){
            return undefined
        }

        const filter = content.replace(/[^a-zA-Z ]/g, "").toLowerCase()
        const link = `${window.location.origin}/Profile?uid=${uid}` 

        let selected = ""
        if (messenger.some((word) => {
            selected = word
            return filter.includes(word)
        })){
            return sendTelegramNotificationToAdmin(`${link} doing off-platform transaction [${selected}]\n\n${filter}`)
        }else if (nsfw.some((word) => {
            selected = word
            return filter.includes(word)
        })){
            return sendTelegramNotificationToAdmin(`${link} doing NSFW request [${selected}]\n\n${filter}`)
        }
        
        return undefined
    }


    const fileUploaded = (e:React.ChangeEvent<HTMLInputElement>) => {
        const element = e?.target as HTMLInputElement
        let files = (element).files

        if (files !== null && files.length !== 0){

            const selectedIndex = (element).id
            const intIndex = parseInt(selectedIndex) 

            const maxNumOfPhoto = 6
            const totalPhotos = intIndex + files.length
            const diff = totalPhotos - maxNumOfPhoto
            
            for (let i = 0; i < files.length; i++) {

                //const selectedIndex = (e?.target as HTMLInputElement).id
                if(i >= (files.length - diff)){
                    continue
                }
                
                const index = files.length > 1 ? (i + intIndex).toString() : selectedIndex
                const file = files[i]
                
                if (FileReader && files && files.length) {
                   
                    readerMap.current.set(index, new FileReader())

                    readerMap.current.get(index)!.onload = function() {

                        const imgtag = (document.getElementById("img-" + index.toString()) as HTMLImageElement);
                    
                        let src = readerMap.current.get(index)!.result as string      

                        imgtag.onload = () => {

                            const width = imgtag.naturalWidth;
                            const height = imgtag.naturalHeight;
                            
                            width_height_array.current[parseInt(index)] =  `${keys.url_width}=${width}&${keys.url_height}=${height}` 

                            readerMap.current.delete(index)
                        
                        };
    
                        imgtag.src = src
                        
                    };
    
                    uploadingFiles.current.set(index,file)
                    //setUploadingFiles(uploadingFiles)
    
                    readerMap.current.get(index)!.readAsDataURL(file);
    
                }
            }
        }
    }

    const videoUploaded = (e:React.ChangeEvent<HTMLInputElement>) => {

        let index = (e?.target as HTMLInputElement).id
        let files = (e?.target as HTMLInputElement).files


        if (files !== null && files.length !== 0){

            let file = files[0]

            const num = 5

            if (file.size > (1048576 * num)) // 2 MiB for bytes.
            {   
                openAlert(dialogIndexEnum.warning, "File size too big" , `File size must under ${num}MB`)
                return;
            }

            if (FileReader && files && files.length) {

                var vidTag = document.getElementById(`vid-${index}`) as HTMLVideoElement;
      
                const URL = window.URL || window.webkitURL
                const src = URL.createObjectURL(file) 
                vidTag.src = src

                vidTag.onload = function() {
                    URL.revokeObjectURL(src);
                }
                          
                vidTag.ondurationchange = function (evt) {
                    //window.URL.revokeObjectURL(vidTag.src);

                    let duration  = (evt.currentTarget as HTMLMediaElement).duration;
                    const max = 10.0 // CAREFUL IF YOU CHANGE THIS VIDEO, you must compare with previous uploaded video
                    const min = 1.0

                    if ( duration > max  ||  duration < min) {


                        const title = (duration > max) ? "Too long" : "Too short"
                        const description = (duration > max) ? "Must be less than 5 seconds" : "Must be more than 1 second"
                        
                        openAlert(dialogIndexEnum.warning.valueOf() , title, description)
                  
                        const url = videoRef.current[parseInt(index)]
                  
                        vidTag.src =  !url ? "https://images.rentbabe.com/assets/gif/selfie.mp4" : url.toCloudFlareURL()
                     
                    }else{

                        const width = vidTag.videoWidth
                        const height = vidTag.videoHeight
    
                        const meta = `&${keys.url_width}=${width}&${keys.url_height}=${height}`
                        video_width_height_array.current[parseInt(index)] = meta
                    
                        uploadingVideos.current.set(index,file)

                    }
                }
            }
        }
    }


    const mediaSection = () => { 

        return <>
            <PhotoPanel  
                expanded={expanded === panels.photo} 
                onChange={handleChange(panels.photo)}
                validateNumberOfPhotos={validateNumberOfPhotos(urls)}
                urls={urls}
                uploadFile={fileUploaded}
            />

            <VoicePanel 
                expanded={expanded === panels.voice} 
                onChange={handleChange(panels.voice)} 
                voiceUrl={voiceUrl}
                onVoiceHandle={onVoiceHandle}
            />

            <VideoPanel 
                expanded = {expanded === panels.video} 
                onChange = {handleChange(panels.video)}
                videos = {videos}
                upload = {videoUploaded}
            />  
        </>
    }


    const locationSection = () => { 

        return <LocationPanel 
                area={area}
                expanded={expanded === panels.location} 
                onChange={handleChange(panels.location)}
                geoInputOnChange={() => setArea(undefined)}
                onPlaceSelected={(formatted_address) => {
                    console.log(formatted_address)
                    if(formatted_address) setArea(formatted_address)
                }}
            />
        
    }

    const clientProfileSection = () => {
        return <>
            <Nickname 
                myUid={uid}
                currentNickname={nickname} 
                disabled={ false }  
                onSuccess={(nick) => {
                    setNickname(nick)
                }}
            />

            <br/>

            <FlexBox> 

                <DateOfBirth DOB={DOB} onChange={onChangeDOB} />

                <FlexGap/>

                <FormControl fullWidth>
                    <InputLabel color="secondary">{t("gender.label")}</InputLabel>
                    <Select color="secondary" 
                            size='small'
                            label={t("gender.label")} 
                            defaultValue={genderState} 
                            placeholder="Select One" 
                            onChange={e => {
                                const v = e.target.value as number;
                                setGender(v)
                            }}>
                                <MenuItem value={genderEnum.female}>Female</MenuItem>
                                <MenuItem value={genderEnum.male}>Male</MenuItem>
                    </Select> 
                </FormControl>
            </FlexBox>

            <br/>
            
            <TextField
                fullWidth
                color="secondary"
                label={t("bio.label")}
                rows={3}
                maxRows={3}
                placeholder="Write something about yourself..." 
                defaultValue={bio} 
                onChange={(e) => {
                    setBio((e.target as HTMLTextAreaElement).value)
                }}
            />
        </>
    }

    const profileSection = () => { 

        return <>

            <ServicesPanel 
                priceLimit={priceLimit}
                services={ services ?? serviceHelper.createDefault(priceState, bio)}
                expanded={expanded === panels.services} 
                onChange={handleChange(panels.services)}
                // onAddPriceLimit={(limit) =>
                //     setPriceLimit(limit)
                // }
                // onChangeServices={(data) => {

                //     // console.log(data)
                
                //     // setServices(prev => {
                //     //     return {...prev, ...data}
                //     // })
        
                // }}
                children={<></>}
            />

            {(services 
            && Object.keys(services).includes("1")) && <EmeetsPanel/>}

            <Accordion expanded={expanded === panels.general} onChange={handleChange(panels.general)}>

                <AdminAccordionSummary>

                    <AccordionIcon src="https://images.rentbabe.com/assets/admin/admin_settings.svg" />
                    <Typography marginLeft={3} className="secondaryHeading">{t('profile.info')}</Typography>

                </AdminAccordionSummary>

                <AccordionDetails>
                    {mainForm()}
                </AccordionDetails>

            </Accordion>

            <Accordion  expanded={expanded === panels.additional} onChange={handleChange(panels.additional)}>
                <AdminAccordionSummary>

                    <AccordionIcon src="https://images.rentbabe.com/assets/admin/admin_settings.svg" />
                    <Typography marginLeft={3} className="secondaryHeading">{t("add.info.label")}</Typography>

                </AdminAccordionSummary>

                <AccordionDetails>

                    <Box>
                    <OrientationInput 
                        value={orientationArray} 
                        onSelect={(value) => {
                            console.log(value)
                            setOrientationArray(value)
                        }}            
                    />

                    <br/>
                    <br/>

                    <AdminInput label='Food Preferences' placeholder="Examples: Halal, Seafood allergic"
                        defaultValue={food} onChange={(e) => setFood((e.target as HTMLInputElement).value)}/>  

                    </Box>

                </AccordionDetails>

            </Accordion>

            <Accordion sx={{width: "100%"}} onClick={() => window.open(TelegramLink, '_blank')}>
                <AdminAccordionSummary>
                    <AccordionIcon src="https://images.rentbabe.com/assets/admin/admin_ask.svg" />
                    <Typography marginLeft={3} className="secondaryHeading">{t("qna")}</Typography>
                </AdminAccordionSummary> 
            </Accordion>
        </>
    }

    const securitySection = () => {
        return <>
        
        {isAdmin && <PrivacyPanel 
            expanded={expanded === panels.security}
            onChange={handleChange(panels.security)} 
            privacy={privacy} 
            onChangePrivacy={(e => {
                const value = e.target.value as number
                setPrivacy(value)
            })}        
        />}

        {isAdmin && <ActiveSwitchPanel 
            loadingStatus={loadingStatus}
            isChecked={isChecked}
            expanded={expanded === panels.switches}
            onChange={handleChange(panels.switches)}
            onSwitchChange={onSwitchChange}
        />}

        <GmailPanel
            expanded={expanded === panels.gmail} 
            onChange={handleChange(panels.gmail)}
        />

        <InstagramVerificationPanel 
            isg={isg}
            isgUsername={isgUsername}
            connectISG={connectISG}
            expanded={expanded === panels.isg} 
            onChange={handleChange(panels.isg)}
            onClickInstagram={onClickInstagram}
        />

        <GovIDPanel
            expanded={expanded === panels.gov} 
            onChange={handleChange(panels.gov)}
            isVerified={ data?.get(keys.video_verification) as boolean } 
            myUID={uid} 
            rejectedReasonAfter={data?.get(keys.reject_reason_after) as string | undefined}  
        />
        
        </>
    }

    const dialogComponent = () => {
        return <Dialog  
        open = {showAlert} 
        onClose={closeDialog}>
            
            <DialogTitle>{alertTitle}</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {alertInfo}
                </DialogContentText>
            </DialogContent>
    
            <DialogActions >

                {dialogIndex.current !== dialogIndexEnum.loading &&
                    <Button variant="contained" color="secondary"  onClick={closeDialog} >
                    cancel
                </Button>}

                {dialogIndex.current === dialogIndexEnum.loading || dialogIndex.current === dialogIndexEnum.warning ?  null : 
                <Button style={{backgroundColor: "red"}} variant="contained" color="secondary" onClick={executeDialog} >
                    {buttonName}
                </Button>}

            </DialogActions>
        </Dialog>
    }


    const onSwitchChange = async (_ : any , checked : boolean) => {

        if(loadingStatus){
            return
        }

        setLoadingStatus(true)

        let map : any = {}

        map[keys.time_stamp] = !checked ? deleteField() : serverTimestamp()

        if(!checked){
            // swtiching to INACTIVE
            // map[keys.number_of_rents] = deleteField()
            map[keys.price_filter] = deleteField()
            map[keys.privacy_time_stamp] = deleteField()
            map[keys.sortByPricing] = deleteField()
            map[keys.sortByRatings] = deleteField()

            const del = helper.deleteAllServicesPricing(services)
            if(del) {
                map = {...map, ...del}
            }

        }else if(checked) {
            // swtiching to active
            if(numOfRents.current){

                const ori = data?.get(keys.number_of_rents) as number 
                const prev = data?.get(keys.cache_number_of_rents) as number

                if(ori && prev){
                    map[keys.number_of_rents] = ori + prev
                }else{
                    map[keys.number_of_rents] = numOfRents.current
                }
            }

            map[keys.cacheTimestamp] = deleteField()
            map[keys.cache_number_of_rents] = deleteField() 

            if(services){
                const updateServices = helper.update(currentUser)
                if(updateServices) map = {...map, ...updateServices}
            }

        }

        updateDoc(doc(db, keys.USERS, uid), map).finally(() => {

            if(!checked){
                localStorage.removeItem(inactiveSKey)
                setUser({isActive : false})
                setChecked(false)
            }else{
                localStorage.setItem(inactiveSKey, "true")
                setUser({isActive : true})
                setChecked(true)

            }

            setTimeout(() => {
                setLoadingStatus(false)
            }, 500)

        })
    }

    const onVoiceHandle = (e: RecorderProps | null) => {
        setVoiceDetails(e)
        if(!e){
            setVoiceUrl(undefined)
        }
    }

    const [expanded, setExpanded] = useState<string | boolean>(false)
  
    const handleChange = (panel: string) => (_ : any, isExpanded : boolean) => {
      setExpanded(isExpanded ? panel : false);
    }

    const onClickInstagram = () => {

        if(!isg){
            const baseURI = "https://api.instagram.com/oauth/authorize?";
            const queries = "scope=user_profile,user_media&response_type=code";
            const client_id = "client_id=341745065475112";

            const isg_url = `${baseURI}${client_id}&redirect_uri=${window.location.origin}/page/Admin&${queries}`
            
            window.open(isg_url, "_self")
            
        }else{
            //connected - ask for disconnection permission 
            openAlert(dialogIndexEnum.isg, "Disconnect" , 
            "This might reduce your number of rents. Instagram connection helps to prove your identity.")
        }

    }

    const getReviewForm = () => {
        return <ReviewForm 
                myUrl={mobileUrlState}
                uid = {uid} 
                open={openReview} 
                onClose = {() => setOpenReview(false)}
            />
    }

    const getReferralDialog = () => {
        return <ReferralDialog
            open={openReferralDialog}
            onClose = {() => setReferralDialog(false)}
            />
    }

    const openProfile = () => {
        //window.location.href =
        history.push( `./Profile?uid=${uid}`)
        //window.open(`./Profile?uid=${uid}`, "_blank")
    }


    const getClientProfileReview = (addBottomMargin : boolean = false) => {
        return <Box marginLeft="16px">
                <FlexBox>
                    <Box marginBottom={addBottomMargin ? 1.5 : 0}>
                        <p 
                        style={{width: "60px"}}
                        onClick={openProfile}
                        className = "view-profile-text orange-background">Profile 
                        <img src= "https://images.rentbabe.com/assets/mui/white_forward_arrow.svg" alt=""/> 
                        </p>
                    </Box>

                    <FlexGap/>

                    <p style={{width: "68px", height: "21px"}}
                        onClick={()=> setOpenReview(true)}
                        className = "view-profile-text orange-background">Reviews 
                    <img src= "https://images.rentbabe.com/assets/mui/white_forward_arrow.svg" alt=""/> </p>

                </FlexBox>

                {(isVerified && doesUserHasCreditDocument) && <p style={{ height: "21px"}}
                   onClick={()=> setReferralDialog(true)}
                   className = "view-profile-text blue-background">Invite & Earn</p>}
         
        </Box>
    }

    const getProfileReview = (addBottomMargin : boolean = false) => {
        return <>
                <Box marginBottom={addBottomMargin ? 1.5 : 0}>
                    <p 
                    style={{width: "62px", height: "21px"}}
                    onClick={openProfile}
                    className = "view-profile-text orange-background">Profile 
                    <img src= "https://images.rentbabe.com/assets/mui/white_forward_arrow.svg" alt=""/> 
                    </p>
                </Box>

                <FlexGap/>

                <p style={{width: "68px", height: "21px"}}
                    onClick={()=> setOpenReview(true)}
                    className = "view-profile-text orange-background">Reviews 
                <img src= "https://images.rentbabe.com/assets/mui/white_forward_arrow.svg" alt=""/> </p>

         

                {(isVerified && doesUserHasCreditDocument) && <>
                    <FlexGap/>
                    <p style={{ height: "21px"}}
                    onClick={()=> setReferralDialog(true)}
                    className = "view-profile-text blue-background">Invite & Earn</p>
                </>}

                <FlexGap/>

                {(isAdmin && genderState === genderEnum.female && isVerified) &&
                    <Box className='flex'> <p 
                            style={{height: "21px"}}
                                onClick={() => {
                                    window.open("https://t.me/+1RRxPK3g-zVjZDk1" , '_blank')
                                }}
                            className = "view-profile-text red-background">{t("join.tele")}
                        </p> 
                    </Box> 
                }
        </>
    }


    if (isAdmin === false || isAdmin === true || join) return <Box
        minHeight="100vh" 
        // maxHeight="100%"
        bgcolor="#efeff3"
        display="flex"
        alignItems="center" 
        flexDirection="column"
    > 
    
    {
       isAdmin === false &&  <TelegramAlert fullWidth/>
    }

    <Box margin="16px auto">
  
        <Box margin={1} maxWidth={maxWidth}>

            {isAdmin && <Box borderRadius={4} padding={2} bgcolor="white">
            {!isChecked ? 
            <Typography>{t("profile.inactive.hint")}</Typography> : <CardHeader
            avatar={
                <Box>
                    <Avatar 
                        variant='circular'
                        src={mobileUrlState}
                    />
              
                </Box>

            }
            title={
                <FlexBox>
                    <Typography> @{nickname}</Typography>
                    <FlexGap/>
                    <StatusTag/>
                </FlexBox>
               
            }
            subheader={<Box>
                {auth.currentUser?.email && <Typography variant='caption'>{auth.currentUser?.email}</Typography>}

                { auth.currentUser?.phoneNumber && <>
                    <br/>
                    <Typography variant='caption'>{auth.currentUser?.phoneNumber}</Typography>
                </>}

            </Box>}
     
        />}

            {data?.get(keys.reject_reason_after) as string && 
            <p className='red-warning-text'>{data?.get(keys.reject_reason_after) as string}</p>}

            <FlexBox marginTop={2}>
                {getProfileReview()}
            </FlexBox>

            </Box>}
            
            <ReviewReject isBabePage={join} rejectedReason={rejectedReason} isApproved={myNickname ? true : false}/>
            {rejectedReason && <BabeButton maxWidth={100} margin="10px 0px"/>}
 
        </Box> 
                
        <Box>

        {isAdmin && <CenterFlexBox padding="0px 10px" justifyContent="center" maxWidth={maxWidth} marginBottom={2}>

            <Button
                fullWidth
                color= {goNowBio === undefined ? "secondary" : "error"}
                disabled={isBlock} 
                variant = "contained"  
                //sx={{}}
                onClick={async () => {

                    if(!isChecked){

                        setToastMsg("Switch your profile back to active")
                        setShowToast(true)

                        return
                    }

                    // check is blocked again...
                    if(!goNowBio){
                    
                        const isBlock = data?.get(keys.gonow_block) as boolean ?? false
                        setBlock(isBlock)   
                        setGoNow(!isBlock)

                        if(isBlock){
                            setToastMsg("You are blocked from using this")
                            setShowToast(true)
                        }
                        
                    }else{
                        setGoNowBio(undefined)

                        await updateDoc(doc(db, keys.USERS, uid) , 
                        {
                            [keys.start] : deleteField(), 
                            [keys.end] : deleteField() , 
                            [keys.gonow_bio] : deleteField(), 
                            [keys.comingFrom] : deleteField()
                        })



                        setToastMsg("Post deleted")
                        setShowToast(true)
                    }

                }}>{!goNowBio ? t("iamfreetoday.button") : t("notfreeanymore.button")}
            </Button>
        

            <FlexGap/>

            <Share/>

            {/* <Button
            fullWidth
            onClick={copySharedLink} 
            endIcon={loadingShare && <CircularProgress size={12} />} 
            color="warning" 
            variant="contained">
                {t("shareprofile.label")}
            </Button> */}
        </CenterFlexBox>}

        <Box padding="0px 10px" width={`${size.width}px`} maxWidth={maxWidth} >
            <Box marginBottom={1} bgcolor="white">
                <Tabs 
                    value={tab}    
                    onChange={onChangeTabHandler}
                    variant="scrollable"
                    allowScrollButtonsMobile
                    textColor='secondary' 
                    indicatorColor='secondary'>
                    <Tab value={tabEnum.profile} label={t("profile.tab")} /> 
                    <Tab value={tabEnum.media} label={t("media.tab")}/> 
                    <Tab value={tabEnum.privacy} label={t("security.tab")}/> 
                    <Tab value={tabEnum.location} label={t("location.tab")}/>
                    <Tab value={tabEnum.notification} label={t("notification.tab")}/>  
                    <Tab value={tabEnum.chats} label={t("chats.tab")}/> 
                </Tabs>
            </Box> 
   

            {tab === tabEnum.profile && <>
                {profileSection()}
            </>}

            {tab === tabEnum.media && <>
                {mediaSection()}    
            </>}

            {tab === tabEnum.privacy && <>
                {securitySection()}
            </>}

            {tab === tabEnum.location && <>
                {locationSection()}
            </>}

            {tab === tabEnum.notification && <>
                <TelegramNotificationPanel/>
            </>}

            {
                tab === tabEnum.chats && <>
                    <BlockUserPanel 
                        expanded={expanded === panels.block} 
                        onChange={handleChange(panels.block)} 
                    />
      
                </>
            }
                
            <br/>
            <br/>

        </Box>
    
        {EndComponent()}

        </Box>

        <br/>
        <br/>

    </Box>

    {getReviewForm()}

    {getReferralDialog()}

    <CenterSnackBar
        open={showToast}
        onClose={() => setShowToast(false)}
        autoHideDuration={2500}
        message={toastMsg}/> 

    {dialogComponent()}

    <GoNowDialog 
      open={showGoNow}
      onClose={ async (from , to , bio, comingFrom, serviceType) => {

        if(from && to && bio){
            setGoNowBio(bio)

            let map : { [key: string] : any} =  { 
                [keys.start] : Timestamp.fromDate(from) , 
                [keys.end] : Timestamp.fromDate(to) , 
                [keys.gonow_bio] : bio,
                [keys.time_stamp]: serverTimestamp()
            }

            if(comingFrom){
                map[keys.comingFrom] = comingFrom
            }

            if(serviceType !== undefined) {
                // becareful of this, dont mistaken with services
                map[keys.gonow_service] = serviceType
            }

            updateDoc(doc(db, keys.USERS, uid), map)

            setToastMsg("Posted")
            setShowToast(true)
        }
        
        setGoNow(false)

    }}/>

    {uid && 
        <DeleteAccountDialog 
            myUid={uid}
            open={openDeleteDialog}
            onClose={() => {
                setDeleteDialog(false)
            }}
        />
    }

</Box>
    
    // PREMIUM Applications
    else if(isPremium || uid) return <Box 
        display="flex" 
        alignItems="center" 
        flexDirection="column"
        height="100vh" 
        bgcolor="#efeff3" 
    
        style={{overflowX: "hidden"}}> 

       <TelegramAlert/>

        <Box width="100%" borderRadius={4} padding={2} bgcolor="white" maxWidth={maxWidth}> 
            {myNickname && rejectedReason as string && 
                <>
                <Typography 
                variant='caption'
                fontWeight="bold" 
                color="error.main">{rejectedReason}</Typography>
                <BabeButton maxWidth={100} margin="10px 0px"/>
            </>}

            {myNickname && data?.get(keys.reject_reason_after) as string && 
            <>
                <Typography 
                    fontSize="11px" 
                    variant='caption' 
                    color="error.main">
                        {data?.get(keys.reject_reason_after) as string}
                </Typography>
                <br/>
                <br/>
                
            </>}

            <Box display="flex">
                <Typography fontWeight="bolder">
                    Basic profile
                </Typography>

                <FlexGap/>

                <MobileTooltip title="A basic profile is required to message the babes. Your profile will not be listed on the platform, it is only for the babes to identity who they are talking to.">
                    <img
                        width={16}
                        height={16}
                        src="https://images.rentbabe.com/assets/question.svg"
                        alt=""
                    />
                </MobileTooltip>
            </Box>

            <br/>

            <FlexBox width="100%">
           
                <AdminPhotos 
                    urls = {urls}
                    onChange = {fileUploaded}
                />

                <FlexBox>
                    {myNickname && getClientProfileReview(true)}
                </FlexBox>

            </FlexBox>


            {myNickname && <Box maxWidth={maxWidth}>
                <CenterFlexBox  marginBottom={2} bgcolor="white">
                    <Tabs
         
                        variant="scrollable"
                        allowScrollButtonsMobile
                        value={tab}    
                        onChange={onChangeTabHandler}
                        textColor='secondary' 
                        indicatorColor='secondary'>
                        <Tab value={tabEnum.profile} label={t("profile.tab")} /> 
                        <Tab value={tabEnum.privacy} label={t("privacy.tab")}/>
                        <Tab value={tabEnum.notification} label={t("notification.tab")}/>  
                        <Tab value={tabEnum.chats} label={t("chats.tab")}/> 
             
                    </Tabs>
                </CenterFlexBox>

                {tab === tabEnum.profile && <>
                    {clientProfileSection()}
                </>}

                {tab === tabEnum.privacy && <>
                    {securitySection()}

                </>}

                {tab === tabEnum.chats && <>
                   <BroadcastList/> 

                   {(isPremium || uid) && <BlockUserPanel 
                        expanded={expanded === panels.block} 
                        onChange={handleChange(panels.block)} 
                    />}
                    
                </>}


                {tab === tabEnum.notification && <>

                   <TelegramNotificationPanel />
                    
                </>}
                    
                <br/>
                <br/>
            </Box>}
    

            {!myNickname && <>
                <br/>
                {clientProfileSection()}
            </>}

            <br/>
            <br/>

            
            </Box> 


            <br/>
            <br/>
            <br/>
            <br/>
            <br/>
            <br/>
            <br/>

            {EndComponent()}
            {dialogComponent()}
            {getReviewForm()}
            {getReferralDialog()}

            {uid && 
                <DeleteAccountDialog 
                    myUid={uid}
                    open={openDeleteDialog}
                    onClose={() => {
                        setDeleteDialog(false)
                    }}
                />
            }

     
        </Box>

    else return null
}

export default AdminProfilePage;