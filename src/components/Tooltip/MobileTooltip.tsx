import { Tooltip, TooltipProps } from '@mui/material';
import { FC } from 'react';


interface props extends TooltipProps{
    duration?: number
}

const MobileTooltip : FC<props> = ({duration = 5000, ...props}) => {


    return <Tooltip 
        {...props} 
        arrow
        enterTouchDelay={0} 
        leaveTouchDelay={duration}
    />
 
}

export default MobileTooltip