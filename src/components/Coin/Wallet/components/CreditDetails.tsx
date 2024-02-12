import { Box } from '@mui/material';
import { FC, ReactNode } from 'react';
import CreditAmount from './CreditAmount';
import CreditHeader from './CreditHeader';

interface props {
    title: string
    hints: string | ReactNode
    amount: number | undefined
}

const CreditDetails : FC<props> = ({title, hints, amount}) => {

    return <Box>
        
        <CreditHeader 
            title={title}
            hints={hints}
        />

        <br/>


        <CreditAmount
            color="primary" 
            amount={amount}
        />
    </Box>
 
}

export default CreditDetails