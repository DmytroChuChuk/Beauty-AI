import { FC, useEffect, useState } from 'react';
import CenterFlexBox from '../components/Box/CenterFlexBox';
import { Item } from '../keys/props/profile';
import { Avatar, Card, CardHeader, Typography } from '@mui/material';
import PageHeader from '../components/Headers/PageHeader';
import { collection, getDocs, limit, query, where } from '@firebase/firestore';
import { db } from '../store/firebase';
import { USERS, myReferrer, referrer } from '../keys/firestorekeys';
import { useUser } from '../store';
import { shallow } from 'zustand/shallow';
import { Helper } from '../utility/Helper';
import LoadingScreen from '../components/Loaders/LoadingScreen';

// Just a basic normal page to track the number of inivites.
// This page does not have load for more function.

const TrackInivitesPage : FC = () => {

    const [ myUUID ] = useUser((state) => [
        state.currentUser?.uid, 
      ], shallow)

    const helper = new Helper()
    const limitFetch = 15 // using this amount because, I don't think there will be much invites at the start.
    const [inviteList, setInviteList] = useState<Item[]>([])
    const [isLoading, setLoading] = useState<boolean>(true)

    useEffect(() => {

        setLoading(true)

        if(!myUUID){
            window.location.href = "/Login"
            return
        }
        // fetch 
      getDocs(query(collection(db, USERS) 
        , where(`${myReferrer}.${referrer}`, "==" , myUUID) 
        , limit(limitFetch))).then((snapShot) => {

            let items = []
            for (let index = 0; index < snapShot.docs.length; index++) {
                const doc = snapShot.docs[index];
                const item = helper.addItems(doc)
                items.push(item)
            }
            setInviteList(items)
        }).finally(() => {
            setLoading(false)
        })
        // eslint-disable-next-line 
    } , [myUUID])

    const openProfilePage = (UUID:string) => () => {
        window.open(`/Profile?uid=${UUID}`)
    }

    if(isLoading) return <LoadingScreen/>

    else if(inviteList.length === 0) return <CenterFlexBox flexDirection="column" height="100vh">
        <Typography>No referrals yet</Typography>
        <Typography variant='caption' color="text.secondary">Sounds like a great time to get someone new on board</Typography>
    </CenterFlexBox>

    else return <CenterFlexBox flexDirection="column" height="100%">
        <PageHeader title='Inivted friends'/>

        {
            inviteList.map((user) => {
                if(!user) return <></>
                else return <Card sx={{minWidth: "50%", width: 350, cursor: "pointer"}}  onClick={openProfilePage(user.uid)} >
                    <CardHeader
                        avatar={<Avatar
                                src={user.mobileUrl?.toCloudFlareURL() ?? user.urls[0]?.toCloudFlareURL()  ?? ""}
                                sx={{ width: 40, height: 40, marginLeft: "1em", cursor: "pointer"}}
                                alt="">
                        </Avatar>}
                        title={`@${user.nickname ?? "Account Delete"}`}
                        subheader={(user.isOnline ? "Online" : user.time_stamp ?  `Last seen ${helper.timeSince(user.time_stamp.toDate(), true)}` : "")}
                    />
                </Card>
            })
        }

    </CenterFlexBox>
 
}

export default TrackInivitesPage