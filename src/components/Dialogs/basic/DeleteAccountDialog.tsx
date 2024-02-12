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
    TextField,
    LinearProgress
} from '@mui/material';
import { auth, db } from '../../../store/firebase';
import { admin, APNSToken, availability, bio, club, CREDIT, dob, gender, height, isg_access_token, 
    isg_timestamp_created, isOnline, mobileUrl, myReferrals, nickname, privacy, ratings, ratings2, services, tele_id, time_stamp, 
    urls, username, USERS, video_verification, voice_url } from '../../../keys/firestorekeys';
import { deleteField, doc, writeBatch } from 'firebase/firestore';

interface props extends DialogProps {
    myUid:string
    open: boolean
    onClose: () => void
}

const DeleteAccountDialog : FC<props> = ({myUid: myUUID, open, onClose}) => {

    const [input, setInput] = useState<string>()

    const [isLoading, setLoading] = useState(false)

    const onChangeHandle = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> ) => {
        const value = event.currentTarget.value
        setInput(value)    
    }
    
    const deleteClick = async() => {
        setLoading(true)

        let batch = writeBatch(db);
        const creditRef = doc(db, CREDIT, myUUID);
        const userRef = doc(db, USERS, myUUID);

        // TODO: THIS IS A WRONG WAY TO DELTE USER
        batch.update(userRef,{
            [admin]: deleteField(),
            [time_stamp]: deleteField(),
            [mobileUrl]: deleteField(),
            [urls]: deleteField(),
            [bio]: deleteField(),
            [username]: deleteField(),
            [nickname]: deleteField(),
            [voice_url]: deleteField(),
            [isg_access_token]: deleteField(),
            [APNSToken]: deleteField(),
            [isg_timestamp_created]: deleteField(),
            [height]: deleteField(),
            [video_verification]: deleteField(),
            [gender]: deleteField(),
            [dob]: deleteField(),
            [availability]: deleteField(),
            [club]: deleteField(),
            [privacy]: deleteField(),
            [isOnline]: deleteField(),
            [services]: deleteField(),
            [myReferrals]: deleteField(),
            [ratings]: deleteField(),
            [ratings2]: deleteField(),
            [tele_id]: deleteField()
        })

        batch.delete(creditRef);

        await batch.commit();
        await auth.signOut();

        window.location.href = ""
    }

    return <Dialog open={open}>
        {isLoading && <LinearProgress color="secondary" />}
         <DialogTitle>{"Delete Account"}</DialogTitle>

         <DialogContent>
         <span className="notranslate">
            Confirm that you want to delete your account by typing: <b>DELETE</b>
         </span>
            
            <TextField
                size='small'
                margin='dense'
                rows={1}
                color="secondary" 
                onChange={onChangeHandle}
            />
        </DialogContent>

         <DialogActions>

            <Button color="inherit" variant='text' onClick={onClose}>Cancel</Button>
            <Button disabled = {input !== "DELETE"} color="error" variant='contained' onClick={ deleteClick }>
                Delete
            </Button>

         </DialogActions>
    </Dialog>
 
}

export default DeleteAccountDialog