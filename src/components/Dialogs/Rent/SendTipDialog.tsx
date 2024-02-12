import {
    ChangeEvent,
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
    Checkbox,
    FormControlLabel,
    Typography,
    LinearProgress
} from '@mui/material';
import PaymentInput from '../../TextField/PaymentInput';
import { httpsCallable } from 'firebase/functions';
import { tipUserFunction } from '../../../keys/functionNames';
import { functions } from '../../../store/firebase';
import CenterSnackBar from '../../../chats/components/Snackbar/CenterSnackBar';
import { useSelectedUser } from '../../../store';


interface props extends DialogProps {
    chatRoomId: string
    onClose: () => void
}

const SendTipDialog : FC<props> = ({chatRoomId, onClose, ...props}) => {


    const currentUser = useSelectedUser((state) => state.currentUser)
    
    const [amount, setAmount] = useState<number>()
    const [loading, setLoading] = useState<boolean>(false)
    const [hasChecked, setCheck] = useState<boolean>(false)

    const [openSnack, setSnack] = useState<boolean>(false)
    const [error, setError] = useState<string>()

    const sendTip = async () => {


        if(!amount || loading || !currentUser?.uid) return 
        
        const tipUser = httpsCallable(functions, tipUserFunction)

        try {
            setLoading(true)
            setError(undefined)
            const res = await tipUser({
                uid: currentUser.uid,
                chatRoomId: chatRoomId,
                amount: amount * 100
            })

            const data = res.data as any;
            const status = data.status

            if(status !== 200){
                const msg = data.message
                setError(msg)
            }else{
                setSnack(true)
                onClose()
            }

            setLoading(false)
        } catch (error) {
            setLoading(false)
        }

    }

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {

        const v = event.target.value
        const _amt = parseFloat(v)

        setAmount(_amt)
    };

    const onChangeCheck = (event: ChangeEvent<HTMLInputElement>, checked: boolean) => {
        setCheck(checked)
    }

    return <>

        <Dialog fullWidth {...props}>

        {loading && <LinearProgress color="secondary" />}

        <DialogTitle>Send {currentUser?.nickname.capitalize()} a Tip</DialogTitle>

        <DialogContent>

            {error && <Typography color="error.main" variant='caption'>{error}</Typography>}

            <PaymentInput 
                fullWidth
                color="secondary"
                margin='dense'
                label="Enter Credit amount"
                variant='standard'
                onChange={handleChange}
            />


        <FormControlLabel 
            sx={{marginLeft: 0}}
            labelPlacement="start" 
            control={<Checkbox onChange={onChangeCheck} color="secondary"/>} 
            label={
            <Typography color="error.main" fontSize={12}>
                I acknowledge that this is not refundable
            </Typography>
            } 
        />

        </DialogContent>


        <DialogActions>
            <Button color="secondary" onClick={onClose}>Cancel</Button>
            <Button disabled={!hasChecked || !amount} color="secondary" onClick={sendTip}>Send</Button>
            
        </DialogActions>

        </Dialog>

        <CenterSnackBar 
            open={openSnack}
            autoHideDuration={1500}
            onClose={() => {setSnack(false)}}
            message={"Transaction success"}
        
        />
    
    </>
 
}

export default SendTipDialog