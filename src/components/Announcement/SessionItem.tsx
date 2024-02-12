import { FC } from 'react';
import { Timestamp } from 'firebase/firestore';
import { Helper } from '../../utility/Helper';

import {  
    ListItem, 
    ListItemText, 
    Typography 
} from '@mui/material';
import { ServiceType } from '../../keys/props/services';

interface props {
    serviceType?: ServiceType
    id: string
    title: string
    venue: string
    timeStamp: Timestamp
    onClose: () => void
}

const SessionItem : FC<props> = ({serviceType, id, title, timeStamp, venue, onClose}) => {


    const atWhere = serviceType === ServiceType.games ? "Games" : "E-Meet"

    const helper = new Helper()

    const onClick = () => {
        const link = `${window.location.origin}/page/Rent?session=${id}`
        //window.open(link, '_blank')    
        window.location.assign(link)
    }

    return <ListItem sx={{width: '100%' , marginBottom: '16px', cursor: 'pointer'}} disablePadding>

        <ListItemText 
            onClick={onClick}
            primary={<Typography fontSize={14} component='p' noWrap>
                  {title}
               </Typography>
            }
            secondary = { serviceType === ServiceType.meetup ? <Typography fontSize={12} color='error' component='p' noWrap>
               { helper.timeSince(timeStamp.toDate(), true) } | Venue: {venue}
            </Typography> : <Typography fontSize={12} color='error' component='p' noWrap>
               { helper.timeSince(timeStamp.toDate(), true) } | {atWhere}
            </Typography>
            }
      
        />

        <div className = 'flex-gap'/>
        <img
            onClick={onClose}
            width={28}
            src= "https://images.rentbabe.com/assets/mui/close_rounded.svg"
            alt=''
        />

    </ListItem>
        
    // return <div style={{opacity: '0.86', margin: '8px 0 8px 0'}} className='flex' onClick={onClick}>

    //     <img
    //         width={19}
    //         src= "https://images.rentbabe.com/assets/mui/OpenInNew.svg"
    //         alt=''
    //     />
    //   <div className='flex-gap'/>
    //     <Typography  noWrap>
    //     {title}
    //     </Typography>

    // </div>
    

}

export default SessionItem