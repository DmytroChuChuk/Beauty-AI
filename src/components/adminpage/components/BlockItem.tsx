import { 
    Avatar, 
    Button, 
    ListItem, 
    ListItemAvatar, 
    ListItemProps, 
    ListItemText 
} from '@mui/material';

import { deleteDoc, doc, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { FC } from 'react';
import { BLOCK, nickname, url, USERS } from '../../../keys/firestorekeys';
import { db } from '../../../store/firebase';


interface props extends ListItemProps {
    index: number
    uid: string
    doc: QueryDocumentSnapshot<DocumentData>
}

const BlockItem : FC<props> = ({index, uid, doc : _doc, ...props}) => {

    const _otherUID = _doc.id
    const _url = _doc.get(url) as string | undefined
    const _nickname = _doc.get(nickname) as string | undefined

    const unblock = () => {
        deleteDoc( doc(db, USERS, uid, BLOCK, _otherUID) )
    }

    return <ListItem 
            {...props} 
            key={index}  
            sx={{cursor: "pointer" }}
            secondaryAction = {
                <Button 
                    size='small' 
                    variant='contained' 
                    color='secondary'
                    onClick={unblock}
                >
                    Unblock
                </Button>
            }
        >
               
        <ListItemAvatar>
            <Avatar src={_url?.toCloudFlareURL() ?? ""} />
        </ListItemAvatar>

        <ListItemText
            className="ellipsis"
            primary={_nickname}
        
        />
    </ListItem>
}

export default BlockItem