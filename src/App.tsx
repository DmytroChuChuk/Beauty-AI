/* eslint-disable */
import { FC, lazy, Suspense, useEffect, useState } from "react";
import "./css/index.scss";

import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Redirect, Route, Router, Switch } from "react-router-dom";
import branch from "branch-sdk";

import history from "./utility/history";
import { version } from "./version/basic";

import { green, red } from "@mui/material/colors";
import { admin, clubs, hasCreditDocument, pageArea } from "./keys/localStorageKeys";

import {
  balance,
  block,
  block_bc,
  clientRecords,
  club,
  clubs as clubsKey,
  CREDIT,
  email,
  income,
  ipAddress,
  name,
  penalty,
  pending,
  points,
  PREMIUM,
  premium,
  priceLimit,
  rbac,
  referral,
  state as stateKey,
} from "./keys/firestorekeys";

import { useCenterSnackBar, useClubAdmin, useCurrentAudio } from "./store";
import { auth, db } from "./store/firebase";

import { onAuthStateChanged, User } from "firebase/auth";
import { parsePhoneNumber } from "libphonenumber-js";
import { RBAC } from "./enum/MyEnum";
import { country, myUid, phoneNumber, timer } from "./keys/localStorageKeys";

import { doc, onSnapshot } from "firebase/firestore";
import shallow from "zustand/shallow";
import CenterSnackBar from "./chats/components/Snackbar/CenterSnackBar";
import MyAppBar from "./components/MyAppBar";
import BanAlert from "./components/Notifications/BanAlert";
import { PriceLimitProps } from "./components/Services/PriceLimit";
import { useDocumentQuery } from "./hooks/useDocumentQuery";
import { useGetUserData } from "./hooks/useGetUserData";
import useOnlineStatus from "./hooks/useOnlineStatus";
import { ClubsRBAC } from "./keys/props/common";
import BindPhoneNumberPage from "./pages/BindPhoneNumberPage";
import DDInvitePage from "./pages/DDInvitePage";
import { RBACType, useUser } from "./store";
import { Helper } from "./utility/Helper";
import { ProfileHelper } from "./utility/ProfileHelper";

// import VoiceRule from './components/Dialogs/Rule/VoiceRule'
//import DashboardPage from './pages/DashboardPage'

