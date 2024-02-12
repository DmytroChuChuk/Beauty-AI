import { FC, forwardRef, useCallback, useEffect, useRef, useState } from 'react';

import { useUser } from '../../store';
import { DocumentData, QueryDocumentSnapshot, collection, limit, orderBy, query, where } from 'firebase/firestore';
import { auth, db } from '../../store/firebase';

import {  
  TRANSACTION, 
  time_stamp, 
  uid, 
  club, 
  name,
  email as emailKey 
} from '../../keys/firestorekeys';

import {  Typography } from '@mui/material';
import { ListChildComponentProps } from 'react-window';
import { TransactionCard } from './component/TransactionCard';
import SkeletonOrderCard from './component/SkeletonOrderCard';
import WindowList from '../List/WindowList';
import { useWindowSize } from '../../hooks/useWindowSize';
import EmptyHistory from './component/EmptyHistory';
import { useScroll } from "@use-gesture/react";
import { useCollectionQuery2 } from '../../chats/hooks/useCollectionQuery2';
import shallow from 'zustand/shallow';
import CheckServiceStatus from '../Dialogs/Payout/CheckServiceStatus';
import { getRedirectResult, GoogleAuthProvider } from 'firebase/auth';
import CenterSnackBar from '../../chats/components/Snackbar/CenterSnackBar';


interface props {
    hasLoaded: () => void
    copyIdClick: (id:string) => void
    isPageOwner?: boolean
}



