import {
  Timestamp,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { FC, useEffect, useRef, useState } from "react";
import { PostType } from "../../enum/MyEnum";
import {
  USERS,
  admin,
  club,
  end,
  geoEncodings,
} from "../../keys/firestorekeys";
import { Item } from "../../keys/props/profile";
import { db } from "../../store/firebase";
import { Helper } from "../../utility/Helper";
import { HorizontalCardList } from "../HorizontalCardList/HorizontalCardList";
import { useTranslation } from "react-i18next";

interface props {
  uid: string | null | undefined;
  isAdminPage: boolean;
  regionState: string[];
  openProfile: (item: Item) => void;
}

const WhoIsFreeTodayView: FC<props> = ({
  uid,
  isAdminPage,
  regionState,
  openProfile,
}) => {
  const helper = new Helper();
  const now = new Date();
  var midnight = useRef<Date>(new Date(now));
  var today = useRef<Date>(new Date(now));

  const NOTannouncementSession = helper.getQueryStringValue("session") === ""
  
  const TODAYLimit = Math.ceil(window.innerWidth / (120 + 16)) + 2;

  const clubName = sessionStorage.getItem(club);
  const refreshingTODAY = useRef<boolean>(false);

  const [goNow, setGoNow] = useState<Item[]>([]);

  const { t } = useTranslation();

  useEffect(() => {
    refreshingTODAY.current = false;
    // eslint-disable-next-line
  }, [goNow]);

  useEffect(() => {
    helper.setTodayMidnightHours(midnight.current);
    if (NOTannouncementSession) {
      getTODAY(regionState);
    }
    // eslint-disable-next-line
  }, [regionState]);

  async function getTODAY(states: string[]) {
    if (refreshingTODAY.current || clubName || states.length === 0) {
      return;
    }
    refreshingTODAY.current = true;

    const goNowItems: Item[] = goNow;
    const state = states[states.length - 1];

    const docRef = query(
      collection(db, USERS),
      where(geoEncodings, "array-contains", state),
      where(admin, "==", true),
      where(end, ">", Timestamp.fromDate(today.current)),
      where(end, "<", Timestamp.fromDate(midnight.current)),
      limit(TODAYLimit),
      orderBy(end, "asc")
    );

    const snap = await getDocs(docRef);

    if(snap.docs.length < 5){
      return;
    }

    for (const doc of snap.docs) {
      const item = helper.addItems(doc, false, PostType.gonow);
      goNowItems.push(item);
    }

    const lastDoc = snap.docs.slice(-1)[0];
    if (lastDoc) {
      today.current = (lastDoc.get(end) as Timestamp).toDate();
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
      getTODAY(regionState)
    }
  }

  //if(!regionState.includes("Singapore")) return null

  if(goNow.length === 0 || isAdminPage) return null

  else return (
    <div
    style={{ paddingTop: uid ? "16px" : "8px" }}
  >
      <HorizontalCardList
        items={goNow}
        onScroll={loadMoreRightEndListener}
        onNext={() => getTODAY(regionState)}
        title={`${t("ava.today")} ⚡️`}
        openProfile={openProfile}
      />
    </div>
  );
};

export default WhoIsFreeTodayView;
