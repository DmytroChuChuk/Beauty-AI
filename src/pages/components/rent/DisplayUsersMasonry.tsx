import { FC, Suspense, useCallback, useEffect, useRef } from 'react';
import CenterFlexBox from '../../../components/Box/CenterFlexBox';
import { Masonry, RenderComponentProps, useInfiniteLoader } from '../../../components/Masonry';
import { Box, CircularProgress, Modal, Typography } from '@mui/material';
import { Item } from '../../../keys/props/profile';
import { Dummy, SkeletonCardView } from '../../RentPage';
import { useWindowSize } from '../../../hooks/useWindowSize';
import DummyCard from '../../../components/RentPage/DummyCard';
import { widthToOpenModal } from '../../../dimensions/basicSize';
import { PostType } from '../../../enum/MyEnum';
import history from '../../../utility/history';

import useState from 'react-usestateref';
import { ServiceType } from '../../../keys/props/services';
import memoize from 'trie-memoize';
import { CollectionReference, DocumentData, Query, QueryConstraint, Timestamp, getDocs, query, where } from '@firebase/firestore';
import { Helper } from '../../../utility/Helper';
import LoadingScreen from '../../../components/Loaders/LoadingScreen';
import ProfilePage from '../../ProfilePage';
import NewRentCard from '../../../components/RentPage/NewRentCard';

interface props {
  // put query
  serviceType: ServiceType | undefined
  serviceId: string | undefined
  collection: CollectionReference
  queryConstraint: QueryConstraint[]
  sortByKey: string
  regionState: string[]
}

