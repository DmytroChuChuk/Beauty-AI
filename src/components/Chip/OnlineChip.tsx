import { Typography } from '@mui/material';
import { Box, BoxProps } from '@mui/system';
import { FC } from 'react';
import CenterFlexBox from '../Box/CenterFlexBox';

interface props extends BoxProps{

}

const OnlineChip : FC<props> = ({...props}) => {

    return <CenterFlexBox 
    padding="0px 6px" 
    borderRadius={99999} 
    border="1px solid white"
    bgcolor="success.main" 
    {...props}
    >
        <Box width={6} height={6} borderRadius={999} bgcolor="white" marginRight="4px" /> 
        <Typography color="primary" variant='caption'>Online</Typography>
    </CenterFlexBox>
 
}

export default OnlineChip