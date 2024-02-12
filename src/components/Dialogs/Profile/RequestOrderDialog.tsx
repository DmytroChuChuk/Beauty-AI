import {
    FC,
    useEffect,
    useState,
} from 'react';
import {
    Dialog,
    DialogProps,
    DialogContent,
    DialogActions,
    LinearProgress,
    CardHeader,
    Avatar,
    Box,
    Typography,
    Divider,
    Skeleton,
    Button,
    CircularProgress,
    FormControl,
    MenuItem,
    Select,
    SelectChangeEvent,
    TextField,
    Chip
} from '@mui/material';

import { createTheme, ThemeProvider } from '@mui/material/styles'
import type {} from '@mui/x-date-pickers/themeAugmentation';
import dayjs, { Dayjs } from 'dayjs';
import locale from 'date-fns/locale/en-GB'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
import DateFnsUtils from "@date-io/date-fns";

import { ServiceType, servicesProps, detailProps } from '../../../keys/props/services';
import { ServiceDetails } from '../../../pages/ProfilePage';
import CoinImage from '../../CustomImage/CoinImage';
import CenterFlexBox from '../../Box/CenterFlexBox';
import { ServicesHelper } from '../../../utility/ServicesHelper';
import UnitStepper from '../Order/components/UnitStepper';
import { httpsCallable } from 'firebase/functions';
import { newConversationV2Function } from '../../../keys/functionNames';
import { analytics, functions } from '../../../store/firebase';
import { APNSTokenProps, useUser } from '../../../store';
import shallow from 'zustand/shallow';

import FlexGap from '../../Box/FlexGap';
import GeoInput from '../../Inputs/GeoInput';
import { APNSToken, club, mobileUrl, tele_id} from '../../../keys/firestorekeys';
import { cabFareInfo, newMessageDate, newMessageInfo, newMessageTime, newMessageVenue } from '../../../keys/localStorageKeys';
import { useWindowSize } from '../../../hooks/useWindowSize';
import Conversation from '../../../utility/Conversation';
import history from '../../../utility/history';
import { MessageEnum, Units } from '../../../enum/MyEnum';
import CenterSnackBar from '../../../chats/components/Snackbar/CenterSnackBar';
import { logEvent } from '@firebase/analytics';
import { emailExp, phoneExp } from '../../../keys/Regex';
import { messenger, nsfw, payment, sendTelegramNotificationToAdmin, sex } from '../../../keys/filters';
import FlexBox from '../../Box/FlexBox';
import { useTranslation } from 'react-i18next';
import { AnalyticsNames } from '../../../keys/analyticNames';
import { CountryLookUpTable } from '../../../data/tables';
import { getMessengerIcon } from '../../../utility/GlobalFunction';
import { preferencesNames } from '../../../data/data';
import { bindPhoneNumberLimit } from '../../../dimensions/limit';
import WarningDialog, { WarningType } from '../basic/WarningDialog';
import { Helper } from '../../../utility/Helper';

//import DisableInfoInput from '../../Inputs/DisableInfoInput';


interface props extends DialogProps {
    clubName: string | undefined
    clubState: string | undefined
    state: string 
    services: servicesProps | undefined
    selectedService: ServiceDetails
    nickname: string | undefined
    chatRoomID: string | undefined
    babeURL: string| undefined
    babeUID: string | undefined
    babeTeleid: string | undefined
    babeAPNSToken: APNSTokenProps | undefined
    eMeetsPref?: string[] | undefined
    eMeetsApp?: string[] | undefined
    onClose: () => void
    onSuccess: (
        chatRoomId: string | null | undefined, 
        hasErrorMessage: string | null | undefined) => void
}

enum cabFareEnum {
    none = "0",
    // oneWay = "1",
    // twoWay = "2"
    ten = "10",
    twenty = "20",
    thirty = "30",
    forty = "40",
    fifty = "50",
    sixty = "60"
}

const theme = createTheme({
    palette: {
      primary: {
        main: "#2196f3",
        contrastText: "#fff" //button text white instead of black
      }
    }
  });

