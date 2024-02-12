import { Box, Button, LinearProgress, TextField } from '@mui/material';
import { deleteField, doc, getDoc, writeBatch } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { FC, useEffect, useState } from 'react';
import { reject_reason_after, url, urls, USERS, VERIFY, video_verification } from '../../../keys/firestorekeys';
import { sendPushNotificationFunction, sendTelegramNotificationFunction } from '../../../keys/functionNames';
import { APNSTokenProps } from '../../../store';
import { db, functions } from '../../../store/firebase';
import CenterFlexBox from '../../Box/CenterFlexBox';

interface props {
    uid: string
    getTeleId: string | undefined
    userAPNSToken: APNSTokenProps | undefined
    onClose?: () => void
}

const GovApprovals : FC<props> = ({uid, getTeleId, userAPNSToken, onClose}) => {

    const defaultReason = "Government issued ID verification rejected. Please take a clear selfie photo of you holding your government issued ID. Date of birth and photo on your ID must be visible."
    const [rejectedReason, setRejectedReason] = useState<string>(defaultReason)

    const [loading, setLoading] = useState<boolean>(false)

    const [urlState, setUrl] = useState<string[] | undefined>()

    const onRejectedReason = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> ) => {
  
        const value = event.currentTarget.value    
        setRejectedReason(value)
    
      }

    useEffect(() => {
        setLoading(true)
        getDoc(doc(db, VERIFY, uid)).then((_doc) => {
            if(_doc.exists()){

                const _url = _doc.get(url) as string | undefined
                const _urls = _doc.get(urls) as string[] | undefined

                setUrl(_urls ?? [_url ?? ""])

            }
        }).finally(() => {
            setLoading(false)
        })
    // eslint-disable-next-line
    } , [])

    const onClick = async () => {

        let batch = writeBatch(db)

        batch.update(doc(db, USERS, uid), 
        {
            [video_verification]: true,
            [reject_reason_after]: deleteField()
        })

        batch.delete(doc(db, VERIFY, uid))

        setLoading(true)

        let promiseArray = []

        const sendTelegramMessage = httpsCallable(functions, sendTelegramNotificationFunction);
        const msg = "Government issued ID verification success. You are now able to accept Orders anf serve your services."

        if(getTeleId) {
          promiseArray.push(sendTelegramMessage({
            tele_id: getTeleId,
            text: encodeURIComponent(msg)
          }))
        }

        if(userAPNSToken){
            const sendPushNotification = httpsCallable(functions, sendPushNotificationFunction);
            promiseArray.push(sendPushNotification({
              token: userAPNSToken,
              title: "Official Admin",
              body: msg,
            }))
        }

        promiseArray.push(batch.commit())

        await Promise.all(promiseArray)

        setLoading(false)
        onClose?.()
        
    }

    const onClickReject = async () => {

        if(!rejectedReason) return

        let batch = writeBatch(db)

        batch.update(doc(db, USERS, uid), 
        {
            [video_verification]: deleteField(),
            [reject_reason_after]: rejectedReason
        })

        batch.delete(doc(db, VERIFY, uid))

        setLoading(true)

        let promiseArray = []

        const sendTelegramMessage = httpsCallable(functions, sendTelegramNotificationFunction);
 

        if(getTeleId) {
          promiseArray.push(sendTelegramMessage({
            tele_id: getTeleId,
            text: encodeURIComponent(rejectedReason)
          }))
        }

        if(userAPNSToken){
            const sendPushNotification = httpsCallable(functions, sendPushNotificationFunction);
            promiseArray.push(sendPushNotification({
              token: userAPNSToken,
              title: "Official Admin",
              body: rejectedReason,
            }))
        }

        promiseArray.push(batch.commit())

        setLoading(false)
        onClose?.()
        
    }

    return <CenterFlexBox flexDirection="column" paddingBottom={4} paddingLeft={1} paddingRight={1}>

        {loading && <LinearProgress color="warning"/>}

        <CenterFlexBox width="100%">

            {
                urlState?.map((url, index) => {
                    return <div key={index}>
            
                    <a href={url} target="_blank" rel="noreferrer">
                        <img
                            width={200} 
                            height={200} 
                            src={url}
                            alt=""
                        />
                    </a>

                    </div>
                })
            }

        </CenterFlexBox>

        <TextField
            fullWidth
            defaultValue={rejectedReason}
            multiline
            onChange={onRejectedReason}
            placeholder='rejected reason...'
            color='secondary'
            variant='outlined'
            rows={4}
        />


        <br/>
        <br/>


        <Box>

            <Button 
                variant='contained' 
                disabled={loading} 
                color="success" 
                onClick={onClick}
            >
                APPROVE
            </Button>  

            <Button 
                variant='contained' 
                disabled={loading} 
                color="error" 
                onClick={onClickReject}
            >
                REJECT
            </Button>

        </Box>


    </CenterFlexBox>
 
}

export default GovApprovals