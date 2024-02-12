import { MenuItem, ListItemIcon } from '@mui/material';
import { FC } from 'react';

interface props {
    title: string
    iconImageSize: number
    imageUrl?: string
    onClick: () => void
}

const BasicMenuItem : FC<props> = ({title,iconImageSize, imageUrl, onClick}) => {


    return <MenuItem onClick={onClick}>

    {imageUrl && <ListItemIcon>

        <img
        style={{borderRadius: "9999px"}}
        height={iconImageSize}
        width={iconImageSize}
        src={imageUrl}
        alt=""
      />
    </ListItemIcon>}
    {title}
  </MenuItem>
 
}

export default BasicMenuItem