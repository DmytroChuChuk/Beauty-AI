import { FC, useRef, useEffect, useContext} from "react";
import { VariableWindowListContext } from "../../../components/List/VariableWindowList";
import { Box, Typography } from "@mui/material";

import '../../styles/Messages.scss';
import { useTranslation } from "react-i18next";

interface props {
    index: number
    msg: string
}


const WarningBubble: FC<props> = ({index, msg}) => {


    const root1 = useRef<HTMLDivElement>(null);
    const { size, setSize } = useContext(VariableWindowListContext);
    const [ t ] = useTranslation()


    useEffect(() => {
        const height1 =  root1.current?.getBoundingClientRect().height ?? 0
        setSize?.(index, height1 + 16 );

      }, [size?.width]) // eslint-disable-line

    return  <Box 
            ref={root1} 
            display="flex" 
            flexDirection="column" 
            alignItems="center"
            className="chat-bubble-wrapper">
            
            <br/>

            <img 
                height={21}
                width={21} 
                src="https://images.rentbabe.com/assets/mui/warning.svg" 
                alt=""
            />
           
            <Typography sx={{margin: ".5rem 1rem", maxWidth: 600}} variant="body2" color="text.secondary" textAlign="center">{`${t(msg)}`}</Typography>

      
    </Box>
    
    

}

export default (WarningBubble) ;