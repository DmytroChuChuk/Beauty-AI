import { FC } from 'react';
import {  Button } from '@mui/material';
import CenterAlert from '../../../../components/Notifications/CenterAlert';

interface props {
    onClick?: () => void
}

const ClientAlert : FC<props> = ({onClick}) => {

    return <CenterAlert onClick={onClick} action={
                 <Button color="inherit" size="small">
                     OK
               </Button>
               }

            title="Please confirm order details with user before placing the order."
        />


}

export default ClientAlert