const GamingRule = lazy(() => import("./pages/rule/GamingRule"));
const VoiceRule = lazy(() => import("./pages/rule/VoiceRule"));
const ChatView = lazy(() => import("./chats/components/Chat/ChatView"));
const DashboardPage = lazy(() => import("./pages/agency/DashboardPage"));
const AttireRulePage = lazy(() => import("./pages/rule/AttireRule"));
const SuccessCheckout = lazy(
  () => import("./components/Stripe/SuccessCheckout")
);
const PrivacyPage = lazy(() => import("./pages/policy/PrivacyPage"));
const StripeCheckOutForm = lazy(
  () => import("./components/Subscription/StripeCheckOutForm")
);
const TrackInvitesPage = lazy(() => import("./pages/TrackInvitesPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const Page = lazy(() => import("./pages/Page"));
const StripeCheckout = lazy(() => import("./components/Stripe/StripeCheckout"));
const ReviewPage = lazy(() => import("./pages/ReviewPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const WalletPage = lazy(() => import("./pages/coin/WalletPage"));
const CreditPage = lazy(() => import("./pages/coin/CreditPage"));
const SessionPage = lazy(() => import("./pages/SessionPage"));
const AttirePolicy = lazy(() => import("./pages/policy/AttirePolicy"));
const Refund = lazy(() => import("./pages/Refund"));
const ReportAnnouncementPage = lazy(
  () => import("./pages/misc/ReportAnnouncementPage")
);
const ChooseServices = lazy(
  () => import("./components/Services/ChooseServices")
);
const PriceLimit = lazy(() => import("./components/Services/PriceLimit"));
const AllChats = lazy(() => import("./pages/admin/AllChats"));
const MyTalentPage = lazy(() => import("./pages/agency/MyTalentPage"));

// Update the Button's color options to include a violet option
declare module "@mui/material/styles" {
  interface Palette {
    yellow: Palette["primary"];
  }

  interface PaletteOptions {
    yellow?: PaletteOptions["primary"];
  }
}
declare module "@mui/material/Button" {
  // Augment the palette to include a violet color

  interface ButtonPropsColorOverrides {
    yellow: true;
  }
}
const yellowBase = "#FFED34";
const theme = createTheme({
  
  typography: {
    fontFamily: ["Roboto", "Helvetica Neue", "sans-serif"].join(","),
    h2:{
      fontFamily: "Helvetica Neue",
      fontSize: "14px",
      fontWeight: 500,
      lineHeight: 1.2,
      textAlign: "left",
      color:"#1A1A1A"
    }
  },
  palette: {
    primary: {
      main: "#ffffff",
    },
    secondary: {
      main: "#2196f3",
    },
    warning: {
      main: "#FFA928",
      contrastText: "#ffffff",
    },
    success: {
      main: green[500],
      contrastText: "#ffffff",
    },
    error: {
      main: red[500],
    },
    yellow: {
      main: yellowBase,
    },
  },
  
});

const App: FC = () => {
  useOnlineStatus();

  const REFERRER_STORAGE_KEY = "referringUserID";

  const helper = new Helper();
  const state = helper.getQueryStringValue("state");

  const setCurrentAudio = useCurrentAudio((state) => state.setCurrentAudio);
  // const setCurrentSoundEffect = useSoundEffect((state) => state.setCurrentSoundEffect)
  const setCurrentUser = useUser((state) => state.setCurrentUser);
  const setCenterSnackbar = useCenterSnackBar(
    (state) => state.setCurrentSnackbar
  );
  const setClubAdmin = useClubAdmin((state) => state.setClubAdmin);

  const [open, message] = useCenterSnackBar(
    (state) => [state?.currentSnackbar?.open, state?.currentSnackbar?.message],
    shallow
  );

  const [myUUID, amIBlock, isPremium, myCountry, currentUser] = useUser(
    (state) => [
      state.currentUser?.uid,
      state.currentUser?.isBlock,
      state.currentUser?.isPremium,
      state.currentUser?.countryCode,
      state.currentUser,
    ],
    shallow
  );

  const [user, setUser] = useState<User | null>(null);
  const { loading, error, data: userData } = useGetUserData(myUUID);
  const { data: walletData } = useDocumentQuery(
    `${myUUID}-balance-main`,
    myUUID ? doc(db, CREDIT, myUUID ?? "empty") : undefined
  );

  const [bannedReason, setReason] = useState<string>();

  useEffect(() => {
    if (!walletData) {
      return;
    }

    if (walletData && walletData.exists()) {
      const pointsValue = (walletData.data()[points] as number) ?? 0;
      const balanceValue = (walletData.data()[balance] as number) ?? 0;
      const penaltyValue = (walletData.data()[penalty] as number) ?? 0;
      const incomeValue = (walletData.data()[income] as number) ?? 0;
      const pendingValue = (walletData.data()[pending] as number) ?? 0;
      const referralValue = (walletData.data()[referral] as number) ?? 0;

      setCurrentUser({
        hasCreditDocument: true,
        points: pointsValue,
        balance: balanceValue,
        penaltyCredits: penaltyValue,
        incomeCredits: incomeValue,
        pendingCredits: pendingValue,
        referralCredits: referralValue,
      });

      localStorage.setItem(hasCreditDocument, "true");
      localStorage.setItem(penalty, `${penaltyValue}`);
      localStorage.setItem(points, `${pointsValue}`);
      localStorage.setItem(balance, `${balanceValue}`);
      localStorage.setItem(income, `${incomeValue}`);
      localStorage.setItem(pending, `${pendingValue}`);
      localStorage.setItem(referral, `${referralValue}`);
    } else {
      setCurrentUser({
        hasCreditDocument: false,
        points: 0,
        balance: 0,
        penaltyCredits: 0,
        incomeCredits: 0,
        pendingCredits: 0,
        referralCredits: 0,
      });

      localStorage.removeItem(hasCreditDocument);
      localStorage.removeItem(referral);
      localStorage.removeItem(pending);
      localStorage.removeItem(income);
      localStorage.removeItem(penalty);
      localStorage.removeItem(points);
      localStorage.removeItem(balance);
    }
  }, [walletData]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let unsub: any = null;
    let unsubListener: any = null;

    unsub = onAuthStateChanged(auth, async (user) => {
      const nowUid = user?.uid;
      const myEmail = user?.email;
      const myPhoneNumber = user?.phoneNumber;

      setUser(user);

      // if(!myPhoneNumber && user){
      //   history.push("/bindphone")
      // }

      if (myEmail) {
        localStorage.setItem(email, myEmail);
        setCurrentUser({ email: myEmail });
      } else {
        localStorage.removeItem(email);
        setCurrentUser({ email: undefined });
      }

      if (myPhoneNumber) {
        setCurrentUser({ phoneNumber: myPhoneNumber });
        localStorage.setItem(phoneNumber, myPhoneNumber);

        if (!myCountry) {
          const _country = parsePhoneNumber(myPhoneNumber).country;
          setCurrentUser({ countryCode: _country });

          if (_country) localStorage.setItem(country, _country);
          else localStorage.removeItem(country);
        }
      } else {
        localStorage.removeItem(phoneNumber);
        //localStorage.removeItem(country)
        setCurrentUser({ phoneNumber: undefined });
      }

      if (!nowUid) {
        setCurrentUser({
          uid: undefined,
          isPremium: false,
          userRBAC: undefined,
        });

        localStorage.setItem(timer, "0");
        localStorage.removeItem(rbac);
        localStorage.removeItem(myUid);
      } else {
        helper.recentlyActive(currentUser);

        localStorage.setItem(myUid, nowUid);
        setCurrentUser({ uid: nowUid });

        unsubListener = onSnapshot(doc(db, PREMIUM, nowUid), (snapShot) => {
          const _isPremium = snapShot.get(premium) as boolean;
          if (!_isPremium && isPremium) {
            window.location.reload();
          }

          const _block = snapShot.get(block);
          const _bannedReason = _block?.n;
          const _blockBroadcast = snapShot.get(block_bc) as boolean;

          // RBAC owner page, display list
          const _rbac = snapShot.get(rbac) as RBACType;
          const _clubsRBAC = snapShot.get(clubsKey) as ClubsRBAC | undefined;

          const isBlock = _block ? true : false;
          const isBlockBroadcast = _blockBroadcast ? true : false;

          const _clientRecords = (snapShot.get(clientRecords) as number) ?? 0;

          var firstClubName = undefined;
          var clubRBAC = undefined;

          if (_clubsRBAC) {
            const keyValue = Object.values(_clubsRBAC);
            if (keyValue.length > 0) {
              const value = keyValue[0];
              firstClubName = value.name;
              clubRBAC = value.rbac;
            }
          }

          if (_bannedReason) {
            setReason(_bannedReason);
          }

          setCurrentUser({
            clientRecords: _clientRecords,
            isPremium: _isPremium,
            isBlock: isBlock,
            userRBAC: _rbac ?? RBAC.user,
            blockBroadcast: isBlockBroadcast,
          });

          setClubAdmin({
            clubName: firstClubName,
            clubRBAC: clubRBAC,
          });

          if (_blockBroadcast) localStorage.setItem(block_bc, "1");
          else localStorage.removeItem(block_bc);

          if (firstClubName)
            localStorage.setItem(`${admin}.${club}.${name}`, firstClubName);
          else localStorage.removeItem(`${admin}.${club}.${name}`);

          if (clubRBAC)
            localStorage.setItem(`${admin}.${club}.${rbac}`, clubRBAC);
          else localStorage.removeItem(`${admin}.${club}.${rbac}`);

          if (_rbac) localStorage.setItem(rbac, _rbac);
          else localStorage.removeItem(rbac);

          localStorage.setItem(myUid, nowUid);
          localStorage.setItem(clientRecords, _clientRecords.toString());
          localStorage.setItem(timer, _isPremium ? "1" : "0");

          if (isBlock) localStorage.setItem(block, "1");
          else localStorage.removeItem(block);
        });
      }
    });

    return () => {
      unsub?.();
      unsubListener?.();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const profileHelper = new ProfileHelper();
    profileHelper.updateUserProfile(userData, setCurrentUser);
  }, [userData]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const branchKey = process.env.REACT_APP_BRANCH_IO_KEY || '';
    branch.init(branchKey, {}, function(err, data: any) {
      const referringUserID = data?.data_parsed?.referringUserID;

        if(referringUserID){
            sessionStorage.setItem(REFERRER_STORAGE_KEY, referringUserID)
        }
    });
  }, []);

  async function storeIP() {
    try {
      const ipCallBack = await fetch("https://api.ipify.org/?format=json");
      const json = await ipCallBack.json();
      const ip = json["ip"];

      if (ip) {
        localStorage.setItem(ipAddress, ip);
        setCurrentUser({ ipaddress: ip });
      } else {
        localStorage.removeItem(ipAddress);
        setCurrentUser({ ipaddress: null });
      }
    } catch (error) {
      console.log(error);
    }
  }

  function storePagesInfo(page: string, country: string) {
    // const params = props.match.params
    const _data = `${page}:${country}`;
    const _clubs = localStorage.getItem(clubs);
    const clubArray = _clubs?.split(",") ?? [];

    if (!clubArray.includes(_data)) {
      clubArray.push(_data);
      console.log(clubArray.join(","));
      localStorage.setItem(clubs, clubArray.join(","));
    }

    sessionStorage.setItem(club, page);
    sessionStorage.setItem(stateKey, country);
  }

  useEffect(() => {
    // const array = udata as {[key: string]: any}[]

    // for (let index = 0; index < array.length; index++) {
    //   const element = array[index];

    //   console.log(element)
    //   let userUID = element["uid"] as string

    //   if(!userUID){
    //     continue
    //   }

    //   setDoc(doc(db, USERS, userUID), element, {merge: true})
    //   // for(const [key, value] of Object.entries(element)){

    //   //   console.log(key)
    //   //   console.log(value)

    //   // }

    // }

    // getDocs(query(collection(db, USERS)
    // , where("a", "==" , true)
    // , limit(30))).then((snapshot) => {

    //   let srt = "["

    //   for (let index = 0; index < snapshot.docs.length; index++) {
    //     const doc = snapshot.docs[index];

    //     const json = doc.data()
    //     srt += JSON.stringify(json) + (index === (snapshot.docs.length - 1) ? "" : ",")

    //   }

    //   srt += "]"

    //   const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(srt);
    //   setDataStr(dataStr)

    //   // var dlAnchorElem = document.getElementById('downloadAnchorElem');
    //   // dlAnchorElem?.setAttribute("href",     dataStr     );
    //   // dlAnchorElem?.setAttribute("download", "users2.json");
    //   // dlAnchorElem?.click();

    // })

    // const _area = localStorage.getItem(area)
    // localStorage.setItem(area, "Kuala Lumpur, Malaysia")

    try {
      const url = window.location.href.split("=")[0];
      if (url === "https://ebuddy.gg?uid") {
        // do nothing, let dyamiclink do the work
      } else if (window.location.origin === "https://ebuddy.gg") {
        window.location.href = "https://www.ebuddy.gg";
      }
    } catch (err) {
      console.log(err);
    }

    storeIP();
    // eslint-disable-next-line
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Suspense fallback={<></>}>
        <Router history={history}>
          {amIBlock && <BanAlert bannedReason={bannedReason} />}

          <audio
            id="audio"
            className="auto-audio"
            autoPlay
            loop={false}
            onPause={() => {
              setCurrentAudio({ voiceUrl: undefined });
            }}
            onEnded={() => {
              setCurrentAudio({ voiceUrl: undefined });
            }}
          >
            <source type="audio/ogg" />
            <source type="audio/mpeg" />
            <source type="audio/webm" />
            <source type="audio/mp3" />
            <source type="audio/wav" />
          </audio>

          <audio
            id="sound-effect"
            className="auto-audio"
            autoPlay
            loop={false}
          />

          {amIBlock ? (
            <MyAppBar />
          ) : (
            <Switch>
              <Route
                path="/page/:name"
                render={() => {
                  return (
                    <Page userData={userData} loading={loading} error={error} />
                  );
                }}
                exact
              />

              <Route
                path="/:country/:page"
                render={(props) => {
                  const params = props.match.params;
                  storePagesInfo(params.page, params.country);

                  localStorage.removeItem(pageArea);

                  window.location.href = `${window.location.origin}/page/Rent?v=${version}`;

                  return <></>;
                }}
                exact
              />

              <Route
                path="/:country/:page/apply"
                render={(props) => {
                  const params = props.match.params;
                  storePagesInfo(params.page, params.country);

                  localStorage.removeItem(pageArea);

                  window.location.href = `${window.location.origin}/page/admission?v=${version}`;

                  return <></>;
                }}
                exact
              />

              <Route
                path="/bindphone"
                render={() => {
                  return <BindPhoneNumberPage user={user} />;
                }}
                exact
              />

              <Route path="/trackinvites" component={TrackInvitesPage} exact />
              <Route path="/dashboard" component={DashboardPage} exact />
              <Route path="/login" component={LoginPage} exact />
              <Route path="/attirepolicy" component={AttirePolicy} exact />
              <Route path="/attirerule" component={AttireRulePage} exact />
              <Route path="/voicerule" component={VoiceRule} exact />
              <Route path="/gamingrule" component={GamingRule} exact />
              <Route
                path="/reportbroadcast"
                component={ReportAnnouncementPage}
                exact
              />

              <Route path="/privacy" component={PrivacyPage} exact />

              <Route
                path="/Terms"
                render={() => {
                  window.location.href =
                    "https://rentbabe.com/page/terms%20of%20service";
                  return null;
                }}
              />

              <Route path="/feedback" component={ReviewPage} exact />

              <Route path="/subscribe" component={StripeCheckOutForm} exact />

              <Route path="/profile" component={ProfilePage} exact />
              <Route
                path="/:country/:page/profile"
                render={(props) => {
                  const params = props.match.params;
                  storePagesInfo(params.page, params.country);
                  const uid = window.location.href.getQueryStringValue("uid");

                  window.location.href = `${window.location.origin}/profile?uid=${uid}`;
                  return null;
                }}
                exact
              />

              <Route
                path="/checkout/payment"
                component={StripeCheckout}
                exact
              />
              <Route path="/chatview" component={ChatView} exact />
              <Route path="/allchats" component={AllChats} exact />

              <Route
                path="/services"
                render={() => {
                  return (
                    <ChooseServices
                      loadingUserData={loading}
                      userData={userData}
                    />
                  );
                }}
                exact
              />

              <Route
                path="/pricelimit"
                render={() => {
                  return (
                    <PriceLimit
                      loading={loading}
                      value={
                        userData?.get(priceLimit) as PriceLimitProps | undefined
                      }
                    />
                  );
                }}
                exact
              />

              <Route path="/success" component={SuccessCheckout} exact />
              <Route path="/verify" component={SuccessCheckout} exact />
              <Route path="/telenotify" component={SuccessCheckout} exact />
              <Route path="/wallet" component={WalletPage} exact />
              <Route path="/credit" component={CreditPage} exact />
              <Route path="/trade" component={SessionPage} exact />
              <Route path="/refund" component={Refund} exact />
              <Route path="/invite" component={DDInvitePage} exact />
              <Route path="/talents" component={MyTalentPage} exact />

              <Route
                path="/page/About"
                render={() => {
                  window.location.href = "https://rentbabe.com/page/FAQ";
                  return null;
                }}
              />

              <Redirect
                from="/"
                to={`/page/rent?v=${version}${state ? `&state=${state}` : ""}`}
                exact
              />
            </Switch>
          )}

          <CenterSnackBar
            open={open}
            message={message}
            autoHideDuration={2000}
            onClose={() => setCenterSnackbar({ open: false })}
          />
        </Router>
      </Suspense>
    </ThemeProvider>
  );
};

export default App;

// eslint-disable-next-line no-extend-native
String.prototype.capitalize = function () {
  if (!this) return "";

  return this.charAt(0).toUpperCase() + this.slice(1);
};

// eslint-disable-next-line no-extend-native
String.prototype.toCloudFlareURL = function () {
  let url = this;
  if (!url) return "";

  let get = url.split("/");

  if (get.length > 2) {
    if (get[2] === "images.rentbabe.com") return `${url}`;
  }

  let last = get[get.length - 1];
  let baseURI = `https://images.rentbabe.com/`;

  let path = "";
  const folders = last.split("%2F");
  for (let index = 0; index < folders.length; index++) {
    const folder = folders[index];
    path += `${folder}${index === folders.length - 1 ? "" : "/"}`;
  }
  
  function getURLQueryStringValue(url: string, key: string) {
    //eslint-disable-next-line no-useless-escape
    return decodeURIComponent(
      url.replace(
        new RegExp(
          "^(?:.*[&\\?]" +
            encodeURIComponent(key).replace(/[\.\+\*]/g, "\\$&") +
            "(?:\\=([^&]*))?)?.*$",
          "i"
        ),
        "$1"
      )
    );
  }

  const rentbh = getURLQueryStringValue(path, "rentbh");
  const rentbw = getURLQueryStringValue(path, "rentbw");
  const time = getURLQueryStringValue(path, "t");

  const myPath = path.split("?")[0];
  const queryWidth = rentbw ? `&rentbw=${rentbw}` : "";
  const queryHeight = rentbh ? `&rentbh=${rentbh}` : "";
  const queryTime = time ? `&t=${time}` : "";

  const finalURL = `${baseURI}${myPath}?${queryHeight}${queryWidth}${queryTime}`; //baseURI + path.split("?")[0] + `?rentbh=${rentbh}&rentbw=${rentbw}` + `${time ? `&t=${time}` : ''}`
  return finalURL;
};

// eslint-disable-next-line no-extend-native
String.prototype.getQueryStringValue = function (key: string) {
  let text = this;
  if (!text) return undefined;

  const url = new URL(text.toString());
  return url.searchParams.get(key) ?? "";
};

// eslint-disable-next-line no-extend-native
String.prototype.bubbleMessage = function () {
  let text = this;
  if (!text) return text;

  // http://, https://, ftp://
  var urlPattern =
    /\b(?:https?|ftp):\/\/[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|]/gim; //eslint-disable-line

  // www. sans http:// or https://
  var pseudoUrlPattern = /(^|[^\/])(www\.[\S]+(\b|$))/gim; //eslint-disable-line

  // Email addresses
  var emailAddressPattern = /[\w.]+@[a-zA-Z_-]+?(?:\.[a-zA-Z]{2,6})+/gim; //eslint-disable-line

  return this.replace(
    urlPattern,
    '<a class="break-all" target="_blank" href="$&">$&</a>'
  )
    .replace(
      pseudoUrlPattern,
      '$1<a class="break-all" target="_blank"  href="http://$2">$2</a>'
    )
    .replace(
      emailAddressPattern,
      '<a class="break-all" target="_blank"  href="mailto:$&">$&</a>'
    )
    .replace(/(?:\r\n|\r|\n)/g, "<br>");
};

// eslint-disable-next-line no-extend-native
String.prototype.shorten = function (limit) {
  const title = this.toString();
  return title.length > limit ? title.substring(0, limit) + "..." : title;
};

// eslint-disable-next-line no-extend-native
String.prototype.srcSetConvert = function () {
  if (!this) return undefined;
  const last = this.split("/").pop();
  if (!last) return undefined;

  const lastName = last.split("%2F").pop();
  if (!lastName) return undefined;

  const sizes = [150, 240, 320, 480, 640];

  let srcSet = "";
  sizes.forEach((size) => {
    const newLastName = `thumb%40${size}_${lastName}`;
    const newFullURL = this.replace(lastName, newLastName);
    srcSet += `${newFullURL} ${size}w,`;
  });

  return srcSet;
};

// eslint-disable-next-line no-extend-native
String.prototype.getWidthHeight = function () {
  let text = this;
  if (!text)
    return {
      width: 0,
      height: 0,
    };

  const key1 = "rentbw";
  const key2 = "rentbh";

  function getKey(url: string, key: string) {
    // eslint-disable-next-line
    return decodeURIComponent(
      url.replace(
        new RegExp(
          "^(?:.*[&\\?]" +
            encodeURIComponent(key).replace(/[\.\+\*]/g, "\\$&") +
            "(?:\\=([^&]*))?)?.*$",
          "i"
        ),
        "$1"
      )
    );
  }

  const width = parseInt(getKey(this.toString(), key1));
  const height = parseInt(getKey(this.toString(), key2));

  return {
    width: width,
    height: height,
  };
};

// eslint-disable-next-line no-extend-native
Date.prototype.addDays = function (days) {
  var date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
};

// eslint-disable-next-line no-extend-native
Date.prototype.addMinutes = function (minutes) {
  return new Date(this.getTime() + minutes * 60000);
};

// eslint-disable-next-line no-extend-native
Date.prototype.addSeconds = function (seconds) {
  return new Date(this.getTime() + seconds * 1000);
};

// eslint-disable-next-line no-extend-native
Date.prototype.getNumberOfHoursAgo = function () {
  if (!this) return 0;

  const today = new Date();

  const timeinmilisec = today.getTime() - this.getTime();

  const num = Math.floor(timeinmilisec / (1000 * 60 * 60));

  return num;
};

// eslint-disable-next-line no-extend-native
Array.prototype.shuffle = function () {
  let array = this;
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex !== 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
};

// eslint-disable-next-line no-extend-native
String.prototype.isURLVideo = function () {
  return (
    this?.split("?")[0]
      .toLowerCase()
      .match(/\.(mp4|mov|webm|avi|wmv|mkv)$/) !== null
  );
};

// eslint-disable-next-line no-extend-native
String.prototype.getURLEnd = function () {
  const last = decodeURIComponent(this.split("/").pop() ?? "");
  if (last.length === 0) {
    return "";
  }

  const endings = last.split("?")[0];
  return endings.toLowerCase();
};
// eslint-disable-next-line no-extend-native
String.prototype.includesInWords = function (word) {
  const filter = this.trim()
    .replaceAll("?", "")
    .replaceAll(".", "")
    .replaceAll("!", "");
  const trimmed = word.trim();
  let word1 = ` ${trimmed} `;
  let word2 = ` ${trimmed}`;
  let word4 = `${trimmed} `;

  // console.log([
  //   word1, word2, word3, word4
  // ].some(substring=>{

  //   console.log(`substring: ${substring}`)

  //   return this.includes(substring)
  // }))

  if (filter.indexOf(" ") >= 0) {
    return [word1, word2, word4].some((substring) =>
      filter.includes(substring)
    );
  } else {
    return [word1, word2, word4, trimmed].some((substring) =>
      filter.trim().includes(substring)
    );
  }
};

// eslint-disable-next-line no-extend-native
Date.prototype.timeSince = function (addAgo) {
  const date = this as any;
  const now: any = new Date();

  var seconds = Math.floor((now - date) / 1000);

  var interval = seconds / 31536000;

  if (interval > 1) {
    const num = Math.floor(interval);
    return `${num} year${num === 1 ? "" : "s"}${addAgo ? " ago" : ""}`;
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    const num = Math.floor(interval);
    return `${num} month${num === 1 ? "" : "s"}${addAgo ? " ago" : ""}`;
  }
  interval = seconds / 86400;
  if (interval > 1) {
    const num = Math.floor(interval);
    return `${num} day${num === 1 ? "" : "s"}${addAgo ? " ago" : ""}`;
  }
  interval = seconds / 3600;
  if (interval > 1) {
    const num = Math.floor(interval);
    return `${num} hour${num === 1 ? "" : "s"}${addAgo ? " ago" : ""}`;
  }
  interval = seconds / 60;
  if (interval > 1) {
    const num = Math.floor(interval);
    return `${num} minute${num === 1 ? "" : "s"}${addAgo ? " ago" : ""}`;
  }

  return "Recently"; //Math.floor(seconds) + " seconds";
};

// eslint-disable-next-line no-extend-native
Date.prototype.getEstimatedBankTransferDate = function () {
  const date = this;

  const hours = date.getHours();

  var cache = date;
  cache.setHours(15, 0, 0, 0);

  if (hours >= 10) {
    cache = cache.addDays(1);
  }
  // else{
  //     cache = cache.addDays(1)
  // }

  return cache
    .toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      hour12: true,
    })
    .replace(" at ", ", ");
};
