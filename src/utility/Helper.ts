/* eslint-disable */
import {
    DocumentData,
    DocumentSnapshot,
    QueryDocumentSnapshot,
    Timestamp,
    deleteField,
    doc,
    serverTimestamp,
    updateDoc,
} from "firebase/firestore";
import parsePhoneNumber from "libphonenumber-js";
import { domainExtension } from "../enum/CountriesEnum";
import { PostType, genderEnum, race as raceEnum } from "../enum/MyEnum";
import {
    area,
    availability,
    bio,
    foodPref,
    pageArea,
    price,
    privacy,
    urls,
} from "../keys/localStorageKeys";
import { Item, StarProps } from "../keys/props/profile";
import { analytics, db } from "../store/firebase";
import history from "./history";

import { logEvent } from "@firebase/analytics";
import { PriceLimitProps } from "../components/Services/PriceLimit";
import { AnalyticsNames } from "../keys/analyticNames";
import {
    COLOMBIA,
    INDONESIA,
    MALAYSIA,
    PHILIPPINES,
    SINGAPORE,
} from "../keys/countries";
import {
    APNSToken,
    USERS,
    additional_info,
    admin,
    age,
    choosen,
    club,
    comingFrom,
    createdAt,
    currency,
    dob,
    drinks,
    drinks as drinksKey,
    emeets,
    end,
    gamer,
    gender,
    geoEncodings,
    gonow_bio,
    gonow_service,
    height as heightKey,
    highest,
    isOnline,
    isg_access_token,
    lowest,
    mobileUrl,
    myServices,
    nickname,
    number_of_rents,
    orientation,
    priceLimit,
    privacy as privacyKey,
    privacy_time_stamp,
    race,
    raceName,
    ratings,
    recommend,
    services,
    sortByPricing,
    sortByRatings,
    start,
    state,
    tele_id,
    time_stamp,
    url_height,
    url_width,
    vaccinated,
    video_urls,
    video_urls_2,
    video_verification,
    voice_url,
} from "../keys/firestorekeys";
import { ClubProps, EmeetsProps } from "../keys/props/common";
import {
    ServiceType,
    detailProps,
    servicesProps,
} from "../keys/props/services";
import { APNSTokenProps, user } from "../store";
import { defaultProfileImages } from "./ProfileHelper";

export class Helper {

  public isUSorUKPhoneNumber(phoneNumber: string): boolean {
    
    // Regular expression pattern for strict US phone numbers
    const usPhonePattern = /^(?:\+1|1)?[-. ]?\(?[2-9][0-9]{2}\)?[-. ]?[2-9][0-9]{2}[-. ]?[0-9]{4}$/;
    const ukPhonePattern = /^\+44\d{10}$/;
    // Test if the phone number matches the strict US pattern
    return usPhonePattern.test(phoneNumber) || ukPhonePattern.test(phoneNumber);
  }

  // public isUKPhoneNumber(phoneNumber: string): boolean {
  //   const regex = /^\+44\d{10}$/; // Regular expression for UK phone numbers
  //   return regex.test(phoneNumber);
  // }

  public upgradePremium(uid: string | null | undefined) {
    try {
      logEvent(analytics, AnalyticsNames.buttons, {
        content_type: "dummy upgrade",
        item_id: "dummy upgrade",
      });
    } catch {}

    if (!uid) {
      history.push("/Login", { openSubscribePage: true });
      return;
    }

    const now = new Date();
    history.push(`/Subscribe?uid=${uid}&t=${now.getTime()}`);
  }

