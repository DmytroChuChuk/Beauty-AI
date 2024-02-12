import { Accordion, AccordionDetails, Typography } from '@mui/material';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import GeoInput from '../../Inputs/GeoInput';
import AccordionIcon from '../components/AccordionIcon';
import { AdminAccordionSummary } from '../components/AdminAccordionSummary';

interface props {
    expanded: boolean
    area: string | undefined
    onChange?: (event: React.SyntheticEvent, expanded: boolean) => void
    geoInputOnChange: () => void
    onPlaceSelected: (formatted_address: string | undefined) => void
}

const LocationPanel : FC<props> = ({expanded, area, onChange, geoInputOnChange, onPlaceSelected}) => {

    const { t } = useTranslation()

    return <Accordion
        sx={{width: "100%"}} 
        expanded={expanded} 
        onChange={onChange}>
        
    <AdminAccordionSummary>
        <AccordionIcon src="https://images.rentbabe.com/assets/admin/admin_location.svg"/>
        <Typography marginLeft={3} className="secondaryHeading">{(t("location.tab"))}</Typography>
        {area && <img
            className="green_tick"
            src = "https://images.rentbabe.com/assets/mui/green_tick.svg" 
            alt="" /> }
    </AdminAccordionSummary>

    <AccordionDetails>

        <GeoInput 
            searchFor='location'
            onChange={geoInputOnChange} 
            defaultValue={area} 
            onPlaceSelected={onPlaceSelected}
        />
    
    </AccordionDetails>
</Accordion>
 
}

export default LocationPanel