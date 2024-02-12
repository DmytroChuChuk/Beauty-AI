import {
    FC,
    useState,
    useEffect,
    ChangeEvent
} from 'react';
import {
    Dialog,
    DialogProps,
    DialogTitle,
    DialogContent,
    DialogActions,
    DialogContentText,
    Button,
    LinearProgress,
    Typography,
    Checkbox,
    FormControlLabel
} from '@mui/material';

import { 
    doc,
    getDoc
} from 'firebase/firestore';
import {chat_room_id, CONVERSATION } from '../../../keys/firestorekeys';
import { sendCreditPaymentV2Function } from '../../../keys/functionNames';
import { httpsCallable } from 'firebase/functions';
import { analytics, db, functions } from '../../../store/firebase';
import Conversation from '../../../utility/Conversation';
import { useCenterSnackBar, useSelectedConversation, useUser } from '../../../store';
import { OrderStruct } from '../../../keys/props/FirestoreStruct';
import shallow from 'zustand/shallow';
import { useWindowSize } from '../../../hooks/useWindowSize';
import history from '../../../utility/history';
import { logEvent } from 'firebase/analytics';
import { ServiceType } from '../../../keys/props/services';
import CenterFlexBox from '../../Box/CenterFlexBox';
import { termsChecked2, termsChecked1 } from '../../../keys/localStorageKeys';
import { termsImage } from '../../../data/images';
import { Box } from '@mui/system';

interface props extends DialogProps {
    data: OrderStruct | undefined
    onCancelHandle: () => void
}

