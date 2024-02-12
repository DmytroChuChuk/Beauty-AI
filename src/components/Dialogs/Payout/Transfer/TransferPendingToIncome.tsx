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
    Checkbox,
    FormControlLabel,
    Typography,
    Button,
    DialogContentText,
    LinearProgress
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../../../store/firebase';
import { transferPendingToIncome } from '../../../../keys/functionNames';

interface props extends DialogProps {
    orderId: string
    myReviewLinkId: string | undefined
    reviewId: string
    isClient: boolean
    transferCompleted: () => void
    onCancel: () => void
}

const TransferPendingToIncome : FC<props> = ({
    orderId, 
    myReviewLinkId,
    reviewId, 
    isClient, 
    transferCompleted, 
    onCancel,
    ...props}) => {

    const { t } = useTranslation()

    const [ error, setError ] = useState<boolean>(false)
    const [ isLoading, setLoading ] = useState<boolean>(false)
    const [ check, setCheck ] = useState<boolean>(false)

    const onChangeCheck = (event: ChangeEvent<HTMLInputElement>, checked: boolean) => {
        setCheck(checked)
    }

    const onConfirm = async () => {

        if(isLoading) return
        setLoading(true)

        const transfer = httpsCallable(functions, transferPendingToIncome)

        try{
            const res = await transfer({
                orderId: orderId
            });
    
            const json = res.data as any;
            const status = json.status;
    
            if(status === 200){
                transferCompleted()
            }else{
                setError(true)
            }
        }catch(error){
            setError(true)
        }

        setLoading(false)
    }

    if(isClient) return <Dialog fullWidth {...props}>

        {isLoading && <LinearProgress color="secondary"/>}

        <DialogTitle>{t("confirmation.label")}</DialogTitle>

        <DialogContent>
            {error && <DialogContentText fontWeight="bold" color="error" variant='caption'>{t("error.label")}</DialogContentText>}
            <DialogContentText>
                {t("sendcredit.description")}
            </DialogContentText>
        </DialogContent>

        <br/>
        <br/>

        <FormControlLabel 
            sx={{width: "100%", paddingRight: "16px"}} 
            labelPlacement="start" 
            control={<Checkbox size='small' disabled={isLoading} onChange={onChangeCheck} color="warning"/>} 
            label={
            <Typography variant='caption' color="text.secondary" fontSize={12}>
                {t("sendcredit.disclaimer")}
            </Typography>}
        />

        <DialogActions>
            <Button disabled={isLoading} color='warning' onClick={onCancel}>Cancel</Button>
            <Button disabled={!check || isLoading} color='warning' onClick={onConfirm}>Confirm</Button>
        </DialogActions>
    </Dialog>

    // show link and ask babe to send the link to client
    return <Dialog fullWidth {...props}>
         <DialogTitle>{t("getpaid.label")}</DialogTitle>
         <DialogContent>
            <DialogContentText>
                {t("askpayment.instruction")}
            </DialogContentText>

            <DialogContentText fontWeight="bold">
                {`${window.location.origin}/Feedback?sid=${myReviewLinkId}`}
            </DialogContentText>

         </DialogContent>
         <DialogActions>
            <Button color='warning' onClick={onCancel}>Cancel</Button>
         </DialogActions>
    </Dialog>
 
}

export default TransferPendingToIncome