import { FC, Fragment } from 'react';

import { 
    ListItem, 
    ListItemAvatar, 
    Avatar, 
    ListItemText, 
    Typography, 
    ListItemProps
} from '@mui/material';

import {
    info, 
    lastMessage,
    mobileUrl,
    nickname,
    recipientNickname,
    recipientProfileURL, 
    sender,
    senderNickname,
    senderProfileURL
} from "../../../keys/firestorekeys";

import { user } from '../../shared/types';

export interface ItemProps extends ListItemProps {
    uid: string 
    otherUid: string | undefined
    isSelected: boolean
    doc: any
    index: number
    onClick? : () => void
}

const Item : FC<ItemProps> = ({uid, otherUid, isSelected , doc, index, onClick, ...props}) => {


    const isSender = (doc.get(sender) as string) === uid
    const _user = doc.get(info) as user | undefined


    let _nickname = otherUid ? (_user?.[otherUid]?.[nickname] ?? doc.get(isSender ? recipientNickname : senderNickname) as string | undefined) : ''
    let _url = otherUid ? (_user?.[otherUid]?.[mobileUrl] ?? doc.get(isSender ? recipientProfileURL : senderProfileURL) as string | undefined) : ''


    return  <ListItem 
        {...props} 
        key={index}  
        sx={{
            cursor: "pointer",
            bgcolor: isSelected ? "rgb(62, 125, 186)" : "white"
        }} 
        onClick={onClick} 
    >
               
        <ListItemAvatar>
            <Avatar src={_url?.toCloudFlareURL() ?? ""} />
        </ListItemAvatar>

        <ListItemText
            className="ellipsis"
            sx={{color: isSelected ? "white" : "black"}}
            primary={_nickname}
            secondary={
                <Fragment>
                    <Typography
                   
                        noWrap
                        sx={{ 
                            overflow:'hidden', 
                            textOverflow: 'ellipsis',
                            color: isSelected  ? "white" : "black"
                        }}

                        variant="body2"
                        color="text.primary"
                    >
                        {doc.get(lastMessage) as string}
                    </Typography>
                </Fragment>
            }
        />

    </ListItem>
 
}

export default (Item)