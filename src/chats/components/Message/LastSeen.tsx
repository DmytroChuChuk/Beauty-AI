import { doc, writeBatch } from 'firebase/firestore';
import { FC, useEffect, useState } from 'react';
import { CONVERSATION, lastSeen, MESSAGES} from '../../../keys/firestorekeys';
import { db } from '../../../store/firebase';
import { useTranslation } from 'react-i18next';

interface props {
    chatRoomID: string
    messageId : string
    seen: boolean
    isMine: boolean
    formattedDate: string
}

const LastSeen : FC<props> = ({chatRoomID, messageId, seen : sn, isMine, formattedDate}) => {


    const [ t ] = useTranslation()
    const [seen, setSeen] = useState<boolean>(sn)

    useEffect(() => {

        if(!sn && !isMine) {
            const batch = writeBatch(db)

            const messageRef = doc(db, CONVERSATION, chatRoomID, MESSAGES, messageId)
            // const roomRef = doc(db, CONVERSATION, chatRoomID)
   
            // const key = `${info}.${myUID}.${lastSeen}`
            // const now = serverTimestamp()


            batch.update(messageRef, {[lastSeen] : true})
            // batch.update(roomRef, {
            //     [ isMine ? senderLastSeen : recipientLastSeen ] : now,
            //     [key] : now
            // })

            batch.commit()
        
        }

        setSeen(sn)
    } , [sn]) // eslint-disable-line



    return <>
    {    
        isMine ? 
        <>
            <p className='read'>
                {seen && `${t("read")}`}
            </p>
            <p >{formattedDate}</p>
        </> : 
        <>
            <p>{formattedDate}</p>
        
        </>
    }
    </>
     
 
}

export default LastSeen