import { FC } from 'react';

interface props {
    src: string
    size?: number
}

const AccordionIcon : FC<props> = ({src, size = 24}) => {

    return   <img style={{borderRadius: '.3em'}}  width={size} height={size} src={src} alt=''></img>
 
}

export default AccordionIcon