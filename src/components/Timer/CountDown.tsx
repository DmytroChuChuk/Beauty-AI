import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';


interface props {
    date: Date | undefined
    minutesToExpire: number
    hasExpired?: () => void
}

const CountDown : FC<props> = ({date, minutesToExpire, hasExpired}) => {

    const [ t ] = useTranslation()
    
    function calculateTimeLeft(date: Date | undefined) {
        // const year = new Date().getFullYear();
        // const year = date.getFullYear();

        if(!date) return {}
        if(date > new Date()) return {}
         
        const offsetDate = date.addMinutes(minutesToExpire);

        const difference = +offsetDate - +new Date();
        let timeLeft = {};
      
        if (difference > 0) {
          timeLeft = {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60)
          };
        }
      
        return timeLeft;
    }

    const [timeLeft, setTimeLeft] = useState<{[timing: string] : number}>(calculateTimeLeft(date))


    const timerComponents = Object.keys(timeLeft).map((interval, index) => {

      if (!timeLeft[interval]) {
          if(index === 3) {
              return <b>00</b>
          }
          if(index === 2) return <b>00:</b>
        return "";
      }

      let end = ""
      
      switch (index) {
        case 0:
          end = "d"
          break;

        case 1:
          end = "h"
          break;

        case 2:
          end = "m"
          break;

        case 3:
          end = "s"
          break;
      
      }
  
      return (
        <b key={index}>
          { ("0" + timeLeft[interval]).slice(-2) }{end}{index === 3 ? "" : ":"}
        </b>
      );
    });



    // const [expired, setExpired] = useState(!timerComponents.length)

    // useEffect(() => {
    //   if(expired){
    //     console.log("i amg here ")
    //     setExpired(true)
    //     hasExpired?.()
    //   }
    // }, [])

    useEffect(() => {

      if(!timerComponents.length){
        hasExpired?.()
        return
      }

      const id = setTimeout(() => {
        setTimeLeft(calculateTimeLeft(date))
      }, 1000)
  
      return () => {
        clearTimeout(id)
      }
         // eslint-disable-next-line
  }, [timeLeft]);


    return (
    <b>
        {timerComponents.length ? timerComponents : <span>{t("expired")}</span>}
    </b>
    );
    
 
}

export default CountDown