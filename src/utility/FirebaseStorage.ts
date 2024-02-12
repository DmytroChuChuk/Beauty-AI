import { getDownloadURL, ref, uploadBytes } from "firebase/storage"
import { uid } from "../keys/localStorageKeys"
import { UploadImageServiceProps } from "../keys/props/services"
import { storage } from "../store/firebase"
import Compressor from 'compressorjs'

export function uploadPhoto(
    folder: string, 
    file: File, 
    key:number | string, 
    data?: {[key: string]: any}) : Promise< UploadImageServiceProps | {[key: string]: any} | undefined> {
    return new Promise((resolve, reject) => {
        let ext = file.name.slice((file.name.lastIndexOf(".") - 1 >>> 0) + 2)
        // const _storage = storageKeys.MOBILE ? getStorage(firebaseApp, "gs://rentb-sg-small-images") : storage

        const uploadImageRef = ref(storage, (`${folder}/${uid}/${new Date().getTime()}_${key}.${ext}`))

        new Compressor(file, {
            maxHeight: 1500,
            maxWidth: 1500,
            quality: 0.85,
            async success(result){
                uploadBytes(uploadImageRef, result).then(async (uploadTask) => {
        
                    const url = await getDownloadURL(uploadTask.ref) as string | undefined
                    resolve({
                        url: url,
                        ...data
                    })
                }).catch((error) => {
                    console.log(error)
                    reject(undefined)
            
                })
            },
            async error(){
                uploadBytes(uploadImageRef, file).then(async (uploadTask) => {
        
                    const url = await getDownloadURL(uploadTask.ref) as string | undefined
                    resolve({
                        url: url,
                        ...data
                    })
                }).catch((error) => {
                    console.log(error)
                    reject(undefined)
            
                })
            }
        })
    })
}
