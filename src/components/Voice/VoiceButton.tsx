import { Avatar, Box } from "@mui/material";
import { BoxProps } from "@mui/system";
import { CSSProperties, FC, useEffect, useRef } from "react";
import "../../scss/components/Voice/VoiceButton.scss";
import { useCurrentAudio } from "../../store";
import CenterFlexBox from "../Box/CenterFlexBox";

interface props extends BoxProps {
  style?: CSSProperties | undefined;
  voiceUrl: string | undefined;
  onClick?: () => void;
  gray?: boolean;
  //orange?: boolean
}

const VoiceButton: FC<props> = ({
  style,
  voiceUrl,
  onClick,
  gray = false,
  ...props
}) => {
  const current = useCurrentAudio((state) => state.currentAudio.voiceUrl);
  const setCurrentAudio = useCurrentAudio((state) => state.setCurrentAudio);

  const imgHTML = useRef<HTMLImageElement>(null);

  const duration = voiceUrl?.getQueryStringValue("duration");
  //const seconds = duration && duration.toLowerCase() !== "nan" ? duration : "5"

  const isAudioPlaying = current === voiceUrl;

  //const [isAudioPlaying, setPlaying] = useState<boolean>(current === voiceUrl)

  useEffect(() => {
    const audio = document.getElementById("audio") as
      | HTMLAudioElement
      | undefined;

    if (audio && isPlaying(audio)) {
      if (audio.src.toCloudFlareURL() === voiceUrl) {
        const img = imgHTML.current;
        if (img)
          img.src = `https://images.rentbabe.com/assets/buttons/stop_rb.svg`;

        // "https://images.rentbabe.com/assets/gif/musicload.gif"

        audio.onended = function () {
          if (img)
            img.src = `https://images.rentbabe.com/assets/buttons/play_rb.svg`;
        };
      }
    }
    // eslint-disable-next-line
  }, []);

  function isPlaying(audelem: HTMLAudioElement | undefined) {
    return !audelem?.paused;
  }

  const voiceOnClick = (event: any) => {
    if (!voiceUrl) return;

    onClick?.();

    const img = imgHTML.current;

    // let audio = document.getElementById('audio') as HTMLAudioElement
    let audio = document.getElementById("audio") as HTMLAudioElement;

    const isSame = audio.src === voiceUrl.toCloudFlareURL();

    if (isSame && audio && isPlaying(audio)) {
      audio.pause();
      audio.currentTime = 0;
      if (img)
        img.src = `https://images.rentbabe.com/assets/buttons/play_rb.svg`;
      //setPlaying(false)
      setCurrentAudio({ voiceUrl: undefined });
      return;
    }

    audio.src = voiceUrl.toCloudFlareURL();

    if (img) img.src = `https://images.rentbabe.com/assets/buttons/stop_rb.svg`;

    audio.onerror = function () {
      if (img)
        img.src = `https://images.rentbabe.com/assets/buttons/play_rb.svg`;
      setCurrentAudio({ voiceUrl: undefined });
      //setPlaying(false)
    };

    audio.onended = function () {
      if (img)
        img.src = `https://images.rentbabe.com/assets/buttons/play_rb.svg`;
      //setPlaying(false)
      setCurrentAudio({ voiceUrl: undefined });
    };

    audio.pause();
    audio.currentTime = 0;

    audio.load(); //call this to just preload the audio without playing
    audio.play(); //call this to play the song right away

    setCurrentAudio({ voiceUrl: voiceUrl.toCloudFlareURL() });
  };

  if (!duration || duration === "0") return null;
  else
    return (
      <CenterFlexBox
        onClick={voiceOnClick}
        position="relative"
        maxWidth="90px!important"
        sx={{ cursor: "pointer" }}
        {...props}
      >
        
        <Avatar
         sx={{
          width: "40px",
          height: "40px",
          border: "2px solid #FFFFFF",
          backgroundColor: "#FFD829",
        }}
        >
           <Box
             sx={{backgroundColor: "#000000", borderRadius:"5px",height:"20px",width:"20px",
            alignItems: "center",justifyContent: "center",display: "flex",
            }}
           >

         
          {isAudioPlaying ? (
            <img
              height={15}
              width={15}
              src={`https://images.rentbabe.com/assets/gif/wave2.gif`}
              alt=""
            />
          ) : (
            <img
            height={15}
              width={15}
              src={`https://images.rentbabe.com/assets/gif/wave2.png`}
              alt=""
            />
          )}
            </Box>
        </Avatar>
      </CenterFlexBox>
    );
};

export default VoiceButton;
