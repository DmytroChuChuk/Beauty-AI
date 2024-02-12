import {
    FC,
} from 'react';

import {
    Dialog,
    DialogProps,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    Button
} from '@mui/material';
import { useTranslation } from 'react-i18next';

interface props extends DialogProps {
    url: string | undefined
}

const ShareProfileDialog : FC<props> = ({url, ...props}) => {

    const [ t ] = useTranslation()


    return <Dialog fullWidth {...props}>
         <DialogTitle>{t("share.profile")}</DialogTitle>
         <DialogContent>
            <Typography sx={{wordBreak: "break-word"}}>{url}</Typography>
         </DialogContent>
         <DialogActions>
            <Button color="warning" onClick={(e) => props.onClose?.(e, "backdropClick")}>{t("cancel")}</Button>
         </DialogActions>
    </Dialog>
 
}

export default ShareProfileDialog