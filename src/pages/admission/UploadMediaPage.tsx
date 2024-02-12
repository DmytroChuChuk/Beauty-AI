import { Box, Card, CardHeader, Typography } from '@mui/material';
import { FC, useEffect, useRef } from 'react';
import AdminPhotos from '../../components/adminpage/components/AdminPhotos';
import VideoPanel from '../../components/adminpage/panels/VideoPanel';
import CenterFlexBox from '../../components/Box/CenterFlexBox';
import { cache_video_urls, url_height, url_width, mobileUrl as mobileUrlKey, urls as urlsKey, USERS } from '../../keys/firestorekeys';
import { url as urlKey } from '../../keys/localStorageKeys';
import { useUser } from '../../store';
import { Helper } from '../../utility/Helper';
import * as storageKeys from "../../keys/storagekeys"
import useState from 'react-usestateref'
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { db, firebaseApp, storage } from '../../store/firebase';
import history from '../../utility/history';
import Compressor from 'compressorjs'
import { doc, updateDoc } from 'firebase/firestore';
import AdmissionButton from './components/AdmissionButton';
import ApplyDescription from './components/ApplyDescription';
import { version } from '../../version/basic';
import PageFooterContainer from './components/PageFooterContainer';
import { useTranslation } from 'react-i18next';

interface props {
    data: any
}

