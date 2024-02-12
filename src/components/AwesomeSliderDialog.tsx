import { FC} from 'react'
import { Dialog } from '@mui/material'

import AwesomeSlider from './react-awesome-slider/core'

import './AwesomeSliderDialog.scss'
import CenterFlexBox from './Box/CenterFlexBox'

interface props {
  isOpen: boolean
  isgUrls: string []
  isgDays: number | undefined
  indexISG: number
  onClose : () => void
  nextOne: (index: number) => void
}

const AwesomeSliderDialog : FC<props> = ({isOpen, isgUrls, isgDays, indexISG, onClose, nextOne}) => {

    return  <Dialog open={isOpen} onClose={onClose} fullWidth>
    
    <div className="image-slides-overlay"  >
        <div className = "background-detector" onClick={onClose}/>
        <AwesomeSlider 
            organicArrows
            mobileTouch
            className='awesome-slider'
            onTransitionStart = {(e: any) => {
              const index = (e.currentIndex)
              nextOne(index)
            }}
            selected= {indexISG - 1}>
            {isgUrls?.map((url, index) => {
              // const isImage = url?.charAt(8) === 's' 
              const isVideo = url?.isURLVideo()

              if(!isVideo) return (<div key={index} className="profile-main">
                    <img loading= "lazy" src={url} alt=""/>
                </div>)
              else return (<div key={index} className="profile-main">
                <video 
                  src={url}
                  autoPlay
                  playsInline
                  muted
                  loop
                />
             </div>)
            })}
        </AwesomeSlider>
        <div className = "overlay">
          <div className = "close-button">
            <button onClick={onClose}>
              <img 
                width={21}
                height={21}
                src = "https://images.rentbabe.com/assets/close.svg" 
                alt = ""
              />
            </button>
            <p>{isgDays} day{isgDays === 1 ? "" : "s"} ago</p>
          </div>
        </div>

        <CenterFlexBox className='arrow-box' padding="0 16px">
          <img 
            src = "https://images.rentbabe.com/assets/mui/arrow_back_ios.svg" 
            className="ios-right-btn" alt = ""/>
          <img 
            src = "https://images.rentbabe.com/assets/mui/arrow_forward_ios.svg" 
            className="ios-left-btn" alt = ""/>
        </CenterFlexBox>

       
      </div>
      </Dialog>
}

  export default AwesomeSliderDialog;