const SendCreditDialog : FC<props> = ({data, onCancelHandle, ...props}) => {


    const [ size ] = useWindowSize()
    const setCenterSnackbar = useCenterSnackBar((state) => state.setCurrentSnackbar)
    const isF2FMeetup = data?.services.serviceType === ServiceType.meetup || data?.services.serviceType === ServiceType.sports
    const termsKey = isF2FMeetup ? termsChecked1 : termsChecked2
    
    const [myUID, profileImage, nickname] = useUser((state) => 
    [
        state.currentUser?.uid, 
        state.currentUser?.profileImage, 
        state.currentUser?.nickname

    ], shallow)

    const setSelectedConversation = useSelectedConversation((state) => state.setSelectedConversation)


    const [loading, setLoading] = useState<boolean>(false)
    const [isCheck, setCheck] = useState<boolean>(localStorage.getItem(termsKey) ?  true : false)
    const [errorMessage, setErrorMessage] = useState<string>()
    const [hasPaid, setPaid] = useState<boolean>(data?.st as number === 2)

    useEffect(() => {
        if(errorMessage){
            setCenterSnackbar({
                open: true,
                message: errorMessage
            })
        }
    }, [errorMessage, setCenterSnackbar])

    const onCheckedHandled = (event: ChangeEvent<HTMLInputElement>, checked: boolean) => {
        if(checked){
            localStorage.setItem(termsKey, "true")
        }else{
            localStorage.removeItem(termsKey) 
        }
        setCheck(checked)

    }

    const sendPayment = async () => {
        
        if(!data || !data.services) {
            setErrorMessage("Unexpected error")
            return
        }

        if(loading){
            return
        }

        setLoading(true)
        setErrorMessage("DO NOT CLOSE")

        try{
            const functionName = sendCreditPaymentV2Function 
            const sendCreditPayment = httpsCallable(functions, functionName);

            let map : {[key: string] : any} = {id: data.id}
            
            if(!myUID || !nickname || !profileImage){
                setLoading(false)
                setErrorMessage("No user data")
                return 
            }
            const conversationHelper = new Conversation()

            const isClient = data.cuid === myUID
            const recipientUid = isClient ? data.buid : data.cuid

            const convo = conversationHelper.senderSendNewConversation(myUID, recipientUid, nickname, 
                profileImage, data.inf?.[recipientUid]?.nick ?? 'null', data.inf?.[recipientUid]?.u ?? 'null', "PAYMENT RECEIVIED")
            map.convo = convo

            // const clubName = sessionStorage.getItem(club)
            // const clubState = sessionStorage.getItem(state)
            
            //make sure babe is under this club too
            //because client might view others profiles via url
            // if(clubName && clubState){
            //     map.extra = {club:{
            //         name: clubName,
            //         state: clubState
            //     }}
            // }
            
            const res = await sendCreditPayment(map);

            const json = res.data as any;
            const status = json.status

            switch (status) {
                case 200:
                      
                    if(data.pr){
                        try{
                            logEvent(analytics, "spend_virtual_currency", {
                                value:  data.pr/100,
                                item_name: "RentBabe virtual currency", 
                                virtual_currency_name: "credit",
                            });  
                        }catch{}
                    }

                    const chatRoomId = data?.cri ?? json.chatRoomId 
                    if(!chatRoomId) {
                        window.location.reload()
                        setPaid(true)

                        return
                    }
              
                    const document = await getDoc(doc(db, CONVERSATION, chatRoomId))
              
                    const convoHelper = new Conversation()
                    const conversation = convoHelper.convertDocToConvo(document)
                    setSelectedConversation({data: conversation})
                    
                    // if(size.width > 620) history.push(`./chat?${chat_room_id}=${document.id}`, conversation)
                    // else history.push('./chatbox', conversation)
                    
                    const pathName = size.width > 620 ? "chat" : "chatbox"
                    history.push(`./${pathName}?${chat_room_id}=${document.id}`, conversation)

                    setPaid(true)

                    break;
                case 201:
                    setErrorMessage("Alread paid")
                    break;
                case 404:
                    setErrorMessage("Does not exist")
                    break;
                case 400:
                    setErrorMessage("Transaction failed, please try again")
                    break;
            }

        }catch(error){  
            setErrorMessage("Unexpected error occur, please try again")
        }finally{
            setLoading(false)
        }
        
    }
// 
    return <> <Dialog {...props} >

        {loading && <LinearProgress color="secondary"/>}

        <DialogTitle>Confirm Payment</DialogTitle>

        <DialogContent>

        <DialogContentText>
            You will be sending {(data?.pr as number / 100)?.toFixed(2)} Credit to {data?.inf?.[data?.buid]?.nick?.capitalize()}.
        </DialogContentText>

        <br/>

        {isF2FMeetup && <CenterFlexBox minHeight={300}>
                <a 
                target="_blank" 
                rel="noreferrer"
                href={termsImage}>
                    <img
                        style={{ maxWidth: "100%", maxHeight: `calc(100vh - ${size.height/2}px)` }}
                        src={termsImage}
                        alt=""
                    />
                </a>
        </CenterFlexBox>}

        </DialogContent>

        <Box padding="20px 24px">
        { isF2FMeetup ? <FormControlLabel
            labelPlacement="end" 
            disabled={loading}
            control={<Checkbox checked={isCheck} size='small' onChange={onCheckedHandled} color="warning" />} 
            label={<Typography variant='caption' color="error">I have read and understand the <a
            target="_blank" 
            rel="noreferrer"
            href={termsImage}
            >terms</a> above. By paying, I agree to and accept the <a
            target="_blank" 
            rel="noreferrer"
            href={termsImage}
            >terms</a>.</Typography>}
        /> : <FormControlLabel 
            labelPlacement="end"
            disabled={loading}
            control={<Checkbox checked={isCheck} size='small' onChange={onCheckedHandled} color="warning" />} 
            label={<Typography variant='caption' color="error">I understand that I only have 72 hours to request for a refund from the date of purchase. I am advice to make payment in 1-2 days in advance.</Typography>}
        />}
        </Box>

        <DialogActions>

            <Button variant="contained" color="inherit" 
            disabled={loading}
            onClick={onCancelHandle}> 
                Cancel
            </Button>

            <Button variant="contained" color="warning"
            onClick={sendPayment} 
            disabled={isCheck ? (!data || !data?.pr || loading || hasPaid) : true}>
                Send
            </Button>

        </DialogActions>

        </Dialog>

        

    </>

 
}

export default SendCreditDialog