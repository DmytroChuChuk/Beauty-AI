import { Accordion, AccordionDetails, Typography } from '@mui/material';
import { FC } from 'react';
import AccordionIcon from '../components/AccordionIcon';
import { AdminAccordionSummary } from '../components/AdminAccordionSummary';
import Privacy from '../components/Privacy';
import { useTranslation } from 'react-i18next';

interface props {
    privacy: number
    expanded: boolean
    onChange?: (event: React.SyntheticEvent, expanded: boolean) => void
    onChangePrivacy: (e: any) => void
}

const PrivacyPanel : FC<props> = ({privacy, expanded, onChange, onChangePrivacy}) => {

    const [ t ] = useTranslation()

    return <Accordion 
    expanded={expanded} 
    onChange={onChange}>
        <AdminAccordionSummary >
            <AccordionIcon src="https://images.rentbabe.com/assets/admin/admin_lock.svg" />
            <Typography marginLeft={3} className="secondaryHeading">{t("privacy")}</Typography>
        </AdminAccordionSummary> 

        <AccordionDetails>
            <Privacy privacy={privacy} onChange={onChangePrivacy}/>
        </AccordionDetails>
    </Accordion>

}

export default PrivacyPanel