
import { Timestamp } from "firebase/firestore";
import { FC, useRef, useEffect, useContext} from "react";
import dayjs from "dayjs";
import '../../styles/Messages.scss'
import LastSeen from "./LastSeen";
import { VariableWindowListContext } from "../../../components/List/VariableWindowList";
import { mobileWidth } from "../../../dimensions/basicSize";

interface props {
    sender: string | undefined
    index: number
    url: string | undefined
    chatRoomID: string
    messageId : string
    msg: string
    isMine: boolean
    seen: boolean
    createdAt: Timestamp
    verified? : boolean
    showProfileImage : boolean

}

const BubbleMessage: FC<props> = ({sender, index, url,  chatRoomID, messageId, seen, msg, isMine, createdAt, showProfileImage, verified = false}) => {


    const root1 = useRef<HTMLDivElement>(null)
    const { size, setSize } = useContext(VariableWindowListContext)
    const currentWidth = size?.width ?? 0
    const withSideName = currentWidth > mobileWidth ? "sidebar" : "nosidebar"

    const name = isMine ? "recipient" : "sender"

    function formatDate (date: Date){
        const formatter = dayjs(date)
        return formatter.format("h:mm A")
    }

    useEffect(() => {
        const height1 =  root1.current?.getBoundingClientRect().height ?? 0
        setSize?.(index, height1)
    }, [size?.width]) // eslint-disable-line

    return  <div ref={root1}  className={`chat-bubble-wrapper ${isMine ? 'isMine' : ''}`}>

        {showProfileImage && <a 
            href={`${window.location.origin}/Profile?uid=${sender}`} 
            target="_blank" 
            rel="noreferrer"
        >
            <img 
                width={80}
                height={80}
                src={url}
                alt=""
            />
        </a>}

            <div className={`wrapper-helper ${withSideName}`}>
                    <div className={`chat-bubble ${name} ${withSideName}`}>
                        <span 
                            className="msg" 
                            dangerouslySetInnerHTML={{ __html: msg.bubbleMessage()}}
                        />

                        <div className={`timing-${name}`}>
                            <LastSeen 
                                chatRoomID={chatRoomID} 
                                messageId={messageId} 
                                isMine={isMine} 
                                seen={seen} 
                                formattedDate ={ formatDate(createdAt.toDate()) }/>
                         
                        </div>
            
                    </div>
                    {showProfileImage && <p>{ createdAt.toDate().toDateString() }</p>}
                    {verified && <b className={`verified-info ${isMine ? 'isMine' : ''}`} > sent by RentBabe  <img width={11} src="https://images.rentbabe.com/assets/flaticon/card.svg" alt=''></img></b>}
            
            </div>
    </div>
    
    

}

export default (BubbleMessage) ;