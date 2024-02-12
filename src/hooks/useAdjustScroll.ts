import { useEffect, useState } from "react";
import { Helper } from "../utility/Helper";

export const useAdjustScroll:() => {
    reachedBottom: boolean
} = () => {

    const helper = new Helper()
    const [reachedBottom, setReachedBottom] = useState(false);

    function isRentPage(): boolean{
      const NOTannouncementSession = helper.getQueryStringValue("session") === ""
      const end = helper.getURLEnd().toLowerCase()
      return end === "rent" && NOTannouncementSession
    }

    useEffect(() => {
        window.onscroll = function() {
          if(!isRentPage()){
            return
          }

          if ((window.innerHeight + Math.round(window.scrollY)) >= document.body.offsetHeight) {
                setReachedBottom(true)
                setTimeout(() => {
                    window.scrollBy(0, -1)
                }, 100)
          }else{
            setReachedBottom(false)
          }
        };
        // eslint-disable-next-line
    }, [])

    return {reachedBottom}
}