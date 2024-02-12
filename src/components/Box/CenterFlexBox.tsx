import { Box } from '@mui/material';
import { BoxProps } from '@mui/system';
import { FC } from 'react';


const CenterFlexBox : FC<BoxProps> = ({...props}) => {

    return <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
                {...props}
    />
 
}

export default CenterFlexBox