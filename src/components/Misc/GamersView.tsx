import { FC, useEffect, useRef, useState } from "react";
import {
  Timestamp,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
  QueryConstraint
} from "firebase/firestore";
import { PostType } from "../../enum/MyEnum";
import {
  USERS,
  admin,
  club,
  time_stamp,
  services,
  id,
  gender,
} from "../../keys/firestorekeys";
import { Item } from "../../keys/props/profile";
import { db } from "../../store/firebase";
import { Helper } from "../../utility/Helper";
import { HorizontalCardList } from "../HorizontalCardList/HorizontalCardList";
import { ServiceType } from "../../keys/props/services";
import { useTranslation } from "react-i18next";

interface props {
  uid: string | null | undefined;
  isAdminPage: boolean;
  openProfile: (item: Item) => void;
}

const GamersView: FC<props> = ({
  uid,
  isAdminPage,
  openProfile,
}) => {

  const helper = new Helper();
  const today = useRef<Date>();

  const isAnnouncementPage = helper.getQueryStringValue("session") !== ""
  
  const TODAYLimit = Math.ceil(window.innerWidth / (120 + 16)) + 2;

  const clubName = sessionStorage.getItem(club);
  const refreshingTODAY = useRef<boolean>(false);

  const [goNow, setGoNow] = useState<Item[]>([]);

  const { t } = useTranslation();

  useEffect(() => {
    getTODAY()
    // eslint-disable-next-line
  }, []);

  async function getTODAY() {
    if (refreshingTODAY.current || clubName) {
      return;
    }
    refreshingTODAY.current = true;

    const goNowItems: Item[] = goNow;

    const queries: QueryConstraint[] = [
      where(admin, "==", true), 
      where(gender, "==", 1), 
      where(`${services}.${ServiceType.games}.${id}`, "==", `${ServiceType.games}`), 
      orderBy(time_stamp, "desc"), 
      limit(TODAYLimit)
    ]

    if(today.current){
      queries.push(where(time_stamp, "<", Timestamp.fromDate(today.current)))
    }

    const docRef = query(
      collection(db, USERS),
      ...queries
    );

    const snap = await getDocs(docRef);
    refreshingTODAY.current = false;

    for (const doc of snap.docs) {
      const item = helper.addItems(doc, false, PostType.gonow);
      goNowItems.push(item);
    }

    const lastDoc = snap.docs.slice(-1)[0];
    if (lastDoc) {
      today.current = (lastDoc.get(time_stamp) as Timestamp).toDate();
    }
    const numberOfProfiles = snap.docs.length;
    if (numberOfProfiles !== 0) {
      setGoNow([...goNowItems]);
    }
  }

  function loadMoreRightEndListener(e?: any) {

    // console.log(event.scrollContainer.current)
    const event = e?.scrollContainer?.current
    if(!event) return

    const scrollLeft = event.scrollLeft
    const scrollWidth = event.scrollWidth

    if (300 > scrollWidth - scrollLeft - event.clientWidth && !refreshingTODAY.current) {
      getTODAY()
    }
  }

  //if(!regionState.includes("Singapore")) return null

  if(goNow.length === 0 || isAdminPage || isAnnouncementPage) return null

  else return (
    <div
    style={{ paddingTop: uid ? "16px" : "8px" }}
  >
      <HorizontalCardList
        items={goNow}
        serviceType={ServiceType.games}
        onScroll={loadMoreRightEndListener}
        onNext={() => getTODAY()}
        title={t("gamers")}
        openProfile={openProfile}
      />
    </div>
  );
};

export default GamersView;
