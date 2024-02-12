import { Accordion, AccordionDetails, Typography } from '@mui/material';
import { FC } from 'react';
import AccordionIcon from '../components/AccordionIcon';
import { AdminAccordionSummary } from '../components/AdminAccordionSummary';
import { useUser } from '../../../store';
import shallow from 'zustand/shallow';
import { useTranslation } from 'react-i18next';

const TelegramNotificationPanel : FC = () => {

    const [ t ] = useTranslation()
    const [ teleid ] = useUser((state) => [state.currentUser?.teleId], shallow)

    const onClick = () => {
        window.open(`https://t.me/RentBabeNotificationBot?start=com` , '_blank')
    }

    return <Accordion
    sx={{width: "100%"}}
    onClick={onClick} 
    expanded={false}>
        
        <AdminAccordionSummary>
            <AccordionIcon src="https://images.rentbabe.com/assets/app/telegram.svg"/>
            <Typography marginLeft={3} className="secondaryHeading">
                {
                    teleid ? t("re.connect.to") : t("connect.to")
                } Telegram
            </Typography>

        </AdminAccordionSummary>

        <AccordionDetails>
        
        </AccordionDetails>

    </Accordion>
 
}

export default TelegramNotificationPanel