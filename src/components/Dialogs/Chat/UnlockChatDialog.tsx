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
import { useTranslation } from 'react-i18next';
import { LockEnum, lockChat } from '../../../utility/CloudFunctionTrigger';

interface props extends DialogProps {
    chatRoomId: string
}

const UnlockChatDialog : FC<props> = ({chatRoomId, ...props}) => {

    const { t } = useTranslation()
    const [ isLoading, setLoading ] = useState<boolean>(false)


    const onLock = async (e: any) => {
        setLoading(true)
        await lockChat(chatRoomId, LockEnum.UNLOCKED)
        setLoading(false)
        props?.onClose?.(e, 'backdropClick')
    }



    return <Dialog {...props}>
   
         <DialogTitle>{t("unlock.chat")}</DialogTitle>
         <DialogContent>
            <DialogContentText>
                {t("unlock.reason1")}
                <br/><br/>
                {t("unlock.reason2")}</DialogContentText>
         </DialogContent>

         <DialogContent>
            <Typography variant='caption' color="error">{t("rules3.warning")}</Typography>
         </DialogContent>

         <DialogActions>
            <Button variant='contained' color="inherit" onClick={(e) => props?.onClose?.(e, 'backdropClick')}>{t("cancel")}</Button>
            <Button onClick={onLock} disabled={isLoading} variant='contained' color="error" endIcon={
                isLoading && <CircularProgress color="secondary" size={12} />
            }>{t("unlock")}</Button>
         </DialogActions>



    </Dialog>
 
}

export default UnlockChatDialog