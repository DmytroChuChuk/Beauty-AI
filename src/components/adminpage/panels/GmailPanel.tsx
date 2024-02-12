import { Accordion, Typography, AccordionDetails } from '@mui/material';
import { FC } from 'react';
import Google from '../../Buttons/Google';
import AccordionIcon from '../components/AccordionIcon';
import { AdminAccordionSummary } from '../components/AdminAccordionSummary';
import { useTranslation } from 'react-i18next';

interface props {
    expanded: boolean
    onChange?: (event: React.SyntheticEvent, expanded: boolean) => void
}

const GmailPanel : FC<props> = ({expanded, onChange}) => {

    const [ t ] = useTranslation()

    return <Accordion 
    sx={{width: "100%"}}
    expanded={expanded} 
    onChange={onChange}>
        <AdminAccordionSummary >
            <AccordionIcon src="https://images.rentbabe.com/assets/logo/google.svg" />
            <Typography marginLeft={3} className="secondaryHeading">{t("connect.to")} Gmail</Typography>
        </AdminAccordionSummary> 

        <AccordionDetails>
            <Google sx={{marginBottom: "1rem"}} fullWidth />
        </AccordionDetails>
    </Accordion>
 
}

export default GmailPanel