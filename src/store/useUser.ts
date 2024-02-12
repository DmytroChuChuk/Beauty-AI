import { useEffect, useState } from "react";
import { useUser } from './index';

type UserHook = [string | undefined | null,
    string | undefined | null,
    string | undefined | null,
    string | undefined | null,
    boolean | null | undefined,
    boolean]

export function useUserHooks() : UserHook {

    const currentUser = useUser((state) => state.currentUser)

    const [uid, setUid] = useState<string | undefined | null>(currentUser?.uid) 
    const [profileImage, setProfileImage] =  useState<string | undefined | null>(currentUser?.profileImage)
    const [nickname, setNickname] =  useState<string | undefined | null>(currentUser?.nickname)
    const [phoneNumber, setPhoneNumber] =  useState<string | undefined | null>(currentUser?.phoneNumber)
    const [isAdmin, setAdmin] =  useState<boolean | null | undefined>(currentUser?.isAdmin)
    const [isPremium, setPremium] =  useState<boolean>(currentUser?.isPremium ?? false)

    useEffect(() => {

        setUid(currentUser?.uid) 
        setProfileImage(currentUser?.profileImage)
        setNickname(currentUser?.nickname)
        setPhoneNumber(currentUser?.phoneNumber)
        setAdmin(currentUser?.isAdmin)
        setPremium(currentUser?.isPremium ?? false)

    }, [currentUser]);


    return [uid, profileImage, nickname, phoneNumber, isAdmin, isPremium];
}
