import { Button, Divider } from '@mui/material';
import { doc, arrayUnion, deleteField, updateDoc } from 'firebase/firestore';
import { FC } from 'react';
import { CONVERSATION, users, info, deleteOn } from '../../../keys/firestorekeys';
import { useUser } from '../../../store';
import { db } from '../../../store/firebase';
import Item, { ItemProps } from './Item';


const ArchiveItem : FC<ItemProps> = ({...props}) => {

    const [myUID] = useUser((state) => [state.currentUser?.uid])

    const retrieve = () => {

        const { doc : _doc } = props
        const chatRoomID = _doc.id

        if(!myUID || !chatRoomID) return
        
        updateDoc(doc(db, CONVERSATION, chatRoomID) , {
            [users]: arrayUnion(myUID),
            [`${info}.${myUID}.${deleteOn}`]: deleteField()
        })
    }

    return <>

        <Item  
            {...props} 
            secondaryAction={
                <Button sx={{textTransform: 'none', marginBottom: '32px'}} size='small'  onClick={retrieve}
                 color='secondary' variant='contained'>Retrieve</Button>

            }
           
        >
                  
        </Item>
        
        <Divider variant="inset" component="li" />
  </>
}

export default ArchiveItem