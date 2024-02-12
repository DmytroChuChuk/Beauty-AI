import React from 'react';
import { styled } from "@mui/material/styles";
import Switch, { SwitchProps } from "@mui/material/Switch";
import CircularProgress from '@mui/material/CircularProgress';

import './Switches.scss'
import { Typography } from '@mui/material';
import DefaultTooltip from './Tooltip/DefaultTooltip';

const IOSSwitch = styled((props: SwitchProps) => (
    <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
  ))(({ theme }) => ({
    width: 42,
    height: 26,
    padding: 0,
    '& .MuiSwitch-switchBase': {
      padding: 0,
      margin: 2,
      transitionDuration: '300ms',
      '&.Mui-checked': {
        transform: 'translateX(16px)',
        color: '#fff',
        '& + .MuiSwitch-track': {
          backgroundColor: '#65C466',
          opacity: 1,
          border: 0,
        },
        '&.Mui-disabled + .MuiSwitch-track': {
          opacity: 0.5,
        },
      },
      '&.Mui-focusVisible .MuiSwitch-thumb': {
        color: '#33cf4d',
        border: '6px solid #fff',
      },
      '&.Mui-disabled .MuiSwitch-thumb': {
        color: theme.palette.grey[100]
           
      },
      '&.Mui-disabled + .MuiSwitch-track': {
        opacity:  0.7,
      },
    },
    '& .MuiSwitch-thumb': {
      boxSizing: 'border-box',
      width: 22,
      height: 22,
    },
    '& .MuiSwitch-track': {
      borderRadius: 26 / 2,
      backgroundColor: '#E9E9EA',
      opacity: 1,
      transition: theme.transitions.create(['background-color'], {
        duration: 500,
      }),
    },
  }));

  interface SwitchesProps {
    onChange: (_ : React.ChangeEvent<{}>, checked: boolean) => void
    check :boolean
    disabled: boolean
    loading: boolean
  }

  

  const Switches : React.FC<SwitchesProps> = ({onChange, check: checked, disabled: isDisable, loading: isLoading}) => {


    return (

          <div id = "switches"  className = "main-switch">

          <label className ='switch-label' style={{color: "#D3D3D3"}}>Inactive</label>

          <IOSSwitch disabled={isDisable} checked={checked}

              onChange={onChange}/>

            <label className ='switch-label' style={{color: "#00D400"}}>Active</label>

            <DefaultTooltip 
            width={19}
            title={
              <Typography fontSize={14}>Your profile is {checked ? "Active" : "Inactive"}.<br/><br/>When you switch your profile to inactive, you can hide your profile from our website immediately.<b> However, your account cannot received any request orders and will be auto deleted if 6 of months inactive.</b> </Typography>
            }
            url = "https://images.rentbabe.com/assets/question.svg"  />
            
            <div hidden= {isLoading}>
            <CircularProgress  className='switch-progress' color = "secondary" />
            </div>



        </div>

  
    );
  }

  export default Switches;