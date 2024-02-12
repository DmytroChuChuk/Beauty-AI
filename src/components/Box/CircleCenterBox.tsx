import { BoxProps } from '@mui/system';
import { FC, ReactNode } from 'react';
import CenterFlexBox from './CenterFlexBox';

interface props extends BoxProps {
    children?: ReactNode
    width?: number
    height?: number
}

const CircleCenterBox : FC<props> = ({width = 16, height = 16, children, ...props}) => {

    return <CenterFlexBox width={width} height={height} borderRadius="9999999px" padding="10px" {...props}>
        {children}
    </CenterFlexBox>
 
}

export default CircleCenterBox