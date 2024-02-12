import { Accordion, AccordionDetails, Typography } from '@mui/material';
import { FC, useState } from 'react';
import AccordionIcon from '../components/AccordionIcon';
import { AdminAccordionSummary } from '../components/AdminAccordionSummary';
import EMeetDialog from '../../Dialogs/emeet/EMeetDialog';


const EmeetsPanel : FC = () => {

    const [open, setOpen] = useState<boolean>(false)

    const onClick = () => {
        // open dialog
        setOpen(!open)
    }

    return <><Accordion
        sx={{width: "100%"}}
        onClick={onClick} 
        expanded={false}>
            
            <AdminAccordionSummary>
                <AccordionIcon src="https://images.rentbabe.com/assets/admin/admin_emeets.svg"/>
                <Typography marginLeft={3} className="secondaryHeading">E-Meets settings</Typography>

            </AdminAccordionSummary>

            <AccordionDetails>
            
            </AccordionDetails>

        </Accordion>
    
        <EMeetDialog open={open} onClose={() => setOpen(false)}/>
    </>
 
}

export default EmeetsPanel