const UploadMediaPage : FC<props> = ({data}) => {


    const [ t ] = useTranslation()

    const [isAdmin, uid] = useUser((state) => [
        state?.currentUser?.isAdmin, 
        state?.currentUser?.uid
    ])

    const setUser = useUser((state) => state.setCurrentUser);

    const helper = new Helper()
    const uploadingFiles = useRef<Map<string,File>>(new Map())
    const readerMap = useRef<Map<string,FileReader>>(new Map())
    const uploadingVideos = useRef<Map<string,File>>(new Map())

    const width_height_array =  useRef<{[key : number] : string }>({})
    const video_width_height_array =  useRef<{[key : number] : string }>({})
    
    const [urls, setUrls] = useState< string[] >(helper.configureURL(data, true, isAdmin))
    
    // eslint-disable-next-line
    const [mobileUrlState, setMobileUrlState, mobileUrl] = useState<string | undefined>( data?.get(mobileUrlKey) as string )
    const [videos, setVideos, videoRef] = useState<string[]>( data?.get(cache_video_urls) as string[] ??  ["", ""] )


    const [errorMessage, setErrorMessage] = useState<string>("")
    const [isLoading, setLoading] = useState<boolean>(false)


    useEffect(() => {
        if(isAdmin){
            window.location.href = `/page/Admin?uid${uid}`
        }
        // eslint-disable-next-line
    }, [isAdmin])
    

    const fileUploaded = (e:React.ChangeEvent<HTMLInputElement>) => {
        const element = e?.target as HTMLInputElement
        let files = (element).files

        if (files !== null && files.length !== 0){

            const selectedIndex = (element).id
            const intIndex = parseInt(selectedIndex) 

            const maxNumOfPhoto = 6
            const totalPhotos = intIndex + files.length
            const diff = totalPhotos - maxNumOfPhoto
            
            for (let i = 0; i < files.length; i++) {

                //const selectedIndex = (e?.target as HTMLInputElement).id
                if(i >= (files.length - diff)){continue}
                
                const index = files.length > 1 ? (i + intIndex).toString() : selectedIndex
                const file = files[i]
                
                if (FileReader && files && files.length) {
                   
                    readerMap.current.set(index, new FileReader())

                    readerMap.current.get(index)!.onload = function() {

                        const imgtag = (document.getElementById("img-" + index.toString()) as HTMLImageElement);
                    
                        let src = readerMap.current.get(index)!.result as string      

                        imgtag.onload = () => {

                            const width = imgtag.naturalWidth;
                            const height = imgtag.naturalHeight;
                            
                            width_height_array.current[parseInt(index)] =  `${url_width}=${width}&${url_height}=${height}` 

                            readerMap.current.delete(index)
                        
                        };
    
                        imgtag.src = src
                        
                    };
    
                    uploadingFiles.current.set(index,file)
                    //setUploadingFiles(uploadingFiles)
    
                    readerMap.current.get(index)!.readAsDataURL(file);
    
                }
            }
        }
    }

    const videoUploaded = (e:React.ChangeEvent<HTMLInputElement>) => {

        let index = (e?.target as HTMLInputElement).id
        let files = (e?.target as HTMLInputElement).files


        if (files !== null && files.length !== 0){

            let file = files[0]

            if (file.size > 2097152) // 2 MiB for bytes.
            {   
                // openAlert(dialogIndexEnum.warning, "File size too big" , "File size must under 2MB")
                setErrorMessage("File size must be less than 2MB")
                return;
            }

            if (FileReader && files && files.length) {

                var vidTag = document.getElementById(`vid-${index}`) as HTMLVideoElement;
      
                const URL = window.URL || window.webkitURL
                const src = URL.createObjectURL(file) 
                vidTag.src = src

                vidTag.onload = function() {
                    URL.revokeObjectURL(src);
                }
                          
                vidTag.ondurationchange = function (evt) {
                    //window.URL.revokeObjectURL(vidTag.src);

                    let duration  = (evt.currentTarget as HTMLMediaElement).duration;
                    const max = 10.0 // CAREFUL IF YOU CHANGE THIS VIDEO, you must compare with previous uploaded video
                    const min = 1.0

                    if ( duration > max  ||  duration < min) {


                        const title = (duration > max) ? "Too long" : "Too short"
                        const description = (duration > max) ? "Must be less than 5 seconds" : "Must be more than 1 second"
                        
                        // openAlert(dialogIndexEnum.warning.valueOf() , title, description)

                        setErrorMessage(`${title} ${description}`)
                  
                        const url = videoRef.current[parseInt(index)]
                  
                        vidTag.src =  !url ? "https://images.rentbabe.com/assets/gif/selfie.mp4" : url.toCloudFlareURL()
                     
                    }else{

                        const width = vidTag.videoWidth
                        const height = vidTag.videoHeight
    
                        const meta = `&${url_width}=${width}&${url_height}=${height}`
                        video_width_height_array.current[parseInt(index)] = meta
                    
                        uploadingVideos.current.set(index,file)

                    }
                }
            }
        }
    }

    function validatePhotos () : string | null {
        if(validateNumberOfPhotos(urls)) return "Fill up all 6 photos"
        return null
    }

    function validateNumberOfPhotos (urls : string[]) : boolean{
        var countPhoto = 0

        for (let index = 0; index < urls.length; index++) {
            const url = urls[index];
            if(url !== ""){
                countPhoto += 1
            }
        }

        countPhoto += uploadingFiles.current.size
        
        return (countPhoto < urls.length)
    }

    async function uploadImage(uploadImageRef: any, result: Blob, key : number , folder:string) : Promise<void>{
        
        return uploadBytes(uploadImageRef, result).then(async (uploadTask) => {
            
            var url = await getDownloadURL(uploadTask.ref) as string

            const d = width_height_array.current[key]

            
            if (url) {
                const now = new Date()
                const imageURL = `${url}?${d}&t=${now.getTime()}`.toCloudFlareURL()

                if(folder === storageKeys.MOBILE)
                {   
                    setMobileUrlState(imageURL)
                
                }else{
                    setUrls((prev) =>  {
                        let array = prev
                        array[key] = imageURL

                        return array
                    })
                   
                }
            }
        }).catch((error) => {
            console.log(error)
        })
        
    }

    function uploadPhoto(folder: string, file: File, key:number): Promise<void>{
        return new Promise((resolve, reject) => {
            let ext = file.name.slice((file.name.lastIndexOf(".") - 1 >>> 0) + 2)
            // const _storage = storageKeys.MOBILE ? getStorage(firebaseApp, "gs://rentb-sg-small-images") : storage
            const uploadImageRef = ref(storage, (`${folder}/${uid}/${key}.${ext}`))
    
            const _maxHeight = folder ===  storageKeys.MOBILE ? Infinity : 1200
            const _maxWidth = folder === storageKeys.MOBILE ? 500 : 1000
    
            new Compressor(file, {
                maxHeight: _maxHeight,
                maxWidth: _maxWidth,
                quality: 0.85,
                async success(result){
                    await uploadImage(uploadImageRef, result, key, folder)
                    resolve()
                },
                async error(){
                    uploadImage(uploadImageRef, file, key, folder)
                    reject("error")
                }
            })

        })
    }
    

    const onClickNext = async () => {

        if(isLoading){
            return
        }
        
        setErrorMessage("")
        
        if(!uid){
            window.location.href = "/Login"
            return
        }

        const _validatePhotos = validatePhotos()

        if(_validatePhotos){
            setErrorMessage(_validatePhotos)
            return
        }

        let promises = []
        if(uploadingFiles.current.has("0")){
      
            let key:number = 0
            let file:File = uploadingFiles.current.get("0")!

            const uploadSmallPhoto =  uploadPhoto(storageKeys.MOBILE,file, key)
            promises.push(uploadSmallPhoto)

        }

        let map = uploadingFiles.current
        for (let entry of Array.from(map.entries())) {
            let key = parseInt(entry[0])
            let file:File  = entry[1]

            const uploadOriginalPhoto = uploadPhoto(storageKeys.TOD_PROFILES_IMAGES , file, key)
            promises.push(uploadOriginalPhoto)
        }


        let videoMap = uploadingVideos.current
        for (let entry of Array.from(videoMap.entries())) {

            let key:number = parseInt(entry[0])
            let file:File = entry[1];

            let ext = file.name.slice((file.name.lastIndexOf(".") - 1 >>> 0) + 2);


            const storage = getStorage(firebaseApp, "gs://rentb-sg-videos");

            const now = (new Date()).getTime()
            const uploadVideoRef = ref(storage, `video/${uid}/${key}.${ext}`);

            const uploadVideos = uploadBytes(uploadVideoRef, file).then(async (uploadTask) => {
                
                let url = await getDownloadURL(uploadTask.ref) as string

                const d = video_width_height_array.current[key]


                if (url) {

                    const videoURL = `${url}?${d}&t=${now}`

                    setVideos((prev) => {
                        const array = prev
                        array[key] = videoURL
                        return array
                    })

                }
     
            })

            promises.push(uploadVideos)
        }
        setLoading(true)
        try {
            await Promise.all(promises) 
            let finalMap : { [id:string] : any } = 
            {
                [urlsKey]: urls, 
                [cache_video_urls]: videoRef.current,
            }
            

            if(mobileUrl.current){
                finalMap[mobileUrlKey]  = mobileUrl.current
                localStorage.setItem(urlKey, mobileUrl.current)
                setUser({ profileImage: mobileUrl.current})
            }
    
            await updateDoc(doc(db, USERS, uid) , finalMap) 

            setLoading(false)

            history.push(`/page/uploadvoice?v=${version}`)
            
        }catch(error){
            setErrorMessage(`${error}`)
            setLoading(false)
        }
    }


    return <CenterFlexBox height="100%" bgcolor="#efeff3" paddingTop={4}>

        <Box>
            <Card style={{maxWidth: 500, minWidth: 330, minHeight: 500, position: "relative"}}>

                <CardHeader
                    title={(t("upload.media"))}
                    subheader={
                        <Typography 
                            onClick={() => history.push("/attirerule")} 
                            sx={{textDecoration: 'underline', cursor: "pointer"}}
                            color="secondary">
                            {t('attire.rules')}
                        </Typography>
                    }
                />

                <Box padding={2}>
                    <AdminPhotos 
                        urls = {urls}
                        onChange = {fileUploaded}
                    />

                    <br/>

                    <VideoPanel 
                        expanded = {true} 
                        videos = {videos}
                        upload = {videoUploaded}
                    />  

                </Box>

            </Card>

            <br/>
            <br/>
            <br/>
            <br/>
            <br/>
            <br/>
            <br/>

        </Box>


        <PageFooterContainer>
       
            {errorMessage && <Typography color="error" variant="caption">{errorMessage}</Typography>}

            <AdmissionButton 
                index={3} 
                isLoading={isLoading} 
                onClickNext={onClickNext}                
            />

            <ApplyDescription/>
  
        </PageFooterContainer>

    </CenterFlexBox>
 
}

export default UploadMediaPage