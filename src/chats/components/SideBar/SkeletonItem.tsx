import { FC, useEffect, useState } from 'react';
import { ListItem, ListItemAvatar, ListItemText, Skeleton, ListItemProps } from '@mui/material';

interface Props extends ListItemProps {
    index: number
    removeAvatar?: boolean
}

const SkeletonItem : FC<Props> = ({index, removeAvatar, ...props}) => {

    // TEMP FIXED.
    const [hide, setHide] = useState(false)

    useEffect(() => {
        const out = setTimeout(() => {
            setHide(true)
        }, 1200)

        return () => {
            clearTimeout(out)
        }
    }, [])

    return <>

        { hide ? null :
            <ListItem hidden {...props} key={index}    >
                {
                    removeAvatar ? null : <ListItemAvatar>
                        <Skeleton variant="circular" height={40} width={40} />
                    </ListItemAvatar>
                }


                <ListItemText
                    className="ellipsis"

                    primary={<Skeleton variant="text" width={120} />}
                    secondary={
                        <Skeleton variant="text" />
                    }
                />

            </ListItem>
        }
    </>
 
}

export default SkeletonItem