import {
    ChangeEvent,
    FC,
    useEffect,
    useState,
} from 'react';
import {
    Dialog,
    DialogProps,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    LinearProgress,
    Typography,
    Checkbox,
    FormControlLabel,
    DialogContentText,
    InputAdornment,
    CircularProgress
} from '@mui/material';
import { useUser } from '../../../../store';
import {  onAuthStateChanged } from 'firebase/auth';
import { analytics, auth, db, functions } from '../../../../store/firebase';

import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import { phoneNumber } from '../../../../keys/localStorageKeys';
import { deleteField, doc, setDoc, Timestamp, updateDoc } from 'firebase/firestore';
import {  PHONE, paynow } from '../../../../keys/firestorekeys';

import { parsePhoneNumber } from 'libphonenumber-js';
import shallow from 'zustand/shallow';
import { httpsCallable } from 'firebase/functions';
import { logEvent } from 'firebase/analytics';
import { AnalyticsNames } from '../../../../keys/analyticNames';

interface props extends DialogProps {
    paynowNumber: string | undefined
    limit: Timestamp[] | undefined
    hasBind: boolean
    onClose: () => void
}

const BindPhoneDialog : FC<props> = ({paynowNumber, limit, hasBind, onClose, ...props}) => {


    const [_uid, myPhoneNumber] = useUser((state) => [state?.currentUser?.uid, 
        state?.currentUser?.phoneNumber], shallow)
    const setCurrentUser = useUser((state) => state.setCurrentUser)


    const [loading, setLoading] = useState<boolean>(false)
    const [phone, setPhone] = useState<string>(paynowNumber ?? myPhoneNumber ?? "")

    const [error, setError] = useState<string>()
    const [isSame, setSame] = useState<boolean>(false)
    const [code, setCode] = useState<string>()
    const [hasSend, setSend] = useState<boolean>(false)
    const [isSending, setSending] = useState<boolean>(false)

    useEffect(() => {

        if(!myPhoneNumber && !paynowNumber) {
            const sub = onAuthStateChanged(auth, 
                (user) => {
                    if(user){
                        const _phoneNumber = user.phoneNumber
                        setCurrentUser({phoneNumber: _phoneNumber})
        
                        if(_phoneNumber) {
                            localStorage.setItem(phoneNumber, _phoneNumber)
                            setPhone(_phoneNumber)
                        } else localStorage.removeItem(phoneNumber)
                    }
                }, 
                (error)=>{console.log(error)},
                () => {setLoading(false)}
            )
    
            return () => {
                sub()
            }
        }else{
            setLoading(false)
        }
        // eslint-disable-next-line
    } , [myPhoneNumber])

    // useEffect(() => {
    
    //     setSame(phone === myPhoneNumber)
    //     // eslint-disable-next-line
    // }, [phone])

    const unbind = async () => {

        if(!_uid) return

        setLoading(true)

        await updateDoc(doc(db, PHONE, _uid), {
            [paynow]: deleteField()
        })

        setLoading(false)

        window.location.reload()
    }

    function onBindSucces(){
        try{
            logEvent(analytics, AnalyticsNames.buttons, {
                content_type: "bind phone",
                item_id: "bind phone", 
              })  
        }catch(error){  
            console.log(error)
        }

        window.location.reload();
    }

    const onBind = async () => {


        if(!_uid) return

        try{
            setLoading(true)
            const _country = parsePhoneNumber(phone).country

            if(_country !== "SG") {
                setError("Wrong Country")
                return
            }

            setError("")

            if(phone === myPhoneNumber){
       
                setLoading(true)
                await setDoc(doc(db, PHONE, _uid), {
                    [paynow]: phone
                }, {merge: true})

                setLoading(true)

                onBindSucces()
            }else {
                // custom auth

                const verifyPhoneNumber = httpsCallable(functions, 
                    'verifyPhoneNumber');

                const res = await verifyPhoneNumber({
                    code: code
                });
        
                const data = res.data as any;
                const status = data.status;

                if(status === 200){
                    onBindSucces()
                }else{
                    const message = data.message
                    setError(`${message}`)
                }
            }


        }catch(error){
            setError("Invalid Country")
        }finally{
            setLoading(false)
        }

    }

    const onChangeHandler = (phone : any) => {
        const _phone = `+${phone}`
        setPhone(_phone)
    }

    const onCheckHandler = (event: ChangeEvent<HTMLInputElement>, checked: boolean) => {
        setSame(checked)
    }

    const onCodeHandler = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const value = e.target.value
        setCode(value)
    }

    const sendCode = async () => {
        
        if(phone === "+") return

        setSending(true)

        const phoneNumberAuth = httpsCallable(functions, 'phoneNumberAuth');

        const res = await phoneNumberAuth({
            phoneNumber: phone
        });

        const data = res.data as any;

        const status = data.status;
        const message = data.message;

        if(status !== 200){
            setError(`${message}`)
        }else{
            // enable code input
            setSend(true)
        }

        setSending(false)
    }

    const isToday = (someDate: Date) => {
        const today = new Date();
        return someDate.getDate() === today.getDate() &&
            someDate.getMonth() === today.getMonth() &&
            someDate.getFullYear() === today.getFullYear();
    };

    const todayTries = limit?.filter(timestamp => {
        return isToday(timestamp.toDate())
    })


    if((todayTries?.length ?? 0) > 5 
    || (limit?.length ?? 0) > 30) return <Dialog {...props}>
        <DialogTitle>Exceeded Limits</DialogTitle>

        <DialogContent>
            <DialogContentText>
                You have exceeded the number of tries to bind your phone number
            </DialogContentText>
        </DialogContent>

        <DialogActions>
            <Button 
            onClick={onClose} 
            color="warning">
                Cancel</Button>
         </DialogActions>
    </Dialog>

    else return <Dialog 
    {...props}>
        {loading && <LinearProgress color="warning" />}
         <DialogTitle>{hasBind ? "Disconnect" : "Connect"} phone number</DialogTitle>

         <DialogContent>
            <PhoneInput
                inputStyle={{color: "black", width: "250px"}}
                country={"sg"}
                onlyCountries={["sg"]}
                disableDropdown
                disabled={loading || !!paynowNumber}
                value={phone}
                onChange={onChangeHandler}
            />

            {myPhoneNumber !== phone && !paynowNumber && <TextField
                sx={{ width: 200}}
                disabled={hasSend ? false : true}
                margin="dense"
                placeholder='1234567'
                size='small'
                autoComplete='off'
                color="warning"
                focused={hasSend}
                onChange={onCodeHandler}
                InputProps={{style: {
                    height: 32,
                    fontSize: 12
                }, endAdornment: <InputAdornment position="end">
                    <Button 
                        onClick={sendCode} 
                        variant='text' 
                        color="warning">{
                            isSending ? <CircularProgress 
                            size={11} 
                            color="warning"/> : hasSend ? "RESEND" : "SEND"
                    }</Button>
              </InputAdornment>}}
       
            />}

            {myPhoneNumber === phone && !paynowNumber && <>
                <br/>
                <FormControlLabel 
                    control={<Checkbox onChange={onCheckHandler} color="warning" />} 
                    label={
                        <DialogContentText fontSize={12}>
                            My login phone number is the same as my PayNow phone number
                        </DialogContentText>
                    }
                />
            </>}

            <Typography color="error.main" variant='caption'>{error}</Typography>
         </DialogContent>

         <DialogActions>
            <Button 
            onClick={onClose} 
            color="warning">
                Cancel
            </Button>
            <Button 
            onClick={paynowNumber ? unbind : onBind}
            disabled={loading ? true : paynowNumber ? false : isSame ? false :  code?.length !== 7 } 
            color="warning">{
            hasBind ? "Disconnect" : "Connect"}</Button>
         </DialogActions>

    </Dialog>
 
}

export default BindPhoneDialog