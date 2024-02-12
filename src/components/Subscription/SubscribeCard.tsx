import React from 'react';
import './SubscribeCard.scss'

import {Card, CardContent, Typography, Grid} from '@mui/material';
import { json, jsonMonthly } from './StripeCheckOutForm';

interface props {
    index: number
    select: number
    priceID: string
    onSelect : (i:number, priceID : string, finalPrice: any) => void
    discount?:  number | undefined
}

const SubscribeCard : React.FC<props> = ({ select, index, priceID, onSelect, discount}) => {


  const multipleOf = jsonMonthly[index]

  const onClick = () => {
    const finalPrice = discount ? ((json[index]) * discount).toFixed(2) : json[index].toFixed(2)
    onSelect(index, priceID, finalPrice )
  }

  return (

    <Grid 
    sx={{
      position: 'relative', 
      display: 'flex', 
    }} justifyContent = 'center' item xs>

      <div className = "banner" hidden={ !(index === 1) }>
        Most Popular
      </div>

      <Card className={`root ${(index === select) ? "add-border" : ""}`} 
            onClick={onClick}>

          <CardContent>

            <Typography gutterBottom variant="h5" component="div">
              {multipleOf}
            </Typography>

            <Typography gutterBottom component="p">
              Month{multipleOf === 1 ? "" : "s"}
            </Typography>

            <Typography sx={{fontSize: 13 , textDecoration: `${!discount ? 'none' : 'line-through'}`}} color="text.secondary">
              ${ (Math.round(json[index] / multipleOf * 100) / 100).toFixed(2) } USD
            </Typography>

            {
              discount ? <Typography sx={{fontSize: 13}} color="text.secondary">
                ${ ((Math.round(json[index] / multipleOf * 100) / 100) * discount).toFixed(2) } | { ((1.0 - discount) * 100).toFixed(0)}%
              </Typography> : null
            }

            <Typography  sx={{ fontSize: 11 }} color="text.secondary">
              first {multipleOf === 1 ? "" : multipleOf} month{multipleOf === 1 ? "" : "s"}
            </Typography>

          </CardContent>
  
      </Card>

    </Grid>
  );
}

export default SubscribeCard