const TransactionHistory : FC<props> = ({isPageOwner = false, hasLoaded, copyIdClick}) =>  {


    const defaultSize = 150;
    const defaultLimitCount = Math.ceil(window.innerHeight/defaultSize);

    const [ _uid, clubName ] = useUser((state) => [
      state?.currentUser?.uid, state?.currentUser?.club
    ], shallow)

    const [ size ] = useWindowSize()

    const [isOpen, setOpen] = useState<boolean>(false)
    const [myReviewId, setMyReviewId] = useState<string>()
    const [otherReviewId, setOtherReivewId] = useState<string>()
    const [when, setWhen] = useState<string>()
    const [amount, setAmount] = useState<number>()
    const [orderId, setOrderId] = useState<string>()

    const [alert, setAlert] = useState<boolean>(false)
    const [alertMsg, setMsg] = useState<string>()

    const [limitCount, setLimitCount] = useState(defaultLimitCount)

    const setCurrentUser = useUser((state) => state.setCurrentUser)

    const { loading, data, error, hasNextPage } = useCollectionQuery2(
      
      _uid ? `${_uid}-order` : undefined,
      isPageOwner ?
        query(collection(db, TRANSACTION), 
        where(`${club}.${name}`, "==", `${clubName}`),
        // where(orderItem, "==", OrderItemEnum.credits_movement.valueOf()),
        // where(moveToWhere, "==", movementEnum.income_to_cash.valueOf()),
        orderBy(time_stamp, "desc"),
        limit(limitCount)) 
        
        : 

        query(collection(db, TRANSACTION), 
        where(uid, "==", `${_uid}`),
        orderBy(time_stamp, "desc"),
        limit(limitCount)), 
      limitCount)

    useEffect(() => {
        if(!loading) hasLoaded()
        // eslint-disable-next-line
    }, [loading])

    useEffect(() => {
      getRedirectResult(auth).then((result) => {
        if(!result){
            return
        }
        const credential = GoogleAuthProvider.credentialFromResult(result);
        if (credential) {
            // Accounts successfully linked.
            const user = result.user
            const _email = user.email
            if(user.email){
                setMsg(`Logined with ${user.email}`)
                setAlert(true)
            }

            if(_email){
                localStorage.setItem(emailKey, _email)
                setCurrentUser({email: user.email})
                setMsg("Gmail connected")
                setAlert(true)
            }else {
                localStorage.removeItem(emailKey)
                setCurrentUser({email: undefined})
                setMsg("Connection error")
                setAlert(true)
            }
        }
      }).catch((error) => {
        console.log(error.code)
        if(error.code === "auth/credential-already-in-use"){
            setMsg("Gmail is already in used")
            setAlert(true)
        }
      })
      // eslint-disable-next-line
    }, [])

    const Row = useCallback(({index, style, data} : 
      ListChildComponentProps<QueryDocumentSnapshot<DocumentData>[]>) => {
    
      const doc = data[index] // ?.docs[index]
        
      if(!doc) return <div key={index} style={style}>
              <SkeletonOrderCard/>
          </div>
    
      else return <div key={index} style={style}>
          <TransactionCard
              isPageOwner={isPageOwner}
              data={doc}
              copyIdClick= {() => {
                copyIdClick(doc.id)
              }}
              checkServiceCompletion={(
                  orderId, 
                  myReviewId, 
                  otherReviewId, 
                  whenTransferToIncome,
                  pendingCreditAmount) => {

                setOrderId(orderId)
                setOtherReivewId(otherReviewId)
                setMyReviewId(myReviewId)
                setWhen(whenTransferToIncome)
                setAmount(pendingCreditAmount)
                setOpen(true)
                // open dialog to check
                // console.log(orderId)
                // console.log(myReviewId)
                // console.log(otherReviewId)
              }}
          />
          
    </div>}, 
    // eslint-disable-next-line
    [])


  //  const fetchMore = useCallback(() => {

  //     console.log("loading next page")
  //     if(hasNextPage){
  //       setLimitCount((prev) => {
  //         return prev + defaultLimitCount
  //       })
  //     }

  //  }, [hasNextPage])

    function loadNextPage(){
      if(hasNextPage){
        setLimitCount((prev) => {
          return prev + defaultLimitCount
        })
      }
    }

    const outerElementType = forwardRef(({ onScroll, children } : any, ref: any) => {
        const containerRef = useRef<HTMLDivElement | null>(null);
        useScroll(
          () => {
            if (!(onScroll instanceof Function)) {
              return;
            }
            const {
              clientWidth,
              clientHeight,
              scrollLeft,
              scrollTop,
              scrollHeight,
              scrollWidth
            } = document.documentElement;
            onScroll({
              currentTarget: {
                clientHeight,
                clientWidth,
                scrollLeft,
                scrollTop:
                  scrollTop -
                  (containerRef.current
                    ? containerRef.current.getBoundingClientRect().top + scrollTop
                    : 0),
                scrollHeight,
                scrollWidth
              }
            });
          },
          { target: window }
        );
        ref.current = document.documentElement;
        return (
          <div style={{ position: "relative" }} ref={containerRef}>
            {children}
          </div>
        );
      });

      if(loading) return <SkeletonOrderCard/>
      else if (error) return <Typography>
          Error, cannot load table
      </Typography>
      else if (data?.size as number === 0) return <>
        <EmptyHistory 
            title='No transaction yet...'
        />

        <CenterSnackBar
            open={alert}
            message={alertMsg}
            onClose={() => setAlert(false)}
            autoHideDuration={2000}
        />
      
      
      </>
      else return <>
  
          <WindowList 
            itemData={(data?.docs ?? []) as QueryDocumentSnapshot<DocumentData | undefined>[]}
            height={3 * ( size.height / 4 )}
            width={ size.width }
            hasNextPage={hasNextPage}
            dataSize={data?.size as number}
            loadNextPage={loadNextPage}
            component={Row}
            itemSize={150}
            outerElementType={outerElementType}
          />
  
          { (orderId && otherReviewId && myReviewId && isOpen) && 
          <CheckServiceStatus
            open={isOpen} 
            orderId={orderId} 
            reviewId={otherReviewId} 
            myReviewLinkId={myReviewId} 
            amount={amount}
            when={when}
            onCancel={() => {
              setOpen(false)
              setOrderId("")
              setMyReviewId("")
              setOtherReivewId("")
              setAmount(0)
              setWhen("")
            }}
          /> }

        <CenterSnackBar
            open={alert}
            message={alertMsg}
            onClose={() => setAlert(false)}
            autoHideDuration={2000}
        />
      
      </>


}

export default TransactionHistory