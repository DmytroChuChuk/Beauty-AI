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
    Grid
} from '@mui/material';
import { Box, GridProps } from '@mui/system';
import history from '../../utility/history';


interface itemProps extends GridProps {
    title: string
    description: string
    src: string | undefined
}


const ItemGrid: FC<itemProps> = ({title, description, src, ...props}) => {

    const img = (src: string | undefined) => {
        return <img
            style={{ maxWidth: "100%", maxHeight: "300px" }}
            src={src}
            alt=""
        />
    }

    function getSrc(title: string) {

       const _title = title.toLowerCase()

        switch (_title) {
            case "excellent":
                return "https://images.rentbabe.com/assets/mui/green_tick.svg";

            case "good":
                return "https://images.rentbabe.com/assets/mui/green_tick.svg";

            case "moderate":
                return "https://images.rentbabe.com/assets/mui/orange_tick.svg";

            case "poor":
                return "https://images.rentbabe.com/assets/mui/red_cross.svg";
        }
    }


    return <Grid {...props} display="flex" alignItems="center" justifyContent="center" item xs={3}
    >
        <Box>
        {img(src)}
      

        
            <Typography variant='caption' marginLeft={.5}>  <img
                width={14}
                height={14}
                src = {getSrc(title)}
                alt=""
            /> {description}</Typography>
       
       
        </Box>
    </Grid>
}

const GamingRule : FC = () => {

    const excellent = "https://images.rentbabe.com/IMAGES/RULES/GAMING/game1.png"
    const moderate = "https://images.rentbabe.com/IMAGES/RULES/GAMING/game2.png"
    const good = "https://images.rentbabe.com/IMAGES/RULES/GAMING/game3.png"
    const poor = "https://images.rentbabe.com/IMAGES/RULES/GAMING/game4.png"



    const onBackClick = () => {
        history.goBack()
    }


    return <Box>

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
                Images and Video Guidelines
            </Typography>

          </Toolbar>
        </AppBar>

         <DialogContent>
            
            <DialogContentText>
            RentBabe is dedicated to creating a platform for users to rent a date, rent a friend purely for social purposes only. 
            To reach this goal, please observe our <a href="/AttirePolicy">Multimedia Policy</a> when uploading images to your game application. 
            These policies apply to all genders.
            </DialogContentText> 

            <br/>

            <DialogContentText>
                <b>Game screenshots and Videos:</b>
            </DialogContentText>
            <br/>
            <DialogContentText>
            1. Screenshots must display information of an account of which you are the sole owner
            <br/>
            <br/>
            2. You must display some form of game-skill. Level, Rank, Match History, an In game Scoreboard, Battle Pass level, etc. If you have a rank listed, your screenshot must display your rank.
            <br/>
            <br/>
            3. Images/videos and all texts must comply with the RentBabe guidelines and policies. They must also be relevant to RentBabe, ads on RentBabe, or game-related user contributions.
            <br/>
            <br/>
            4. If ranking, leaderboards are irrelevant for this game, you could also showcase your skills by uploading your epic gaming moments.


            </DialogContentText>

            <br/>
            <br/>

            <Grid 
                direction="row" 
                container
                spacing={{ xs: 2, md: 3 }} 
                columns={{ xs: 6, sm: 12 }}
            >

                <ItemGrid title="excellent" description="A screenshot that clearly shows your game skills" src={excellent}/>
                <ItemGrid title="poor" description="No skill display - i.e. no level, rank, etc." src={good}/>
                <ItemGrid title="poor" description="Non-game related image" src={moderate}/>
                <ItemGrid title="poor" description="NSFW text" src={poor}/>

            </Grid>

            <br/>
            <br/>

        </DialogContent>
    </Box>
}

export default GamingRule