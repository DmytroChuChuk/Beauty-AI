import { Typography, AccordionDetails } from '@mui/material';
import Accordion from '@mui/material/Accordion';
import { FC } from 'react';
import AccordionIcon from '../components/AccordionIcon';
import { AdminAccordionSummary } from '../components/AdminAccordionSummary';
import Instagram from '../components/Instagram';
import { useTranslation } from 'react-i18next';

interface props {
    isg: string | undefined
    isgUsername: string | undefined
    connectISG: boolean
    expanded: boolean
    onChange?: (event: React.SyntheticEvent, expanded: boolean) => void
    onClickInstagram: () => void
}

const InstagramVerificationPanel : FC<props> = ({
    isg, 
    isgUsername, 
    connectISG, 
    expanded, 
    onChange, 
    onClickInstagram}) => {

    const [ t ] = useTranslation()

    return <Accordion
    sx={{width: "100%"}} 
    expanded={expanded} 
    onChange={onChange}>
        <AdminAccordionSummary >
            <AccordionIcon src="https://images.rentbabe.com/assets/igfill.svg" />
            <Typography marginLeft={3} className="secondaryHeading">{t("connect.to")} Instagram</Typography>
        </AdminAccordionSummary> 

        <AccordionDetails>
        <Instagram connectISG={connectISG} isg={isg} isgUsername={isgUsername} onClick={onClickInstagram}/>
        </AccordionDetails>
    </Accordion>
 
}

export default InstagramVerificationPanel