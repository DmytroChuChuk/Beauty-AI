
import { Timestamp } from "firebase/firestore";
import { FC, useRef, useEffect, useContext} from "react";
import dayjs from "dayjs";
import '../../styles/Messages.scss'
import LastSeen from "./LastSeen";
import { VariableWindowListContext } from "../../../components/List/VariableWindowList";

import CenterFlexBox from "../../../components/Box/CenterFlexBox";

interface props {
    index: number
    chatRoomID: string
    messageId : string
    msg: string
    isMine: boolean
    seen: boolean
    createdAt: Timestamp
    url: string | undefined
}


const PaymentBubble: FC<props> = ({ index, chatRoomID, messageId, seen, msg, isMine, createdAt, url }) => {
 

    const root1 = useRef<HTMLDivElement>(null);
    const { size, setSize } = useContext(VariableWindowListContext);

    const data = url?.getWidthHeight() ?? {width: 0, height: 0}

    const name = isMine ? "recipient" : "sender"

    function formatDate (date: Date){

        const formatter = dayjs(date);
      
        return formatter.format("h:mm A");
    }

    useEffect(() => {
        const height1 =  root1.current?.getBoundingClientRect().height ?? 0
        setSize?.(index, height1  );

      }, [size?.width]) // eslint-disable-line

      const onClick = () => {
        window.open(url?.toCloudFlareURL(), "_blank")
      }

    return  <div ref={root1}  className={`chat-bubble-wrapper ${isMine ? 'isMine' : ''}`}>

            <div className='wrapper-helper'>
            
                    <div className={`chat-bubble ${name}`}>

                        <CenterFlexBox 
                        onClick={onClick} className="bubble-img" >
                            <img 
                                style={{aspectRatio: `${data.width} / ${data.height}`}}
                                src={url?.toCloudFlareURL()}
                                alt=""
                            />
                        </CenterFlexBox>

                        <span className="msg" dangerouslySetInnerHTML={{ __html: msg.bubbleMessage() }} />

                        <div className={`timing-${name}`}>
                            <LastSeen chatRoomID={chatRoomID} messageId={messageId} isMine={isMine} seen = {seen} formattedDate ={formatDate(createdAt.toDate())}/>
                        </div>
                    </div>

                    <b className={`verified-info ${isMine ? 'isMine' : ''}`} > sent by RentBabe  <img width={11} src="https://images.rentbabe.com/assets/flaticon/card.svg" alt=''></img></b>
            
            </div>
    </div>
    
    

}

export default PaymentBubble;