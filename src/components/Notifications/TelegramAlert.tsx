import { Alert, Box, Button } from '@mui/material';
import { FC } from 'react';
import shallow from 'zustand/shallow';
import { useUser } from '../../store';
import '../../scss/components/TelegramAlert.scss';
import { useTranslation } from 'react-i18next';


interface Props {
    fullWidth?: boolean
}

const TelegramAlert : FC<Props> = ({fullWidth}) => {

    const [ t ] = useTranslation()
    const [teleId, uid] = useUser((state) => [state.currentUser?.teleId, state.currentUser?.uid] , shallow)

    const onClick = () => {
        window.open(`https://t.me/RentBabeNotificationBot?start=com` , '_blank')
    }

    return <Box className='telegram-alert'>
        { (!teleId) && (uid) ?  <Alert sx={{width: fullWidth ? "100%" : "auto"}} className='alert' action={
             <Button color="inherit" size="small">
             {t("turn.on")}
           </Button>
        } onClick={onClick} severity="error">{t("turn.on.noti")}</Alert> : null}
    </Box>
 
}

export default TelegramAlert