import { TImage } from "../image";

type TImageInfoInvalid = {
    valid : false
}

type TImageInfoValid = {
    valid : true
    image   : string

    title?  : string
    source? : string

    url? : string
}

type TImageInfo = TImageInfoInvalid | TImageInfoValid 

// Make this support batch process
interface IImageSource<Id = string> {

    readonly name : string

    isSource( strURL  : string )  : boolean

    solveURLs( strURLs  : string[] )  : Promise<TImageInfo[]>
    
}

export { IImageSource , TImageInfo }