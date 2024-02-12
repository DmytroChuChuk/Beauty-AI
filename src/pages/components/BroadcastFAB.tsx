import { Fab, Badge } from '@mui/material';
import { FC } from 'react';

interface props {
    hasPending: boolean
    openBroadcastClick: () => void
}

const BroadcastFAB : FC<props> = ({hasPending, openBroadcastClick}) => {

    return <Fab sx={{
        zIndex: 12, 
        position: "fixed", 
        bottom: "1rem", 
        right: "1rem", 
        background: "black",
        height: 44,
        width: 44

    }}
    onClick={openBroadcastClick} >
      <Badge
        color='error' 
        badgeContent={hasPending ? "!" : undefined}
      >
        <img 
          width={19} 
          height={19} 
          src="https://images.rentbabe.com/assets/buttons/icons/announcement.svg" 
          alt =''
        />
      </Badge>
    </Fab>
}

export default BroadcastFAB