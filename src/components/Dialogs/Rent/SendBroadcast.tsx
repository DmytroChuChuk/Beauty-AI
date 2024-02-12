import { 
    Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
    TextField, 
    Button, 
    Checkbox, 
    FormControlLabel,
    Typography,
    CircularProgress,
    Box,
    Tab,
    Tabs
} from '@mui/material';

import { createTheme, ThemeProvider } from '@mui/material/styles'
import type {} from '@mui/x-date-pickers/themeAugmentation';
import dayjs, { Dayjs } from 'dayjs';
import locale from 'date-fns/locale/en-GB'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
import DateFnsUtils from "@date-io/date-fns";

import { 
    newMessageActivity, 
    newMessageTime, 
    bcCheck,
    newMessageVenue,
    newMessageDate,
    area
} from '../../../keys/localStorageKeys';
    
import { httpsCallable } from 'firebase/functions';
import { ChangeEvent, FC, useEffect, useState } from 'react';

import { useUser } from '../../../store';
import { functions } from '../../../store/firebase';
import history from '../../../utility/history';
import DefaultTooltip from '../../Tooltip/DefaultTooltip';
import { sendBroadcastFunction } from '../../../keys/functionNames';

import { ServiceType } from '../../../keys/props/services';
import GeoInput from '../../Inputs/GeoInput';
import Activities from '../../Select/Activities';
import { channels, meetupEnum } from '../../../enum/MyEnum';
import { emailExp, phoneExp } from '../../../keys/Regex';
import { category } from '../../../keys/firestorekeys';
import { useTranslation } from 'react-i18next';
import FlexBox from '../../Box/FlexBox';
import FlexGap from '../../Box/FlexGap';
import { nsfw, sendTelegramNotificationToAdmin, sex } from '../../../keys/filters';
// import DisableInfoInput from '../../Inputs/DisableInfoInput';
// import DisableInfoInput from '../../Inputs/DisableInfoInput';

const theme = createTheme({
    palette: {
      primary: {
        main: "#2196f3",
        contrastText: "#fff" //button text white instead of black
      }
    }
  });

interface props {
    handleClose: () => void
    open: boolean
    serviceType?: ServiceType
    documentID?: string
    message_id?: number
    preVenue?: string
    preDate?: string
    preTime?: string
    preActivity?: string
    prevInfo?: string
    prevCabfare?: string
}

