import { Accordion, Typography, AccordionDetails, CircularProgress } from '@mui/material';
import { FC, useState } from 'react';

import { db } from '../../../store/firebase';

import { AdminAccordionSummary } from '../components/AdminAccordionSummary';
import AccordionIcon from '../components/AccordionIcon';
import { useEffectCollectionQuery } from '../../../chats/hooks/useEffectCollectionQuery';
import WindowList from '../../List/WindowList';
import { useUser } from '../../../store';
import { BLOCK, time_stamp, USERS } from '../../../keys/firestorekeys';
import { orderBy, limit, query, collection} from 'firebase/firestore';
import shallow from 'zustand/shallow';
import { ListChildComponentProps } from 'react-window';
import SkeletonItem from '../../../chats/components/SideBar/SkeletonItem';
import BlockItem from '../components/BlockItem';
import { useTranslation } from 'react-i18next';

interface props {
    expanded : boolean
    onChange: (event: React.SyntheticEvent, expanded: boolean) => void
}

const BlockUserPanel : FC<props> = ({ expanded, onChange}) => {
    
    const [ t ] = useTranslation()
    const [uid] = useUser((state) => [state.currentUser?.uid], shallow)
    const [limitCount, setLimitCount] = useState<number>(3)

    const {loading , error , data, hasNextPage} = useEffectCollectionQuery(uid ? `BC-${uid}` : undefined , 
    uid ? query(collection(db, USERS, uid, BLOCK),
    orderBy(time_stamp, 'desc'), limit(limitCount)) : undefined, limitCount)

    function loadNextPage() {

        if(hasNextPage){
            setLimitCount((prev) => prev + 3)
        }
    }

    const Row  = ({index, style} : ListChildComponentProps) => {

        const doc = data?.docs[index]

        if(!doc || !uid) return <SkeletonItem 
        style={style} 
        index={index} 
        removeAvatar={true}/>

    
        return <div key={index} style={style}>
            <BlockItem 
                index={index}
                uid={uid}
                doc={doc}  
            />
        </div>
      }

    return <Accordion
    sx={{width: "100%"}} 
            disableGutters
            disabled={error || loading}  
            expanded={expanded} 
            onChange={onChange}
        >

        <AdminAccordionSummary>

            {
                loading ? <CircularProgress size={24} color='secondary'/> : 
                <AccordionIcon src="https://images.rentbabe.com/assets/admin/admin_blockuser.svg" />
            }
        
            <Typography 
            
            className="secondaryHeading"
            marginLeft={3} 
            
            >{t("block.user")}</Typography>

        </AdminAccordionSummary>
            
        <AccordionDetails>
            <WindowList 
                height={136}
                width={"100%"}
                hasNextPage={hasNextPage}
                dataSize={data?.size as number}
                loadNextPage={loadNextPage}
                component={Row}
                itemSize={56}
            />
        </AccordionDetails>

        </Accordion>
    
 
}

export default BlockUserPanel