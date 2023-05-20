import { createLogger } from "./logger"
import { GoogleImage } from "./search/google"
import { PinterestClient } from "./source/Pinterest"
import { TumblrClient } from "./source/Tumblr"
import { IImageSource, TImageInfo } from "./source/interface"

const logger = createLogger("CLI")

import * as crypto from 'node:crypto'
import * as fs from 'node:fs/promises'
import * as path from 'node:path'

function md5( content : string ) {
    const cipher = crypto.createHash("md5")
    cipher.update( content )
    return cipher.digest('hex')
}


async function scrape( url : string , name? : string ) {

    name = name ?? md5(url)

    logger.info(`Start search for ${url}`)

    const searchEngine = new GoogleImage()
    const ImageSources  = [ new TumblrClient() , new PinterestClient()]

    const searchResults = await searchEngine.searchByURL( url )

    const sourceLinks = new Map<IImageSource , string[]>

    ImageSources.forEach( source => sourceLinks.set( source , []))

    searchResults.forEach( search => {
        const source = ImageSources.find( source => source.isSource( search.url ))

        if (!source)
            return logger.warn(`${search.url} Can't find source`)

        logger.info(`[${source.name}] -> ${search.url} `)
        sourceLinks.get( source )?.push( search.url )
    })

    const ImageInfos : TImageInfo[] = []

    for ( const [ source , links ] of sourceLinks ) {
        logger.info(`[${source.name}] Found ${links.length} links`)
        logger.info(`[${source.name}] Resolving URLs`)

        const infos = await source.solveURLs( links )

        logger.info(`[${source.name}] Finish with ${infos.length} images`)
        ImageInfos.push( ...infos)
    }

    logger.info(`Total of ${ImageInfos.length} images`)

    const workPath = path.join("./data", name ) 

    logger.info(`Saving this to ${workPath}`)

    const imagesPath = path.join( workPath  , "images")
    const originalPath = path.join( workPath, "original")


    return 0
}

export default scrape