import { Button, Typography, Badge, Avatar, TypographyProps } from '@mui/material';
import { FC, useEffect, useState } from 'react';
import FlexBox from '../../Box/FlexBox';
import FlexGap from '../../Box/FlexGap';
import MobileTooltip from '../../Tooltip/MobileTooltip';
import { useTranslation } from 'react-i18next';

interface props {
    index: string
    selected: boolean
    gameImage: string | undefined
    file: File | undefined
    fileUploaded: (file: File | undefined) => void
}

export const UploadGamingProfileGuideLineText : FC<TypographyProps> = ({...props}) => {

    const [ t ] = useTranslation()


    const linkClicked = () => {
        //history.push("/gamingrule")
        window.open("/gamingrule", "_blank")
    }
    return <Typography 
        {...props} 
        variant='caption' 
        fontWeight="bold" 
        color="error"
        sx={{textDecoration: 'underline', cursor: "pointer"}}  
        onClick={linkClicked}>
        {t("gaming.guidelines")}
    </Typography>
}   

const UploadGamingPhotoInput : FC<props> = ({index, selected, gameImage, file, fileUploaded}) => {

    //const [file, setFile] = useState<File>()
    const [preview, setPreview] = useState<string>()

    useEffect(() => {
        if(!preview && !gameImage){
            if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreview(reader.result as string);
                };
                reader.readAsDataURL(file);
              }
        }
        // eslint-disable-next-line
    }, [preview, gameImage])
    
    const onChangeHandle = (e:React.ChangeEvent<HTMLInputElement>) => {

        const element = e?.target as HTMLInputElement
        let files = (element).files
        const fileReader = new FileReader()
        if (files !== null && files.length !== 0){

            
            for (let i = 0; i < files.length; i++) {

                const file = files[i]
                if (files && files.length) {
                   
                    //setFile(file)
  
                    fileReader.onload = function() {
                        let src = fileReader.result as string
                      
                        setPreview(src)     
                    }
                
                    fileReader.readAsDataURL(file)
                    fileUploaded(file)
                }
            }
        }else{
            console.log("no files")
            //setFile(undefined)
            fileUploaded(undefined)
        }
    }

    const onRemove = () => {
        
        //setFile(undefined)
        setPreview(undefined)
        fileUploaded(undefined)
    }

    return <FlexBox alignItems="center" marginTop={2}>

        <FlexBox>

            <input
                accept="image/*"
                style={{ display: 'none' }}
                id={`${index}-"raised-button-file"`}
                type="file"
                onChange={onChangeHandle}
                onClick={(event:any)=> { 
                    event.target.value = null
               }}
            />
            <label htmlFor={`${index}-"raised-button-file"`}>
            <Badge overlap='circular' color="error" badgeContent={(!file && selected && !gameImage) ? "!": undefined}>
                <Button size="small" color="secondary" variant="contained" component="span">
                    {gameImage ? "Update" : "Upload"}
                </Button>
            </Badge>
            </label>

            <>
                <FlexGap/>
                <Button disabled={preview || file ? false : true} size="small" color="error" variant="contained" component="span" onClick={onRemove}>Remove</Button>
            </>

        </FlexBox>
               
        <FlexGap/>

        <MobileTooltip title={<Typography variant='caption'>
            Upload a screenshot of your gaming profile. <br/> <UploadGamingProfileGuideLineText/>
        </Typography>}>

        <Badge 
            overlap='circular'
            color="secondary" 
            badgeContent={(!file && selected && !gameImage ) ? "?" : undefined}>
            <Avatar
                id={`${index}-game-profile`}
                sx={{
                    width: 34,
                    height: 26
                }}
                variant='rounded'
                src={preview ?? gameImage}
            />
        </Badge>

        </MobileTooltip>

    </FlexBox>
 
}

export default UploadGamingPhotoInput