const DisplayUserMasonry : FC<props> = ({
  serviceType,
  serviceId,
  collection,
  queryConstraint,
  sortByKey,
  regionState
}) => {


    const minBoxWidth = 250
    const helper = new Helper()
    const [size] = useWindowSize()

    const [ isRefreshing, setRefreshing ] = useState<boolean>(false)
    const [noMoreState, setNoMoreState, noMore] = useState<boolean>(false)
    const [showProfile, setShowProfile] = useState<boolean>(false)
    const [selectedItem, setSelectedItem] = useState<Item>()
    const [items, setItems] = useState<(Item | Dummy)[]>([])
    const [dummyItems, setDummyItems] = useState< any[] >([])
    const [noProfiles, setNoProfiles] = useState(false)

    const last = useRef<Timestamp | number | undefined>(undefined)
    const _limit = useRef<number>(8)
    const queryConstraintRef = useRef<QueryConstraint[]>(queryConstraint)

    useEffect(() => {

      setDummyItems(helper.getDummyItems(minBoxWidth))
      addMoreItems(true)
      
      // eslint-disable-next-line 
    }, [])

    async function addMoreItems(reset?: boolean, event?: any ) {

      const _items: (Item | Dummy)[] = reset ? [] : items;
  
      if (reset) {
        setItems([])
      }
      
      if (isRefreshing) {
        return
      }
  
      setRefreshing(true)
      setNoMoreState(false)
      setNoProfiles(false)

  
      await getProfiles(_limit.current, _items, true, true)
  
    }

    function openProfile(item:Item, selectedServiceType?: ServiceType, selectedServiceId?: string){

        let _item = item

        //const _s = serviceIndex.current

        if(selectedServiceType !== undefined && selectedServiceId !== undefined){

        _item = {..._item , selected: {
            serviceType: selectedServiceType,
            id: selectedServiceId
        }}

        }else if(selectedServiceType !== undefined && selectedServiceId !== undefined){
        _item = {..._item , selected: {
            serviceType: selectedServiceType,
            id: selectedServiceId
        }}
        }

        // else if(_s){
        //   let [cat, id] = Object.entries(_s)[0]
        //   _item = {..._item , selected: {
        //     serviceType: parseInt(cat),
        //     id: id
        //   }}
        // }

        if(window.innerWidth < widthToOpenModal){
        const type = window.location.href.getQueryStringValue("usertype")
        let url = `/page/Profile?uid=${item.uid}&private=${item.isPrivate}&usertype=${type}`
        
          // mobile version push
          history.push(url, _item)
        }else{
          setSelectedItem(_item)
          setShowProfile(true)
        }
    }

    const getCard = useCallback(({ index, data, width } : 
        RenderComponentProps<Item | Dummy>) =>  {
    
          if(data.type === PostType.dummy){
      
            return <DummyCard 
                index={index}
                width={width}
            />
          } 
      
          const item = data as Item

          return <NewRentCard
            sortedBy={"-1"}
            serviceType={serviceType}
            serviceId={serviceId}
            index= {index}
            width = {width}
            item = {item}
            openProfile = {(serviceType, serviceId) => {
              openProfile(item, serviceType, serviceId)
            }}
            announcement={false}
            postService={undefined}
          />
    
          // return <RentCard
          //   sortedBy={"-1"}
          //   serviceType={serviceType}
          //   serviceId={serviceId}
          //   index= {index}
          //   height = {_height}
          //   width = {_width}
          //   item = {item}
          //   openProfile = {(serviceType, serviceId) => {
          //     openProfile(item, serviceType, serviceId)
          //   }}
          //   announcement={false}
          //   postService={undefined}
          // />
          // eslint-disable-next-line 
      },  []) 
    
    const getSkeletonCard =  useCallback ( ({ index, data, width } : RenderComponentProps<any>) => {
  
      return <SkeletonCardView
        index={index}
        height={width}
        width={width}
      />
  
        // eslint-disable-next-line 
    }, [dummyItems])

    function isRentPage(): boolean{
      const end = helper.getURLEnd().toLowerCase()
      return end === "renting"
      //let isRentPage = true
  
      // if(end !== "rent"){
      //   for(const v of Object.values(pages)){
      //     if(end === v.toString()){
      //       //isRentPage = false
      //       return false
      //     }
      //   }
      // }
  
      // return true
    }

    const fetchMoreItems = memoize(
      [{}, {}, {}],
      async (startIndex, stopIndex, currentItems ) =>
      
      {     
        if(!isRentPage() && currentItems.length > _limit.current * 3){
          return
        }
        if(currentItems.length !== startIndex) {
          return
        }
  
        const numberOfDocuments = stopIndex - startIndex

        await getProfiles(numberOfDocuments, currentItems as Item[], false, false)
      }
  
    );

    async function getProfiles(
      limitNumber : number, _items : (Item | Dummy)[], 
      reset: boolean, 
      showNoProfileAtAll : boolean = false){
  
      let shouldSkip = false
      let numberOfProfiles = 0
      

      let array = regionState
      let numberOfRegion = regionState.length > 0 ? regionState.length : 1

      let constraint = queryConstraintRef.current
      if(last.current){
        constraint = [...queryConstraintRef.current, where(sortByKey, "<", last.current)]
      }

  
      for (let index = 0; index < numberOfRegion; index++) {
        
        // const currentState = regionState.current[index]
        // if(!currentState) continue
        if(shouldSkip) {
          continue
        } 

        const getUserByLatest : Query<DocumentData> = query(collection, ...constraint)
        const _numberOfProfiles = await getMembers(_items, getUserByLatest , index === 0  ? reset : false)

  
        numberOfProfiles = numberOfProfiles + _numberOfProfiles
  
        // either no more profiles or not inside country at all
        if(numberOfProfiles === limitNumber ){
          shouldSkip = true
        } else if(numberOfProfiles < limitNumber && array.length > 1) {
          array.splice(index, 1)
        }
      }
      //setRegionState(array)
      // numberOfProfiles is -1 if there is an error
      if(showNoProfileAtAll && reset && numberOfProfiles === 0) {
        noProfileAtAll()
      }else if(array.length === 1 && numberOfProfiles < limitNumber) {
        setNoMore()
      }else if(array.length === 0 && numberOfProfiles === -1) {
        setNoMore()
      }

      
      setFinally()
    }

    async function getMembers (_items: (Item | Dummy)[], getUserByLatest: Query<DocumentData>, reset?: boolean) :  Promise<number> {

      if(noMore.current) {
        return Promise.resolve(-1)
      }
  
      let items = _items
  
      let snap = null
  
      try{
        snap = await getDocs(getUserByLatest)
      }catch(error){
        console.log(`getMembers error: ${error}`)
      }
  
      if(!snap){
        return Promise.resolve(-1)
      }

      const totalNumberOfDocs = snap.docs.length
  
      if(reset && totalNumberOfDocs === 0){
        return Promise.resolve(0)
      }
  
      snap.docs.forEach((_doc) => {
        const item = helper.addItems(_doc, false)
        items.push(item)
      })
  
      if (totalNumberOfDocs !== 0) {
  
        const last_doc = snap.docs[totalNumberOfDocs - 1]
        last.current = last_doc.get(sortByKey) as Timestamp | number
  
        // console.log( (last.current as Timestamp).toDate() )
  
      }else if(!reset) {
        return Promise.resolve(-1)
      }
          
      if(reset) {
        setItems(items)
      }
  
      return Promise.resolve(totalNumberOfDocs)
    }

    function setFinally(){
      // refreshing.current = false
      setRefreshing(false)
    }

    function setNoMore(){

      if(noMore.current) {
        return
      }
      // if(helper.getURLEnd().toLowerCase() === "rent"){
      //   setInformation("No more profiles")
      //   setShowInformation(true)
      // }
      //noMore.current = true
      setNoMoreState(true)
    }

    const closeModal = () => {
      setShowProfile(false)
    }

    function noProfileAtAll(){
      setItems([])
      setNoProfiles(true)
    }

    const maybeLoadMore = useInfiniteLoader(fetchMoreItems);
  
    function calculateColCount (width: number) : number {
      const count = Math.floor(width / 250)
      return count < 2 ? 2 : count
    }

    return <Box width="100%">

        <main className='masonry-main'>

        <div className='masonry-wrapper'>

        { items.length > 0 ? <Masonry
          items={items}
          // columnGutter={16}
          rowGutter={20}
          columnWidth={size.width}
          overscanBy={2}
          render={getCard}
          onRender = {maybeLoadMore}
          columnCount = {calculateColCount( size.width) }
        /> : null }

        { (items.length > 0) ? null : noProfiles ? <CenterFlexBox marginTop={15}>
          <Typography align='center' variant='caption' color="text.secondary">No profiles for this selection.<br/>Try searching another service or filter a different option again.</Typography>
        </CenterFlexBox> : <Masonry 
          items={ dummyItems }
          // columnGutter={8}
          // rowGutter={8}
          columnWidth={ size.width }
          overscanBy={ 2 }
          render={getSkeletonCard}
          columnCount = { calculateColCount( size.width) }

        />} 

          {(noMoreState && !noProfiles) && <CenterFlexBox margin={2}>
            <Typography variant='caption' color="text.secondary">End</Typography>
          </CenterFlexBox>}
        </div>

        </main>

        {(noMoreState && !noProfiles) ? <></> : <CenterFlexBox margin={2}>
      <CircularProgress color='secondary' size={14} />  
    </CenterFlexBox>}

        <Modal
        open={showProfile} 
        onClose={closeModal}>
          <div className="react-modal">
            <Suspense fallback={<LoadingScreen/>}>
              <ProfilePage 
                isPrivate={selectedItem?.isPrivate} 
                fromModal={true} 
                data={selectedItem} 
                onClose={closeModal}
              />
            </Suspense>

          </div>
      </Modal> 
    </Box>
 
}

export default DisplayUserMasonry