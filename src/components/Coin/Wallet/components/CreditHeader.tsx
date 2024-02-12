import { Typography } from '@mui/material';
import { FC, ReactNode } from 'react';
import DefaultTooltip from '../../../Tooltip/DefaultTooltip';

interface props {
    title: string
    hints: string | ReactNode
}

const CreditHeader : FC<props> = ({title, hints}) => {


    return  <Typography fontSize={17} color="primary" fontWeight="bold">
            {title}
        <DefaultTooltip
            width={17}
            margin='0 0 0 8px'
            title={typeof(hints) === 'string' ? <Typography variant='body2' whiteSpace="pre-line">{hints}</Typography> : hints}
            url="https://images.rentbabe.com/assets/mui/help.svg"
        />
    </Typography>
 
}

export default CreditHeader