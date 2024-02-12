export const DateHelper = {
    getEstimatedBankTransferDate(date: Date): string {
        const hours = date.getHours();
        const cache = new Date(date);
        cache.setHours(15, 0, 0, 0);
        
        if (hours >= 10) {
            cache.setDate(cache.getDate() + 1);
        }
        return cache
            .toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            hour12: true,
            })
            .replace(" at ", ", ");
    },
    
    addMinutes(date: Date, minutes: number): Date {
        return new Date(date.getTime() + minutes * 60_000);
    },
    
    addSeconds(date: Date, seconds: number): Date {
        return new Date(date.getTime() + seconds * 1000);
    },
    
    getNumberOfHoursAgo(date: Date): number {
        if (!date) return 0;
        const today = new Date();
        const timeInMillis = today.getTime() - date.getTime();
        return Math.floor(timeInMillis / (1000 * 60 * 60));
    },
    
    addDays(date: Date, days: number): Date {
        const newDate = new Date(date.getTime());
        newDate.setDate(newDate.getDate() + days);
        return newDate;
    }

}