const SendBroadcast : FC<props> = ({
    serviceType: sType,
    open: p,  
    documentID : dic, 
    message_id: mid,
    preVenue,
    preDate,
    preTime,
    preActivity,
    prevInfo,
    prevCabfare,
    handleClose}) => {



    const [
        uid, 
        isAdmin, 
        nickname, 
        profileImage,
        whereAmI 
        // isPremium, 
        // points,
    ] = useUser((state) => 
    [
        state.currentUser?.uid , 
        state.currentUser?.isAdmin,  
        state.currentUser?.nickname, 
        state.currentUser?.profileImage,
        state.currentUser?.countryCode,
        // state.currentUser?.isPremium,
        // state.currentUser?.points,
    ])

    const areas = localStorage.getItem(area)?.split(", ")
   
    const hasSingapore = areas?.includes("Singapore")
    const hasMeetup = hasSingapore && (whereAmI === "SG")
    
 
    const { t } = useTranslation()
    const [info, setInfo] = useState<string | null>()

    const [venue, setVenue] = useState<string | null>()
    const [activity, setActivity] = useState<string | null>()
    const [date, setDate] = useState<string | null>()
    const [time, setTime] = useState<string | null>()



    const [open, setOpen] = useState<boolean>(p)

    const [serviceType, setServiceType] = useState<ServiceType | null | undefined>(
        sType ?? ( hasMeetup ? ServiceType.meetup : ServiceType.eMeet)
    )

    const [documentID, setDocumentID] = useState<string | undefined>(dic)
    const [message_id, setMessage_id] = useState<number | undefined>(mid)

    const [loading, setLoading] = useState<boolean>(false)
    const [cabfare, setCabfare] = useState<boolean>()

    const [check, setCheck] = useState<boolean>(localStorage.getItem(bcCheck) === "true")

    const [information, setInformation] = useState<string | undefined>()

    const handleDateChange = (newValue: Dayjs | null) => {

        // const _dayjs = dayjs(newValue)
        // const _date = _dayjs?.format("ddd, DD MMM")
        setDate(newValue?.toString())
        if(newValue) localStorage.setItem(newMessageDate, newValue?.toString())
    };

    const handleTimeChange = (newValue: Dayjs | null) => {

        // const _dayjs = dayjs(newValue)
        // const _time = _dayjs?.format("h:mm A")

        setTime(newValue?.toString())

        if(newValue) localStorage.setItem(newMessageTime, newValue?.toString())

    };

    const onChangeCheck = (event: ChangeEvent<HTMLInputElement>, checked: boolean) => {
        setCheck(checked)

        localStorage.setItem(bcCheck, `${checked}`)
    }

    function showError (msg: string) {
        setInformation(msg)
    }

    useEffect(() => {

        setOpen(p)
        setDocumentID(dic)
        setMessage_id(mid)

        if(!p) {
            setServiceType(undefined)
            setLoading(false)
        }else{

            setInfo(prevInfo ?? null)
            setVenue(preVenue ?? localStorage.getItem(newMessageVenue))

            const _a = localStorage.getItem(newMessageActivity) ?? ""
            const _serviceId = parseInt(_a)
            // setServiceId(getActivityIndex(preActivity) ?? _serviceId)
            const cAct = getActivityName(_serviceId)
            setActivity(preActivity ??  cAct)

            setDate(preDate ?? localStorage.getItem(newMessageDate))
            setTime(preTime ?? localStorage.getItem(newMessageTime))

            const hasCabfare = prevCabfare ? prevCabfare === "Yes" : cabfare
            setCabfare(hasCabfare)            
            setServiceType(sType !== undefined ? sType : hasMeetup ? ServiceType.meetup : ServiceType.eMeet)
        }
        // eslint-disable-next-line
    } , [p, dic, mid, sType])

    const send = async (e: any) => {
        e.preventDefault();
        showError("")
        if(loading) return

        if(isAdmin){
            showError("Babe cannot send broadcast")
            return
        }

        if(!uid){
            history.push("/login")
            return
        }

        if(!nickname || !profileImage){
            history.push(`/page/Admin?uid=${uid}`)
            handleClose()
            return
        }

        if(serviceType === ServiceType.meetup){

            if(!venue){
                showError("Venue is required")
                return
            }

            if(!activity){
                showError("Activity is required")
                return
            }
        
            if(!time){
                showError("Time is required")
                return
            }

            if(!date){
                showError("Date is required")
                return
            }

            if(
                venue === preVenue &&
                activity === preActivity &&
                date === preDate &&
                time === preTime &&
                info  === prevInfo
            ){
                showError("Nothing to update")
                return 
            }

        }else{
            if(!date || !time){
                showError("Date and time is required")
                return
            }

            if(
                date === preDate &&
                time === preTime &&
                info  === prevInfo
            ){
                showError("Nothing to update")
                return 
            }

        }

        setLoading(true)
        const sendBroadcast = httpsCallable(functions, sendBroadcastFunction)

        try{

            let header = "Meetup"

            switch (serviceType) {
                case ServiceType.meetup:
                    header = "Meetup";
                    break;

                case ServiceType.eMeet:
                    header = "E-Meet";
                    break;
            
                case ServiceType.games:
                    header = "Games";
                    break;
            }

            const censor = "****"
            let _info = info?.replace(phoneExp, censor).replace(emailExp, censor)

            let arrays = sex.concat(nsfw)
            if (arrays.some((word) => { 
                return _info?.toLowerCase().includesInWords(word)})) {
                    const link = `${window.location.origin}/Profile?uid=${uid}` 
                    sendTelegramNotificationToAdmin(
                        `${link} doing obvious NSFW request! [${_info}]`)
                    handleClose()
                    return
            }

            var map : any = {
                status: 0,
                serviceType: serviceType,
                header: header,
                venue: venue,
                activity: activity,
                date: date,
                time: time,
                country: channels.GLOBAL_SG,
                info : _info,
                cabfare: cabfare ? "Yes" : "No",
                nickname: nickname,
                profileImage: profileImage
            }

            const aIndex = getActivityIndex(activity)
            if(aIndex !== null && serviceType === ServiceType.meetup){
                map[category] = aIndex
            }

            if(documentID) map['documentID'] = documentID
            if(message_id) map['message_id'] = message_id

            const res = await sendBroadcast(map);
    
            const data = res.data as any;
            const status = data.status

            if(status === 200){
                // success
                if(documentID) {
                    handleClose()
                    return
                }

                const link = data.link as string
                const fullLink = `${window.location.origin}${link}`

               window.location.assign(fullLink)

            }else if (status === 400){
                // 3 times per day alert
                showError("You have reach the maximum number of broadcast")
            }else if (status === 404){
                // unexpected error
                const error = data.error
                console.log(error)
                showError("Unexpected error")
            }
            
            setLoading(false)

        }catch (err) {
            console.log(err)
            setLoading(false)
        }

    }

    const onChange = (e: any) => {
        setInfo(e.target.value)
        // info.current =  e.target.value
    }

    const onCheckChange = (e: any) => {
        const checked = e.target.checked
        setCabfare(checked)

    }

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        showError("")
        setServiceType(newValue);
    };

    function getActivityName(_value: number){

        let name = ""
        switch (_value) {
          case meetupEnum.meals:
            name = "Meals"
            break;

          case meetupEnum.drinks:
            name = "Drinks"
            break;

          case meetupEnum.hiking:
            name = "Hiking"
            break;

          case meetupEnum.dining:
            name = "Fine dining"
            break;

          case meetupEnum.photoshoot:
            name = "Photoshoot"
            break;

          case meetupEnum.gathering:
            name = "Gathering"
            break;

          case meetupEnum.movies:
            name = "Movies"
            break;
        }

        return name
    }

    function getActivityIndex(_activity: string | null | undefined): number | null{

        switch (_activity) {
          case "Meals":
            return  meetupEnum.meals

          case "Drinks":
            return meetupEnum.drinks


        case "Hiking":
            return meetupEnum.hiking

        case "Fine dining":
            return meetupEnum.dining


        case "Photoshoot":
            return meetupEnum.photoshoot

        case "Gathering":
            return meetupEnum.gathering

        case "Movies":
            return meetupEnum.movies

        default:
            return null
        }

    }


    return <>
    
    <Dialog  fullScreen={window.innerWidth < 450} open={open} onClose={() => handleClose() }>


    <DialogTitle>{sType === undefined || sType === null ? "Send a Broadcast" : "Update Broadcast"} <DefaultTooltip width={16} title="Broadcast a message. It gathers the list of profiles who are available. 3 times per day" 
        url = "https://images.rentbabe.com/assets/question.svg"  /> </DialogTitle>

        <DialogContent>
            {
                <>
                    {
                        (serviceType === ServiceType.meetup && hasMeetup && whereAmI === "SG") ? 
                            <DialogContentText>Singapore</DialogContentText> :
                            <DialogContentText>{`➜ Global Worldwide`}</DialogContentText>
                    }
                </>
            }
            
        <DialogContentText sx={{color: 'red'}}>{information}</DialogContentText> 

        <Box sx={{borderBottom: 1, borderColor: 'divider', marginBottom: 2}}>

            {
                hasMeetup ? <Tabs 
                    textColor='secondary' 
                    indicatorColor='secondary' 
                    value={serviceType} 
                    onChange={handleChange}>
                  
                {(sType === undefined || sType === null) ? <Tab value={ServiceType.meetup} label="Meetup"/> :
                    sType === ServiceType.meetup ? <Tab disabled value={ServiceType.meetup} label="Meetup"/> : null}
          
                {sType === undefined || sType === null ? <Tab value={ServiceType.eMeet} label="E-Meet"/> : 
                sType === ServiceType.eMeet ? <Tab disabled value={ServiceType.eMeet} label="E-Meet"/> : null}

                {sType === undefined || sType === null ? <Tab value={ServiceType.games} label="Games"/> : 
                sType === ServiceType.games ? <Tab disabled value={ServiceType.games} label="Games"/> : null}

                </Tabs> : <Tabs 
                    textColor='secondary' 
                    indicatorColor='secondary' 
                    value={serviceType} 
                    onChange={handleChange}>
            
                    {sType === undefined || sType === null ? <Tab value={ServiceType.eMeet} label="E-Meet"/> : 
                    sType === ServiceType.eMeet ? <Tab disabled value={ServiceType.eMeet} label="E-Meet"/> : null}

                    {sType === undefined || sType === null ? <Tab value={ServiceType.games} label="Games"/> : 
                    sType === ServiceType.games ? <Tab disabled value={ServiceType.games} label="Games"/> : null}
                </Tabs>
            }

        </Box>

        {(serviceType === ServiceType.meetup && hasMeetup) && <>
        <GeoInput 
            restrict={'sg'}
            defaultValue={venue}
            searchFor='venue'
            onChange={() => {
                setVenue(null)
                localStorage.removeItem(newMessageVenue)
            }}
            onPlaceSelected={(formatted_address) => {
                // console.log(formatted_address)
                if(formatted_address){
                    localStorage.setItem(newMessageVenue, formatted_address)
                }
                setVenue(formatted_address)
            }}
        />

        <Box marginTop={2} display="flex" alignItems="center">
            <Activities
                defaultValue={ localStorage.getItem(newMessageActivity) ?? undefined}
                onChange={(index) => {
                    localStorage.setItem(newMessageActivity, index.toString())
                    setActivity(getActivityName(index))
                }}
            />
        </Box>

        </>}

        <br/>
        <br/>

        <FlexBox>
        <ThemeProvider theme={theme}>
            <LocalizationProvider 
            locale={locale} 
            dateAdapter={DateFnsUtils}>

            <MobileDatePicker
            label={t("date")}
            inputFormat="dd/MM/yyyy"
            value={dayjs(date)}
            onChange={handleDateChange}
            renderInput={(params) => <TextField 
                sx={{width: "50%"}} {...params} />}
            />

            </LocalizationProvider>

            </ThemeProvider>
                <FlexGap/>

                <ThemeProvider theme={theme}>
                <LocalizationProvider 
                locale={locale} 
                dateAdapter={DateFnsUtils}>

                <TimePicker
                label={t("time")}
                inputFormat="h:mm a"
                ampmInClock
                ampm
                value={dayjs(time)}
                onChange={handleTimeChange}
                
                renderInput={(params) => <TextField 
                    sx={{width: "50%"}} {...params} />}
                />

                </LocalizationProvider>
            </ThemeProvider>

        </FlexBox>
        
        <br/>
        <br/>

        <TextField
            helperText={
                <Typography fontSize={12} color="error">
                    {/* We ban user who ask for NSFW services or gives out third party messenger on addition information */}
                    {t("rules.warning")}
                </Typography>
            }
            fullWidth
            margin='dense'
            size='small'
            color='secondary'
            placeholder="Additional information"
            variant='standard'
            multiline
            maxRows={5}
            defaultValue={info}
            onChange={onChange}
        /> 

        {/* {
            (isPremium || (points ?? 0) >= 10000 || !uid) ?

            <TextField
                helperText={
                    <Typography fontSize={12} color="error">
                     We ban user who gives out third party messenger on addition information
                    </Typography>
                }
                fullWidth
                margin='dense'
                size='small'
                color='secondary'
                placeholder="Additional information"
                variant='standard'
                multiline
                maxRows={5}
                defaultValue={info}
                onChange={onChange}
            /> 
            
            :

            <DisableInfoInput hint = {1}/>
        } */}

        {
          serviceType === ServiceType.meetup && 
          <FormControlLabel
          control={ <Checkbox size='small' color ='secondary' checked={cabfare} onClick={onCheckChange} />}
          label={
            <DialogContentText variant='caption'>Cab fare provided</DialogContentText>
          }
          labelPlacement="end"
        />}

        </DialogContent>

        <FormControlLabel 
            sx={{width: "100%", paddingRight: "16px"}} 
            labelPlacement="start" 
            control={<Checkbox checked={check} onChange={onChangeCheck} color="secondary"/>} 
            label={
            <Typography color="text.secondary" fontSize={12}>
                I understand that my broadcast message will be monitored
            </Typography>
            } 
        />

        <DialogActions>
            <Button color="secondary" variant='contained' onClick={handleClose}>Cancel</Button>
            <Button 
            onClick={send}
            color="secondary" 
            variant='contained' 
            endIcon={
                loading && <CircularProgress size={12} color="primary"/>
            }
            disabled={!check} >{documentID ? "Update" : "Send"}</Button>
        </DialogActions>


    </Dialog>

    </>

 
}

export default SendBroadcast