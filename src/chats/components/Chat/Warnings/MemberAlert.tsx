import { FC } from 'react';
import { Button } from '@mui/material';
import CenterAlert from '../../../../components/Notifications/CenterAlert';

interface props {
    onClick?: () => void
}

const MemberAlert : FC<props> = ({onClick}) => {

    return <>

        <CenterAlert
       
            onClick={onClick} 
            severity='error' 
            action={
                <Button color="inherit" size="small">
                    Ok
                </Button>
            }
            title="Please avoid off-platform transaction to protect your personal information"
        />
    
    </>

 
}

export default MemberAlert