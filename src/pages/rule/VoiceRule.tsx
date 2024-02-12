import {
    FC
} from 'react';
import {
    DialogContent,
    AppBar,
    IconButton,
    Toolbar,
    Typography,
    DialogContentText,
    Box
} from '@mui/material';
import VoiceButton from '../../components/Voice/VoiceButton';
import FlexGap from '../../components/Box/FlexGap';
import history from '../../utility/history';
import FlexBox from '../../components/Box/FlexBox';


const VoiceRule : FC = () => {

    const onBackClick = () => {
        history.goBack()
    }

    return <Box>

        <audio
            id = "audio"
            className="auto-audio"
            autoPlay
            loop={false}
          />

        <AppBar sx={{ position: 'relative' }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={onBackClick}>
                <img
                width={16}
                height ={16}
                    src = "https://images.rentbabe.com/assets/back.svg"
                    alt=""
                />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                Rules for images and content
            </Typography>

          </Toolbar>
        </AppBar>

         <DialogContent>
            
            <DialogContentText>
                RentBabe is dedicated to creating a social gaming platform where users can safely and creatively express themselves. To reach this goal, please observe our Multimedia Policy when uploading media to our application. You can read the full policy here Multimedia Policy. These policies apply to all genders.
            </DialogContentText> 

            <br/>

            <DialogContentText>
                <b>Audio criterias:</b>
            </DialogContentText>
            <br/>
            <DialogContentText>
            1. The quality of the audio track, and its background noise.
            <br/>
            <br/>
            2. Whether you have introduced yourself.
            <br/>
            <br/>
            3. Whether you have talked about the services you are providing and/or your in-game skills and/or preferences.

            </DialogContentText>

            <br/>
            <br/>


            <FlexBox alignItems="center"> 
                Play Example: <FlexGap/> <VoiceButton voiceUrl="https://images.rentbabe.com/GUIDELINE/example.mp3?duration=12" />
            </FlexBox>
   
       
            <br/>
            <br/>

            <DialogContentText>
                <b>Hints:</b>
            </DialogContentText>

            <br/>

            <DialogContentText>
                1. Record your line in a quiet environment with a decent quality microphone, and try to keep your volume consistent.
                <br/>
                <br/>
                2. Don’t speak too fast nor too slow, make yourself easy to understand.
                <br/>
                <br/>
                3. It should include self-introduction.
                <br/>
                <br/>
                4. Humour is a great selling point, so tell some jokes if you have any.
            </DialogContentText>

        </DialogContent>
    </Box>
}

export default VoiceRule