import { Alert, Button, Typography } from '@mui/material';
import { FC } from 'react';
import shallow from 'zustand/shallow';
import { useUser } from '../../store';

const BanAlert : FC<{
    bannedReason: string | undefined
}> = ({bannedReason}) => {

    const [uid, nickname] = useUser((state) => [
        state?.currentUser?.uid, 
        state?.currentUser?.nickname
    ], shallow)

    const onClick = () => {
        const subject = `BANNED matters from ${nickname ?? ""} Id: ${uid}`
        window.open(`mailto:hello@RentBabe.com?subject=${subject}` , '_blank')
    }

    return <Alert
            sx={{marginTop: "64px"}}  
            action={
             <Button variant='contained' color="error" size="small">
             EMAIL US
           </Button>
        } onClick={onClick} severity="warning">
            We have receive reports that have breach our terms and violated the rules. We take matters like this seriously as we are trying to build a safe and secure community for our members, and will take immediate actions against anyone who would abuse the platform or the members.
            {bannedReason && <Typography marginTop={2} fontWeight="bold">Banned for: {bannedReason}</Typography>}
        </Alert> 
 
}

export default BanAlert