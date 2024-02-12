import {  useEffect } from "react";
import useState from 'react-usestateref'

export  interface Size {
    width: number 
    height: number
    outerHeight: number
}

type SizeHook = [Size, ReadOnlyRefObject<Size>];

export function useWindowSize() : SizeHook {
    // Initialize state with undefined width/height so server and client renders match
    // Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
    const [windowSize, setWindowSize, windowRef] = useState<Size>({
      width: window.innerWidth,
      height: window.innerHeight,
      outerHeight: window.outerHeight
    });
    useEffect(() => {
      
      // Handler to call on window resize
      function handleResize() {
        // Set window width/height to state
   
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
          outerHeight: window.outerHeight,
        });
      }

      window.addEventListener("resize", handleResize);

      handleResize();

      return () => window.removeEventListener("resize", handleResize);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return [windowSize, windowRef];
  }