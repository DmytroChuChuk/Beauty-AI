const now = new Date()
const hour = now.getHours()

export const loyalPointsLimit = 10000
export const isLoyalPeriod = now.getDay() >= 4  && ((hour >= 0 && hour <= 1) || (hour >= 21 && hour <= 23))

export const preferencesNames = ["text", "audio", "video"]
export const applicationNames = [
    "whatsapp", 
    "telegram", 
    "discord", 
    "viber", 
    "facebook messenger", 
    "line", 
    "wechat", 
    "kakaotalk"
]

export const mediaLinks = [
    "https://www.youtube.com/embed/QV2FF9wwE2w",
    "https://www.youtube.com/embed/Hj4HWnXe8vk",
    "https://www.youtube.com/embed/z7dQzkKrXTk",
    "https://www.youtube.com/embed/9Nug7n1CuRs",
    "https://www.youtube.com/embed/Fp0ykAVyulk",
    "https://www.youtube.com/embed/afkr_fLi3tE" ,
    "https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fwww.facebook.com%2Fdoubleupsg%2Fvideos%2F598883757878310%2F&show_text=false&width=560&t=0",
    "https://www.youtube.com/embed/WYplgVAxMv4",
    "https://www.youtube.com/embed/T-qRwQ5D0e0",
    "https://www.youtube.com/embed/cSz4m15Y0sc",
    "https://www.youtube.com/embed/_FZb1mFdPoI",
    "https://www.youtube.com/embed/kDMV7scaLvk"
]