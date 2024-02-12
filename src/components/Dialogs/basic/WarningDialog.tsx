import {
    FC
} from 'react';
import {
    Dialog,
    DialogProps,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button
} from '@mui/material';
import { useTranslation } from 'react-i18next';

export enum WarningType {
    NSFW,
    OFF_PLATFORM
}

interface props extends DialogProps {
    type: WarningType
    onConfirm: (e: any) => void
}

const WarningDialog : FC<props> = ({type, onConfirm, ...props}) => {

    const [ t ] = useTranslation()

    const title = type === WarningType.NSFW ? "Warning: Inappropriate message" : "Warning: Off-platform transaction"

    const content= type === WarningType.NSFW ? `If you insist on sending message, you may get banned. Please follow the rules of the community.
    <a target="_blank" href="${`${window.location.origin}/page/FAQ?ref=rules`}">READ RULES.</a>` 
    : `Exchanging of contacts before making payment on the platform will result in account suspension. Please follow the rules of the community.
    <a target="_blank" href="${`${window.location.origin}/page/FAQ?ref=rules`}">READ RULES.</a>`

    return <Dialog {...props}>
         <DialogTitle>{title}</DialogTitle>
         <DialogContent>

         <span dangerouslySetInnerHTML={{ __html: content ?? "" }} />
  
        </DialogContent>
         <DialogActions>
            <Button color="warning" variant='text' onClick={(e) => props.onClose?.(e, "backdropClick") }>Cancel</Button>
            <Button color="warning" variant='contained' onClick={(e) => {
                props.onClose?.(e, "backdropClick") 
                onConfirm(e)
            }}>{t("confirm")}</Button>
         </DialogActions>
    </Dialog>
 
}

export default WarningDialog