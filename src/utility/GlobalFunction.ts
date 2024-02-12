import { DiscordAppLogo, FBLogo, KakaotalkAppLogo, LineAppLogo, TelegramLogo, ViberAppLogo, WechatAppLogo, WhatsAppLogo } from "../data/images";

export async function generateFirebaseDynamicLink(
    UUID:string, 
    username: string | null | undefined, 
    age: number | string | null | undefined,
    geoEncoding: string[] | null | undefined, 
    profileImage: string | null | undefined, 
    bio?: string | undefined): Promise<string>{


    const apiUrl = "https://api2.branch.io/v1/url";   
    const location = geoEncoding?.[geoEncoding.length - 1] ?? undefined;

    const title = username ? `${username}${age ? ` (${age})` : ""}${location ? ` ${location}` : ""}` : "RentBabe"
    const profileUrl = `${window.location.origin}/Profile?uid=${UUID}`
    const branchKey = process.env.REACT_APP_BRANCH_IO_KEY || '';

    const payLoad: {
        [key: string]: any
    } = {
        branch_key: branchKey,
        channel: 'profile',
        feature: 'site',
        campaign: "share_profile",
        data: {
            referringUserID: UUID,
            $og_title: title,
            $fallback_url: profileUrl,
            $desktop_url: profileUrl,
            $web_only: true
        },
    };

    if(bio){
        payLoad["data"]["$og_description"] = bio
    }

    if(profileImage){
        payLoad["data"]["$og_image_url"] = profileImage
    }

    console.log(payLoad);

    const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payLoad)
      });
    const result = await response.json();

    const url = result.url;

    return url ?? "ERROR"
}

export function playSoundEffect(src: string){
    let audio = document.getElementById('sound-effect') as HTMLAudioElement
    audio.src = src.toCloudFlareURL()

    audio.pause()
    audio.muted = false
    
    audio.volume = 0.7
    audio.currentTime = 0

    audio.load(); //call this to just preload the audio without playing
    audio.play(); //call this to play the song right away
}

export function getMessengerIcon(app: string): string{
    switch (app) {

        case "telegram":
            return TelegramLogo

        case "whatsapp":
            return WhatsAppLogo   

        case "discord":
            return DiscordAppLogo

        case "viber":
            return ViberAppLogo

        case "facebook messenger":
            return FBLogo

        case "line":
            return LineAppLogo  

        case "wechat":
            return WechatAppLogo  

        case "kakaotalk":        
            return KakaotalkAppLogo
    
        default:
            return ""
    }
}