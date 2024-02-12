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
            <Box display="flex" alignItems="center">
            <img
                width={16}
                height={16}
                src = {getSrc(title)}
                alt=""
            />
        
                <Typography marginLeft={.5}>{title}</Typography>
            </Box>
            <Typography variant='caption'>{description}</Typography>
        </Box>
    </Grid>
}

const AttireRule : FC = () => {

    const good = "https://images.rentbabe.com/IMAGES/good.jpeg"
    const poor = "https://images.rentbabe.com/IMAGES/poor.jpg"
    const excellent = "https://images.rentbabe.com/IMAGES/excellent.jpeg"
    const moderate = "https://images.rentbabe.com/IMAGES/moderate.jpg"

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
                Rules for images and content
            </Typography>

          </Toolbar>
        </AppBar>

         <DialogContent>
            
            <DialogContentText>
            RentBabe is dedicated to creating a platform for users to rent a date, rent a friend purely for social purposes only. 
            To reach this goal, please observe our <a href="/AttirePolicy">Multimedia Policy</a> when uploading images to your profile. 
            You can read the full policy here RentBabe Attire Policy. These policies apply to all genders.
            </DialogContentText> 

            <br/>

            <DialogContentText>
                <b>Image criterias:</b>
            </DialogContentText>
            <br/>
            <DialogContentText>
            1. The general quality of the image, and its resolution
            <br/>
            <br/>
            2. What is in the background, messy or clean
            <br/>
            <br/>
            3. The lighting of the image
            <br/>
            <br/>
            4. whether if all facial features are clearly defined
            <br/>
            <br/>
            5. At least one full body photo of you to show your body type, if you are tall, slim, short.

            </DialogContentText>

            <br/>
            <br/>

            <Grid 
                direction="row" 
                container
                spacing={{ xs: 2, md: 3 }} 
                columns={{ xs: 6, sm: 12 }}
            >

                <ItemGrid title="Excellent" description="Clean background, well-defined facial feature and show body type. This is a great portrait." src={excellent}/>
                <ItemGrid title="Good" description="Feels natural, but facial features are partially obstructed, and the background is a little messy." src={good}/>
                <ItemGrid title="Moderate" description="Too much filter and obstruction on the face. Horrible filter and blurry effects." src={moderate}/>
                <ItemGrid title="Poor" description="Does not contain real person, look like a shady profile and does not proof your identity." src={poor}/>

            </Grid>

            <br/>
            <br/>

            <Typography fontWeight="bolder">Stay true and authentic! Dont worry, looks are perspective. Coming out with these guidelines show that we are transparent with our services.</Typography>


        </DialogContent>
    </Box>
}

export default AttireRule