import { Card, Typography } from '@mui/material';
import { FC } from 'react';
import CenterFlexBox from '../Box/CenterFlexBox';

interface props {
    height: number
}

const NotSupportedCard : FC<props> = ({height}) => {

    return <Card>

    <CenterFlexBox height={height}>

        <Typography component="p" fontStyle="italic" color="text.secondary">
            This website version does not support this content
        </Typography>

    </CenterFlexBox>

</Card>
 
}

export default NotSupportedCard