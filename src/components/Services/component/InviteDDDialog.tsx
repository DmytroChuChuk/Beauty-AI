import {
    FC,
    useState,
} from 'react';
import {
    Dialog,
    DialogProps,
    DialogTitle,
    DialogContent,
    DialogActions,
    DialogContentText,
    Button,
    CircularProgress,
    Typography
} from '@mui/material';
import { addDoc, collection, getDocs, limit, orderBy, query, serverTimestamp, Timestamp, where } from 'firebase/firestore';
import { db } from '../../../store/firebase';
import { bio, category, INVITE, joined, price, sender, suffix, time_stamp, type } from '../../../keys/firestorekeys';
import { useUser } from '../../../store';
import shallow from 'zustand/shallow';
import { ServiceType } from '../../../keys/props/services';
import CountDown from '../../Timer/CountDown';
import { InviteProps } from '../../../keys/props/common';
import { DDInviteLinkExpire } from '../../../version/basic';
import { Units } from '../../../enum/MyEnum';

interface props extends DialogProps {
    priceState: number | undefined
    bioState: string | undefined
}

const InviteDDDialog : FC<props> = ({priceState, bioState, ...props}) => {

    const [ myUUID ] = useUser((state) => [ 
        state.currentUser?.uid 
    ], shallow)

    const [ isLoading, setLoading ] = useState<boolean>(false)
    const [ link, setLink ] = useState<string>()
    const [linkExpire, setExpire] = useState<Timestamp>()
    // prompt user to add intro and price before inviting

    // firestore keys: sender, uid, price, one-liner intro, time, service type, category (id), 
    function createNewLink (map: {[key:string] : any}) : Promise<any>{
        return addDoc(collection(db, INVITE), map)
    }

    const onLinkCreate = async () => {

        if(!priceState || !bioState || !myUUID) return


        setLoading(true)

        let map: InviteProps = {
            [sender]: myUUID,
            [price]: priceState,
            [bio]: bioState,
            [time_stamp]: serverTimestamp(),
            [type]: `${ServiceType.eMeet}`,
            [category]: "7",
            [suffix]: Units.hr
        }

        try{
            let id = ""
            const snaps = await getDocs(query(collection(db, INVITE), where(sender, "==", myUUID), orderBy(time_stamp, "desc"), limit(1)))
            if(snaps.docs.length > 0){
                const doc = snaps.docs[0]
                id = doc.id
                const isAccepted = doc.get(joined) as boolean | undefined

                if(isAccepted){
                    const add = await createNewLink(map)
                    setExpire(Timestamp.now())
                    id = add.id
                }else{
                    const currentPrice = doc.get(price) as number | undefined
                    const currentBio = doc.get(bio) as string | undefined
                    const createAt = doc.get(time_stamp) as Timestamp | undefined
                    const now = new Date()
                
                    if(createAt){
                        var difference = now.getTime() - createAt.toDate().getTime()
                        const resultInMinutes = Math.round(difference / 60000)
                        // console.log(resultInMinutes)
                        const c1 = resultInMinutes > (DDInviteLinkExpire) - 1
                        const c2 = priceState !== currentPrice || bioState !== currentBio
                        if(c1 || c2){
                            // 1 more min to expire, lets create a new link
                            const add = await createNewLink(map)
                            setExpire(Timestamp.now())
                            id = add.id
                        }else{
                            setExpire(createAt)
                        }
                    }else{
                        // can never happen?
                        const add = await createNewLink(map)
                        setExpire(Timestamp.now())
                        id = add.id
                    }
                }

            }else{
                const add = await createNewLink(map)
                id = add.id
                setExpire(Timestamp.now())
            }

            setLink(`${window.location.origin}/invite?id=${id}`)
        }catch(error){
            console.log(error)
        }
        // 
        // create new link if no exisiting link

        // 
        // display link

        setLoading(false)
    }

    // create a button [create link]
    // when a link is created firestore document is added
    // link expires in 6 hours
    // read if there is an existing link that is not expired
    // if link is going to expire then read a new link
    // when user click on link, it will redirect them to invite page
    // make sure user is login and being redirected to the same page after login 
    // user able to accept the link being invited by who
    // only babe can accept invite [condition] only babe without DD is able to accept invite
    // prompt user to 'Be a Babe' or remove current DD
    // once accepted (add), show success page and add a remove button. Once removed, link will be expired 
    // cloud function trigger, add services to both parties with the same one-liner intro and price. They can changed it afterwards

    return <Dialog {...props}>
        {/* {isLoading && <LinearProgress color="warning"/>} */}
         <DialogTitle>Invite link</DialogTitle>
         <DialogContent>
            <DialogContentText>
                Please send this link to your friend to join: <br/>{link ? <b>{link}</b> :  <Button 
                    size='small'
                    color="warning"
                    variant='contained'
                    disabled={isLoading} 
                    onClick={onLinkCreate}  
                    endIcon={
                    isLoading && <CircularProgress size={11} color="warning"/>}>
                        Create Link
                    </Button>}

                    { link && <> 
                        <br/> 
                        <Typography color="error" variant='caption'>Link expires at <CountDown 
                        date={linkExpire?.toDate()} minutesToExpire={DDInviteLinkExpire} /></Typography> 
                    
                    </>}
            </DialogContentText>
         </DialogContent>
         <DialogActions>
            <Button color="warning" onClick={(e) => props?.onClose?.(e, 'backdropClick')}>Cancel</Button>
         </DialogActions>
    </Dialog>
 
}

export default InviteDDDialog