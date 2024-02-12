import { Typography, TypographyProps } from '@mui/material';
import { FC } from 'react';



const BasicTypography : FC<TypographyProps> = ({...props}) => {


    return <Typography
    sx={{userSelect: "none"}}
    {...props}
    />
 
}

export default BasicTypography