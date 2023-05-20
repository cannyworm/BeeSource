import { TImage } from "../image";



type TImageInfo = {
    image   : string

    title?  : string
    source? : string

    url? : string
} 

// Make this support batch process
interface IImageSource<Id = string> {

    readonly name : string

    isSource( strURL  : string )  : boolean
    // It's exsit because in case we can batch process them
    // Like Pinterest api
    solveURLs( strURLs  : string[] )  : Promise<TImageInfo[]>
    
}

export { IImageSource , TImageInfo }