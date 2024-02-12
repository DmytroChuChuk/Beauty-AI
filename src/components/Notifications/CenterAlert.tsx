import { FC } from 'react';
import { Alert, AlertColor, AlertProps } from '@mui/material';

import '../../scss/components/Notifications/CenterAlert.scss'

interface props extends AlertProps {
    onClick?: () => void
    action?: React.ReactNode
    title: string
    severity?: AlertColor
}
const CenterAlert : FC<props> = ({onClick, action, title, severity}) => {

    return <Alert className='center-alert' action={action} onClick={onClick} severity={severity ?? 'info'}>{title}</Alert>
 
}

export default CenterAlert