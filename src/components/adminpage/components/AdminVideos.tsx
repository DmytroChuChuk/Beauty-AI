import { Box, Button, Grid } from '@mui/material';
import { FC } from 'react';
import { chatGray } from '../../../keys/color';
import './scss/AdminVideos.scss'


interface props {
    videos: string[]
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    removeVideo?:(index: number) => void
}


const AdminVideos : FC <props> = ({videos, onChange, removeVideo}) => {

    const onClick = (index: number) => () => {
        removeVideo?.(index)
    }

    // WARNING: <video tag src cannot use CDN, it will cache previous video
    return <Grid container direction="row" columnSpacing={1}>
        {
            videos.map((cacheUrl, index) => {

                return <Grid height={150} xs={6} key={index} item>
                     <Box position="relative" borderRadius="8px" bgcolor={chatGray} height={150}>
                        <video autoPlay loop playsInline muted 
                            id = { "vid-" + index.toString()} 
                            className="profile-vid" 
                            src={!cacheUrl ? "https://images.rentbabe.com/assets/gif/selfie.mp4" : cacheUrl} 
                        />
                        
                        <input accept="video/mp4,video/x-m4v,video/*" id ={index.toString()} type="file" className="update-btn" 
                        onChange={(e) => {
                            onChange(e)
                        }}/>

                        {cacheUrl && <Button
                        size='small'
                        sx={{position: "absolute", right: 8, top: 4}} 
                        onClick={onClick(index)}
                        variant='contained' color = "error">
                            Remove
                        </Button>
                        
                        }

                    </Box>
                    </Grid>
            })
        }

    </Grid>

    
    // return <div>
    
    //     <div className="rowx-vid">
    //         {videos.map((url,index) => {


    //             return <div key = {index}>
    //                 <video autoPlay loop playsInline muted className="profile-vid" id = { "vid-" + index.toString()}  src={ !url ? "https://images.rentbabe.com/assets/gif/selfie.mp4" : url } ></video>
    //                 <input accept="video/mp4,video/x-m4v,video/*" id ={index.toString()} type="file" className="update-btn" onChange={(e) => {onChange(e)}}/>
    //             </div>
    //         })}
    //     </div>  
    // </div>

}

export default AdminVideos