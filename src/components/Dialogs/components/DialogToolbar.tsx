import { AppBar, Toolbar, IconButton, Typography, Button, CircularProgress } from '@mui/material';
import { FC } from 'react';

interface props {
    title: string
    doneButtonName? : string
    isLoading?: boolean
    onDoneClick: (e?: any) => void
    onBackClick: (e?: any) => void
}   

const DialogToolbar : FC<props> = ({title, doneButtonName = "DONE", isLoading = false, onBackClick, onDoneClick}) => {


    return <AppBar sx={{ position: 'relative' }}>
    <Toolbar>
      <IconButton
        edge="start"
        color="inherit"
        onClick={onBackClick}
        aria-label="close"
      >
        <img
          width={16}
          height={16}
          src = "https://images.rentbabe.com/assets/back.svg" 
          alt=""
        />
      </IconButton>
      <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
          {title}
      </Typography>
      <Button onClick={onDoneClick} autoFocus color="inherit">
        {isLoading ? <CircularProgress color="secondary" size={10}/>  : doneButtonName}
      </Button>
    </Toolbar>
  </AppBar>
}

export default DialogToolbar