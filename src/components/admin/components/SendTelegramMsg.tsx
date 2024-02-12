import { Button, CircularProgress, TextField } from '@mui/material';
import { Box } from '@mui/system';
import { deleteField, doc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { FC, useState } from 'react';
import { admin, block, isOnline, PREMIUM, reason as reasonKey, reject_reason, time_stamp, uid, USERS } from '../../../keys/firestorekeys';
import { sendTelegramNotificationFunction } from '../../../keys/functionNames';
import { db, functions } from '../../../store/firebase';
import CenterFlexBox from '../../Box/CenterFlexBox';
import FlexGap from '../../Box/FlexGap';

interface props {
    userUid: string
    teleId: string | undefined
}

const SendTelegramMsg : FC<props> = ({userUid, teleId}) => {

    const [loading, setLoading] = useState<boolean>(false)
    const [msg, setMsg] = useState<string>()

    const onChangeHandle = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> ) => {
        const value = event.currentTarget.value
        setMsg(value)
    }


    const onSend = async () => {

        if(!teleId || !msg) return
  
        setLoading(true)
        const sendTelegramMessage = httpsCallable(functions, sendTelegramNotificationFunction)
        try{
            const res = await sendTelegramMessage({
                tele_id: teleId,
                text: encodeURIComponent(msg)
            })

            const data = res.data as any

            if(data.status === 200){
                console.log("sent")
            }else{
                console.log("error")
            }
        }catch(error){
            console.log(error)
        }
            
        setLoading(false)
    }

    const unbanUserClick = async () => {
        // add PREMIUM block
        // add IP ADDRESS
        setLoading(true)
        try{
            await updateDoc(doc(db, PREMIUM, userUid), {[block]: deleteField()})
        }catch(err){
            console.log(err)
        }finally{
            setLoading(false)
        }        
    }

    const removeUser  = async () => { 

        setLoading(true)

        let map: {[key:string]: any} = {
            [time_stamp]: deleteField(),
            [admin]: deleteField(),
            [isOnline]: deleteField(),
        }

        if(msg) map[reject_reason] = msg

        await updateDoc(doc(db, USERS, userUid), map)

        if(teleId && msg){
            const sendTelegramMessage = httpsCallable(functions, sendTelegramNotificationFunction);
            const res = await sendTelegramMessage({
                tele_id: teleId,
                text: encodeURIComponent(msg)
            })

            await sendTelegramMessage({
                tele_id: "858353262",
                text: encodeURIComponent(msg)
            })
    
            const data = res.data as any
    
            if(data.status === 200){
                console.log("sent")
            }else{
                console.log("error")
            }

        }
        setLoading(false)
    }

    const banUserClick = async () => {
        // add PREMIUM block
        // add IP ADDRESS
        if(!msg) return

        setLoading(true)

        let blockMap : {[key: string]: any} = {
            [uid]: userUid,
            [block]: {
                [uid]: userUid,
                [time_stamp]: serverTimestamp(),
                [reasonKey]: msg
            }
        }

        try{
            await Promise.all([
                setDoc(doc(db, PREMIUM, userUid), blockMap, {merge: true}),
                setDoc(doc(db, USERS, userUid), {
                    [isOnline]: deleteField(),
                    [time_stamp]: deleteField()
                }, {merge: true})
            ])
        }catch(err){
            console.log(err)
        }finally{
            setLoading(false)
        }
        
    }


    return <Box padding={2}>

        <CenterFlexBox>
        <TextField
        fullWidth
            rows={6}
            color="secondary" 
            onChange={onChangeHandle}
        />

        <FlexGap/>

        <Button disabled={loading || teleId ? false : true} variant='contained' color="secondary" onClick={onSend} endIcon={
            <>
                {
                    loading && <CircularProgress size={12} color="secondary" />
                }
            </>
        }>
            SEND
        </Button>
        </CenterFlexBox>

        <br/>
        <br/>

        <Button 
        fullWidth 
        variant='contained' 
        color="warning"
        endIcon={loading && <CircularProgress size={12} color="primary" />} 
        onClick={removeUser}>REMOVE USER</Button>

        <br/>
        <br/>

        <Button 
        fullWidth 
        disabled={msg ? false : true}
        variant='contained' 
        color="error"
        endIcon={loading && <CircularProgress size={12} color="primary" />} 
        onClick={banUserClick}>BAN USER</Button>
        
        <br/>
        <br/>

        <Button 
        fullWidth 
        variant='contained' 
        color="success"
        endIcon={loading && <CircularProgress size={12} color="primary" />} 
        onClick={unbanUserClick}>UNBAN USER</Button>



    </Box>
 
}

export default SendTelegramMsg