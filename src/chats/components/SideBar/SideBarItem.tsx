import { FC } from 'react';
import { Badge, Divider } from '@mui/material';

import Item, { ItemProps } from './Item';
import {  Timestamp } from 'firebase/firestore';
import { info, lastSeen, senderLastSeen, recipientLastSeen, sender, updatedAt } from '../../../keys/firestorekeys';
import { user } from '../../shared/types';


const SideBarItem: FC<ItemProps> = ( {...props} ) => {

  const isSender = (props.doc.get(sender) as string) === props.uid
  const _user = props.doc.get(info) as user
  const isUpdatedAt = props.doc.get(updatedAt) as Timestamp

  let myLastSeen =  _user?.[props.uid]?.[lastSeen] ?? props.doc.get(isSender ? senderLastSeen : recipientLastSeen) as Timestamp

  return  <>

    <Item 
      {...props}
      secondaryAction = {
        <>
          { !props.isSelected && <Badge  
          variant="dot"
          badgeContent={ !myLastSeen ? ' ' : myLastSeen < isUpdatedAt ? ' ' : 0} color="secondary"/>}
        </>
      }
    />

    <Divider variant="inset" component="li" />

  </>
}

export default SideBarItem