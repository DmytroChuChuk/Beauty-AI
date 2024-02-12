import { Accordion, AccordionDetails, Box, Button, CircularProgress, Typography } from '@mui/material';
import { FC, useEffect, useState } from 'react';
import { ListChildComponentProps } from 'react-window';
import { date, time, location, time_stamp,  ANNOUNCE, sender, status, telegram_message_id, services, country } from '../../keys/firestorekeys';
import { activity } from '../../keys/localStorageKeys';
import { AdminAccordionSummary } from '../adminpage/components/AdminAccordionSummary';

import AccordionIcon from '../adminpage/components/AccordionIcon';
import WindowList from '../List/WindowList';
import SessionItem from './SessionItem';
import { collection, limit, orderBy, query, Timestamp, where } from 'firebase/firestore';
import SkeletonItem from '../../chats/components/SideBar/SkeletonItem';

import { db } from '../../store/firebase';
import shallow from 'zustand/shallow';
import { useUser } from '../../store';
import CloseAnnouncementDialog from '../Dialogs/Rent/CloseAnnouncementDialog';
import { Announcement } from '../../utility/Announcement';
import { ServiceType } from '../../keys/props/services';
import { useCollectionQuery } from '../../chats/hooks/useCollectionQuery';
import FlexBox from '../Box/FlexBox';
import CloseAllAnnouncementDialog from '../Dialogs/Rent/CloseAllAnnouncementDialog';


interface props {
    darkMode?: boolean
    size?: "small" | "medium"
    hasPending?: (hasPending: boolean) => void
}

const BroadcastList : FC<props> = ({darkMode = false, size = "medium", hasPending}) => {

    const isSmall = size === "small"

    const [uid, nickname] = useUser((state) => [
        state.currentUser?.uid,
        state.currentUser?.nickname
    ], shallow)

    const [limitCount, setLimitCount] = useState<number>(3)
    const [open, setOpen] = useState<boolean>(false)
    const [openAll, setOpenAll] = useState<boolean>(false)

    const {loading , error , data, hasNextPage} = useCollectionQuery(uid ? `BC-${uid}` : undefined , 
    uid ? query(collection(db, ANNOUNCE), where(sender, '==', uid), 
    where(status, '==', 0) , 
    orderBy(time_stamp, 'desc'), limit(limitCount)) : undefined, limitCount)

    const [id, setID] = useState<string>()
    const [telegramMessageID, setTMID] = useState<number>()
    const [msg, setMsg] = useState<string>()
    const [countryState, setCountry] = useState<number>()

    useEffect(() => {
        hasPending?.(data?.length as number > 0)
        // eslint-disable-next-line 
    }, [data])

    const onCloseDialog = () => {
        setOpen(false)
        setOpenAll(false)
    }

    function loadNextPage() {
        if(hasNextPage){
            setLimitCount((prev) => prev + 3)
        }
    }

    const onCloseAll = () => {
        setOpenAll(true)
    }




    const Row = ({index, style} : ListChildComponentProps) => {

        const doc = data?.[index]

        if(!doc) return <SkeletonItem 
        style={style} 
        index={index} 
        removeAvatar={true}/>

        const id = doc.id

        const _serviceType = doc.get(services) as ServiceType
        const _venue = doc.get(location) as string
        const _date = doc.get(date) as string
        const _time = doc.get(time) as string
        const _activity = doc.get(activity) as string
        const _timeStamp = doc.get(time_stamp) as Timestamp
        const _telegramMessageID = doc.get(telegram_message_id) as number
        const _country = doc.get(country) as number
        
        const msg = `${_date} on ${_time} at ${_venue} ${_activity}`

        const onClose = () => {
            const announcement = new Announcement()
            setID(id)
            setMsg(announcement.convertToAnnouncementMsg(doc))
            setTMID(_telegramMessageID)
            setCountry(_country ?? 0)
            setOpen(true)
        }
    
        return <div key={index} style={style}>

            <SessionItem 
                id={id} 
                serviceType={_serviceType}
                title={msg} 
                timeStamp={_timeStamp}
                venue={_venue} 
                onClose={onClose}
            />
      
        </div>
      }

    if(data?.length as number > 0) return  <>

        <FlexBox flexDirection="column" justifyContent="center" style={{marginBottom: '16px'}}>

        <Accordion
            disableGutters
            disabled={error || loading}  
            sx={{
                width: '100%', 
                minWidth: "280px", 
                maxWidth: '500px', 
                margin: '0 auto 0 auto', 
                background: "black"
            }} 
        >
                
        <AdminAccordionSummary darkMode={darkMode}>

            <Box display="flex" alignItems="center">

                {
                    loading ? <CircularProgress size={isSmall ? 12 : 24} color={darkMode ? 'primary' : 'secondary'} /> : 
                    <AccordionIcon size={isSmall ? 19 : undefined} src={darkMode ?  "https://images.rentbabe.com/assets/admin/admin_broadcast_history_white.svg" 
                    : "https://images.rentbabe.com/assets/admin/admin_broadcast_history.svg" }/>
                }

                <Typography
                    color={darkMode ? "primary.main" : "text.main"}
                    marginLeft={isSmall ? 1 : 3} 
                    className="secondaryHeading"
                >
                    
                    Previous broadcast message {error && "ERROR"}

                </Typography>

            </Box>

        </AdminAccordionSummary>

        <AccordionDetails sx={{background: "white"}}>
            <FlexBox width="100%">
                <Button onClick={onCloseAll} size="small" sx={{marginLeft: "auto", textTransform: "none", fontSize: 10}} variant='text' color="error">Close All</Button>
            </FlexBox>
           
            <WindowList 
                height={136}
                width={"100%"}
                hasNextPage={hasNextPage}
                dataSize={data?.length as number}
                loadNextPage={loadNextPage}
                component={Row}
                itemSize={56}
            />
        </AccordionDetails>

        </Accordion> 
        </FlexBox>
    
        <CloseAnnouncementDialog 
          id={id} 
          nickname={nickname}
          telegramMessageID={telegramMessageID} 
          msg={msg} 
          country={countryState ?? 0}
          open={open} 
          onClose={onCloseDialog}        
        />

        <CloseAllAnnouncementDialog 
          nickname={nickname}
          uid={uid}
          open={openAll} 
          onClose={onCloseDialog}        
        />
    </>

    return null
 
}

export default (BroadcastList)