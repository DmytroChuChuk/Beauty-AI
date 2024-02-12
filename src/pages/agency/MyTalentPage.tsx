import { Avatar, Box, Button, Card, CardHeader, CircularProgress, Skeleton, Typography } from '@mui/material';
import { useScroll } from '@use-gesture/react';
import { DocumentData, DocumentSnapshot, Timestamp, collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { FC, forwardRef, useRef, useState } from 'react';
import { ListChildComponentProps } from 'react-window';
import shallow from 'zustand/shallow';
import CenterFlexBox from '../../components/Box/CenterFlexBox';
import FlexBox from '../../components/Box/FlexBox';
import FlexGap from '../../components/Box/FlexGap';
import PageHeader from '../../components/Headers/PageHeader';
import WindowList from '../../components/List/WindowList';
import LoadingScreen from '../../components/Loaders/LoadingScreen';
import MyAppBar from '../../components/MyAppBar';
import { RBAC } from '../../enum/MyEnum';
import { useDocPaginate } from '../../hooks/useDocPaginate';
import { useWindowSize } from '../../hooks/useWindowSize';
import { cardGray } from '../../keys/color';
import { admin, club, createdAt, name, nickname, reject_reason, time_stamp, USERS } from '../../keys/firestorekeys';
import { useClubAdmin, useUser } from '../../store';
import { Helper } from '../../utility/Helper';
import { db } from '../../store/firebase';

const MyTalentSkeletonCard : FC = () => {

    return <Box padding={2}>
      <Card elevation={0} sx={{borderRadius : 0}} >
  
        <CardHeader
          avatar={
            <Skeleton
              sx={{height: 40, width: 40}}
              variant='circular'
            />
          }
          title={        <Skeleton 
            width={200}
            variant='text'
          />}
          subheader={        <Skeleton 
            width={80}
            variant='text'
          />}
        />

      

        <FlexBox alignItems="center" padding={2}>
                <Skeleton 
                width="30%"
                variant='text'
            />
        </FlexBox>

  
        </Card>
      </Box>
}


const Row  = (helper: Helper, numberOfDocs: number, hasNextPage: boolean) => ({index, style, data} : ListChildComponentProps<DocumentSnapshot<DocumentData>[]>) => {
    
    const user = data[index] 

    const item = helper.convertToItem(user)
    const inReview = item?.admin === false
    const activeMember = item?.admin === true
    const isActive = item?.time_stamp 
    const rejectedReason = user?.get(reject_reason) as string | undefined

    const onClick = () => {
        window.open(`/Profile?uid=${user.id}` ,"_blank")
    }
    
    if(!item ) {

        return hasNextPage ? <div key={index}  style={style}> 
          <MyTalentSkeletonCard/>
          <br/>
          {
            numberOfDocs === 0 && <>
              <MyTalentSkeletonCard/>
              <br/>
              <MyTalentSkeletonCard/>
              <br/>
              <MyTalentSkeletonCard/>
              <br/>
              <MyTalentSkeletonCard/>
              <br/>
            </>
          }
  
        </div> : null
        
      }

    else return <div key={index} style={style}>
        <Card>
            <CardHeader
                avatar={
                    <Avatar 
                        src={item?.mobileUrl}
                        variant="circular"
                        onClick={onClick}
                    />
                }
                title={`ID: ${item?.createdAt?.seconds}`}
                subheader={
                    `@${item?.nickname}`
                }
            />

            <FlexBox alignItems="center" padding={2}>
                <Typography variant='caption'>Status:</Typography>
                <FlexGap gap={2}/>
                <Typography fontWeight="bold" color={isActive ? "success.main" : "error"} variant='caption'
                >{ inReview ? "In Review" : activeMember ?  isActive ? "Active" : "Inactive" : rejectedReason ? "Application rejected" : ""}</Typography>
            </FlexBox>
      
        </Card>
    </div>
}

const MyTalentPage : FC = () => {

    const helper = new Helper()
    const [ size ] = useWindowSize()
    const [ uid] = useUser((state) => [ 
        state.currentUser?.uid, 
    ], shallow)

    const [clubName, clubsRBAC ] = useClubAdmin((state) => 
    [
      state.current?.clubName, 
      state.current?.clubRBAC
    ], shallow)

    const [lastTimestamp, setLastTimestamp] = useState<Timestamp | undefined>()
    const [isLoading, setLoading] = useState(false)

    const {loading, hasNextPage, data} = useDocPaginate(
        `${uid}-talent-page`, 
        lastTimestamp, 
        `${USERS}`,
        [where(admin, "==", true),
        where(`${club}.${name}`, "==", clubName)])

    const dataSize = data?.length ?? 0


    function loadNextPage() {
   
        if(hasNextPage){
            const numberOfDoc = data?.length ?? 0
            if(numberOfDoc > 0 && data){
                const last = data[ numberOfDoc - 1].get(time_stamp) as Timestamp | undefined
                if(last) setLastTimestamp(last)
            }
        }
    }

    const exportToCSV = async () => {

      if(isLoading || !clubName){
        return
      }

      setLoading(true)
      const allTalents = await getDocs(query(collection(db, USERS),
        where(admin, "==", true),
        where(`${club}.${name}`, "==", clubName),
        orderBy(createdAt, "desc")))

      const data = allTalents.docs

      if(data.length === 0){
        setLoading(false)
        return
      }

      const rows = [
        ["ID", "username"]
      ]

      for (let index = 0; index < data.length; index++) {

        const user = data[index]
        const userId = user.get(createdAt) as Timestamp | undefined

        if(!userId){
          continue
        }

        const username = user.get(nickname) as string | undefined

        rows.push([
          userId.seconds.toString(), `@${username ?? "ERROR"}`
        ])

      }

      function arrayToCsv(data: any){
        return data.map((row: any) =>
          row
          .map(String)  // convert every value to String
          .map((v: any) => v.replaceAll('"', '""'))  // escape double colons
          .map((v: any) => `"${v}"`)  // quote it
          .join(',')  // comma-separated
        ).join('\r\n');  // rows starting on new lines
      }



      function downloadBlob(content: any, filename: any, contentType: any) {
        // Create a blob
        var blob = new Blob([content], { type: contentType });
        var url = URL.createObjectURL(blob);
      
        // Create a link to download it
        var pom = document.createElement('a');
        pom.href = url;
        pom.setAttribute('download', filename);
        pom.click();
      }

      let csv = arrayToCsv(rows)
      downloadBlob(csv, 'all_active_talents.csv', 'text/csv;charset=utf-8;')

      setLoading(false)
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
          <div style={{ position: "relative"}} ref={containerRef}>
            {children}
          </div>
        );
      });

    if(loading) return <LoadingScreen/>
    else if(clubsRBAC !== RBAC.admin) return <CenterFlexBox height="100vh">
        <Typography>You are not authorized to view this page.</Typography>
    </CenterFlexBox>
    else if(!hasNextPage && dataSize === 0) return <CenterFlexBox height="100vh">
        <Typography>No talents yet...</Typography>
    </CenterFlexBox>
    else return <FlexBox
        flexDirection="column"
        padding=".5rem"
        className={!loading ? `chat-background` : ""}
        bgcolor={loading ? "white" : cardGray} 
        minHeight="100vh"
        sx={{overflowX: "hidden"}}
        >
        <MyAppBar/>
        <PageHeader
            title='My Talents'
        />

        <Box marginLeft="auto" marginRight="auto" maxWidth={800} width="100%">

            <Button
              endIcon={
                isLoading && <CircularProgress size={12} color='primary'/>
              } 
              variant='contained' 
              color="warning" 
              onClick={exportToCSV}>EXPORT TO CSV</Button>

            <br/>
            <br/>

            <WindowList
                itemData={data}
                height={window.innerHeight}
                width={ "100%"}
                hasNextPage={hasNextPage}
                dataSize={dataSize}
                loadNextPage={loadNextPage}
                component={Row(helper, dataSize, hasNextPage)}
                itemSize={130}
                outerElementType={outerElementType}
            />

            { !hasNextPage && <>
                {
                    dataSize === 0 ? <></> : <FlexBox
                    marginLeft={2}
                    width={ size.width * 0.95 > 550 ? 550 : size.width * 0.95 }
                    flexDirection="column">
                        <Typography color="text.secondary" variant='caption'>End</Typography>
                        <Typography marginRight="auto" >Number of Talents: {dataSize}</Typography>
                    </FlexBox>
                }
            
            </> }
        </Box>

   


   
    </FlexBox>
}

export default MyTalentPage