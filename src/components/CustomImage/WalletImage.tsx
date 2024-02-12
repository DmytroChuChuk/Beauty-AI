import { Box } from '@mui/material';
import { FC } from 'react';
import history from '../../utility/history';

const WalletImage : FC = () => {

    const onClick = () => {
        history.push("/wallet")
    }

    return <Box sx={{cursor: "pointer"}} onClick={onClick}>

            <img 
              width={32}
              height={32}
              src="https://images.rentbabe.com/assets/flaticon/wallet96.png"
            />

    </Box>
 
}

export default WalletImage