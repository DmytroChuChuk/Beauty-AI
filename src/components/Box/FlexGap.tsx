import { Box } from '@mui/system';
import { FC } from 'react';

interface props  {
    gap?: number
}

const FlexGap : FC<props> = ({gap = 4}) => {

    return <Box  margin={`0 ${gap}px`}/>

}

export default FlexGap