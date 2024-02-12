import React from "react";
import '../scss/mainUI.scss'

import { Divider, Typography } from '@mui/material';

const PageHeader : React.FC<{title:string}> = ({title}) => {
  
    return <div className= "top-header-wrapper">
        <div>
            <Typography variant="h1">{title}</Typography>
            <Divider  />
        </div>
    </div>
}

export default PageHeader