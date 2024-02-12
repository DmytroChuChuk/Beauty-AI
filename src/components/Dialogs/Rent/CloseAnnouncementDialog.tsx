import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, CircularProgress } from '@mui/material';
import { httpsCallable } from 'firebase/functions';
import { FC, useState } from 'react';
import { closeBroadcastFunction } from '../../../keys/functionNames';
import { functions } from '../../../store/firebase';

interface props {
    id: string | undefined
    nickname: string | null | undefined
    telegramMessageID: number | undefined
    country: number,
    msg: string | undefined
    open: boolean
    onClose? : () => void
}

const CloseAnnouncementDialog : FC<props> = ({id, nickname, telegramMessageID, country, msg, open, onClose}) => {

    const [loading, setLoading] = useState<boolean>(false)

    const foundOnClick = async () => {


        if(!telegramMessageID || !msg || !id) return

        setLoading(true)
        // setLoading(true)
        // setLoadingMessage('Closing...')
        // setOpen(false)

        const replaceTo = `Status:%20<b>${encodeURIComponent(`FOUND, JOB CLOSED by ${nickname?.capitalize() ?? ""}`)}</b>`

        const updated = encodeURIComponent(`Id: ${id}\n`) +  encodeURIComponent(msg).replace('Status%3A%20FOUND%2C%20JOB%20CLOSED', replaceTo).replace('Status%3A%20Searching...', replaceTo)

        const closeBroadcast = httpsCallable(functions, closeBroadcastFunction)

        const map : any = {
            docID: id,
            message_id: telegramMessageID,
            msg: updated,
            country: country
        }

        try{
            await closeBroadcast(map)
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
        <DialogTitle>Remove broadcast</DialogTitle>

            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                Remove this broadcast message so that the rest will not be waiting for nothing. You cannot retrieve this back anymore.
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
            onClick={foundOnClick}>
                FOUND, JOB CLOSED
            </Button>

            </DialogActions>
    </Dialog>
 
}   

export default CloseAnnouncementDialog