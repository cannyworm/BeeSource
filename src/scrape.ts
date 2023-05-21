import { readImageURL } from "./image"
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


async function scrape( toFindURL : string , name? : string ) {

    name = name ?? md5(toFindURL)

    logger.info(`Start search for ${toFindURL}`)

    const searchEngine = new GoogleImage()
    const ImageSources  = [ new TumblrClient() , new PinterestClient()]

    const searchResults = await searchEngine.searchByURL( toFindURL )

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

        if (links.length == 0)
            continue

        logger.info(`[${source.name}] Resolving URLs`)

        const infos = await source.solveURLs( links )

        logger.info(`[${source.name}] Finish with ${infos.length} images`)
        ImageInfos.push( ...infos)
    }

    logger.info(`Total of ${ImageInfos.length} images`)

    const workPath = path.join("./data", name ) 

    logger.info(`Saving this to ${workPath}`)

    const imagesRootPath = path.join( workPath  , "images")
    const originalPath   = path.join( workPath, "original")
    const infoPath   = path.join( workPath, "info.json")

    await fs.mkdir( imagesRootPath , { recursive : true })

    logger.info(`Download original image to ${originalPath}`)

    const originalImage = await readImageURL(toFindURL)
    await fs.writeFile(  originalPath + originalImage[0] , originalImage[1]  , "binary")

    logger.info(`Done !`)

    logger.info(`Download images to ${imagesRootPath} and create info`)

    const metaData = {
        original : toFindURL,
        images   : Array<{ path : string , info : TImageInfo}>( ImageInfos.length )
    }

    const downloadImagesTask = ImageInfos.map(
            async info => {
                const imageData = await readImageURL( info.image )
                const imageName = md5( info.image ) 
                const imagePath = path.join( imagesRootPath , imageName + imageData[0] ) 

                metaData.images.push({
                    path : imageName,
                    info
                })

                await fs.writeFile( imagePath , imageData[1] , "binary" )
            }
    )

    await Promise.all( downloadImagesTask )

    logger.info(`Done !`)
    logger.info(`Saving info`)

    await fs.writeFile( infoPath , JSON.stringify( metaData , undefined , 4 ) )

    logger.info(`Done !`)

    return 0
}

export default scrape