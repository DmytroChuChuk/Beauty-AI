import React, { useEffect } from "react";
import useState from 'react-usestateref'
import { PlayIcon, StopIcon, CloseIcon } from "../../icons";
import wave from "../../icons/wave.json";
import "./index.scss"
import { Typography } from "@mui/material";
// import Lottie from "react-lottie";
import Lottie from "lottie-react";
import { useCenterSnackBar } from "../../../../../store";
import shallow from "zustand/shallow";

function isChrome(){
  // please note, 
  // that IE11 now returns undefined again for window.chrome
  // and new Opera 30 outputs true for window.chrome
  // but needs to check if window.opr is not undefined
  // and new IE Edge outputs to true now for window.chrome
  // and if not iOS Chrome check
  // so use the below updated condition
  var isChromium = (window as any).chrome;
  var winNav = window.navigator;
  var vendorName = winNav.vendor;
  var isOpera = typeof (window as any).opr !== "undefined";
  var isIEedge = winNav.userAgent.indexOf("Edge") > -1;
  var isIOSChrome = winNav.userAgent.match("CriOS");

  if (isIOSChrome) {
    // is Google Chrome on IOS
  } else if(
    isChromium !== null &&
    typeof isChromium !== "undefined" &&
    vendorName === "Google Inc." &&
    isOpera === false &&
    isIEedge === false
  ) {
    // is Google Chrome
    return true
  } else { 
    // not Google Chrome 
    return false
  }
}

export interface RecorderProps {
  blob: Blob
  duration: number
  fileType: string
}

interface props {
  voiceUrl: string | undefined
  onRecordReset: () => void
  onRecordStopHandle: (data: RecorderProps) => void
}

