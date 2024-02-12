import { Box, Grid } from '@mui/material';
import {FC} from 'react';
import { chatGray } from '../../../keys/color';
import { defaultProfileImages } from '../../../utility/ProfileHelper';
import '../scss/AdminPhotos.scss'

interface props {
    urls: string[]
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const AdminPhotos : FC <props> = ({  urls, onChange}) => {
   
    const defaultUrl = urls.length === 1 ? "https://images.rentbabe.com/assets/account_circle.svg" : "https://images.rentbabe.com/assets/girl.svg"

    return <Grid 
        direction={urls.length > 1 ? "row" : "column" } 
        container 
        rowSpacing={urls.length > 1 ? 4 : 0} 
        columnSpacing={urls.length > 1 ? 1 : 0}>

        {
            urls?.map((url, index) => {

                const _url = index !== 0 ? url : urls.length > 1 ? (defaultProfileImages.includes(url) ?  "" : url) : url
                

                return <Grid  height={168} key={index} item xs={urls.length > 1 ? 4 : 6}>
                    <Box position="relative" borderRadius="10px" bgcolor={chatGray} height={140}>

                        <img 
                            id = { "img-" + index.toString()}  
                            style={{borderRadius: "10px", objectFit: "scale-down", objectPosition: "center"}}
                            height="100%"
                            width="100%"
                            src={_url ? _url.toCloudFlareURL() : defaultUrl }
                            alt="" 
                        />

                        <input id ={index.toString()} multiple={urls.length > 1} accept="image/jpg,image/jpeg,.jpg,.jpeg" type="file" 
                        className={`update-btn ${urls.length > 1 ? "" : ""}`} onChange={(e) => { onChange(e) }} />

                        {urls.length !== 1 && <div className="circle-div">
                            {index + 1} 
                    </div> }

                    </Box>
 
                    </Grid>
            })

        }

    

    </Grid>

    // return  <div className={`${urls.length < 6 ? 'premium' : 'admin'}-photos-container`} >
    //         <br/>
    //         <div className = {`row-${urls.length < 6 ? 'one' : 'three'}`}>

    //             {urls?.map((url, index) => {
    //                 return <div className = "profile-div" key={index}>
    //                     <img className="profile-img" 
    //                     id = { "img-" + index.toString()}  
    //                     src={url === "" ? defaultUrl : url.toCloudFlareURL()} 
    //                     loading = "lazy"
    //                     alt= ""
    //                     onError={(e) => {
    //                         e.currentTarget.src = defaultUrl
    //                     }}></img>
                                    
    //                     <input multiple={urls.length > 1} accept="image/jpg,image/jpeg,.jpg,.jpeg" id ={index.toString()} type="file" 
    //                     className="update-btn"  onChange={(e) => { onChange(e) }} />

    //                     {urls.length !== 1 && <div className="circle-div">
    //                         {index + 1} 
    //                     </div> }
    //                 </div>
    //             })}

    //         </div>
    //     </div>
}

export default AdminPhotos