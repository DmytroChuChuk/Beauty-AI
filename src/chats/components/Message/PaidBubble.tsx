
import { DocumentData, QueryDocumentSnapshot, Timestamp } from "firebase/firestore";
import { FC, useRef, useEffect, useContext} from "react";
import '../../styles/Messages.scss'
import { VariableWindowListContext } from "../../../components/List/VariableWindowList";
import { Box, Chip, Typography } from "@mui/material";
import { amount, createdAt, id, info, nickname, sender, short_link, tele_id, type } from "../../../keys/firestorekeys";
import { useUser } from "../../../store";
import CoinImage from "../../../components/CustomImage/CoinImage";
import LeaveReview from "../../../components/Chip/LeaveReview";
import FlexGap from "../../../components/Box/FlexGap";
import CenterFlexBox from "../../../components/Box/CenterFlexBox";
import shallow from "zustand/shallow";


interface props {
    index: number
    data: QueryDocumentSnapshot<DocumentData>
    tipOnClick: () => void
    openCashBackDialog: () => void
}

const PaidBubble: FC<props> = ({ index, data, tipOnClick, openCashBackDialog}) => {

    interface struct {
        [id]: string
        [createdAt]: Timestamp
        [type]: number
        [amount]: number
        [info]: {
            [uid: string] : {
                [id]: string | undefined,
                [short_link] : string | undefined,
                [sender]: string | undefined,
                [nickname]: string | undefined,
                [tele_id]: string | undefined
            }
        }
    }

    const googleLink = "https://g.page/r/CbGyPSjHcdeWEAI/review"

    const _data = data.data() as struct;

    const [ myUID ] = useUser((state) => [
        state.currentUser?.uid
    ], shallow)

    const filterUser = Object.keys(_data[info]).filter(id => id !== myUID)
    const otherUID = filterUser.length > 0 ? filterUser[0] : ""

    const root1 = useRef<HTMLDivElement>(null);
    const { size, setSize } = useContext(VariableWindowListContext);


    useEffect(() => {
        const height1 =  root1.current?.getBoundingClientRect().height ?? 0
        setSize?.(index, height1 + 16 );

      }, [size?.width]) // eslint-disable-line

    return  <Box 
            ref={root1} 
            display="flex" 
            flexDirection="column" 
            alignItems="center"
            bgcolor="#efefef"
            className="chat-bubble-wrapper">
            
            <br/>
            
            <Box 
            borderRadius={1} 
            padding={1} 
            bgcolor="black"            
            display="flex" 
            justifyContent="center"
            alignItems="center">  
               <CoinImage imageWidth={21}/>
                    <FlexGap/>
                        <Typography fontWeight={800} color="primary">

                            {!_data[amount]  ? "PAYMENT RECEIVED" : `PAYMENT RECEIVED: ${(_data[amount] / 100).toFixed(2)}`}


                        </Typography>
                    <FlexGap/>
                <CoinImage imageWidth={21}/>
            </Box>
            

            {
                _data?.[id] && <Typography 
                    sx={{textDecoration: 'underline'}} 
                    variant="caption" 
                    color="text.secondary" 
                    textAlign="center">
                        
                    <a  
                        href={`${window.location.origin}/page/checkout?id=${_data?.[id]}`}
                        style={{color: "inherit"}}
                        rel="noreferrer"
                    >
                        Order ID: {_data?.[id]}
                    </a>
                </Typography>
            }

          
            <Typography marginTop={1} variant="body1" color="text.secondary" textAlign="center">
                The transaction is successfully completed!
            </Typography>

            <Typography variant="caption" color="error.main" textAlign="center">
                Please tip/review or issue a refund in 72 hours
            </Typography>
  

            {/* { isAdmin && <CenterFlexBox marginTop="8px"  onClick={openCashBackDialog}>
                <Chip 
                    sx={{cursor: "pointer"}}
                    variant="filled" 
                    color="error"
                    label={<Typography fontWeight={800} variant="body1">Tap here to earn S${_data[amount] * 0.0025}</Typography>}
                />

            </CenterFlexBox> } */}
            

            <br/>

            <Box  display="flex" >


                <Chip
                    onClick = {tipOnClick}
                    sx={{cursor: "pointer"}} 
                    icon={
                        <CenterFlexBox width={24} height={24}>


                            <img
                                width={19}
                                height={19}
                                src="https://images.rentbabe.com/assets/mui/paid.svg"
                                alt=""
                            />

                        </CenterFlexBox>
                    }
                    label="Tip"
                />


            <FlexGap />

                <LeaveReview
                    link={_data?.[info]?.[otherUID]?.[short_link]}
                    myReviewLinkId = {_data?.[info]?.[myUID ?? ""]?.[short_link]?.getQueryStringValue("sid")}
                />

                <FlexGap />

                <Chip 
                    onClick={() => {
                        window.open(googleLink, "_blank")
                    }}
                    sx={{cursor: "pointer"}}
                    icon={
                        <img
                            width={24}
                            height={24}
                            src= "https://images.rentbabe.com/assets/rentblogo.svg"
                            alt=""
                        />
                    } 
                    label="Review"
                />

                <FlexGap />

                <Chip 
                    sx={{cursor: "pointer"}}
                    variant="filled" 
                    color="primary"
                    onClick={() => {
                        //window.location.href = `/refund?id=${_data[id]}`
                        window.open(`/refund?id=${_data[id]}`, "_blank")
                    }}
                    label={<Typography fontWeight={800} variant="caption">Refund</Typography>}
                />

            </Box>

            <br/>
    </Box>
    
}

export default (PaidBubble) ;