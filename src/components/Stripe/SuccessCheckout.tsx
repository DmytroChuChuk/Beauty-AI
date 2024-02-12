import React, { useEffect, useState } from 'react';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

import Typography from '@mui/material/Typography';

import './SuccessCheckout.scss'
import { Box, Divider, LinearProgress, Link } from '@mui/material';
import { Helper } from '../../utility/Helper';

import { functions } from '../../store/firebase';
import { httpsCallable } from 'firebase/functions';

import history from '../../utility/history';
import { useUser } from '../../store';
import shallow from 'zustand/shallow';
import MyAppBar from '../MyAppBar';
import { cardGray } from '../../keys/color';
import LoginPage from '../../pages/LoginPage';

const SuccessCheckout: React.FC = () => {

    const [ uid , country, gender ] = useUser((state) => [state.currentUser?.uid, 
        state.currentUser?.countryCode, 
        state.currentUser?.gender], shallow)

    const setCurrentUser = useUser((state) => state.setCurrentUser)

    enum pageType{
        verify = "verify",
        telegramNotification = "telenotify"
    }

    const [loading, setLoading] = useState<boolean>(false)
    const [icon, setIcon] = useState<boolean>(false)
    const [color, setColor] = useState<string>("black");
    const [header, setHeader] = useState<string>();
    const [msg, setMsg] = useState<string>();
    const [link, setLink] = useState<string>();

    const helper = new Helper();

    async function verifyTelegramNotifcation() {

        const chat_id = helper.getQueryStringValue("id")
        const verifyTelegramNotifcation = httpsCallable(functions, 'verifyTelegramNotifcation')

        try{
            const res = await verifyTelegramNotifcation({
                gender: gender,
                chat_id: chat_id,
                country: country
            });
    
            const data = res.data as any;
            const status = data.status
            const joinmsg = data.joinmsg
    
            if(status === 200){
                // success
                setMsg(`You will receive incoming message notification at the Telegram Bot\n\n${joinmsg}`)
                setColor("green")
                setHeader("VERIFIED SUCCESS")

                setCurrentUser({teleId: chat_id})
            }

        }catch (err) {
            console.log(err)
            setMsg("Something wrong has occur...")
            setColor("red")
            setHeader("NOT VERIFIED")
        }

        setLoading(false)

    }

    async function verifyPremiumUser(){

        const ticket_id = helper.getQueryStringValue("ticket_id")

        if(!ticket_id){

            setMsg("Cannot find basic information")
            setHeader("NOT VERIFIED")
            return
        }


        setLoading(true)

        const verifyPremiumUser = httpsCallable(functions, 
            'verifyPremiumUser');

        let status = 401


        const res = await verifyPremiumUser({
            ticket_id: ticket_id
        });

        const data = res.data as any;
        status = data.status


        if(status === 404){
            setMsg("You are not a premium member")
            setColor("red")
            setHeader("NOT VERIFIED")
        }else if(status === 401){
            setMsg("Something wrong has occur...")
            setColor("red")
            setHeader("NOT VERIFIED")
        }
        else{
            setMsg("You may enjoy your 10% OFF for all meetups from our coordinators")
            setColor("green")
            setHeader("VERIFIED SUCCESS")
        }

        setLoading(false)
    }

    useEffect(() => {

        const url = window.location.href.replace(/\/$/, '');
        const lastSeg = url.substring(url.lastIndexOf('/') + 1)
        const data = {openVerify: lastSeg}
        const pageName = lastSeg.split("?")[0].toLowerCase()
   
        if( pageType.verify.valueOf() === pageName ){
            
            // if (!uid){
            //     history.push("/Login", data)
            //     return
            // }

            setHeader("Please wait...")
            verifyPremiumUser()


            return
        }

        if( pageType.telegramNotification.valueOf() === pageName ){
            
            if (!uid){
                history.push("/Login", data)
                return
            }

            setHeader("Please wait...")
     
            verifyTelegramNotifcation()

            return
        }

        setIcon(true)
        setHeader("PAYMENT RECEVIED")
        setColor("green")
        const text = helper.getQueryStringValue("text")
        const link = helper.getQueryStringValue("link")

        setMsg((text))
        setLink(link)

    },[]) // eslint-disable-line react-hooks/exhaustive-deps

    function urlify(text: string | undefined) {

        if(!text) return ""

        var urlRegex = /(https?:\/\/[^\s]+)/g;
        return text.replace(urlRegex, function(url) {
          return '<a href="' + url + '">' + url + '</a>';
        })
        // or alternatively
        // return text.replace(urlRegex, '<a href="$1">$1</a>')
      }


    if(!uid) return <LoginPage dontRedirect/>
    
    else return <Box 
        className="chat-background" 
        display="flex" 
        flexDirection="column" 
        alignItems="center"
        width="100%"
        height="100vh"
        padding="0 8px"
        bgcolor={cardGray} 
    
    >

        <MyAppBar/>

        <Card sx={{marginTop: "56px"}}>
        {loading ? <LinearProgress color='secondary'/> : null}
            <CardContent >
                <div className = "header">

                    <Typography style={{color: color, fontWeight: 500}}  gutterBottom variant="h5" component="div">
                        {header}
                    </Typography>

                    {icon ? <img src = "https://images.rentbabe.com/assets/flaticon/card.svg" alt="rentbabe verified"/> : null}
                    
                </div>


                <br/>
                <Divider/>
                <br/>

                <Typography className = "new-line" variant="body2" >
                    <Link href=  {link} underline="none" color="secondary" target="blank">

                    {icon ? "View date partner profile": null}
                        
                    </Link>
                </Typography>

                <Typography className = "new-line" variant="body2" >

                    <span dangerouslySetInnerHTML={{ __html: urlify(msg) }} />
                
                </Typography>

                <br/>

                <Typography variant="caption" color="secondary" >        
                    <Link href={`${window.location.origin}/page/Rent`} underline="none" color="secondary">
                        Return to Home
                    </Link>
                </Typography>
        
                <Typography variant="caption" color="secondary" sx={{marginLeft: "8px"}}>
                    <Link href="rentbabe.com/page/Terms%20of%20service" underline="none" color="secondary">
                        Terms of service
                    </Link>
                </Typography>

                <Typography variant="caption" color="secondary" sx={{marginLeft: "8px"}}>        
                    <Link href="rentbabe.com/page/FAQ" underline="none" color="secondary">
                        FAQ
                    </Link>
                </Typography>



            </CardContent>
        
        </Card>

    </Box>
  
}

export default SuccessCheckout