import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, CircularProgress } from '@mui/material';
import { logEvent } from 'firebase/analytics';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { FC, useState } from 'react';
import { AnalyticsNames } from '../../../keys/analyticNames';
import { ANNOUNCE, country, sender, status, telegram_message_id, time_stamp } from '../../../keys/firestorekeys';
import { closeBroadcastFunction } from '../../../keys/functionNames';
import { analytics, db, functions } from '../../../store/firebase';
import { Announcement } from '../../../utility/Announcement';

interface props {
    uid: string | null | undefined
    nickname: string | null | undefined
    open: boolean
    onClose? : () => void
}

const CloseAllAnnouncementDialog : FC<props> = ({ uid, nickname, open, onClose}) => {

    const announcement = new Announcement()

    const [loading, setLoading] = useState<boolean>(false)

    const onCloseAll = async () => {
        if(!uid) {
            return  
        }

        setLoading(true)

        const snaphsots = await getDocs(
        query(collection(db, ANNOUNCE), 
        where(sender, '==', uid), 
        where(status, '==', 0) , 
        orderBy(time_stamp, 'desc')))

        const docs = snaphsots.docs
        let promises: Promise<any>[] = []

        for (let index = 0; index < docs.length; index++) {
            const doc = docs[index]
            const msg = announcement.convertToAnnouncementMsg(doc)
            const telegramMessageID = doc.get(telegram_message_id) as number
            const _country = doc.get(country) as number

            const replaceTo = `Status:%20<b>${encodeURIComponent(`FOUND, JOB CLOSED by ${nickname?.capitalize() ?? ""}`)}</b>`

            const updated = encodeURIComponent(`Id: ${doc.id}\n`)  + encodeURIComponent(msg).replace('Status%3A%20FOUND%2C%20JOB%20CLOSED', replaceTo).replace('Status%3A%20Searching...', replaceTo)
    
            const closeBroadcast = httpsCallable(functions, closeBroadcastFunction)
    
            const map : any = {
                docID: doc.id,
                message_id: telegramMessageID,
                msg: updated,
                country: _country
            }

            const task = closeBroadcast(map)
            promises.push(task)
        }

        try{
            logEvent(analytics, AnalyticsNames.buttons, {
              content_type: "close all bc",
              item_id: "close all bc", 
            })  
        }catch{}

        try{
            await Promise.all(promises)
        }catch(error){
            console.log(error)
        }finally{
            setLoading(false)
            onClose?.()
        }

    }

    return <Dialog
    open={open}
    onClose={onClose}>
        <DialogTitle>Remove all broadcast</DialogTitle>

            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                Remove all the broadcast message so that the rest will not be waiting for nothing. You cannot retrieve this back anymore.
                </DialogContentText>
            </DialogContent>

            <DialogActions>

                <Button variant="text" color="secondary" onClick={onClose} >
                    Cancel
                </Button>

                <Button disabled={loading} variant="contained" color="secondary" 
                
                endIcon={
                    loading && <CircularProgress size={12} color="secondary" />
                }
                onClick={onCloseAll}>
                    CLOSE ALL BROADCAST
                </Button>

            </DialogActions>
    </Dialog>
 
}   

export default CloseAllAnnouncementDialog