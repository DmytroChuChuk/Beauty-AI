import { Button, ButtonProps } from '@mui/material';
import { FC, ReactNode } from 'react';

interface props extends ButtonProps{
    children: ReactNode
}

const BlackButton : FC<props> = ({children, ...props}) => {

    return <Button
        sx={{background: "black", color: "white!important"}}
        {...props}
    >
        {children}
    </Button>
 
}

export default BlackButton