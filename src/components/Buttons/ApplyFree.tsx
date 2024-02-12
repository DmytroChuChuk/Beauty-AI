import { Box, BoxProps } from '@mui/system';
import { FC } from 'react';
import '../../scss/components/Buttons/button.scss';
import { Helper } from '../../utility/Helper';

interface props extends BoxProps {
    className?: string,
    onclick?: () => void,
    text: string
}

const ApplyFreeButton : FC<props>= ({className = "",
    onClick = () => {},
    text="",
    ...props
}) => {

    const helper = new Helper()   
    
    return <Box 
            className = {`babe-button ${className}`}
            bgcolor={"black"}  
            onClick={onClick}
            width={helper.isMobileCheck2() ? '50%': '60%'}
            {...props}

        >
            {text}
            

    </Box>
 
}

export default ApplyFreeButton