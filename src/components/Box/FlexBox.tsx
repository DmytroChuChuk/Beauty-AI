import { Box } from '@mui/material';
import { BoxProps } from '@mui/system';
import { FC } from 'react';

const FlexBox : FC<BoxProps> = ({...props}) => {

    return <Box
        {...props}
        display="flex"
    />
 
}

export default FlexBox