import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, LinearProgress, TextField } from '@mui/material';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { ref , uploadBytes, getDownloadURL} from 'firebase/storage';
import React, {  useRef, useState } from 'react'
import CenterSnackBar from '../../../chats/components/Snackbar/CenterSnackBar';
import { time_stamp , reason as reasonKey, sender, uid, REPORT, url, chat_room_id} from '../../../keys/firestorekeys';
import { db, storage } from '../../../store/firebase';

interface props{
  chatRoomId?: string | undefined
  open: boolean
  reportBy: string | undefined | null
  user: string | undefined
  onClose: () => void
}

const ReportDialog : React.FC<props> = ({chatRoomId, open : showReport, reportBy, user, onClose}) => {

    const file = useRef<File | undefined>()
    const [reason, setReason] = useState<string>()
    const [openToast, setToast] = useState<boolean>(false)

    const [loading, setLoading] = useState<boolean>(false)

    const onToastHandleClose = () => {
      setToast(false)
    }

    const onReport = async (e: any) => {
      e.preventDefault();
      setLoading(true)

      if(!reason || !reportBy || !user) return

      let map : {[key: string] : any} = {
        [reasonKey] : reason, 
        [time_stamp] : serverTimestamp(),
        [uid] : user,
        [sender]: reportBy
      }

      if(chatRoomId){
        map[chat_room_id] = chatRoomId
      }

      if(file.current){

        const uploadImageRef = ref(storage, (`${REPORT}/${reportBy}/${new Date().getTime()}-${file.current.name}`))

        const uploadTask = await uploadBytes(uploadImageRef, file.current)
        const _url = await getDownloadURL(uploadTask.ref) as string

        map[url] = _url.toCloudFlareURL()

      }

      await addDoc(collection(db, REPORT), map)

      setLoading(false)
      setToast(true)

      onClose()

    }

    const onChangeHandle = (e:React.ChangeEvent<HTMLInputElement>) => {

      const element = e?.target as HTMLInputElement
      let files = (element).files

      if (files !== null && files.length !== 0){
          const _file = files[0]
          file.current = _file
      }
  }

    return <>

    <Dialog open={showReport}  onClose={onClose}>
    <form onSubmit={onReport}>
        {loading && <LinearProgress color="secondary" />}
        <DialogTitle id="form-dialog-title">Report user</DialogTitle>

      
        <DialogContent>

          <DialogContentText>
            We take your feedback seriously, please write a reason why are you reporting this profile.
          </DialogContentText>

          <br/>

          <TextField
            required
            autoComplete='off'
            autoFocus
            margin="dense"
            label="Report description"
            fullWidth
            color='secondary'
            variant='standard'
            onChange={(e) => {

              const msg = e.target.value
              setReason(msg)

            }}
          />

          <br/>
          <br/>

          <DialogContentText>
              Upload Image
          </DialogContentText>
          <input required type="file" accept="image/*" onChange={onChangeHandle} ></input>

        </DialogContent>

        <br/>

        <DialogActions>

          <Button onClick={onClose} color="secondary">
            Cancel
          </Button>

          <Button type="submit"  disabled={!reason} color="secondary">
            Report
          </Button>
          
        </DialogActions>
      </form>
      </Dialog>
    
      <CenterSnackBar
        open={openToast}
        onClose={onToastHandleClose}
        message={"Reported"}
        autoHideDuration={1500}/>

    </>
}

export default ReportDialog