export const MyRecorder: React.FC<props> = ({voiceUrl, onRecordReset, onRecordStopHandle}) => {
  // const defaultOptions = {
  //   loop: true,
  //   autoplay: true,
  //   animationData: wave,
  //   rendererSettings: {
  //     preserveAspectRatio: "xMidYMid slice",
  //   },
  // };

  const seconds = parseInt(voiceUrl?.getQueryStringValue("duration") ?? "")

  const [setCurrentSnackbar] = useCenterSnackBar((state) => [state.setCurrentSnackbar],shallow)
  const [totalSeconds, setTotalSeconds, totalSecondsRef] = useState<number>(0);
  const [width, setWidth] = useState(0);
  const [showPlaceHolder, setShowPlaceHolder] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | undefined>(voiceUrl);

  const [finalDuration, setFinalDuration] = useState<number | null>(null);
  const [showCloseButton, setShowCloseButton] = useState(false);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);

  const timerRef = React.useRef<number | null>(null);
  const playbackRef = React.useRef<number | null>(null);

  const chunksRef = React.useRef<Blob[]>([]);
  // const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const minDuration = 5;
  const maxDuration = 15;

  useEffect(() => {
    if(voiceUrl && seconds && seconds >= minDuration){
      setTotalSeconds(seconds)
      updateWidth(seconds)
      setAudioURL(voiceUrl)
      setIsRecording(false)
      setShowCloseButton(true)
    }
    // eslint-disable-next-line
  }, [voiceUrl])

  useEffect(() => {
    if (totalSeconds >= maxDuration) {
      handleStopRecording();
    }
    // eslint-disable-next-line
  }, [totalSeconds]);

  useEffect(() => {

    return () => {

      document.documentElement.style.removeProperty(
        "--animation-duration"
      )
      document.documentElement.classList.remove("start-animation")
      stopPlayback()
      stopTimer()
    }
  }, [])

  function stopPlayback(){
    if(playbackRef.current){
      clearInterval(playbackRef.current);
      playbackRef.current = null;
    } 
  }

  function stopTimer(){
    if(timerRef.current){
      clearInterval(timerRef.current);
      timerRef.current = null;
    } 
  }

  const handleStartRecording = async () => {
    setShowPlaceHolder(false)



    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {

        const blob = new Blob(chunksRef.current, { type: "audio/wav"});


        let meme = ""
        if(chunksRef.current.length !== 0){
          meme = (chunksRef.current[0].type)
        } 

        if (totalSecondsRef.current >= minDuration) {
          onRecordStopHandle({
            blob: blob,
            duration: totalSecondsRef.current,
            fileType: meme
          })

          var vendorURL = window.URL || window.webkitURL;
          setAudioURL(vendorURL.createObjectURL(blob));
          setIsRecording(false);
          setFinalDuration(
            Math.min(
              Math.floor(
                chunksRef.current.length /
                  (stream.getAudioTracks()[0]?.getSettings()?.sampleRate || 1)
              ),
              maxDuration
            )
          );

          setShowCloseButton(true);
        }
      };

      mediaRecorder.start(10);
      setIsRecording(true);

      // Start timer
      let seconds = 0;
      timerRef.current = window.setInterval(() => {
        seconds++;
        setTotalSeconds(seconds);
        updateWidth(seconds);
      }, 1000);

      document.documentElement.style.setProperty(
        "--animation-duration",
        `${maxDuration}s`
      );
      document.documentElement.classList.add("start-animation");
      setWidth(0);

      setTimeout(() => {
        setWidth(100);
      }, 100); // Wait for a small delay before setting the width to 100 (to allow the animation to start)

    } catch (error) {
      console.error("Error accessing microphone:", error);
      setCurrentSnackbar({
        open: true,
        message: "Unable to access to microphone"
      })
    }
  };

  const handleStopRecording = () => {

    // if (timerRef.current) {
    //   clearInterval(timerRef.current);
    //   timerRef.current = null;
    // }

    stopTimer();

    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      // Check if recording duration is less than the minimum duration
      if (totalSecondsRef.current < minDuration) {
        setShowPlaceHolder(true);
        handleReset()
      }
    }
  };

  const [currentAudioValue, setCurrentAudioValue] = useState<number>(0);

  const handlePlay = () => {

    const audio = document.getElementById("recorder-audio") as HTMLAudioElement

    if (audioURL && audio) {

      if(audio.src !== audioURL){
        // this supports mobile version of safari
        if(isChrome()){
          audio.src = audioURL
        }else{
          audio.removeAttribute("src")
        }

        // audio.src = audioURL

        const children = audio.children
        for (let index = 0; index < children.length; index++) {
          const child = children.item(index) as HTMLSourceElement
          if(child && child.src !== audioURL){
            child.src = audioURL
          } 
        }
      }

      if (!isPlaying) {
        
      
        audio.play();
        setIsPlaying(true);

        // if(!currentAudioValue && totalSecondsRef.current){
        //   console.log(totalSecondsRef.current)
        //   setCurrentAudioValue(totalSecondsRef.current)
        // }
        
        //setCurrentAudioValue(finalDuration || 0);

        playbackRef.current = window.setInterval(() => {
          setCurrentAudioValue((prevValue) => {
            return prevValue - 1
          });
        }, 1000);

        audio.onerror = (err) => {
    
          handleReset()
          setCurrentSnackbar({
            open: true,
            message: "Unable to playing audio"
          })
        };

        audio.onended = () => {
    
          stopPlayback()
          setIsPlaying(false);
          setCurrentAudioValue(0);
        };

      } else {
        audio.pause()
        setIsPlaying(false)
        stopPlayback()
        //audio.currentTime = 0;
        //setCurrentAudioValue(finalDuration || 0);
      }
    }
  };

  // const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (file) {
  //     setAudioFile(file);
  //   }
  // };

  const handleReset = () => {

    onRecordReset()

    const audio = document.getElementById("recorder-audio") as HTMLAudioElement
    if(audio){
      audio.pause();
      audio.currentTime = 0;
      audio.removeAttribute("src")
    }

    setIsRecording(false);
    setAudioURL(undefined);
    setTotalSeconds(0);
    setFinalDuration(null);
    setShowCloseButton(false);
    setCurrentAudioValue(0);
    setIsPlaying(false);

    stopTimer()
    stopPlayback()

    chunksRef.current = [];
  };
  const updateWidth = (seconds: number) => {
    // const newWidth = (totalSeconds / maxDuration) * 100;
    // const newWidth2 = (totalSeconds / maxDuration) * 100;
    const newWidth = Math.ceil(((seconds) / maxDuration) * 100);
    document.documentElement.style.setProperty("--progress-width", `${newWidth}` );
    setWidth(newWidth);
    setCurrentAudioValue(finalDuration ? finalDuration - totalSeconds : 0);
  };

  useEffect(() => {
    // updateWidth();
    if (totalSecondsRef.current < minDuration) {
      setIsRecording(false);
      setAudioURL(undefined);
      setTotalSeconds(0);
      setFinalDuration(null);
      setShowCloseButton(false);
      chunksRef.current = [];
    }
    // eslint-disable-next-line
  }, [audioURL]);


  return (
    <div className="audio-recorder">
      {/* <audio
          id = "recorder-audio"
          autoPlay
          loop={false}
      /> */}

      {/* <audio id = "recorder-audio" preload="auto"  src={isChrome() ? audioURL : undefined}>
        <source  src={audioURL} type="audio/ogg" />
        <source  src={audioURL} type="audio/mpeg" />  
      </audio> */}

      <audio id = "recorder-audio" preload="auto" >
        <source type="audio/ogg" />
        <source type="audio/mpeg" /> 
        <source type="audio/webm" /> 
        <source type="audio/wav" /> 
      </audio>

      <div className="actions">
        {!isRecording && !audioURL ? (
          <>
            <button className="btn" onClick={handleStartRecording}>
              Record
            </button>

            {/* <br/>
            <br/>
            <br/>

            <div className="uploading-file-side">
              <input
                type="file"
                id="upload_file"
                accept="audio/*"
                onChange={handleFileChange}
                className="select-file"
              />

              <button
                className="btn"
                onClick={() => {
                  const element = document.getElementById("upload_file");
                  if (element) {
                    element.click();
                  }
                }}
              >
                Upload
              </button>
            </div> */}
          </>
        ) : (
          <div className="player-section">
            <div className="btn-play">
              <button
                className={`audio-timer ${
                  isRecording ? "start-animation" : ""
                }`}
                style={{
                  maxWidth: `${!isRecording ? width : 100}%`,
                  width: `${width}%`,
                  cursor: isRecording ? "default" : "pointer"
                }}
                onClick={handlePlay}
              >
                <div className="play-icon">
                  {!showCloseButton ? (
                    <Lottie 
                      style={{marginLeft: 8}} 
                      animationData={wave} 
                      loop 
                    />
                  ) : (
                    <>
                      {isPlaying ? (
                        <Lottie
                          style={{marginLeft: 8}}
                          animationData={wave}
                          loop
                        />
                      ) : (
                        <PlayIcon />
                      )}
                    </>
                  )}
                </div>

                {showCloseButton && (
                  <div className="voice-numb1">
                    {totalSeconds && (totalSeconds + currentAudioValue) > 0 ? totalSeconds + currentAudioValue : "0"}"
                  </div>
                )}
              </button>
              {!showCloseButton && (
                <div className="voice-numb">
                  {totalSeconds ? totalSeconds : "0"}"
                </div>
              )}
            </div>
            <>
              {(isRecording || audioURL) && !showCloseButton ? (
                <button className="btn-stop" onClick={handleStopRecording}>
                  <StopIcon />
                </button>
              ) : (
                <button className="btn-close" onClick={handleReset}>
                  <CloseIcon />
                </button>
              )}
            </>
          </div>
        )}
      </div>

      <Typography variant="caption" color="error" className="place-holder">
        {showPlaceHolder
          ? `Voice introduction should be ${minDuration} to ${maxDuration} seconds long`
          : ""}
      </Typography>
    </div>
  );
};

export default MyRecorder;
