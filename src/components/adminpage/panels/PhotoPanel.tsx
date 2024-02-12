import { Accordion, Typography, AccordionDetails } from '@mui/material';
import { FC } from 'react';
import AdminPhotos from '../components/AdminPhotos';

import { AdminAccordionSummary } from '../components/AdminAccordionSummary';
import AccordionIcon from '../components/AccordionIcon';
import history from '../../../utility/history';
import { useTranslation } from 'react-i18next';

interface props {
    expanded : boolean
    validateNumberOfPhotos : boolean
    urls: string[] | undefined
    uploadFile:  (e: React.ChangeEvent<HTMLInputElement>) => void
    onChange: (event: React.SyntheticEvent, expanded: boolean) => void
}

const PhotoPanel : FC<props> = ({validateNumberOfPhotos , expanded, urls, onChange, uploadFile}) => {

    const [ t ] = useTranslation()

    const onClick = () => {
        history.push("/attirerule")
    }

    return  <Accordion  expanded={expanded} onChange={onChange}>
        <AdminAccordionSummary>
            <AccordionIcon src="https://images.rentbabe.com/assets/admin/admin_photo.svg"/>
          
            <Typography marginLeft={3}>{t("photos")}</Typography>

            {!validateNumberOfPhotos && <img alt="" src = "https://images.rentbabe.com/assets/mui/green_tick.svg" className="green_tick"/> }
            <Typography onClick={onClick} 
            variant='body2' 
            sx={{textDecoration: "underline", color: "red!important"}}
            marginLeft={1}>Rules</Typography>

        </AdminAccordionSummary>
            
        <AccordionDetails>
            <AdminPhotos 
                urls = { urls ?? ["" ,"" ,"" ,"" ,"", ""] }
                onChange = {uploadFile}
            />
        </AccordionDetails>
    </Accordion>
 
}

export default PhotoPanel