import {Button, Card, CardContent, DialogActions, LinearProgress, TextField, Typography } from '@mui/material';
import { FC, useEffect, useState } from 'react';
import { Helper } from '../../utility/Helper';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../store/firebase';
import { ANNOUNCE } from '../../keys/firestorekeys';
import CenterFlexBox from '../../components/Box/CenterFlexBox';
import { sendTelegramNotificationToAdmin } from '../../keys/filters';
import LoadingScreen from '../../components/Loaders/LoadingScreen';
import { useUser } from '../../store';
import shallow from 'zustand/shallow';


const ReportAnnouncementPage : FC = () => {

    interface Announcement {
        sen?: string | undefined
        act?: string | undefined
        u?: string | undefined
        tmid?: number | undefined
    }

    const [myUID] = useUser((state) => [state.currentUser?.uid],shallow)
    
    const helper = new Helper()
    const id = helper.getQueryStringValue("id")

    const [submitted, setSubmitted] = useState<boolean>(false)
    const [isSubmitting, setSubmitting] = useState<boolean>(false)
    const [isLoading, setLoading] = useState<boolean>(true)
    const [reason, setReason] = useState<string>()
    const [announcement, setAnnouncement] = useState<Announcement | undefined>(undefined)

    useEffect(() => {
        if(!id){
            return
        }

        getDoc(doc(db, ANNOUNCE, id)).then((snapshot) => {

            if(snapshot.exists()){
                const _announcement = snapshot.data() as Announcement | undefined
                setAnnouncement(_announcement)
            }

            setLoading(false)

        })
// eslint-disable-next-line
    } , [])

    const onSubmit = async (e: any) => {
        e.preventDefault();
        // https://t.me/c/1762500999/1640
        const base = "https://t.me/c/1762500999/"
        const messageLink = `TELE: ${base}${announcement?.tmid ?? "error"}\n\n`

        let msg = "REPORT BROADCAST\n\n"
        msg += messageLink
        msg += `By: https://rentbabe.com/Profile?uid=${myUID}\n\n`
        msg += `SENDER: https://rentbabe.com/Profile?uid=${announcement?.sen}\n\n`
        msg += `REASON: ${reason}`

        setSubmitting(true)
        await sendTelegramNotificationToAdmin(msg)
        setSubmitting(false)
        setSubmitted(true)
    }

    if(isLoading) return <LoadingScreen/>

    return <CenterFlexBox className='chat-background' height="100vh">


        {(!isLoading && !announcement) ? <Typography>Unable to find broadcast...</Typography> :

        <Card sx={{minWidth: 300, maxWidth: 350, minHeight: 100}}>
            <form onSubmit={onSubmit}>
            <CardContent>

            {(isSubmitting) && <LinearProgress color="secondary"/>}

                <Typography gutterBottom variant="h5" component="div">
                    {submitted ? "Thank you for the feedback" : "Report Broadcast"}
                </Typography>

                { !submitted && <Typography  variant='caption' gutterBottom component="div">
                    Please report broadcast if you think that it's unsafe, scam, dangerous or a spam.
                </Typography>}

                {!submitted && <TextField
                    autoComplete='off'
                    autoFocus
                    margin="dense"
                    label="Reason"
                    fullWidth
                    required
                    color='secondary'
                    variant='standard'
                    onChange={(e) => {

                        const msg = e.target.value
                        setReason(msg)

                    }}
                />}

                {
                    submitted && <Typography>We have received your report and will investigate on this matter.</Typography>
                }

            </CardContent>

            <DialogActions>
                {!submitted && <Button type="submit" disabled={isSubmitting || submitted} color='secondary'>Submit</Button>}
            </DialogActions>
            </form>
        </Card>
        
        }



    </CenterFlexBox>
 
}

export default ReportAnnouncementPage