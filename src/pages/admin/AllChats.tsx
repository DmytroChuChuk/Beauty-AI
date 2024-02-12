import { Avatar, Card, CardHeader, LinearProgress, Typography } from '@mui/material';

import { collection, DocumentData, DocumentSnapshot, Timestamp } from 'firebase/firestore';
import { FC, useState } from 'react';
import { ListChildComponentProps } from 'react-window';
import CenterFlexBox from '../../components/Box/CenterFlexBox';
import FlexBox from '../../components/Box/FlexBox';
import FlexGap from '../../components/Box/FlexGap';
import WindowList from '../../components/List/WindowList';
import SkeletonOrderCard from '../../components/Order/component/SkeletonOrderCard';
import { RBAC } from '../../enum/MyEnum';
import { useGetDocuments } from '../../hooks/useGetDocuments';
import { useWindowSize } from '../../hooks/useWindowSize';
import { CONVERSATION, updatedAt } from '../../keys/firestorekeys';
import { useUser } from '../../store';
import { db } from '../../store/firebase';

import Conversation from "../../utility/Conversation"

const AllChats : FC = () => {

    const defaultLimitCount = 5

    const [userRBAC ] = useUser((state) => [
        state?.currentUser?.userRBAC
    ])

    const [ size ] = useWindowSize()

    const [limitCount, setLimitCount] = useState(defaultLimitCount)

    const { loading, data, error, hasNextPage } = useGetDocuments(`admin-all-conversation`,
    collection(db, CONVERSATION),
    [],
    updatedAt,
    limitCount)
    

    const Row  = ({index, style, data} : 
        ListChildComponentProps<DocumentSnapshot<DocumentData>[] | null> ) => {

        const doc = data?.[index] 
        const helper = new Conversation()
        const convo = helper.convertDocToConvo(doc)

    
        if(!doc) return  <div key={index} style={style}>
                <SkeletonOrderCard/>
            </div>

     
        else return <div key={index} style={style}>
    
            <Card>
                <CardHeader
                    title={
                        <FlexBox>
                            {convo?.info &&  <>
                                {Object.values(convo.info).map(value => {
                                    return <>
                                        <Avatar
                                            src={value?.mbl ?? undefined}
                                            variant="circular"
                                        />
                                        <FlexGap/>
                                    </>
                                })}
                            </>}
                            <FlexGap/>
                            <Typography variant='caption'>{convo?.lastMessage?.shorten(100)}</Typography>
                        </FlexBox>
                    }

                    subheader={<Typography 
                        color="text.secondary" 
                        variant='caption'
                        fontSize={10}>
                            <a 
                            rel="noreferrer" 
                                href={`${window.location.origin}/chatview?cri=${doc.id}`} 
                                target="_blank"
                            >ChatRoomID: { doc.id }</a>
                    </Typography>}

                />

            <Typography 
                color="text.secondary" 
                variant='caption'
               >
                <b>{
                    (convo?.updatedAt as Timestamp)?.toDate().toLocaleString("en-US", {
                        month: "short", day: "numeric", 
                        hour: "numeric", minute: "numeric", hour12: true
                    })
                }</b>
                ---
                has paid: { (convo?.order?.length ?? 0) > 0 ? "YES" : "NO"}
            </Typography>
            </Card>
        </div>
      }


    function loadNextPage() {
        if(hasNextPage){
            setLimitCount((prev) => {
              return prev + defaultLimitCount
            })
        }
    }

    if(userRBAC !== RBAC.admin) return <p>error, not admin</p>
    else if (error) return <p>ERROR LOADING...</p>
    // else if (loading) return <LoadingScreen/>
    else return <CenterFlexBox bgcolor="gray" paddingTop={10} height="100vh">
    {loading && (data?.length ?? 0) === 0 && <LinearProgress color="secondary"/>}
    <WindowList
        itemData={data ?? []} 
        height={600}
        width={ size.width * 0.95 > 550 ? 550 : size.width * 0.95 }
        hasNextPage={hasNextPage}
        dataSize={data?.length ?? 0}
        loadNextPage={loadNextPage}
        component={Row}
        itemSize={120}
        overScan={0}
    />

    </CenterFlexBox>
 
}

export default AllChats