  public isMobileCheck2() {
    let check = false;
    //eslint-disable-next-line no-useless-escape
    (function (a) {
      if (
        /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
          a
        ) ||
        /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
          a.substr(0, 4)
        )
      )
        check = true;
    })(navigator.userAgent || navigator.vendor || (window as any).opera);
    return check;
  }
  public isTabletCheck() {
    let check = false;
    check =
      /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(
        navigator.userAgent
      );
    return check;
  }

  public getQueryStringValue(key: string) {
    // let parsed = url.parse(window.location.href, true);
    // if (parsed.query[key] !== undefined) {
    //     return parsed.query[key];
    // }
    // return '';

    const url = new URL(window.location.href);
    return url.searchParams.get(key) ?? "";
  }

  public getURLEnd() {
    const last = decodeURIComponent(
      history.location.pathname.split("/").pop() ?? ""
    );
    const endings = last.split("?")[0];
    return endings;
  }

  public randomInt(min: number, max: number) {
    // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  public capitalize(string: string | undefined): string | undefined {
    if (string === undefined) {
      return undefined;
    }
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  public ageFromDateOfBirthday(birthDate: Date | undefined): number | string {
    if (birthDate === undefined) return NaN;

    try {
      const today = new Date();

      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();

      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      return age;
    } catch (error) {
      console.log(error);
      return "";
    }
  }

  public getVacValue(vac: number | undefined): string {
    switch (vac) {
      case 0:
        return "No";
      case 1:
        return "Yes";
      default:
        return "-";
    }
  }

  public getDomainExtension(): string {
    const url = window.location.href;
    const spliter = url.split("//")[1];
    const first = spliter.split("/")[0];
    const last = first.split(".").slice(-1)[0];

    return last;
  }

  public getDefaultPhoneCode(): string {
    const _domainExtension = this.getDomainExtension();

    switch (_domainExtension) {
      case domainExtension.Singapore.valueOf():
        return "sg";
      case domainExtension.Philippines.valueOf():
        return "ph";
      case domainExtension.Indonesia.valueOf():
        return "id";
      default:
        const _area = localStorage.getItem(area);
        const last = _area?.split(",");

        if (last && last.length > 0) {
          const country = last[last.length - 1];
          if (country === "Singapore") {
            return "sg";
          } else if (country === "Philippines") {
            return "ph";
          } else if (country === "Indonesia") {
            return "id";
          } else return "sg";
        }
    }

    return "sg";
  }

  public getCurrentPageState(): string[] | undefined {
    const _area = localStorage.getItem(pageArea);

    if (_area) {
      return _area.split(", ");
    }

    return undefined;
  }

  public getDummyItems(minBoxWidth: number): any[] {
    let dummyItems = [];

    let w = window.innerWidth;
    let myLimit = Math.floor(w / minBoxWidth) * 2;

    myLimit = myLimit < 10 ? 10 : myLimit * 2;

    for (let index = 0; index < myLimit; index++) {
      dummyItems.push({
        width: this.randomInt(200, 300),
        height: this.randomInt(150, 350),
      });
    }

    return dummyItems;
  }

  public getState(phoneNumber: string | null | undefined): string[] {
    const _area = localStorage.getItem(area);

    if (_area) {
      return _area.split(", ");
    }

    const lang = navigator?.language?.toLowerCase() ?? "";
    const split = lang.split("-");
    if (split.length > 1) {
      const c = split[0];
      if (c === "es") {
        return COLOMBIA;
      }
    }

    if (phoneNumber) {
      const symbol = parsePhoneNumber(phoneNumber);

      switch (symbol?.country) {
        case "SG":
          return SINGAPORE;

        case "PH":
          return PHILIPPINES;

        case "ID":
          return INDONESIA;

        case "MY":
          return MALAYSIA;

        case "CO":
          return COLOMBIA;

        default:
          return SINGAPORE;
      }
    }

    // if navigator ...

    const _domainExtension = this.getDomainExtension();
    switch (_domainExtension) {
      case domainExtension.Singapore.valueOf():
        return SINGAPORE;
      case domainExtension.Philippines.valueOf():
        return PHILIPPINES;
      case domainExtension.Indonesia.valueOf():
        return INDONESIA;
    }

    return SINGAPORE;
  }

  public setTodayMidnightHours(midnight: Date) {
    midnight.setTime(midnight.getTime() + 24 * 60 * 60 * 1000);
    // today.setTime( today.getTime() + (2*60*60*1000) );
  }

  public amIFreeToday(end: Timestamp | undefined): boolean {
    if (end !== undefined) {
      const now = new Date();

      var midnight = new Date(now);
      var today = new Date(now);

      this.setTodayMidnightHours(midnight);
      // midnight.setHours(24 + 3 ,2,0,0)
      // today.setTime(today.getTime() + (2*60*60*1000));

      const endDate = end.toDate();
      if (endDate > today && endDate < midnight) {
        return true;
      }
    }

    return false;
  }

  public serviceValidation(data: servicesProps | undefined): boolean {
    if (!data) return false;
    for (const value of Object.values(data)) {
      for (const _value of Object.values(value)) {
        const v = _value as detailProps;
        if (v.price && v.bio) return true;
      }
    }

    return false;
  }

  public configureURL(
    data: any,
    join: boolean,
    isAdmin: boolean | null | undefined
  ) {
    let _urls = data?.get(urls) as string[] | undefined;

    const defaultArray = ["", "", "", "", "", ""];
    const normalUser = !(isAdmin === false || isAdmin === true);

    const random = this.randomInt(0, defaultProfileImages.length - 1);
    const defaultImage = defaultProfileImages[random];

    if (join) {
      if (!_urls) return defaultArray;
      if (_urls?.length < 6) {
        for (let index = _urls.length - 1; index < 5; index++) {
          _urls.push("");
        }
      }

      return _urls;
    }

    if (!_urls) {
      if (normalUser) return [defaultImage];
      else return defaultArray;
    }

    if (normalUser && _urls.length > 1) {
      _urls = [_urls[0]];
    } else if (!normalUser && _urls.length === 1) {
      _urls = defaultArray;
    }

    return _urls;
  }

  public validateGender(gender: number | undefined): string | null {
    if (gender === undefined) {
      return "Gender is required";
    }
    return null;
  }

  public validateNickname(nickname: string | undefined): string | null {
    if (!nickname) {
      return "Nickname is required or invalid";
    } else if (nickname.length < 3) {
      return "Nickname min. 3 letter";
    }
    return null;
  }

  public validateDOB(DOB: Date | undefined): string | null {
    if (!DOB) return "Date of birth is required";

    const age = parseInt(this.ageFromDateOfBirthday(DOB).toString());
    if (age < 18) {
      return "Must be 18 and above";
    } else if (age > 100) {
      return "Invalid age";
    }

    return null;
  }

  public validateBio(bio: string | undefined): string | null {
    if (!bio) {
      return "Bio is required";
    } else if ((bio?.length ?? 0) < 10) {
      return "Bio must be more than 10 characters";
    }

    return null;
  }

  public timeSince(date: any, addAgo: boolean = false) {
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
  }

  public sortByPricesValue(
    price: number,
    ratings: number,
    numberOfRents: number,
    epoch: number = new Date().getTime()
  ) {
    return (
      1 * price +
      1 /
        (Math.exp(0.5 * Math.log10(ratings)) +
          Math.exp(0.03 * Math.log10(numberOfRents)) +
          Math.exp(0.001 * Math.log10(epoch)))
    );
  }

  public deleteAllServicesPricing(
    myServices: servicesProps | null | undefined
  ): { [key: string]: any } | undefined {
    // const myServices = user?.services
    if (myServices) {
      const map: { [key: string]: any } = {};
      const mainServices = Object.entries(myServices);

      for (const [serviceType, category] of mainServices) {
        const values = Object.entries(category);

        for (const [id, value] of values) {
          if (typeof value === "string") continue;
          const price = (value as detailProps).price;

          if (price) {
            map[`${services}.${serviceType}.${id}.${sortByPricing}`] =
              deleteField();
          }
        }
      }

      if (Object.keys(map).length > 0) {
        return map;
      } else {
        return undefined;
      }
    }

    return undefined;
  }

  public updateLowestHighestPricing(
    myServices: servicesProps | null | undefined,
    ratings: number,
    numberOfRents: number,
    epoch: number = new Date().getTime()
  ): { [key: string]: any } | undefined {
    if (myServices) {
      const map: { [key: string]: any } = {};
      const prices: number[] = [];
      const mainServices = Object.entries(myServices);
      for (const [serviceType, category] of mainServices) {
        const values = Object.values(category);
        const typePrices: number[] = [];

        for (const value of values) {
          if (typeof value === "string") continue;
          const price = (value as detailProps).price;

          if (price) {
            typePrices.push(price);
            prices.push(price);
          }
        }

        const min = Math.min(...typePrices);
        const max = Math.max(...typePrices);
        if (min) {
          map[`${sortByPricing}.${serviceType}.${lowest}`] =
            this.sortByPricesValue(min, ratings, numberOfRents, epoch);
        }

        if (max) {
          map[`${sortByPricing}.${serviceType}.${highest}`] =
            this.sortByPricesValue(max, ratings, numberOfRents, epoch);
        }
      }

      const min = Math.min(...prices);
      const max = Math.max(...prices);
      if (min) {
        map[`${sortByPricing}.${lowest}`] = this.sortByPricesValue(
          min,
          ratings,
          numberOfRents,
          epoch
        );
      }

      if (max) {
        map[`${sortByPricing}.${highest}`] = this.sortByPricesValue(
          max,
          ratings,
          numberOfRents,
          epoch
        );
      }

      if (Object.keys(map).length > 0) {
        return map;
      } else {
        return undefined;
      }
    }

    return undefined;
  }

  public updateAllServicesPricing(
    myServices: servicesProps | null | undefined,
    ratings: number,
    numberOfRents: number,
    epoch: number = new Date().getTime()
  ): { [key: string]: any } | undefined {
    if (myServices) {
      const map: { [key: string]: any } = {};
      const prices: number[] = [];
      const mainServices = Object.entries(myServices);
      for (const [serviceType, category] of mainServices) {
        const values = Object.entries(category);
        const typePrices: number[] = [];

        for (const [id, value] of values) {
          if (typeof value === "string") continue;
          const price = (value as detailProps).price;

          if (price) {
            map[`${services}.${serviceType}.${id}.${sortByPricing}`] =
              this.sortByPricesValue(price, ratings, numberOfRents, epoch);
            typePrices.push(price);
            prices.push(price);
          }
        }

        const min = Math.min(...typePrices);
        const max = Math.max(...typePrices);
        if (min) {
          map[`${sortByPricing}.${serviceType}.${lowest}`] =
            this.sortByPricesValue(min, ratings, numberOfRents, epoch);
        }

        if (max) {
          map[`${sortByPricing}.${serviceType}.${highest}`] =
            this.sortByPricesValue(max, ratings, numberOfRents, epoch);
        }
      }

      const min = Math.min(...prices);
      const max = Math.max(...prices);
      if (min) {
        map[`${sortByPricing}.${lowest}`] = this.sortByPricesValue(
          min,
          ratings,
          numberOfRents,
          epoch
        );
      }

      if (max) {
        map[`${sortByPricing}.${highest}`] = this.sortByPricesValue(
          max,
          ratings,
          numberOfRents,
          epoch
        );
      }

      if (Object.keys(map).length > 0) {
        return map;
      } else {
        return undefined;
      }
    }

    return undefined;
  }

  public update(
    user: user | null | undefined,
    epoch: number = new Date().getTime()
  ): { [key: string]: any } | undefined {
    const UUID = user?.uid;
    if (!UUID) return undefined;

    let map: {
      [key: string]: any;
    } = {
      [time_stamp]: serverTimestamp(),
      [isOnline]: true,
    };

    // cal rating stars
    if (user?.isAdmin) {
      const ratings = user.ratings ?? 0;
      const numberOfRents = user.numberOfRents ?? 0;

      const sortBy =
        Math.exp(0.5 * Math.log10(ratings)) +
        Math.exp(0.05 * Math.log10(numberOfRents)) +
        Math.exp(0.001 * Math.log10(epoch));

      map[sortByRatings] = sortBy;
      const updateServices = this.updateAllServicesPricing(
        user.services,
        user.ratings ?? 0,
        user.numberOfRents ?? 0,
        epoch
      );

      if (updateServices) map = { ...map, ...updateServices };
    }
    // updateDoc(doc(db, USERS, UUID), map)
    return map;
  }

  // add ratings
  public recentlyActive(user: user | null | undefined) {
    if (!user || !user.uid) {
      return;
    }

    // Member have the ability to switch their profile to active / inactive
    if (user.isAdmin === true) {
      if (user.uid && user.isActive) {
        const map = this.update(user);
        updateDoc(doc(db, USERS, user.uid), map);
      }
    } else if (user.uid) {
      const map = this.update(user);
      updateDoc(doc(db, USERS, user.uid), map);
    }
  }

  public getVideoURL(
    doc: QueryDocumentSnapshot<DocumentData> | DocumentSnapshot<DocumentData>
  ) {
    const video2: { [key: string]: string } = doc.get(video_urls_2);

    let video2URL: string[] | undefined = undefined;

    if (video2) {
      for (const [key, value] of Object.entries(video2)) {
        if (!video2URL) video2URL = Array(Object.keys(video2).length).fill("");

        video2URL[parseInt(key)] = value;
      }
    }

    let vurls_: string[] = [];

    if (video2URL && video2URL.length === 1) {
      vurls_.push(video2URL[0]);
      const remaining = (doc.get(video_urls) as string[]) ?? [];

      if (remaining.length === 2) {
        vurls_.push(remaining[1]);
      }
    } else if (video2URL && video2URL.length === 2) {
      vurls_ = video2URL;
    } else {
      vurls_ = (doc.get(video_urls) as string[]) ?? [];
    }

    return vurls_;
  }

  public convertToItem(
    doc: DocumentSnapshot<DocumentData> | null | undefined
  ): Item | undefined {
    if (!doc) return undefined;

    const _uid = doc.id as string;

    const _admin = doc.get(admin) as boolean;
    const _timeStamp =
      (doc.get(time_stamp) as Timestamp) ??
      (doc.get(privacy_time_stamp) as Timestamp);
    const isgAccessToken = doc.get(isg_access_token) as string;

    const _availability = doc.get(availability) as string;

    const _race2 = doc.get(`${race}2`) as
      | { [key: string]: boolean }
      | undefined;
    const _raceKeys = _race2 ? Object.keys(_race2).length > 0 : false;
    const _raceK = _race2 && _raceKeys ? Object.keys(_race2)[0] : NaN;

    const _race =
      this.raceEnumToName(parseInt(_raceK as string)) ??
      (doc.get(raceName) as string);

    const _food = doc.get(foodPref) as string;
    const _videoVerification = doc.get(video_verification) as boolean;
    const _createdAt = doc.get(createdAt) as Timestamp | undefined;

    let _geoEncodings = doc.get(geoEncodings) as string[];

    if (_geoEncodings?.length === 1) {
      if (_geoEncodings[0] === "Metro Manila")
        _geoEncodings.push("Phillipines");
      else if (_geoEncodings[0] === "Jakarta") _geoEncodings.push("Indonesia");
      else if (_geoEncodings[0] === "Kuala Lumpur")
        _geoEncodings.push("Malaysia");
      else if (_geoEncodings[0] === "Johor Bahru")
        _geoEncodings.push("Malaysia");
    }

    const _state = doc.get(state) as string;

    const _mobileUrl = doc.get(mobileUrl) as string;
    const _urls = doc.get(urls) as string[];

    let _vurls = this.getVideoURL(doc);

    const _price = doc.get(price) as number;

    const _gender = doc.get(gender) as genderEnum;
    const _nickname = doc.get(nickname) as string;
    const _bio = doc.get(bio) as string;
    const _drinks = doc.get(drinksKey) as string;

    const _mHeight = doc.get(heightKey) as number;
    const _vac = doc.get(vaccinated) as number;
    const _voiceUrl = doc.get(voice_url) as string;
    const _dob = doc.get(dob) as Timestamp | undefined;
    const _active =
      (doc.get(time_stamp) as Timestamp) ??
      (doc.get(privacy_time_stamp) as Timestamp);

    const _apply_info = doc.get(additional_info) as string | undefined;
    const _nor = (doc.get(number_of_rents) as number) ?? 0;

    const _isPrivate = ((doc.get(privacy) as number) ?? 0) !== 0;

    const _teleId = doc.get(tele_id) as string;
    const _APNSToken = doc.get(APNSToken) as APNSTokenProps;

    const _currency = doc.get(currency) as string;
    const _choosen = (doc.get(choosen) as boolean) ?? false;

    let _gonow_bio: string | undefined = undefined;
    const _gonow_start = doc.get(start) as Timestamp | undefined;
    const _gonow_end = doc.get(end) as Timestamp | undefined;
    const _gonow_coming = doc.get(comingFrom) as string | undefined;
    const _gonow_service = doc.get(gonow_service) as ServiceType | undefined;

    const _orientation = doc.get(orientation) as string[] | undefined;
    const _services =
      (doc.get(services) as servicesProps | undefined) ??
      (doc.get(myServices) as servicesProps | undefined);
    const _priceLimit = doc.get(priceLimit) as PriceLimitProps | undefined;
    const _ratings = doc.get(ratings) as StarProps;

    const _club = doc.get(club) as ClubProps | undefined;
    const _clubName = _club?.name;
    const _clubState = _club?.state;

    const free = this.amIFreeToday(_gonow_end);
    if (free && !_apply_info) {
      _gonow_bio = doc.get(gonow_bio) as string | undefined;
    }

    const _isGamer = doc.get(gamer) as boolean;
    const _isOnline = doc.get(isOnline) as boolean;
    const _emeets = doc.get(emeets) as EmeetsProps | undefined;

    return {
      type: PostType.version0,
      admin: _admin,
      isGamer: _isGamer,
      userGender: _gender,
      uid: _uid,
      nickname: _nickname,
      bio: _bio,
      urls: _urls,
      video_urls: _vurls,
      availability: _availability,
      race: _race,
      price: _price,
      drinks: _drinks,
      time_stamp: _timeStamp,
      visible: false,
      width: undefined,
      height: undefined,
      mHeight: _mHeight,
      isgToken: isgAccessToken,
      age: NaN,
      videoVerification: _videoVerification,
      geoEncodings: _geoEncodings,
      sponsor: false,
      food: _food,
      state: _state,
      voiceUrl: _voiceUrl,
      rec: undefined,
      dob: this.ageFromDateOfBirthday(_dob?.toDate()),
      mobileUrl: _mobileUrl,
      vac: _vac,
      gonow_servce: _gonow_service ?? ServiceType.meetup,
      gonow_bio: _gonow_bio,
      gonow_coming_from: _gonow_coming,
      start: _gonow_start?.toDate(),
      end: _gonow_end?.toDate(),
      apply_info: _apply_info,
      isPrivate: _isPrivate,
      nor: _nor,
      teleId: _teleId,
      APNSToken: _APNSToken,
      active: _active,
      currency: _currency,
      choosen: _choosen,
      orientation: _orientation,
      ratings: _ratings,
      services: _services,
      priceLimit: _priceLimit,
      clubName: _clubName,
      clubState: _clubState,
      emeets: _emeets,
      createdAt: _createdAt,
      isOnline: _isOnline,
    };
  }

  public raceEnumToName(rEnum: raceEnum | undefined) {
    switch (rEnum) {
      case raceEnum.chinese:
        return "Chinese";

      case raceEnum.asian:
        return "Asian";

      case raceEnum.black:
        return "Black";

      case raceEnum.caucasian:
        return "White / Caucasian";

      case raceEnum.japan:
        return "Korean / Japanese";

      case raceEnum.malay:
        return "Malay";

      case raceEnum.indian:
        return "Indian";

      case raceEnum.mixed:
        return "Mixed";

      case raceEnum.others:
        return "Others";

      default:
        return "";
    }
  }

  public addItems(
    doc: QueryDocumentSnapshot<DocumentData> | DocumentSnapshot<DocumentData>,
    sponsor: boolean = false,
    postType: PostType = PostType.version0
  ): Item {
    const uid = doc.id as string;

    const _admin = doc.get(admin) as boolean;
    const _timeStamp = doc.get(time_stamp) as Timestamp;
    const isgAccessToken = doc.get(isg_access_token) as string;
    const _sbyprt = doc.get(sortByPricing) as
      | { [key: string]: any }
      | undefined;

    const _availability = doc.get(availability) as string;

    const _race2 = doc.get(`${race}2`) as
      | { [key: string]: boolean }
      | undefined;

    const _raceKeys = _race2 ? Object.keys(_race2).length > 0 : false;
    const _raceK = _race2 && _raceKeys ? Object.keys(_race2)[0] : NaN;

    const _race =
      this.raceEnumToName(parseInt(_raceK as string)) ??
      (doc.get(raceName) as string);

    const _food = doc.get(foodPref) as string;
    const _age = doc.get(age) as number;
    const _videoVerification = doc.get(video_verification) as
      | boolean
      | undefined;

    let _geoEncodings = doc.get(geoEncodings) as string[];

    if (_geoEncodings?.length === 1) {
      if (_geoEncodings[0] === "Metro Manila")
        _geoEncodings.push("Phillipines");
      else if (_geoEncodings[0] === "Jakarta") _geoEncodings.push("Indonesia");
      else if (_geoEncodings[0] === "Kuala Lumpur")
        _geoEncodings.push("Malaysia");
      else if (_geoEncodings[0] === "Johor Bahru")
        _geoEncodings.push("Malaysia");
    }

    const _state = doc.get(state) as string;

    const _mobileUrl = doc.get(mobileUrl) as string;

    const _urls = (doc.get(urls) as string[]) ?? [];
    let _vurls = this.getVideoURL(doc);

    if (_vurls.length > 0) {
      _vurls = _vurls.filter((a) => a !== "");
    }

    const _price = doc.get(price) as number;
    const _gender = doc.get(gender) as genderEnum;

    const _nickname = doc.get(nickname) as string;
    const _bio = doc.get(bio) as string;
    const _drinks = doc.get(drinks) as string;

    const _mHeight = doc.get(heightKey) as number;
    const _vac = doc.get(vaccinated) as number;
    const _rec = doc.get(recommend) as string[];
    const _voiceUrl = doc.get(voice_url) as string | undefined;
    const _dob = doc.get(dob) as Timestamp | undefined;
    const _active =
      (doc.get(time_stamp) as Timestamp) ??
      (doc.get(privacy_time_stamp) as Timestamp);
    const _createdAt = doc.get(createdAt) as Timestamp | undefined;

    let visible =
      _vurls.length === 0 || this.isMobileCheck2()
        ? false
        : this.randomInt(0, 10) < 1;

    let h: number | string | undefined = 250;
    let w: number | string | undefined = 250;
    if (sponsor) visible = false;

    if (_urls.length !== 0) {
      h = _urls[0].getQueryStringValue(url_height);
      h = h ? parseInt(h) : 250;

      w = _urls[0].getQueryStringValue(url_width);
      w = w ? parseInt(w) : 250;
    }

    let _gonow_bio: string | undefined = undefined;
    const _gonow_start = doc.get(start) as Timestamp | undefined;
    const _gonow_end = doc.get(end) as Timestamp | undefined;
    const _gonow_coming = doc.get(comingFrom) as string | undefined;
    const _gonow_service = doc.get(gonow_service) as ServiceType | undefined;

    const _apply_info = doc.get(additional_info) as string;
    const _nor = (doc.get(number_of_rents) as number) ?? 0;

    const _isPrivate = ((doc.get(privacyKey) as number) ?? 0) !== 0;

    const _teleId = doc.get(tele_id) as string;
    const _APNSToken = doc.get(APNSToken) as APNSTokenProps;

    const _currency = doc.get(currency) as string;
    const _ratings = doc.get(ratings) as StarProps;
    const _choosen = (doc.get(choosen) as boolean) ?? false;
    const _orientation = doc.get(orientation) as string[] | undefined;
    const _services =
      (doc.get(services) as servicesProps | undefined) ??
      (doc.get(myServices) as servicesProps | undefined);
    const _priceLimit = doc.get(priceLimit) as PriceLimitProps | undefined;
    const _club = doc.get(club) as ClubProps | undefined;
    const _clubName = _club?.name;
    const _clubState = _club?.state;

    const free = this.amIFreeToday(_gonow_end);
    if (free && !_apply_info) {
      _gonow_bio = doc.get(gonow_bio) as string | undefined;
    }

    const _isOnline = doc.get(isOnline) as boolean;
    const _isGamer = doc.get(gamer) as boolean;
    const _emeets = doc.get(emeets) as EmeetsProps | undefined;

    //push
    return {
      type: postType,
      admin: _admin,
      isGamer: _isGamer,
      userGender: _gender,
      uid: uid,
      nickname: _nickname,
      bio: _bio,
      urls: _urls,
      video_urls: _vurls,
      availability: _availability,
      race: _race,
      price: _price,
      drinks: _drinks,
      time_stamp: _timeStamp,
      visible: visible,
      width: w,
      height: h,
      mHeight: _mHeight,
      isgToken: isgAccessToken,
      vac: _vac,
      age: _age,
      videoVerification: _videoVerification,
      geoEncodings: _geoEncodings,
      sponsor: sponsor,
      food: _food,
      state: _state,
      voiceUrl: _voiceUrl?.toCloudFlareURL(),
      rec: _rec,
      dob: this.ageFromDateOfBirthday(_dob?.toDate()),
      mobileUrl: _mobileUrl?.toCloudFlareURL(),
      gonow_servce: _gonow_service ?? ServiceType.meetup,
      gonow_bio: _gonow_bio,
      gonow_coming_from: _gonow_coming,
      start: _gonow_start?.toDate(),
      end: _gonow_end?.toDate(),
      apply_info: _apply_info,
      isPrivate: _isPrivate,
      nor: _nor,
      teleId: _teleId,
      APNSToken: _APNSToken,
      active: _active,
      currency: _currency,
      choosen: _choosen,
      orientation: _orientation,
      ratings: _ratings,
      services: _services,
      priceLimit: _priceLimit,
      clubName: _clubName,
      clubState: _clubState,
      emeets: _emeets,
      createdAt: _createdAt,
      sbyprt: _sbyprt,
      isOnline: _isOnline,
    };
  }
}
