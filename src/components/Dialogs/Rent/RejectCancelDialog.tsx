import {
    FC,
    useState,
} from 'react';
import {
    Dialog,
    DialogProps,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { CancelRejectProps } from '../../../keys/props/common';
import { CancelOrReject } from '../../../enum/MyEnum';
import { emailExp, phoneExp } from '../../../keys/Regex';
import { useUser } from '../../../store';
import shallow from 'zustand/shallow';
import { doc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { CONVERSATION, MESSAGES, ORDER, lastMessage, reject_reason, status, time_stamp, updatedAt } from '../../../keys/firestorekeys';
import { db, functions } from '../../../store/firebase';
import { option } from '../../../chats/components/Message/RequestOrderBubble';
import { OrderStatusEnum } from '../../../enum/OrderEnum';
import { httpsCallable } from 'firebase/functions';
import { sendPushNotificationFunction, sendTelegramNotificationFunction } from '../../../keys/functionNames';
import { messenger, nsfw, payment, sendTelegramNotificationToAdmin } from '../../../keys/filters';

interface props extends DialogProps {
    data: CancelRejectProps | null
}

const RejectCancelDialog : FC<props> = ({data, ...props}) => {

    const chatRoomId = data?.cri
    const messageId = data?.mid

    const [ t ] = useTranslation()
    const [ 
        myNickname, 
        teleId,
        APNSToken,
        myProfileImage
    ] = useUser((state) => [
        state.currentUser?.nickname, 
        state.currentUser?.teleId, 
        state.currentUser?.APNSToken, 
        state.currentUser?.profileImage], shallow)

    const [reason, setReason] = useState("")
    const [hasError, setError] = useState(false)

    const onConfirm = async () => {
        
        if(!reason){
            setError(true)
            return
        }

        if(!chatRoomId || !messageId){
            return
        }

        let promises = []

        // filter reason 
        const censor = "****"
        const _reason = reason?.replace(phoneExp, censor).replace(emailExp, censor)
        const action = data.st === CancelOrReject.CANCEL ? "cancel" : "rejected"

        var msg =  `${myNickname?.capitalize()} has ${action} your order.`
        msg += _reason ? ` Reason:\n\n${_reason}` : ""

        let batch = writeBatch(db)
        
        batch.update(doc(db, CONVERSATION, chatRoomId, MESSAGES, messageId), {
            [status]: option.reject,
            [reject_reason]: msg
        })

        batch.update(doc(db, CONVERSATION, chatRoomId), {
            [updatedAt]: serverTimestamp(),
            [lastMessage]: `Order ${action}`
        })

        const orderId = data.plink?.getQueryStringValue("id")
        if(orderId){
            batch.update(doc(db, ORDER, orderId), {
                [time_stamp]: serverTimestamp(),
                [status]: OrderStatusEnum.cancel
            })
        }
        
        promises.push(batch.commit())

        const promise = sendTelegramNotification(msg)
        if(promise){
            promises.push(promise)
        }

        const fcm = sendPushNotification(msg)
        if(fcm){
            promises.push(fcm)
        }

        const warning = checkForThirdParty(msg)
        if(warning){
            promises.push(warning)
        }

        //setLoading(true)
        setError(false)

        Promise.all(promises)
        props.onClose?.({}, "backdropClick")
        //setLoading(false)
    }

    function checkForThirdParty(content: string | undefined): Promise<void> | undefined{

        if(!content){
            return undefined
        }

        const filter = content.replace(/[^a-zA-Z ]/g, "").toLowerCase()

        let selected = ""

        if (payment.some((word) => {
            selected = word
            return filter.includes(word)})) {
                const chatLink = `${window.location.origin}/chatview?cri=${chatRoomId}` 
                return sendTelegramNotificationToAdmin(
                    `${chatLink} doing off-platform transaction [${selected}]\n\n${filter}`)
        }else if (messenger.some((word) => {
            selected = word
            return filter.includes(word)})) {
                const chatLink = `${window.location.origin}/chatview?cri=${chatRoomId}` 
                return sendTelegramNotificationToAdmin(
                    `${chatLink} doing off-platform messaging [${selected}]\n\n${filter}`)
        }else if (nsfw.some((word) => { 
            selected = word
            return filter.includes(word) })) {
            const chatLink = `${window.location.origin}/chatview?cri=${chatRoomId}` 
            return sendTelegramNotificationToAdmin(
                `${chatLink} doing NSFW request [${selected}\n\n${filter}]`)
        }
        
        return undefined
    }

    function sendPushNotification(body: string | null | undefined) : Promise<any> | undefined{
        if(APNSToken){
            const sendPushNotification = httpsCallable(functions, sendPushNotificationFunction)
            return sendPushNotification({
                token: APNSToken,
                title: myNickname ?? "User",
                body: body ?? "",
                icon: myProfileImage ?? ""
            })  
        }
        
        return undefined
    }

    function sendTelegramNotification(text: string): Promise<any> | undefined{

        if(teleId){
            const sendTelegramNotification = httpsCallable(functions, sendTelegramNotificationFunction)
            const _text = encodeURIComponent(text)

            return sendTelegramNotification({
              tele_id: teleId,
              text: _text
            })
        }
        return undefined
    }

    if (!data) return null
    else return <Dialog fullWidth {...props}>
         <DialogTitle>{data.st === CancelOrReject.CANCEL ? t("cancel.reason") : t("rejected.reason")}</DialogTitle>
         <DialogContent>
            <TextField
                autoFocus
                margin='dense'
                onFocus={() => {
                    console.log("oaksodaksod")
                    setTimeout(() => {
                        window.scrollTo(0, 100)
                    }, 100)
   
                }}
                fullWidth
                color="secondary"
                multiline
                rows={3}
                maxRows={3}
                error={hasError}
                helperText={hasError && t("reason.required")}
                onChange={(e) => {
                    //setCounter(0)
                    const value = e.currentTarget.value
                    setReason(value)
                }}
            /> 
         </DialogContent>
         <DialogActions>
            <Button 
                color="warning" 
                onClick={(e) => props.onClose?.(e, "backdropClick")}>{t("cancel")}</Button>
            <Button 
                color="warning" 
                onClick={onConfirm}>{t("confirm")}</Button>
         </DialogActions>
    </Dialog>
 
}

export default RejectCancelDialog