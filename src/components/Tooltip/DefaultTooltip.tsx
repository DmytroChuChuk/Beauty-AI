import { FC, ReactChild, ReactFragment, ReactPortal } from 'react';
import { SxProps, Theme } from '@mui/material';
import MobileTooltip from './MobileTooltip';

interface props {
    className?: string
    title: boolean | ReactChild | ReactFragment | ReactPortal
    url: string
    width?: number
    margin?: string
    sx?: SxProps<Theme> | undefined
    
}

const DefaultTooltip : FC<props> = ({className, title, url, width = 24, margin, sx}) => {

    return <MobileTooltip 
        sx={sx}
        className={className}
        title={title} 
      >
        <img 
          style={{cursor: 'pointer', margin: `${margin}`, WebkitTapHighlightColor:"transparent"}}
          width={width} 
          height={width}
          src={url} 
          alt =''
        />
    </MobileTooltip>
}

export default DefaultTooltip