import { Typography, TypographyProps } from '@mui/material';
import { FC, ReactNode } from 'react';

interface props extends TypographyProps{
    children: ReactNode
}

const SectionTitle : FC<props> = ({children, ...props}) => {

    return <Typography marginLeft={1.5} fontWeight="bold" variant='body2' color="text.secondary" {...props}>
    {children}
  </Typography>
 
}

export default SectionTitle