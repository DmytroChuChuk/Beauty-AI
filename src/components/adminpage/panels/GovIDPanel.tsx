import { Accordion, Typography, AccordionDetails } from '@mui/material';
import { FC } from 'react';

import AccordionIcon from '../components/AccordionIcon';
import { AdminAccordionSummary } from '../components/AdminAccordionSummary';
import GovIDVerification from '../components/GovIDVerification';
import { useTranslation } from 'react-i18next';

interface props {
    isVerified: boolean | undefined
    myUID: string | null | undefined
    rejectedReasonAfter: string | null | undefined
    expanded: boolean
    onChange?: (event: React.SyntheticEvent, expanded: boolean) => void
}

const GovIDPanel : FC<props> = ({isVerified, myUID, rejectedReasonAfter, expanded, onChange}) => {

    const [ t ] = useTranslation()

    return <Accordion 
    sx={{width: "100%"}}
    expanded={expanded} 
    onChange={onChange}>
        <AdminAccordionSummary >
            <AccordionIcon src="https://images.rentbabe.com/assets/flaticon/card.svg" />
            <Typography marginLeft={3} className="secondaryHeading">{t("verification")}</Typography>
        </AdminAccordionSummary> 

        <AccordionDetails>
            <GovIDVerification 
                isVerified={isVerified} 
                myUID={myUID} 
                rejectedReasonAfter={rejectedReasonAfter}
            />
        </AccordionDetails>
    </Accordion>
 
}

export default GovIDPanel