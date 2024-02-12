import { httpsCallable } from "firebase/functions" ;
import { functions } from "../store/firebase" ;
import { sendTelegramNotificationFunction } from "./functionNames" ;

export const payment = [
    " pay ", " bank ", " uob ", " paynow ", " paylah ",
    " transfer ", " posb ", " ocbc ", " citibank ", " cash ",
    " transferwise ", " maybank ", " cimb ", " payment ",
    " paypal ", " cash ", " payment ", " deal ", " pays ",
    " money ", " paying ", " tip me ", " ocbc ", " tip ", " crypto ", " bitcoin " ];

export const messenger = [
    " telegram ", " tele ", " line ", 
    " discord ", " instagram ", " dm ",
    " isg ", " whatsapp ", " wechat ", " tel ",
    " viber ", " messenger ", " number ", " snapchat ", 
    " facebook ", " fb ", " phone ", " twitter ", 
    " tiktok ", " tele gram ", " insta ", " email ", " gram ",
    " mail ", " username ", " tl ", " isg ", " tlgram ", " paynow" 
]

export const sex = [
    " sex ", " fuck ", " intimacy ", " cuddle ", " cuddling ", " blowjob ", " nsfw ", " sexy ", " happy ending "];

export const nsfw = [
    " sex ", " fuck ", " intimacy ", " hold hands ", " pda ", " dtf ", " gd time ",
    " cuddle ", " hug ", " kiss ", " touching ", " nswf ", " good time ",
    " sext ", " boobs ", " breast ", " kissing ", " cuddling ", " private ", " open minded ",
    " fingering ", " blowjob ", " sfw ", " nsfw ", " nswf ", " ons ",
    " hotel 81 ", " make out ", " overnight ", " over night ", " room ",
    " home ", " my place ", " house ", " touch ", " daycation ", " staycation ", 
    " bj ", " sexy ", " skirt ", " lingerie ", " hug ", " panties ", " lick ",
    " girlfriend ", " boyfriend ", " flirting ", " flirt ", " night drive ", " sugarbaby ", " sugardaddy "];


export function sendTelegramNotificationToAdmin(text: string): Promise<any> | undefined{
    const sendTelegramNotification = httpsCallable(functions, sendTelegramNotificationFunction)
    const _text = encodeURIComponent(text)

    return sendTelegramNotification({
        tele_id: "858353262 ",
        text: _text
    })
}