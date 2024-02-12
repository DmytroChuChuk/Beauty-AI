import { sortBy } from '../enum/MyEnum';
import { 
    area, 
    filterDrinks, 
    filterGender, 
    filterPrice, 
    filterRace, 
    filterProfile, 
    filterDefault
} from '../keys/localStorageKeys';
import { sortByRatings } from './firestorekeys';


export const defaultGender = localStorage.getItem(filterGender)
export const defaultRace = localStorage.getItem(filterRace)
export const defaultDrinks = localStorage.getItem(filterDrinks)
export const defaultPrices = localStorage.getItem(filterPrice) 
export const defaultProfile = localStorage.getItem(filterProfile) 
export const defaultFilter = localStorage.getItem(filterDefault) 

export const defaultSortedBy = localStorage.getItem(sortByRatings) ?? sortBy.HIGHEST_RATINGS.toString()

export const defaultArea = localStorage.getItem(area)