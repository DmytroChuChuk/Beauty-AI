import React from 'react';

import './scss/RoadMapBox.scss'
import { Typography } from '@mui/material';

export interface RoadMapBoxProps {
    percentage: string,
    description: string[],
    select: boolean
}

interface props {
    data: RoadMapBoxProps
}

const RoadMapBox: React.FC<props> = ({data }) => {

    return <div className='box'>   

        <br/>
            <div className= {`indicator ${data.select ? "select" : ""}`}></div>
        <br/>
        <br/>
        <Typography component={'p'}>
            {data.percentage}%
        </Typography>

        {data.description.map((des, index) => {
            return <Typography key={index}>
            {des}
        </Typography>  
        })}

    </div>  
}

export default (RoadMapBox);