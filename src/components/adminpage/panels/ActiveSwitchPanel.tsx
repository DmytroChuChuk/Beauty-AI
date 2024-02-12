import { Accordion, AccordionDetails, Typography } from '@mui/material';
import { FC } from 'react';
import Switches from '../../Switches';
import AccordionIcon from '../components/AccordionIcon';
import { AdminAccordionSummary } from '../components/AdminAccordionSummary';
import { useTranslation } from 'react-i18next';

interface props {
    loadingStatus: boolean
    isChecked: boolean
    expanded: boolean
    onChange?: (event: React.SyntheticEvent, expanded: boolean) => void
    onSwitchChange: (_ : React.ChangeEvent<{}>, checked: boolean) => void
}

const ActiveSwitchPanel : FC<props> = ({loadingStatus, isChecked, expanded, onChange, onSwitchChange}) => {

    const [ t ] = useTranslation()

    return <Accordion 
    expanded={expanded} 
    onChange={onChange}>
        <AdminAccordionSummary >
            <AccordionIcon src="https://images.rentbabe.com/assets/admin/admin_hide.svg?v=1" />
            <Typography marginLeft={3} className="secondaryHeading">{t("switch.to.inactive")}</Typography>
        </AdminAccordionSummary> 

        <AccordionDetails>
            <Switches 
                loading= {!loadingStatus} 
                disabled = { loadingStatus} 
                check={isChecked} 
                onChange={onSwitchChange}
            />
        </AccordionDetails>
    </Accordion>

}

export default ActiveSwitchPanel