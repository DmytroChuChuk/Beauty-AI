import { Accordion, Typography, AccordionDetails, Dialog, DialogTitle, DialogContent, DialogActions, Button, LinearProgress } from '@mui/material';
import { FC, useRef, useState } from 'react';
import AccordionIcon from '../components/AccordionIcon';

import AdminVideos from '../components/AdminVideos';
import { AdminAccordionSummary } from '../components/AdminAccordionSummary';
import { db } from '../../../store/firebase';
import { deleteField, doc, updateDoc } from 'firebase/firestore';
import { cache_video_urls, USERS, video_urls_2 } from '../../../keys/firestorekeys';
import { useUser } from '../../../store';
import { useTranslation } from 'react-i18next';

interface props {
    expanded : boolean
    onChange?: (event: React.SyntheticEvent, expanded: boolean) => void
    videos: string[]
    upload: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const VideoPanel : FC<props> = ({expanded, onChange, videos, upload }) => {

    const [ t ] = useTranslation()
    
    const [uid] = useUser((state) => [state.currentUser?.uid])
    const [open, setOpen] = useState<boolean>(false)
    const [isLoading, setLoading] = useState<boolean>(false)
    const indexRef = useRef<number | undefined>(undefined)

    const onRemoveVideo = (index: number) => {
        indexRef.current = index
        setOpen(true)
    }

    return  <>

        <Accordion sx={{width: "100%"}} expanded={expanded} onChange={onChange}>
            <AdminAccordionSummary>
                <AccordionIcon src="https://images.rentbabe.com/assets/admin/admin_video.svg"/>
                <Typography marginLeft={3}>{t("videos")}</Typography>
            </AdminAccordionSummary>

            <AccordionDetails>
                <AdminVideos videos={videos} onChange={upload} removeVideo={onRemoveVideo}/>
            </AccordionDetails>
        </Accordion>

        <Dialog fullWidth open={open}>

            {isLoading && <LinearProgress color="secondary"/>}
            <DialogTitle>Remove Video</DialogTitle>

            <DialogContent>Are you sure?</DialogContent>

            <DialogActions>

                <Button variant='contained' color='inherit' onClick={() => {
                    setOpen(false)
                    indexRef.current = undefined
                }}>Cancel</Button>

                <Button variant='contained' onClick={async () => {
                    // delete video
                    const index = indexRef.current
                    if(index === undefined || !uid){
                        setOpen(false)
                        return
                    }

                    videos[index] = ""

                    setLoading(true)
                    await updateDoc(doc(db, USERS, uid), {
                        [cache_video_urls]: videos,
                        [`${video_urls_2}.${index}`]: deleteField()
                    })

                    setLoading(false)
                    setOpen(false)

                }} color='error'>Delete</Button>

            </DialogActions>

        </Dialog>
    
    
    </>
 
}

export default VideoPanel