interface String { 
    toCloudFlareURL(): string;
    bubbleMessage(): string;
    capitalize(): string;
    getQueryStringValue(key: string): string | undefined;
    getWidthHeight(): {width: number, height: number};
    shorten(limit: number): string;
    srcSetConvert() : string | undefined;
    getURLEnd(): string;
    isURLVideo(): boolean;
    includesInWords(word: string): boolean
}
interface Array<T> { 
    shuffle(): any[];
}

interface Date {
    addDays(days: number): Date
    addMinutes(minutes: number): Date
    addSeconds(seconds: number): Date
    getNumberOfHoursAgo(): number
    getEstimatedBankTransferDate(): string
    timeSince(addAgo: boolean): string
}

declare type ReadOnlyRefObject<T> = {
    readonly current: T;
};