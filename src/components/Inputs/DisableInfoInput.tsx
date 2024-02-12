import { TextField, InputAdornment, Typography } from '@mui/material';
import { FC } from 'react';
import shallow from 'zustand/shallow';
import { useUser } from '../../store';
import { Helper } from '../../utility/Helper';
import MobileTooltip from '../Tooltip/MobileTooltip';

interface props {
    hint?: number
}

const DisableInfoInput : FC<props> = () => {

    const [myUID] = useUser((state) => [state.currentUser?.uid], shallow);
    
    const onClick = () => {
        const helper = new Helper()
        helper.upgradePremium(myUID)
    }

    return <MobileTooltip
    placement="bottom-start" 
    title={
        <Typography variant='caption'>Only <Typography variant='caption' display="inline" sx={{textDecoration: 'underline', cursor: "pointer"}} 
        onClick={onClick}>premium</Typography> user or user with a few rents are able to key in additional information.</Typography>
    }>
   <TextField
        disabled
        fullWidth
        variant='standard'
        maxRows={1}
        label="Additional information"
        color="warning"
        InputProps={{
            endAdornment: 
            <InputAdornment position="end">
                <img
                    width={21}
                    height={21}
                    src="https://images.rentbabe.com/assets/padlock.png"
                    alt=""
                />
            </InputAdornment>
        }}
    />

    </MobileTooltip>
}

export default DisableInfoInput