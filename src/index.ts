import axios from "axios"
import { GoogleImage } from "./search/google"
import { TImage, readImageFile } from "./image"
import { TumblrClient } from "./source/Tumblr"
import { IImageSource, TImageInfo } from "./source/interface"
import { PinterestClient } from "./source/Pinterest"
import { SearchResult } from "./search/interface"

axios.defaults.headers.common = {
    "User-Agent" : "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:102.0) Gecko/20100101 Firefox/102.0"
}

async function main() {

    try {

        // const results = await google.search(
        //     "https://i.pinimg.com/564x/ef/95/e6/ef95e66febd6a97067ed25535c7a2f68.jpg"
        // )


        // https://sburbox.tumblr.com/post/178491654097
        // https://www.tumblr.com/sburbox/178491654097

        /**
         * Gather every search result
         * send all the url to image sources
         * get all them goodie
         * send to image processing in batch
         * profit ?
         */


        const google = new GoogleImage()

        const destImage = "https://i.pinimg.com/564x/ba/53/39/ba5339553f0521e3db16561e37a28a11.jpg"
        const searchResult = await google.search( destImage )


        const ImageSources = [ new TumblrClient() , new PinterestClient() ]
        const sourceResults = new Map<IImageSource, SearchResult[]>()

        // Initialize array
        ImageSources.forEach( source => {
            sourceResults.set( source , [] )
        })

        searchResult.forEach( search => {

            const engine = ImageSources.find( source => source.isSource( search.url ) )

            if ( !engine )
                return

            sourceResults.get( engine )!.push( search )
        })

        for ( const [ engine , result ] of sourceResults ) {
            console.log(`[${engine.name}]`, result )
        }

        const Result : TImageInfo[] = []

        for ( const [ engine , result ] of sourceResults ) {

            const URLs = result.map( r => r.url )
            const images = await engine.solveURLs( URLs )

            console.log(
                `[${engine.name}]`,
                images
            )

            Result.concat( images )
        }

        Result.forEach( r => console.log(r) )

        

    } catch( err : any ) {

        if ( axios.isAxiosError( err )) {
            return console.log( err )
        }

        console.error( err )
    }

}

main()