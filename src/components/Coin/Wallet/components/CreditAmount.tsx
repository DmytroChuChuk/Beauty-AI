import { Box, CircularProgress, Typography, TypographyProps } from '@mui/material';
import { FC } from 'react';

import CoinImage from '../../../CustomImage/CoinImage';

interface props extends TypographyProps {
    amount: number | undefined
    imageWidth?: number
}

const CreditAmount : FC<props> = ({amount, imageWidth = 32, ...props}) => {


    return <Box display="flex">
        <CoinImage 
            imageWidth={imageWidth}
            margin={"auto 8px 0 0"}
        />

        <Typography {...props} variant="h4" marginTop="auto" >
            { amount !== undefined && !isNaN(amount) ?  (amount / 100).toFixed(2) : <CircularProgress size={16} color="warning" /> }
        </Typography>

    </Box>
 
}

export default CreditAmount