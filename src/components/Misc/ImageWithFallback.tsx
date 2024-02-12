import { ImgHTMLAttributes, useRef } from 'react'


interface Props extends ImgHTMLAttributes<any> {

  fallback: string[]
}

export default function ImageWithFallback({ fallback, src, ...props }: Props) {


  const counter = useRef<number>(0)

  // eslint-disable-next-line 
  return <img 
        //src={src}

        draggable={false} 
        onLoad={() => {
          counter.current = 0
        }}
        onError={(event) => {       
          const fallbackArray = fallback.filter (n => n !== "")
          if(fallbackArray.length === 0){
            return
          }

          if(counter.current >= fallbackArray.length){
            counter.current = 0
            //event.currentTarget.onerror = null
            return
          }

          const fallbackValue = fallbackArray[counter.current]

          if(fallbackValue) {
            event.currentTarget.srcset  = fallbackValue
          }

          counter.current += 1
        }} 
        {...props}
    />  

  
}