const RequestOrderDialog : FC<props> = ({
    clubName,
    clubState,
    state,
    babeUID,
    babeTeleid, 
    babeAPNSToken,
    babeURL, 
    chatRoomID, 
    nickname, 
    services, 
    selectedService,
    eMeetsPref,
    eMeetsApp,
    onClose, 
    onSuccess,
    ...props
    }) => {

    const [
        myUID, 
        teleid, 
        myAPNSToken,
        myNickname, 
        profileImage, 
        phoneNumber,
        isPremium, 
        points
    ] = useUser((state) => 
    [
        state.currentUser?.uid, 
        state.currentUser?.teleId,
        state.currentUser?.APNSToken,
        state.currentUser?.nickname,
        state.currentUser?.profileImage,
        state.currentUser?.phoneNumber,
        state.currentUser?.isPremium,
        state.currentUser?.points
    ], 
    shallow)

    const { t } = useTranslation()
    const [ size ] = useWindowSize()

    const servicesHelper = new ServicesHelper()
    const helper = new Helper()

    const id = selectedService.id
    const price = selectedService.details?.price
    const serviceType = selectedService.serviceType
    const suffix = selectedService.details?.suffix ?? servicesHelper.getDefaultSuffix(serviceType)

    const _suffix = servicesHelper.convertUnits(suffix)
    
    const details = services && serviceType !== undefined && id ? services?.[serviceType]?.[id] as detailProps : undefined


    const [loading, setLoading] = useState<boolean>(false)
    const [numberOfUnits, setNumberUnits] = useState<number>(1)
    const [cabFare, setCabFare] = useState<cabFareEnum>(getEnum())

    const today = new Date()
    const cacheDate = localStorage.getItem(newMessageDate)
    const cacheTime = localStorage.getItem(newMessageTime)
    const cacheVenue = localStorage.getItem(newMessageVenue)
    const cahceAdditionalInfo = localStorage.getItem(newMessageInfo)

    const [date, setDate] = useState<string | null | undefined>(dayjs(cacheDate).toDate() <= today ? dayjs(today).toString() : cacheDate)
    const [time, setTime] = useState<string | null | undefined>(cacheTime) // user always put AM
    const [venue, setVenue] = useState<string | null |  undefined>(cacheVenue)


    const [info, setInfo] = useState<string | null | undefined>(cahceAdditionalInfo)

    const [alert, setAlert] = useState<boolean>(false)

    const [openConfirm, setOpenConfirm] = useState<boolean>(false)
    const [warningType, setWarningType] = useState<WarningType>(WarningType.NSFW)

    const [alertMsg, setAlertMsg] = useState<string>()

    const openAlert = (msg: string) => {
        setAlertMsg(msg)
        setAlert(true)
    }

    const handleChange = (event: SelectChangeEvent) => {
        const value = event.target.value as cabFareEnum
        setCabFare(value)
        localStorage.setItem(cabFareInfo, value)
    }   

    function getEnum(): cabFareEnum{
        function enumFromStringValue<T> (enm: { [s: string]: T}, value: string): T | undefined {
            return (Object.values(enm) as unknown as string[]).includes(value)
              ? value as unknown as T
              : undefined;
        }
        return enumFromStringValue(cabFareEnum, localStorage.getItem(cabFareInfo) ?? cabFareEnum.none) ?? cabFareEnum.none
    }

    useEffect(() => {

        if(serviceType !== ServiceType.meetup){
            setCabFare(cabFareEnum.none)
        }else{
            setCabFare(getEnum())
        }
   
    }, [serviceType])

    const handleDateChange = (newValue: Dayjs | null) => {
        setDate(newValue?.toString())
        if(newValue) localStorage.setItem(newMessageDate, newValue?.toString())
    }

    const handleTimeChange = (newValue: Dayjs | null) => {
        setTime(newValue?.toString())
        if(newValue) localStorage.setItem(newMessageTime, newValue?.toString())
    }

    const onCloseHandle = (e: any) => {
        if(loading) return
        onClose()
    }
    
    const onConfirm =  (onConfirmClick: boolean) => async (e: any) => {

        if(loading){
            return
        }

        if(!myUID){
            history.push("/login")
            return
        }

        if(!profileImage || !myNickname){
            history.push(`/page/Admin?uid=${myUID}`)
            return
        }

        if(state === "Singapore"){
            if(!phoneNumber){
                if(!isPremium && (points ?? 0) < bindPhoneNumberLimit){
                    history.push("/bindphone")
                    return;
                }
            }else if(helper.isUSorUKPhoneNumber(phoneNumber)){
                const canSendRequest = isPremium || (points ?? 0) >= bindPhoneNumberLimit;
                if(!canSendRequest){
                    openAlert(`Minimum ${bindPhoneNumberLimit/100} Credits to request an order`)
                    return;
                }
            }
        }

        if(!myUID || !price){
            openAlert("Unexpected error, contact us")
            return
        }

        if(!babeUID || !babeURL || !nickname){
            openAlert("Unexpected error, contact us")
            return
        }

        if(serviceType === undefined) {
            openAlert("No service")
            return
        }

        if(!venue && serviceType === ServiceType.meetup) {
            openAlert("Venue is required")
            return
        }

        if(venue && serviceType === ServiceType.meetup && venue.toLowerCase().includes("cozyplace")){
            openAlert("This venue is not allowed")
            return 
        }


        if(!onConfirmClick){
            let arrays = sex.concat(nsfw)
            if (arrays.some((word) => { 
                return info?.toLowerCase().includesInWords(word)})) {
                    setWarningType(WarningType.NSFW)
                    setOpenConfirm(true)
                    return
            }
          }

        if(!onConfirmClick){
            let arrays = payment.concat(messenger)
            if (arrays.some((word) => { 
            return info?.toLowerCase().includesInWords(word)})) {
                setWarningType(WarningType.OFF_PLATFORM)
                setOpenConfirm(true)
                return
            }
        }

        let selected = ""
        if (sex.some((word) => { 
            selected = word
            return info?.toLowerCase().includesInWords(word) })) {
    
            const chatLink = `${window.location.origin}/Profile?uid=${myUID}` 
            sendTelegramNotificationToAdmin(
                `${chatLink} doing obvious NSFW request! [${selected}\n\n${info}]`)
                
            return                
        }

        if(!time) {
            openAlert("Time is required")
            return
        }

        if(!date) {
            openAlert("Date is required")
            return
        }

        if(!dayjs(time).isValid()){
            openAlert("Invalid time")
            return
        }

        if(!dayjs(date).isValid()){
            openAlert("Invalid date")
            return
        }

        const datejs = dayjs(date)
        const timejs = dayjs(time)
        const _today = dayjs()
            .set("date", datejs.date())
            .set("month", datejs.month())
            .set("year", datejs.year())
            .set("hour", timejs.hour())
            .set("minute", timejs.minute())
            .set("second", timejs.second())

        if(_today < dayjs()){
            openAlert(`Wrong date/time. Now is already ${dayjs().format("h:mm a. ddd DD MMM")}`)
            return 
        }

        const censor = "****"
        let filter = info?.replace(phoneExp, censor).replace(emailExp, censor)

        const cabPrice = (getCabFarePrice(cabFare)/100)
        const servicePrice = (numberOfUnits * price!/100)
        const finalPrice = (cabPrice + servicePrice)

        const header = "ORDER REQUEST\n"
        const _date = `Date: ${dayjs(date).format("ddd, DD MMM")}\n`
        const timing = dayjs(time)

        const _toValue = suffix === Units.min ? 
        ` - ${timing.add(15 * numberOfUnits, "m").format("h:mm A")}` :
        suffix === Units.hr ?
        ` - ${ timing.add(60 * numberOfUnits, "m").format("h:mm A")}` :
        suffix === Units.game ? 
        ` for ${numberOfUnits} Game${numberOfUnits > 1 ? "s" : ""}` : ""
        
        const _time = `Time: ${timing.format("h:mm A") }${_toValue}\n`

        const _venue = `Venue: ${venue?.replace(", Singapore", "")}\n`
        const _activity = `Activity: ${selectedService.details?.title}\n`
        const _cabfare = `Cab fare: ${cabPrice ? `+${cabPrice} Credits` : "-"}\n`
        const _info = filter ? `Info: ${filter ? filter : "-"}\n` : ""

        const _finalPrice = cabPrice ? 
        `\n\nFINAL PRICE: ${servicePrice.toFixed(2)} + ${cabPrice.toFixed(2)} = ${finalPrice.toFixed(2)} Credit` :
        `\n\nFINAL PRICE: ${finalPrice.toFixed(2)} Credit`
        
        const msg = `${header}${_date}${_time}${_venue}${_activity}${_cabfare}${_info}${_finalPrice}`
        const eMsg = `${header}${_date}${_time}${_activity}${_info}${_finalPrice}`
        const fMsg = serviceType === ServiceType.meetup ? msg : eMsg

        const conversationHelper = new Conversation()

        try{
            const eventName: string = "begin_checkout";

            logEvent(analytics, eventName, {
                currency: "SGD",
                value: finalPrice,
                items: [{
                    item_id: selectedService.details?.title,
                    item_name: nickname,
                    currency: "SGD",
                    price: price/100,
                    quantity: numberOfUnits
                }]
            })
        }catch{
        }

        const title = selectedService.details?.title
        if(title){
            try{
                logEvent(analytics, AnalyticsNames.request, {
                  content_type: title,
                  item_id: title, 
                })  
            }catch{}
        }

        let serviceMap: {[key: string]: any}  = {
            price: finalPrice * 100,
            clientUID: myUID,
            babeUID: babeUID,
            origin: window.location.origin,
            chatRoomID: chatRoomID,
            babeNickname: nickname,
            babeProfileImage: babeURL,
            clientNickname: myNickname,
            clientProfileImage: profileImage,
            serviceDetails: selectedService,
        }

        if(teleid) serviceMap.clientTeleID = teleid
        if(myAPNSToken) serviceMap.clientToken = myAPNSToken

        const newConversation = httpsCallable(functions, newConversationV2Function);
        const extra = conversationHelper.senderSendNewConversation(myUID, babeUID, myNickname, 
            profileImage, nickname, babeURL, fMsg)

        let map : {[key: string]: any} = {
            recipientUid: babeUID,
            content: fMsg,
            extra: extra,
            // type: MessageEnum.order,
            // extra: extra,
            // serviceMap: serviceMap
        }

        let msgMap : {[key: string] : any} = {
            sen: myUID,
            ctn: fMsg,
            ty: MessageEnum.order,
        };

        if (serviceMap.clientNickname) {
            msgMap.nick = serviceMap.clientNickname;
        }

        if(clubName && clubState && clubName !== "rentbabe"){
            msgMap[club] = {
                name: clubName,
                state: clubState
            }
        }
        
        if(serviceMap.clientProfileImage){
            msgMap[mobileUrl] = serviceMap.clientProfileImage;
        }

        if(babeTeleid) msgMap[tele_id] = babeTeleid
        if(babeAPNSToken) msgMap[APNSToken] = babeAPNSToken

        if (serviceMap) {
            msgMap.order = serviceMap
        }

        map.msg = msgMap

        try{

            setLoading(true)

            const res = await newConversation(map)
            const data = res.data as any

            const result = data.result as string | null | undefined
            const chatRoomId = data.chatRoomId as string | null | undefined

            setLoading(false)
            onClose()
            onSuccess(chatRoomId, result)
        }catch(error){
            console.log(error)
            setLoading(false)
            onClose()
            onSuccess(null, `Unexpected error ${error}`)
        }
    }

    function getCabFarePrice(cabfare: cabFareEnum) : number{
        switch (cabfare) {
            case cabFareEnum.none:
                return 0;
            case cabFareEnum.ten:
                return 1000;
            case cabFareEnum.twenty:
                return 2000;
            case cabFareEnum.thirty:
                return 3000;
            case cabFareEnum.forty:
                return 4000;
            case cabFareEnum.fifty:
                return 5000;
            case cabFareEnum.sixty:
                return 6000;
            default:
                return 0;
        }
    }

    function calculateHoursFromPastDateToToday(pastDate: Date): number {
        // Get today's date and time
        const today: Date = new Date();
        
        // Calculate the time difference in milliseconds
        const timeDifference: number = pastDate.getTime() - today.getTime()
        
        // Calculate the number of hours
        const hoursDifference: number = timeDifference / (1000 * 3600);
        
        return hoursDifference;
    }

    // Function to set the time of targetDate to be the same as the time of sourceDate
    function setTimeFromDate(targetDate: Date, sourceDate: Date): Date {
        const hours = sourceDate.getHours();
        const minutes = sourceDate.getMinutes();
        const seconds = sourceDate.getSeconds();
        const milliseconds = sourceDate.getMilliseconds();
    
        targetDate.setHours(hours, minutes, seconds, milliseconds);

        return targetDate
    }
    
    if(!services) return null
    else if(!id || !price || serviceType === undefined || !details) return null
    else return <>
    <Dialog  
    fullWidth
    fullScreen = {(size.width < 450 && serviceType === ServiceType.meetup)}
    onClose={onCloseHandle} 
    {...props}>
        
        { loading && <LinearProgress color="warning"/> }

        <Box marginTop={2} marginLeft={1}>

            <FlexBox >
            {
                selectedService.serviceType === ServiceType.eMeet && <>
                    {preferencesNames?.map((name, index) => {
                        let _name = name
                        if(name === "text"){
                            _name = "Texting"
                        }else if (name === "audio"){
                            _name = "Audio calls"
                        }else if (name === "video"){
                            _name = "Video calls"
                        }
                        return  <Chip key={index} size='small' sx={{marginLeft: "8px"}} label={_name.capitalize()} icon={
                            <img
                                width={16}
                                height={16}
                                // src = {eMeetsPref?.includes(name) ? "https://images.rentbabe.com/assets/mui/green_tick.svg"  : } 
                                src = {`https://images.rentbabe.com/assets/mui/${eMeetsPref?.includes(name) ? "green_tick" : "cancel"}.svg?v=3`} 
                                alt=""
                            />
                        }/>
                    })}
                </>
            }      
            </FlexBox>

            <FlexBox>
            {
                selectedService.serviceType === ServiceType.eMeet && <>
                    {eMeetsApp?.map((name, index) => {
                        return <Chip 
                            key={index} 
                            size='small' 
                            sx={{
                                marginLeft: "8px", 
                                marginTop: "8px"
                            }} 
                            label={name.capitalize()} 
                            icon={<img
                                    style={{ borderRadius: "5px" }}
                                    width={16}
                                    height={16}
                                    src = {getMessengerIcon(name)}
                                    alt=""
                                />
                            }/>
                    })}
                </>
            }      
            </FlexBox>

        </Box>

         
         <CardHeader
            avatar={
                <Avatar 
                    sx={{ width: 50, height: 50 }}
                    variant='rounded'
                    src={details.image}
                />
            }
            title={details.title}
            subheader={<Box display="flex">
                <Typography variant='body2'>{nickname}</Typography>
                <CenterFlexBox marginLeft="auto" display="flex">
                    <CoinImage imageWidth={24}/>
                    <Typography  variant='body2'>{(price/100).toFixed(2)}/{_suffix}</Typography>
                </CenterFlexBox>

            </Box>}
        />
         <DialogContent>

            <Box margin="0px 0px 16px 0px">
                <UnitStepper
                    margin='0 0 16px 0'
                    minValue={serviceType === ServiceType.meetup || serviceType === ServiceType.sports ? 2 : 1}
                    onChange={(value) => {
                        setNumberUnits(value)
                }}/>
            <>
            <Divider/>
            {(serviceType === ServiceType.meetup || serviceType === ServiceType.sports ) && <Box margin="16px 0" width="100%" >
                <GeoInput
                    serviceType={serviceType} 
                    restrict = { CountryLookUpTable[state] ?? "sg"}
                    meetupType={details.id ? parseInt(details.id) : undefined}
                    defaultValue={venue}
                    searchFor={serviceType === ServiceType.meetup ? "Cafe/bistro/bar" : "stadium/sports hall"}
                    onChange={() => {
                        localStorage.removeItem(newMessageVenue)
                        setVenue(null)
                    }}
                    onPlaceSelected={(venue) => {
                        setVenue(venue)
                        if(venue){
                            localStorage.setItem(newMessageVenue, venue)
                        }
                        
                    }}                    
                />
            </Box> }

            <CenterFlexBox margin="16px 0" width="100%" display="flex">
         
            <ThemeProvider theme={theme}>
                
                <LocalizationProvider 
                    locale={locale} 
                    dateAdapter={DateFnsUtils}>

                <MobileDatePicker
                    label={t("date")}
                    inputFormat="dd MMM"
                    value={dayjs(date)}
                    onChange={handleDateChange}
                    renderInput={(params) => <TextField
                        size="small" 
                        sx={{width: "50%"}} 
                        {...params} 
                    />}
                />

                <FlexGap/>

                <LocalizationProvider 
                    locale={locale} 
                    dateAdapter={DateFnsUtils}>

                    <TimePicker
                        label={t("time")}
                        inputFormat="h:mm a"
                        ampm
                        ampmInClock
                        value={dayjs(time)}
                        onChange={handleTimeChange}
                        renderInput={(params) => <TextField 
                            size="small" sx={{width: "50%"}} {...params} />}
                    />

                </LocalizationProvider>

                </LocalizationProvider>
            </ThemeProvider>
        
            </CenterFlexBox>

            { calculateHoursFromPastDateToToday(setTimeFromDate(dayjs(date).toDate(), dayjs(time).toDate())) > 72 && 
            <Typography fontSize={12} color="error">
                {t('order.warning')}
            </Typography> }
            
            </>

            <Box margin="16px 0" width="100%" display="flex" alignItems="center">

                <TextField  
                    fullWidth
                    variant='standard'
                    defaultValue={info}
                    maxRows={1}
                    label="Additional information"
                    color="warning"
                    onChange={(e) => {
                        const v = e.currentTarget.value as string
                        localStorage.setItem(newMessageInfo,  v)
                        setInfo(v)

                }}/> 

                {/* {
                    (isPremium || (points ?? 0) >= 20000)  ?
                    <TextField  
                        helperText={
                            <Typography fontSize={12} color="error">
                                We ban user who gives out third party messenger on addition information
                            </Typography>
                        }
                        fullWidth
                        variant='standard'
                        defaultValue={info}
                        maxRows={1}
                        label="Additional information"
                        color="warning"
                        onChange={(e) => {
                            const v = e.currentTarget.value as string
                            localStorage.setItem(newMessageInfo,  v)
                            setInfo(v)
                        }}
                    /> 
                    
                    : <DisableInfoInput/>
                }  */}

            </Box>

            </Box>

            {
                serviceType === ServiceType.meetup && <><Box display="flex">
                    <Box display="flex" alignItems="center">
                    <Typography>{t("cab.fare")}</Typography>
                    <FlexGap/>
                   { cabFare !== cabFareEnum.none && <>
              
                        <Typography>+{cabFare.toString()}</Typography>
                        <CoinImage imageWidth={19} />
                    </> }
                    </Box>
           

                    <FormControl  sx={{marginLeft: "auto", minWidth: 120}}>
                        <Select
                        color="warning"
                        sx={{height: 28}}
                        onChange={handleChange}
                        value={cabFare}
                    
                        >
                        <MenuItem value={cabFareEnum.none}>
                            <em>None</em>
                        </MenuItem>
                        <MenuItem value={cabFareEnum.ten}>10 Credits</MenuItem>
                        <MenuItem value={cabFareEnum.twenty}>20 Credits</MenuItem>
                        <MenuItem value={cabFareEnum.thirty}>30 Credits</MenuItem>
                        <MenuItem value={cabFareEnum.forty}>40 Credits</MenuItem>
                        <MenuItem value={cabFareEnum.fifty}>50 Credits</MenuItem>
                        <MenuItem value={cabFareEnum.sixty}>60 Credits</MenuItem>
                        </Select>
                    </FormControl>
             
                </Box>
                <br/>
                </>
            }

            <Box display="flex" marginTop="8px" alignItems="center">
                <Typography marginBottom="auto">{t("final.price")}</Typography>

                <Box marginLeft="auto" marginTop="auto">
                    <Typography textAlign="right"  marginTop="auto">{numberOfUnits} units total:</Typography>
                 
                    <Box display="flex">
                        <CoinImage imageWidth={38}/>
                        {
                            price ? <Typography  marginTop="auto" variant='h5'>{
                            (numberOfUnits * price/100 + getCabFarePrice(cabFare)/100)?.toFixed(2)}
                            </Typography> : 
                            <Skeleton width="80px" variant='text'/>
                        }
                    </Box>
                </Box>
            </Box>

         </DialogContent>

        <br/>
        
         <DialogActions>
      
        <Button variant='text' color="warning" onClick={onCloseHandle}>{t("cancel")}</Button>

            <Button 
            disabled={loading} 
            variant='contained' 
            color="warning" 
            onClick={onConfirm(false)} 
            // onClick={() => {
            //     if(!onConfirmClick){
            //         let arrays = sex.concat(payment).concat(messenger).concat(nsfw)
            //         if (arrays.some((word) => { 
            //             return info?.toLowerCase().includesInWords(word)})) {
            //                 setOpenConfirm(true)
                            
            //         }
            //     }
            // }}
            endIcon={
                <>
                    {loading && <CircularProgress size={16} color="warning"/>}
                </>
            }> {t("send")}
            </Button>

         </DialogActions>


        <CenterSnackBar 
            message={alertMsg}
            onClose={() => setAlert(false)}
            open={alert}
        />
    </Dialog>

    <WarningDialog
        type={warningType}
        open={openConfirm}
        onClose={() => {
            setOpenConfirm(false)
        }}
        onConfirm={onConfirm(true)}
    />
        
    </>
}

export default RequestOrderDialog