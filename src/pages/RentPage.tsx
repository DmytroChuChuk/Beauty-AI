import { FC, lazy, Suspense, useCallback, useEffect, useRef } from "react";

import useState from "react-usestateref";

import { logEvent } from "firebase/analytics";
import { analytics } from "../store/firebase";

import {
  collection,
  DocumentData,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  Query,
  query,
  QueryConstraint,
  Timestamp,
  where,
} from "firebase/firestore";

import { db } from "../store/firebase";

import {
  admin,
  ANNOUNCE,
  apply_time_stamp,
  club,
  gender,
  geoEncodings,
  highest,
  lowest,
  name,
  privacy,
  race,
  services,
  sortByPricing,
  sortByRatings,
  state,
  time_stamp,
  uid,
  USERS,
  video_verification,
} from "../keys/firestorekeys";

import "./scss/RentPage.scss";

import { Box, CircularProgress, Modal, Typography } from "@mui/material";

import { PostType, RBAC, sortBy } from "../enum/MyEnum";
import { Helper } from "../utility/Helper";
import history from "../utility/history";

// try to lazy load all these
// import Events from './javascripts/Events';
// import { defaultGender,
//   defaultRace,
//   defaultProfile,
//   defaultFilter
// } from '../keys/defaultValues';

import shallow from "zustand/shallow";
import {
  // dummyHeightSizes,
  hideFilterButtonSize,
  widthToOpenModal,
} from "../dimensions/basicSize";
import { useUser } from "../store";

import {
  Masonry,
  RenderComponentProps,
  useInfiniteLoader,
} from "../components/Masonry";

import {
  defaultAllFilter,
  filterType,
  genderFilter,
  profileFilter,
  raceFilter,
} from "../components/Filter/FilterBy";

import { useWindowSize } from "../hooks/useWindowSize";

import memoize from "trie-memoize";

import LoadingScreen from "../components/Loaders/LoadingScreen";
import DummyCard from "../components/RentPage/DummyCard";
import { ServiceType } from "../keys/props/services";

import ScrollContainer from "react-indiana-drag-scroll";
import BroadcastList from "../components/Announcement/BroadcastList";
import FilterByPanel from "../components/Dialogs/Rent/FilterByPanel";

import CenterFlexBox from "../components/Box/CenterFlexBox";
import LoyaltyHeader from "../components/Headers/LoyaltyHeader";
import WhoIsFreeTodayView from "../components/Misc/WhoIsFreeTodayView";
import DisplayFavourites from "../components/Services/component/DisplayFavourites";
import SectionTitle from "../components/Typography/SectionTitle";
import { useGetFavourites } from "../hooks/useGetFavourites";
import { useIPAddress } from "../hooks/useIPAddress";
import { AnalyticsNames } from "../keys/analyticNames";
import {
  COLOMBIA,
  MALAYSIA,
  PHILIPPINES,
  SINGAPORE,
  SOUTH_KOREA,
} from "../keys/countries";
import {
  defaultFilter,
  defaultGender,
  defaultProfile,
  defaultRace,
  defaultSortedBy,
} from "../keys/defaultValues";
import { area, serviceIndexKey } from "../keys/localStorageKeys";
import { Item } from "../keys/props/profile";
import BroadcastFAB from "./components/BroadcastFAB";
//import FeatureProfileView from '../components/Misc/FeatureProfileView';
import { useTranslation } from "react-i18next";
import FloatingFilterButton from "../components/Buttons/FloatingFilterButton";
import { bindPhoneNumberLimit } from "../dimensions/limit";
// import WarningSign from '../components/Headers/WarningSign';
import FlexBox from "../components/Box/FlexBox";
import FlexGap from "../components/Box/FlexGap";
import InfoGridBox from "../components/Headers/InfoGridBox";
import MoreInfoSection from "../components/Headers/MoreInfoSection";
import NewRentCard from "../components/RentPage/NewRentCard";
import { isLoyalPeriod, loyalPointsLimit } from "../data/data";
import { useAdjustScroll } from "../hooks/useAdjustScroll";
// import NewUsersView from "../components/Misc/NewUsersView";
// import GamersView from "../components/Misc/GamersView";
import { version } from "../version/basic";

const ProfilePage = lazy(() => import("./ProfilePage"));
const AnnouncementHeader = lazy(
  () => import("../components/Announcement/AnnouncementHeader")
);
const SendBroadcast = lazy(
  () => import("../components/Dialogs/Rent/SendBroadcast")
);
const CountriesDialog = lazy(
  () => import("../components/Dialogs/Rent/CountriesDialog")
);

export interface Dummy {
  type: PostType;
  height: number;
  width: number;
}

export interface Place {
  uid: string;
  area: string;
  name: string;
  info: string;
  location: string;
  activity: string;
  url: string;
  discount: number;
  site: string;
  time_stamp: Timestamp;
}

export interface Live {
  uid: string;
  room: string;
  tag: string;
  url: string;
  views: number;
  connect_id: string;
  time_stamp: Timestamp;
}

export interface Rent {
  //  once: MutableRefObject<boolean>
  hidden: boolean;
}

export const SkeletonCardView: FC<{
  index: number;
  width: number;
  height: number;
}> = ({ index, width, height }) => {
  return (
    <Box
      key={index}
      className="skeleton"
      sx={{
        width: `${width}px`,
        height: `${height}px`,
        borderRadius: "1em",
        aspectRatio: { xs: "1/2", md: "3/5" },
        maxHeight: "384px",
      }}
    >
      <Box className="skeleton-content" />
    </Box>
  );
};

