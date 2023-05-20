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

import * as crypto from 'node:crypto'
import * as fs from 'node:fs/promises'

function md5( content : string ) {
    const cipher = crypto.createHash("md5")
    cipher.update( content )
    return cipher.digest('hex')
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
        const searchResults = await google.search( destImage )

        console.log(`[Google] Found ${searchResults.length} results`)

        searchResults.forEach( search => {
            console.log(`[Google] > ${search.url} (${search.title})`)
        })

        console.log(`[Log] Initialize client`)
        const ImageSources = [ new TumblrClient() , new PinterestClient() ]
        const sourceResults = new Map<IImageSource, SearchResult[]>()

        // Initialize array
        ImageSources.forEach( source => {
            sourceResults.set( source , [] )
        })

        searchResults.forEach( search => {
            const engine = ImageSources.find( source => source.isSource( search.url ) )

            if ( !engine )
                return console.log(`[ImgSource] ${search.url} Can't find source`)

            console.log(`[ImgSource] ${search.url} belong to [${engine.name}]`)
            sourceResults.get( engine )!.push( search )
        })


        for ( const [ engine , links ] of sourceResults ) {
            console.log(`[ImgSource] [${engine.name}]`)
            links.forEach( link => {
                console.log(`[ImgSource] \t|-> ${link.url}`)
            })
        }

        console.log('[ImgSource] Start extract image from pages')

        const Result : TImageInfo[] = []

        for ( const [ engine , result ] of sourceResults ) {

            const URLs = result.map( r => r.url )
            const images = await engine.solveURLs( URLs )

            console.log(`[ImgSource] [${engine.name}]`)

            images.forEach( image => {
                console.log(`[ImgSource] \t|-> ${image.image}`)
            })

            Result.push( ...images )
        }

        const workPath = "./data/something"

        const metaData = {
            original : destImage,
            images   : await Promise.all( Result.map( async imageInfo => {

                const imageReponse = await axios.get( imageInfo.image ,{ responseType : "arraybuffer" })

                let imageExt    = imageReponse.headers["content-type"] as string
                //content-type: image/jpeg
                imageExt = imageExt.slice( imageExt.lastIndexOf("/") + 1 )

                const imagePath   = workPath + "/images/" + md5( imageInfo.image ) + "." + imageExt
                const imageFile   = await fs.writeFile( imagePath , imageReponse.data , "binary")
                
                return {
                    path : imagePath,
                    info : imageInfo
                }

            }) )
        }

        await fs.writeFile( workPath + "/info.json", JSON.stringify( metaData , null , 4) )
        const originalImage = await axios.get( destImage, { responseType : "arraybuffer"})
        await fs.writeFile( workPath + "/original.jpg",  originalImage.data , "binary")

    
    } catch( err : any ) {

        if ( axios.isAxiosError( err )) {
            return console.log( err )
        }

        console.error( err )
    }

}

main()