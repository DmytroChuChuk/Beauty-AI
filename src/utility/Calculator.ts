import { StarProps } from "../keys/props/profile"

export class Calculator {

    public priceFormat(price: number) : string{
        if(price >= 1000000){
            const p = (price / 1000000).toString().replace(/[^0-9.-]/g, '')
            return p + "M"
        }else if(price >= 1000){
            const p = (price / 1000).toString().replace(/[^0-9.-]/g, '')
            return p + "k"
        }else{
            return price.toString()
        }
    }

    public viewFormat(price: number) : string{
        if(price >= 1000000){
            const p = (price / 1000000).toFixed(1).toString()
            return p + "M"
        }else if(price >= 1000){
            const p = (price / 1000).toFixed(1).toString()
            return p + "k"
        }else{
            return price.toString()
        }
    }

    public weightedAverage(data: StarProps | undefined){

        if(!data) return "---"
        let totalNumberOfStars = 0
        let totalValue = 0
        let numberOfRents = 0
        for (const [key, _value] of Object.entries(data)) {

            const value = _value < 0 ? 0 : _value

            totalNumberOfStars += value
            const numKey = parseInt(key)
            totalValue += (numKey * value)

            numberOfRents += value
        }

        const avg = totalValue / totalNumberOfStars
        if(isNaN(avg)) return "---"
        return `${avg.toFixed(1)} (${this.priceFormat(numberOfRents)})`

    }

    public weightedAverageNumberOfRents(data: StarProps | undefined){
            
            if(!data) return "---"
            let totalNumberOfStars = 0
            let totalValue = 0
            let numberOfRents = 0
            for (const [key, _value] of Object.entries(data)) {
    
                const value = _value < 0 ? 0 : _value
    
                totalNumberOfStars += value
                const numKey = parseInt(key)
                totalValue += (numKey * value)
    
                numberOfRents += value
            }
    
            const avg = totalValue / totalNumberOfStars
            if(isNaN(avg)) return "---"
            return `${numberOfRents}`
    
        }

    public weightedAverageValue(data: StarProps | undefined): number{
    
        if(!data) return 0
        let totalNumberOfStars = 0
        let totalValue = 0
  
        for (const [key, _value] of Object.entries(data)) {

            const value = _value < 0 ? 0 : _value

            totalNumberOfStars += value
            const numKey = parseInt(key)
            totalValue += (numKey * value)
        }

        const avg = totalValue / totalNumberOfStars
        if(isNaN(avg)) return 0
        return avg

    }

    public numberOfMeetups (data: StarProps | undefined) {

        if(!data) return 0

        let num = 0
        for (const value of Object.values(data)){
                num += value
        }
        
        return num
    }

}