const RentPage: FC<Rent> = ({ hidden }) => {
  // const [ hidden, setHidden ] = useState<boolean>(hide)

  useAdjustScroll();

  const [size] = useWindowSize();
  const { loadingIPAddress } = useIPAddress();
  const [t] = useTranslation();

  const { favourites } = useGetFavourites();

  const [
    myUID,
    isPremium,
    phoneNumber,
    isAdmin,
    userRBAC,
    blockBroadcast,
    points,
  ] = useUser(
    (state) => [
      state.currentUser?.uid,
      state.currentUser?.isPremium ?? false,
      state.currentUser?.phoneNumber,
      state.currentUser?.isAdmin,
      state.currentUser?.userRBAC,
      state?.currentUser?.blockBroadcast,
      state?.currentUser?.points,
    ],
    shallow
  );



  const clubName = sessionStorage.getItem(club);
  const limitNumber = 8;
  const minBoxWidth = 250;

  // initializer classes
  const helper = new Helper();
  // const events = new Events()

  const id = helper.getQueryStringValue("session");
  const isAdminPage =
    helper.getQueryStringValue("admin") === "true" && userRBAC === RBAC.admin;
  const isVerify =
    helper.getQueryStringValue("verify") === "true" && userRBAC === RBAC.admin;
  const NOTannouncementSession = helper.getQueryStringValue("session") === "";

  const displayFavouritesRef: any = useRef<ScrollContainer | null>(null);

  const [openBroadcast, setBroadcast] = useState<boolean>(false);
  const [openCountryDialog, setOpenCountryDialog] = useState<boolean>(false);
  const [postRef, setPostRef] = useState<string>();
  const [postService, setPostService] =
    useState<[ServiceType | undefined, number | undefined]>();

  const shouldAddDummy = useRef<number>(shouldAdd(isPremium));
  function shouldAdd(isPremium: boolean): number {
    if (!NOTannouncementSession) return 0;
    return isPremium ? 0 : 1;
  }

  // const [favourites, setfavourites] = useState<detailProps[]>([])

  // const noMore = useRef<boolean>(false)

  const [noMoreState, setNoMoreState, noMore] = useState<boolean>(false);
  const [hasPending, setHasPending] = useState<boolean>(false);
  const [getRegionState, setRegionState, regionState] = useState<string[]>([]);
  const [showProfile, setShowProfile] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<Item>();
  const [numberOfProfiles, setNumberOfProfiles] = useState<number>(0);
  const [items, setItems] = useState<(Item | Dummy)[]>([]);
  const [dummyItems, setDummyItems] = useState<any[]>([]);
  const [defaultAllCountries, setAllCountries] = useState<boolean>(false);
  const [noProfiles, setNoProfiles] = useState(false);

  function getDefaults(defaults: string | null, filterArrays: any[]) {
    if (clubName) {
      return NaN;
    }

    if (defaults) {
      let index = filterArrays.find((e) => e.title === defaults)?.firebase;
      if (index !== undefined) return index.valueOf();
    }

    return NaN;
  }

  const isLoyal =
    !isPremium && (points ?? 0) >= loyalPointsLimit && isLoyalPeriod;

  const sortedByKeyIndex = useRef<string>(defaultSortedBy);
  const raceIndex = useRef<number>(getDefaults(defaultRace, raceFilter)); // useRef<number>(NaN)
  const genderIndex = useRef<number>(getDefaults(defaultGender, genderFilter)); // useRef<number>(NaN)
  const profileIndex = useRef<number>(
    getDefaults(defaultProfile, profileFilter)
  ); // useRef<number>(NaN)
  const defaultIndex = useRef<number>(
    getDefaults(defaultFilter, defaultAllFilter)
  ); // useRef<number>(NaN)
  const serviceIndex = useRef<{ [serviceType: number]: string } | undefined>();

  const onceAdd = useRef<boolean>(false);

  const [favouritesTitle, setTitle] = useState<string>();
  const [isRefreshing, setRefreshing] = useState<boolean>(false);
  const [openMenu, setMenu] = useState(false);

  function sortByKey(): string {
    if (clubName) {
      return time_stamp;
    }

    switch (sortedByKeyIndex.current) {
      case sortBy.RECENTLY.toString():
        return time_stamp;

      case sortBy.HIGHEST_RATINGS.toString():
        return sortByRatings;

      //case sortBy.HIGHEST_PRICE.toString():
      case sortBy.LOWEST_PRICE.toString():
        const highLow =
          sortedByKeyIndex.current === sortBy.HIGHEST_PRICE.toString()
            ? highest
            : lowest;

        if (serviceIndex.current) {
          const keys = Object.keys(serviceIndex.current);
          const values = Object.values(serviceIndex.current);

          if (keys.length > 0 && values.length > 0) {
            const key = keys[0];
            const value = values[0];

            if (value === "-1") {
              return `${sortByPricing}.${highLow}`;
            } else if (value === "-2") {
              return `${sortByPricing}.${ServiceType.games}.${highLow}`;
            } else return `${services}.${key}.${value}.${sortByPricing}`;
          } else return `${sortByPricing}.${highLow}`;
        } else return `${sortByPricing}.${highLow}`;

      default:
        return time_stamp;
    }
  }

  const last = useRef<Timestamp | number | undefined>(undefined);

  const _limit = useRef<number>(8);
  const scrollPositionY = useRef<number>(0);

  const [showScrollToTop, setShowScrollToTop] = useState<boolean>(false);

  useEffect(() => {
    if (isRefreshing) {
      const map = serviceIndex.current;
      if (map) {
        const entries = Object.entries(map);
        if (entries.length > 0) {
          localStorage.setItem(
            serviceIndexKey,
            `${entries[0][0]},${entries[0][1]}`
          );
        }
      } else {
        localStorage.removeItem(serviceIndexKey);
      }
    }
  }, [isRefreshing]);

  function getQuery(
    db: any,
    raceIndex: number,
    genderIndex: number,
    state: string,
    last: Timestamp | number | undefined,
    limitNumber: number
  ): Query<DocumentData> {
    let getUserByLatest: Query<DocumentData>;

    const gIndex = genderIndex;

    const whereAdminTrue = where(admin, "==", true);

    const orderByTimestamp = orderBy(
      sortByKey(),
      sortedByKeyIndex.current === sortBy.LOWEST_PRICE.toString()
        ? "asc"
        : "desc"
    );

    const limitBy = limit(limitNumber);

    const queries: QueryConstraint[] = [
      whereAdminTrue,
      orderByTimestamp,
      limitBy,
    ];

    if (clubName) {
      queries.push(
        where(`${club}.${name}`, "==", clubName ? clubName : "rentbabe")
      );
    }

    const deIndex = defaultIndex.current;
    const poIndex = profileIndex.current;
    const _s = serviceIndex.current;

    if (_s) {
      let [cat, id] = Object.entries(_s)[0];

      if (cat === "2" && id === "-2") {
        const _q = where(
          `${services}.${cat}.id`,
          "==",
          ServiceType.games.toString()
        );
        queries.push(_q);
      } else if (cat === "0" && id === "-1") {
      } else {
        const _q = where(`${services}.${cat}.${id}.id`, "==", id);
        queries.push(_q);
      }
    }

    if (!isNaN(gIndex)) {
      const whereGender = where(gender, "==", gIndex);
      queries.push(whereGender);
    }

    const whereRegion = where(geoEncodings, "array-contains", state);

    if (_s) {
      let cat = Object.keys(_s)[0];
      if (
        parseInt(cat) === ServiceType.meetup ||
        parseInt(cat) === ServiceType.sports
      ) {
        queries.push(whereRegion);
      }
    } else if (isNaN(deIndex)) {
      queries.push(whereRegion);
    }

    if (isNaN(deIndex)) {
      if (!isPremium && !isLoyal) {
        queries.push(where(privacy, "==", 0));
      } else if (!isNaN(poIndex) && (isPremium || isLoyal)) {
        queries.push(where(privacy, "==", poIndex));
      } else {
        queries.push(where(privacy, "==", 0));
      }
    } else {
      // prevention if deIndex is NaN
      const category = deIndex;
      queries.push(where(`${services}.${category}.id`, "==", `${category}`));
      queries.push(where(privacy, "==", 0));
    }

    if (last) {
      const whereTimestamp = where(
        sortByKey(),
        sortedByKeyIndex.current === sortBy.LOWEST_PRICE.toString() ? ">" : "<",
        last
      );
      queries.push(whereTimestamp);
    }

    if (!isNaN(raceIndex)) {
      const whereRace = where(`${race}2.${raceIndex}`, "==", true);
      queries.push(whereRace);
    }

    getUserByLatest = query(collection(db, USERS), ...queries);

    return getUserByLatest;
  }

  function getLimit() {
    let w = window.innerWidth;
    let myLimit = Math.floor(w / minBoxWidth) * 3;
    return myLimit <= 8 ? limitNumber : myLimit;
  }

  useEffect(() => {
    shouldAddDummy.current = shouldAdd(isPremium);
    // eslint-disable-next-line
  }, [isPremium]);

  useEffect(() => {
    try {
      const _fav = Object.values(favourites);
      if (_fav.length === 0) return;

      const ele = displayFavouritesRef.current?.getElement();
      const service = serviceIndex.current;

      if (!ele || !service) return;

      let index = 0;
      let counter = 0;

      for (const value of _fav) {
        const _serviceType = value.serviceType;
        const _category = value.id ?? value.category;

        if (_serviceType === undefined) continue;
        if (_category === undefined) continue;

        if (service[_serviceType] === _category) {
          index = counter;
          setTitle(value?.title);
          break;
        }

        counter += 1;
      }

      const child = ele.firstChild?.firstChild?.childNodes[
        index
      ] as HTMLDivElement;

      ele.scrollLeft = child.offsetLeft - 10;
    } catch {
      //console.log(error)
    }
  }, [favourites]);

  useEffect(() => {
    if (!isAdminPage && NOTannouncementSession && !loadingIPAddress) {
      const serviceIndexCache = localStorage.getItem(serviceIndexKey);
      const splitter = serviceIndexCache ? serviceIndexCache.split(",") : null;
      const defaultServiceFilter: { [key: string]: string } =
        clubName || !localStorage.getItem(area)
          ? { [ServiceType.eMeet]: "0" }
          : { [ServiceType.meetup]: "-1" };
      const data = clubName
        ? defaultServiceFilter
        : splitter && splitter.length > 1
        ? { [`${parseInt(splitter[0])}`]: `${splitter[1]}` }
        : defaultServiceFilter;

      serviceIndex.current = data;

      setDummyItems(helper.getDummyItems(minBoxWidth));
      addMoreItems(true);
    }
    // eslint-disable-next-line
  }, [loadingIPAddress]);

  // console.log(helper.sortByPricesValue(50, 5.0, 100, 1686304838))
  // 200.2870895
  // 200.08782273279368

  useEffect(() => {
    // getDocs(query( collection(db, USERS), where("a", "==", true),
    // orderBy("t", "desc")))
    // .then((snapShot) => {
    //   console.log(`number of updates: ${snapShot.docs.length}`)
    //   snapShot.docs.forEach((_doc) => {

    //     const uid = _doc.id

    //     const item = helper.addItems(_doc, false)
    //     const epoch = item.time_stamp?.toDate().getTime()

    //     if(epoch){

    //       let map : {[key: string] : any} = {}

    //       map.uid = uid
    //       map.isAdmin  = item.admin
    //       map.services = item.services

    //       const cal = new Calculator()
    //       const v = cal.weightedAverageValue(item.ratings)
    //       const numberOfRents = cal.numberOfMeetups(item.ratings)

    //       map.ratings = v ?? 0
    //       map.numberOfRents = numberOfRents ?? 0

    //       let updateMap = helper.update(map, epoch)

    //       delete updateMap?.t
    //       delete updateMap?.sbyrt

    //       if(updateMap){
    //         console.log(`UPDATE: ${uid}`)
    //         updateDoc(doc(db, USERS, uid), updateMap)
    //       }
    //     }
    //   })
    // })

    // setTimeout(() => {
    //   events.init(document.getElementById('scroll-whole-content'))
    // }, 1000)

    _limit.current = getLimit();

    const lang = navigator.language?.toLowerCase();
    if (lang) {
      logEvent(analytics, AnalyticsNames.languages, {
        language_type: lang,
      });
    }

    if (isAdminPage) {
      const _where = isVerify
        ? where(video_verification, "==", false)
        : where(admin, "==", false);

      getDocs(query(collection(db, USERS), _where)).then((snapShot) => {
        const _docs = snapShot.docs;

        let items = [];

        for (let index = 0; index < _docs.length; index++) {
          const _doc = _docs[index];
          const item = helper.addItems(_doc, false);
          items.push(item);
        }

        setItems(items);
      });
    } else if (!NOTannouncementSession) {
      const queries: QueryConstraint[] = [
        where(admin, "==", true),
        where(
          apply_time_stamp,
          "<",
          Timestamp.fromDate(new Date().addDays(10))
        ),
        orderBy(apply_time_stamp),
      ];

      // if(isAdmin && myUID){
      //   queries.push(where(uid, "==", myUID))
      // }

      const getUserByLatest = query(
        collection(db, ANNOUNCE, id, USERS),
        ...queries
      );

      let counter = 0;
      //let remove = 0

      const unsub = onSnapshot(getUserByLatest, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            const doc = change.doc;

            const item = helper.addItems(doc, false);
            // items.current.unshift(item)
            setItems((prevItems) => {
              prevItems.unshift(item);
              return prevItems;
            });

            counter += 1;
            setNumberOfProfiles(counter);
          }
        });
      });

      return () => {
        unsub();
      };
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function onScroll() {
    const last = decodeURIComponent(
      history.location.pathname.split("/").pop() ?? ""
    );
    const endings = last.split("?")[0];

    if (endings.toLowerCase() === "rent") {
      scrollPositionY.current = window.scrollY;
    }

    if (window.scrollY > 2000) {
      setShowScrollToTop(true);
    } else {
      setShowScrollToTop(false);
    }
  }

  useEffect(() => {
    //setHidden(hide)

    if (!NOTannouncementSession) {
      return;
    }

    if (!hidden) {
      if (!onceAdd.current) {
        window.addEventListener("scroll", onScroll);
        onceAdd.current = true;
      }

      setTimeout(() => {
        window.scrollTo(0, scrollPositionY.current);
      }, 100);
    }
  }, [hidden]); // eslint-disable-line react-hooks/exhaustive-deps

  function setArea() {
    const query = sessionStorage.getItem(state)?.toLowerCase();
    if (query) {
      const currentPageState = helper.getCurrentPageState();
      if (currentPageState && currentPageState.length > 0) {
        setRegionState(currentPageState);
      } else {
        if (query === "ph") {
          setRegionState(PHILIPPINES);
        } else if (query === "my") {
          setRegionState(MALAYSIA);
        } else if (query === "co") {
          setRegionState(COLOMBIA);
        } else if (query === "kr") {
          setRegionState(SOUTH_KOREA);
        } else {
          setRegionState(SINGAPORE);
        }
      }
    } else {
      const getState = helper.getState(phoneNumber);
      setRegionState(getState);
      localStorage.setItem(area, getState.join(", "));
    }

    if (
      serviceIndex.current?.[ServiceType.meetup] ||
      serviceIndex.current?.[ServiceType.sports]
    ) {
      setAllCountries(false);
    } else {
      setAllCountries(true);
    }
  }

  async function addMoreItems(reset?: boolean, event?: any) {
    const _items: (Item | Dummy)[] = reset ? [] : items;

    if (reset) {
      setItems([]);
      setRegionState([]);
    }

    if (isRefreshing) {
      return;
    }

    setRefreshing(true);
    setNoMoreState(false);
    setNoProfiles(false);
    setArea();

    await getProfiles(
      db,
      raceIndex.current,
      genderIndex.current,
      last.current,
      _limit.current,
      _items,
      true,
      true
    );
  }

  async function getProfiles(
    db: any,
    raceIndex: number,
    genderIndex: number,
    last: Timestamp | number | undefined,
    limitNumber: number,
    _items: (Item | Dummy)[],
    reset: boolean,
    showNoProfileAtAll: boolean = false
  ) {
    let shouldSkip = false;
    let numberOfProfiles = 0;

    let array = regionState.current;
    let numberOfRegion = isNaN(defaultIndex.current)
      ? regionState.current.length
      : 1;

    for (let index = 0; index < numberOfRegion; index++) {
      const currentState = regionState.current[index];

      if (!currentState) continue;
      if (shouldSkip) continue;

      const getUserByLatest: Query<DocumentData> = getQuery(
        db,
        raceIndex,
        genderIndex,
        currentState,
        last,
        limitNumber
      );
      const _numberOfProfiles = await getMembers(
        _items,
        getUserByLatest,
        index === 0 ? reset : false
      );

      numberOfProfiles = numberOfProfiles + _numberOfProfiles;

      // either no more profiles or not inside country at all
      if (numberOfProfiles === limitNumber) {
        shouldSkip = true;
      } else if (numberOfProfiles < limitNumber && array.length > 1) {
        array.splice(index, 1);
      }
    }

    setRegionState(array);

    // numberOfProfiles is -1 if there is an error

    if (
      showNoProfileAtAll &&
      reset &&
      numberOfProfiles === 0 &&
      NOTannouncementSession
    ) {
      noProfileAtAll();
    } else if (array.length === 1 && numberOfProfiles < limitNumber) {
      setNoMore();
    }

    setFinally();
  }

  function noProfileAtAll() {
    setItems([]);
    setNoProfiles(true);
    // if(isRentPage()){
    //   setInformation(`No profiles at all`)
    //   setShowInformation(true)
    // }
  }

  async function getMembers(
    _items: (Item | Dummy)[],
    getUserByLatest: Query<DocumentData>,
    reset?: boolean
  ): Promise<number> {
    if (noMore.current) return -1;

    let items = _items;

    let snap = null;

    try {
      snap = await getDocs(getUserByLatest);
    } catch (error) {
      console.log(`getMembers error: ${error}`);
    }

    if (!snap) {
      return Promise.resolve(-1);
    }

    const totalNumberOfDocs = snap.docs.length;

    if (!NOTannouncementSession) {
      setNumberOfProfiles(totalNumberOfDocs);
    }

    if (reset && totalNumberOfDocs === 0 && NOTannouncementSession) {
      return Promise.resolve(0);
    }

    // if (reset && !isPremium) {
    //   items.push({
    //     type: PostType.dummy,
    //     width: helper.randomInt(200, 300),
    //     height: dummyHeightSizes[0],
    //   });
    // }

    snap.docs.forEach((_doc) => {
      const item = helper.addItems(_doc, false);
      items.push(item);
    });

    if (totalNumberOfDocs !== 0) {
      const last_doc = snap.docs[totalNumberOfDocs - 1];
      last.current = last_doc.get(sortByKey()) as Timestamp | number;

      // console.log( (last.current as Timestamp).toDate() )
    } else if (!reset) return -1;

    if (reset) {
      setItems(items);
    }

    // else if(items.length > 0){

    //   window.scrollBy({
    //     top: 10,
    //     behavior: "smooth"
    //   })
    //   //window.scrollTo(0, 0)
    // }

    return Promise.resolve(totalNumberOfDocs);
  }

  function openProfile(
    item: Item,
    selectedServiceType?: ServiceType,
    selectedServiceId?: string
  ) {
    let _item = item;

    //const _s = serviceIndex.current

    if (
      !NOTannouncementSession &&
      selectedServiceType !== undefined &&
      selectedServiceId !== undefined
    ) {
      _item = {
        ..._item,
        selected: {
          serviceType: selectedServiceType,
          id: selectedServiceId,
        },
      };
    } else if (
      selectedServiceType !== undefined &&
      selectedServiceId !== undefined
    ) {
      _item = {
        ..._item,
        selected: {
          serviceType: selectedServiceType,
          id: selectedServiceId,
        },
      };
    }

    // else if(_s){
    //   let [cat, id] = Object.entries(_s)[0]
    //   _item = {..._item , selected: {
    //     serviceType: parseInt(cat),
    //     id: id
    //   }}
    // }

    if (window.innerWidth < widthToOpenModal) {
      let url = `/page/Profile?uid=${item.uid}&private=${item.isPrivate}`;

      if (isVerify) {
        url += `&verify=true`;
      }
      // mobile version push
      history.push(url, _item);
    } else {
      setSelectedItem(_item);
      setShowProfile(true);
    }
  }

  const closeModal = () => {
    setShowProfile(false);
  };

  function setNoMore() {
    if (!NOTannouncementSession || noMore.current) return;

    // if(helper.getURLEnd().toLowerCase() === "rent"){
    //   setInformation("No more profiles")
    //   setShowInformation(true)
    // }

    //noMore.current = true

    setNoMoreState(true);
  }

  function setFinally() {
    // refreshing.current = false
    setRefreshing(false);
  }

  const scrollToTop = () => {
    window.scrollTo(0, 0);

    try {
      logEvent(analytics, AnalyticsNames.buttons, {
        content_type: "scroll to top",
        item_id: "scroll to top",
      });
    } catch {}
  };

  const openBroadcastClick = () => {

    if (!myUID) {
      history.push("/login");
      return;
    }

    if (blockBroadcast) {
      return;
    }

    if (!phoneNumber && getRegionState.includes("Singapore")) {
      if (!isPremium && (points ?? 0) < bindPhoneNumberLimit) {
        history.push("/bindphone");
        return;
      }
    }else if(phoneNumber && helper.isUSorUKPhoneNumber(phoneNumber)){
      const canSendRequest = isPremium || (points ?? 0) >= bindPhoneNumberLimit;
      if(!canSendRequest){
          history.push(`/wallet?v=${version}`);
          return;
      }
    }
    
    try {
      logEvent(analytics, AnalyticsNames.buttons, {
        content_type: "broadcast button",
        item_id: "BC button",
      });
    } catch {}



    setBroadcast(true);
  };

  const closeBroadcastClick = () => {
    setBroadcast(false);
  };

  const openCountryDialogClick = () => {
    setOpenCountryDialog(true);
  };

  const onCloseCountryDialogClick = () => {
    setOpenCountryDialog(false);
  };

  const msgCallBack = (msg: string) => {
    setPostRef(msg);
  };

  const serviceCallBack = (
    serviceType: ServiceType | undefined,
    serviceId: number | undefined
  ) => {
    setPostService([serviceType, serviceId]);
  };

  const getCard = useCallback(
    ({ index, data, width }: RenderComponentProps<Item | Dummy>) => {
      if (data.type === PostType.dummy) {
        //const item = data as Dummy
        //const [estimateHeight, w] = getEstimateHeight(width , item)

        return <DummyCard index={index} width={width} />;
      }

      const item = data as Item;
      //const [_height, _width] = getEstimateHeight( width , item)

      const dIndex = defaultIndex.current;

      const [_cat, _id] = Object.entries(
        serviceIndex.current ?? { cat: -1, id: undefined }
      )[0];

      return (
        <NewRentCard
          sortedBy={sortedByKeyIndex.current}
          serviceType={isNaN(dIndex) ? parseInt(_cat) : dIndex}
          serviceId={_id}
          index={index}
          width={width}
          item={item}
          openProfile={(serviceType, serviceId) => {
            openProfile(item, serviceType, serviceId);
          }}
          announcement={!NOTannouncementSession}
          postService={postService}
        />
      );
      // eslint-disable-next-line
    },
    // eslint-disable-next-line
    [postRef, postService]
  );

  const getSkeletonCard = useCallback(
    ({ index, data, width }: RenderComponentProps<any>) => {
      return <SkeletonCardView index={index} height={width} width={width} />;

    },
    // eslint-disable-next-line
    [dummyItems]
  );

  function resetLastCurrent() {
    last.current = undefined;
  }

  function isRentPage(): boolean {
    const end = helper.getURLEnd().toLowerCase();
    return end === "rent";
  }

  const fetchMoreItems = memoize(
    [{}, {}, {}],
    async (startIndex, stopIndex, currentItems) => {
      if (!isRentPage() && currentItems.length > _limit.current * 3) {
        return;
      }
      if (currentItems.length !== startIndex) {
        return;
      }

      // const lastDoc = currentItems[currentItems.length - 1]
      // console.log(lastDoc)
      // const fromValue =  lastDoc.time_stamp

      // if(!fromValue) {
      //   console.log("zxc")
      //   return
      // }

      const numberOfDocuments = stopIndex - startIndex;

      await getProfiles(
        db,
        raceIndex.current,
        genderIndex.current,
        last.current,
        numberOfDocuments,
        currentItems as Item[],
        false,
        false
      );
    }
  );

  const maybeLoadMore = useInfiniteLoader(fetchMoreItems);

  function calculateColCount(width: number): number {
    const count = Math.floor(width / 250);
    return count < 2 ? 2 : count;

    // const myNumber: number = Math.floor(width / 250); // replace someValue with the actual value you have
    // const minLimited = Math.max(2, myNumber);
    // const minAndMaxLimited = Math.min(5, minLimited);

    //return count
  }

  // hidden={hidden}
  // @ts-ignore
  // @ts-ignore
  return (
    <>
      <div hidden={hidden} id="scroll-whole-content" className="whole-content">
        {/* <WarningSign hidden={(!NOTannouncementSession || isAdminPage) ? true : false}/> */}

        <>
          {NOTannouncementSession && !isVerify && !isAdminPage && (
            <>
              {size.width > 600 ? (
                <FlexBox margin={1} maxHeight="494px">
                  <InfoGridBox width="150vw" minWidth="none" />
                  <FlexGap />
                  <MoreInfoSection isMobile={false} />
                </FlexBox>
              ) : (
                <Box margin={1}>
                  <InfoGridBox height="188px"  width="100%" minWidth="none" />
                  <br/>
                  <MoreInfoSection isMobile={false} />
                </Box>
              )}
            </>
          )}
        </>

        {NOTannouncementSession || isAdminPage ? null : (
          <Suspense fallback={<></>}>
            <AnnouncementHeader
              serviceCallBack={serviceCallBack}
              msgCallBack={msgCallBack}
              db={db}
              profiles={numberOfProfiles}
              removed={0}
              id={id}
            />
          </Suspense>
        )}


        <WhoIsFreeTodayView
          uid={uid}
          isAdminPage={isAdminPage}
          regionState={getRegionState}
          openProfile={openProfile}
        />

        {/* <NewUsersView 
          uid={uid}
          isAdminPage={isAdminPage}
          openProfile={openProfile}
        />

        <GamersView 
          uid={uid}
          isAdminPage={isAdminPage}
          openProfile={openProfile}
        /> */}

        <Box display="flex" flexDirection="column" marginBottom=".5rem">
          {favourites.length > 0 && !clubName && (
            <Box
              marginTop={1.2}
              marginLeft={
                size.width / 2 > favourites.length * 68
                  ? `calc(${size.width / 2}px - ${favourites.length * 68}px)`
                  : 0
              }
            >
              <SectionTitle>{t("favourites")}</SectionTitle>
            </Box>
          )}

          {!clubName && (
            <Box
              maxWidth={`${favourites.length * 150}px`}
              width={size.width}
              margin="0 auto"
            >
              <ScrollContainer
                ref={displayFavouritesRef}
                style={{ paddingTop: "8px" }}
                vertical={false}
                className="live-container horizontal-scroll"
              >
                {favourites.length > 0 && (
                  <DisplayFavourites
                    defaultCategory={
                      loadingIPAddress
                        ? undefined
                        : serviceIndex.current
                        ? Object.values(serviceIndex.current)[0]
                        : "-1"
                    }
                    defaultServiceType={
                      loadingIPAddress
                        ? undefined
                        : serviceIndex.current
                        ? Object.keys(serviceIndex.current)[0]
                        : ServiceType.meetup.toString()
                    }
                    // defaultCategory={
                    //   loadingIPAddress ? undefined :
                    //   splitter && splitter.length > 1 ? splitter[1] : "-1"
                    // }
                    // defaultServiceType={
                    //   loadingIPAddress ? undefined :
                    //   splitter && splitter.length > 1 ? splitter[0] : ServiceType.meetup.toString()
                    // }
                    isRefreshing={isRefreshing}
                    favourites={favourites}
                    onSelected={async (category, id, title) => {
                      if (serviceIndex.current) {
                        let [_cat, _id] = Object.entries(
                          serviceIndex.current
                        )[0];
                        if (
                          `${_cat}` === `${category}` &&
                          `${_id}` === `${id}`
                        ) {
                          return;
                        }
                      }

                      if (isRefreshing) {
                        return;
                      }

                      setRefreshing(true);
                      setNoMoreState(false);
                      setNoProfiles(false);

                      resetLastCurrent();

                      if (!category || !id || id === "-1" || id === "-2") {
                        serviceIndex.current = {
                          [parseInt(category ?? "-1")]: id ?? "-1",
                        };

                        setItems([]);
                        _limit.current = getLimit();
                        setAllCountries(
                          `${category}` !== `${ServiceType.meetup}`
                        );
                        await getProfiles(
                          db,
                          raceIndex.current,
                          genderIndex.current,
                          last.current,
                          _limit.current,
                          [],
                          true,
                          true
                        );
                        setRefreshing(false);
                        setTitle(title);
                        return;
                      }

                      const _category = parseInt(category) as ServiceType;
                      if (serviceIndex.current?.[_category] === id) {
                        setRefreshing(false);
                        return;
                      }

                      serviceIndex.current = { [_category]: id };

                      if (title) {
                        logEvent(analytics, "search", {
                          search_term: title,
                        });
                      }

                      setItems([]);

                      _limit.current = getLimit();

                      try {
                        await getProfiles(
                          db,
                          raceIndex.current,
                          genderIndex.current,
                          undefined,
                          _limit.current,
                          [],
                          true,
                          true
                        );
                        setAllCountries(_category !== ServiceType.meetup);
                        setTitle(title);
                      } catch (error) {
                        console.log(error);
                      }

                      setRefreshing(false);
                    }}
                  />
                )}
              </ScrollContainer>
            </Box>
          )}
        </Box>

        {NOTannouncementSession && (
          <FilterByPanel
            openMenu={openMenu}
            setMenu={(setter) => {
              setMenu(setter);
            }}
            title={favouritesTitle}
            getRegionState={
              defaultAllCountries ? ["All countries"] : getRegionState
            }
            value={
              defaultAllCountries ? "All countries" : getRegionState.toString()
            }
            openCountryDialogClick={openCountryDialogClick}
            onSearch={async () => {
              if (isRefreshing) return;

              setArea();

              if (regionState.current.length === 0) return;

              setRefreshing(true);
              setNoMoreState(false);
              setNoProfiles(false);

              try {
                resetLastCurrent();

                setItems([]);
                _limit.current = getLimit();

                await getProfiles(
                  db,
                  raceIndex.current,
                  genderIndex.current,
                  last.current,
                  _limit.current,
                  [],
                  true,
                  true
                );

                const hasEMeet = serviceIndex.current?.[ServiceType.eMeet];
                const hasGamers = serviceIndex.current?.[ServiceType.games];

                setAllCountries(!!hasEMeet || !!hasGamers);
              } catch (error) {
                console.log(error);
              }

              setRefreshing(false);
            }}
            onChange={(filters, sortKey) => {
              // setDeselected(prev => !prev)
              // serviceIndex.current = undefined

              let _gender: number = NaN;
              let _race: number = NaN;
              let _profile: number = NaN;
              let _default: number = NaN;

              filters.forEach((data) => {
                if (data.firebase === undefined) return;
                let value = data.firebase.valueOf() as any;
                // let index = (data.index).valueOf() as any

                switch (data.type) {
                  case filterType.gender:
                    _gender = value;
                    break;

                  case filterType.race:
                    _race = value;
                    break;

                  case filterType.profile:
                    _profile = value;
                    break;

                  case filterType.default:
                    _default = value;
                    break;
                }

                if (data.title) {
                  logEvent(analytics, "search", {
                    search_term: data.title,
                  });
                }
              });

              sortedByKeyIndex.current = sortKey;
              raceIndex.current = _race;
              genderIndex.current = _gender;
              profileIndex.current = _profile;
              defaultIndex.current = _default;
            }}
          />
        )}

        {NOTannouncementSession && !clubName && myUID && !isAdmin && (
          <>
            <Box position="fixed" bottom={0} right={78} zIndex={99}>
              <BroadcastList
                darkMode
                size="small"
                hasPending={(hasPending) => setHasPending(hasPending)}
              />
            </Box>
          </>
        )}

        {isLoyal && myUID && <LoyaltyHeader />}

        <main className="masonry-main">
          <div className="masonry-wrapper">
            {items.length > 0 ? (
              <Masonry
                items={items}
                // columnGutter={16}
                rowGutter={20}
                columnWidth={size.width}
                overscanBy={2}
                render={getCard}
                onRender={NOTannouncementSession ? maybeLoadMore : undefined}
                columnCount={calculateColCount(size.width)}
              />
            ) : null}

            {items.length > 0 ? null : noProfiles ? (
              <CenterFlexBox marginTop={15}>
                <Typography
                  align="center"
                  variant="caption"
                  color="text.secondary"
                >
                  No profiles for this selection.
                  <br />
                  Try searching another service or filter a different option
                  again.
                </Typography>
              </CenterFlexBox>
            ) : (
              <Masonry
                items={dummyItems}
                // columnGutter={8}
                // rowGutter={8}
                rowGutter={20}
                columnWidth={size.width}
                overscanBy={2}
                render={getSkeletonCard}
                columnCount={calculateColCount(size.width)}
              />
            )}

            {noMoreState && !noProfiles && (
              <CenterFlexBox margin={2}>
                <Typography variant="caption" color="text.secondary">
                  End
                </Typography>
              </CenterFlexBox>
            )}
          </div>
        </main>

        {noMoreState && !noProfiles ? (
          <></>
        ) : (
          <CenterFlexBox margin={2}>
            <CircularProgress color="secondary" size={14} />
          </CenterFlexBox>
        )}
      </div>

      <Modal open={showProfile} onClose={closeModal}>
        <div className="react-modal">
          <Suspense fallback={<LoadingScreen />}>
            <ProfilePage
              isPrivate={selectedItem?.isPrivate}
              fromModal={true}
              data={selectedItem}
              onClose={closeModal}
            />
          </Suspense>
        </div>
      </Modal>

      {myUID && openBroadcast && (
        <Suspense fallback={<LoadingScreen />}>
          <SendBroadcast
            open={openBroadcast}
            handleClose={closeBroadcastClick}
          />
        </Suspense>
      )}

      <Suspense fallback={<LoadingScreen />}>
        <CountriesDialog
          keepMounted
          open={openCountryDialog}
          onClose={onCloseCountryDialogClick}
          value={getRegionState.toString()}
        />
      </Suspense>

      {
      getRegionState.toString() === "Singapore" ? 
      !hidden &&
        NOTannouncementSession &&
        !clubName &&
        !blockBroadcast &&
        !isAdmin && (
          <BroadcastFAB
            hasPending={hasPending}
            openBroadcastClick={openBroadcastClick}
          />
        ) : <></>
      }

      {size.width < hideFilterButtonSize &&
        isRentPage() &&
        NOTannouncementSession && (
          <CenterFlexBox
            position="fixed"
            bottom={`${hasPending ? "calc(1rem + 48px + 4px)" : "calc(1rem)"}`}
            zIndex={11}
            left={hasPending ? 8 : "1rem"}
          >
            <FloatingFilterButton
              onClick={() => {
                try {
                  logEvent(analytics, AnalyticsNames.buttons, {
                    content_type: "filter btn btm",
                    item_id: "filter btn btm",
                  });
                } catch {}

                setMenu(!openMenu);
              }}
            />
          </CenterFlexBox>
        )}

      {showScrollToTop && (
        <CenterFlexBox
          flexDirection="column"
          position="fixed"
          right={
            isAdmin || !isRentPage() ? "1rem" : "calc(1rem + 28px - 16px - 6px)"
          }
          bottom={isAdmin || !isRentPage() ? "-6px" : isAdmin || getRegionState.toString() !== "Singapore" ? "-6px" : "52px"}
          onClick={scrollToTop}
          zIndex={99}
          sx={{
            transform: "translate(0, -50%)",
            cursor: "pointer",
          }}
        >
          <CenterFlexBox
            padding={2}
            bgcolor="black"
            sx={{
                width: !isAdmin && getRegionState.toString() === "Singapore" ? 21 : 44, 
                height: !isAdmin && getRegionState.toString() === "Singapore" ? 21 : 44, 
                borderRadius: 999999
            }}
          >
            <img
              width={!isAdmin && getRegionState.toString() === "Singapore" ? 12 : 16}
              height={!isAdmin && getRegionState.toString() === "Singapore" ? 12 : 16}
              src="https://images.rentbabe.com/assets/flaticon/gotop.svg"
              alt=""
            />
          </CenterFlexBox>
        </CenterFlexBox>
      )}
    </>
  );
};

export default RentPage;
