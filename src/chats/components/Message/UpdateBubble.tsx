import { FC, useContext, useEffect, useRef } from "react";
import '../../styles/Messages.scss';
import { Typography } from "@mui/material";

import { VariableWindowListContext } from "../../../components/List/VariableWindowList";
import { MessageEnum } from "../../../enum/MyEnum";

interface props {
    index: number
    isMine: boolean
    type: number
}

const UpdateBubble: FC<props> = ({index, isMine, type}) => {

    
    const name = isMine ? "recipient" : "sender"
    
    const { size, setSize } = useContext(VariableWindowListContext)
    const root1 = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const height1 =  root1.current?.getBoundingClientRect().height ?? 0
        setSize?.(index, height1  );

      }, [size?.width]) // eslint-disable-line


    return  <div ref={root1} className="chat-bubble-wrapper">
        
            <div  className={`chat-bubble ${name}`} >
            
            <Typography className="update-message" >

                This website version does not support

            </Typography>

            <Typography className="update-message" >

            this content{type === MessageEnum.requestReview ? " anymore." : ". Please refresh website."}

            </Typography>


        </div>

      
        
        </div>
}

export default (UpdateBubble);