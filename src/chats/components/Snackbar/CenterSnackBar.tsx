import { Snackbar } from '@mui/material';
import { FC } from 'react';

import { SnackbarProps } from '@mui/material';

const CenterSnackBar : FC<SnackbarProps> = ({...props}) => {
    return  <Snackbar
        sx={{width: "100%"}}
        color='secondary' 
        anchorOrigin={{horizontal: 'center', vertical: 'bottom'}} 
        {...props}
    />
}

export default CenterSnackBar