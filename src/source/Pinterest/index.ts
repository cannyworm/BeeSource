import axios , {AxiosInstance} from 'axios'
import { IImageSource, TImageInfo } from "../interface";

type Response<Data = []> = {
    status : "success"
    code : number
    message : string
    endpoint_name : string
    data : Data
}

type Image = {
    width : number
    height : number
    url : string
}

type Pin = {

    id : string

    images : {
        [ wX : string ] : Image
    }

    rich_metadata : {
        title : string
        url   : string
    }

    is_video : boolean

    domain : string
    link : string

    description : string
}


class PinterestClient implements IImageSource {

    name = "pinterest"

    axios : AxiosInstance

    constructor() {

        this.axios = axios.create({
            baseURL : "https://widgets.pinterest.com/v3/pidgets",
            params : {
                sub : "www",
                base_scheme : "https",
                callback : "A"
            }
        })

        // rpc transform
        this.axios.interceptors.response.use( function( resp ) {

            if ( !resp.headers["content-type"]?.toLocaleString().includes("javascript") )
                return resp

            const content : string = resp.data
            /**
             * $callback_name({})
             */
            // this may slow thing down a bit
            resp.data = content.slice( content.indexOf("(") + 1  , content.length - 1 )
            resp.data = JSON.parse( resp.data )

            return resp
        })

    }


    isSource(strURL: string): boolean {
        const url = new URL( strURL )
        return url.hostname.includes("pinterest") 
    }

    async solveURLs(strURLs: string[]): Promise<TImageInfo[]> {

        const IDs = strURLs.map( this.solveID ).filter( id => id !== null ) as string[]
        const uIDs = [ ... new Set(IDs) ]

        const Pins = await this.getPins( uIDs )

        return Pins.map( this.pinImageInfo )
    }


    solveID( strURL: string ): string | null {
        
        const url = new URL( strURL )

        const paths = url.pathname.split('/').slice(1)

        if ( paths[0] !== 'pin')
            return null

        const pinID = paths[1]

        return pinID
    }


    pinImageInfo( pin : Pin ) : TImageInfo {

        const images = Object.keys(pin.images).map(widthX => pin.images[widthX]).sort( (a,b) => b.width - a.width )

        return {
            image  : images[0].url,
            source : pin.link
        }

    }


    async getPins( ids : string[]) : Promise<Pin[]> {

        const resp = await this.axios.get<Response<Pin[]>>("/pins/info", {
            params : {
                pin_ids : ids.join(','),
            }
        })

        return resp.data.data
    }


}

export { PinterestClient  }