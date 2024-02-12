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
    DialogContentText,
    Button,
    Typography,
    CircularProgress
} from '@mui/material';
import { removeDoubleDatesv1Function } from '../../../keys/functionNames';
import { functions } from '../../../store/firebase';
import { httpsCallable } from 'firebase/functions';

interface props extends DialogProps {
    otherUUID: string | undefined
    callback: () => void
}

const RemoveDDUserDialog : FC<props> = ({otherUUID, callback, ...props}) => {


    const [ isLoading, setLoading ] = useState<boolean>(false)
    const [ error, setError ] = useState<string>()



    const onRemove = async (e: any) => {

        if(!otherUUID){
            setError("Unexpected error")
            return
        }
        const removeDoubleDatesv1 = httpsCallable(functions, removeDoubleDatesv1Function)

        try{
            setLoading(true)
            const res = await removeDoubleDatesv1({
                otherUUID: otherUUID
            })
    
            const json = res.data as any
            const status = json.status
            const message = json.message

            if(status === 200){
                callback()
                props?.onClose?.(e, 'backdropClick')
                
            }else{
                setError(message)
            }

        }catch(error){
            console.log(error)
            setError(`${error}`)
        }finally{
            setLoading(false)
        }
    }



    return <Dialog  {...props}>
         <DialogTitle>Remove user</DialogTitle>
         <DialogContent>
            <DialogContentText>
                This action will remove both parties double date service.
            </DialogContentText>

            <Typography variant='caption' color="error">{error}</Typography>
         </DialogContent>
         <DialogActions>
             <Button variant='contained' color="inherit" onClick={(e) => {
             
                props?.onClose?.(e, "backdropClick")
                
               
             }}>CANCEL</Button>
            <Button endIcon={
                isLoading && <CircularProgress size={12} color="secondary" />
            } disabled={isLoading} variant='contained' color="error" onClick={onRemove}>REMOVE</Button>
         </DialogActions>
    </Dialog>
 
}

export default RemoveDDUserDialog