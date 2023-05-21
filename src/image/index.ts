// Response for handle Image data , Image processing etc...

import * as fs from 'node:fs/promises'
import * as fsa from 'node:fs'
import axios from 'axios'
import { createLogger } from '../logger'

type TImage = string

const logger = createLogger("Image")

async function compareSimiliar( src : Buffer , dst : Buffer) : Promise<number> {

    return 0
}

async function readImageFile( filePath : string ) {
    const buffer = await fs.readFile( filePath )

    return buffer
}

const CONTENT_TYPE_EXT =  {
    "image/jpeg" : ".jpg",
    "image/png"  : ".png",
}


async function readImageURL( imageURL : string ) : Promise<[ string , Buffer ]> {

    const imageReponse = await axios.get( imageURL , { responseType : "arraybuffer" })

    const contentTypeHeader = Object.keys( imageReponse.headers ).find( header => header.toLowerCase() === 'content-type')

    if (contentTypeHeader) {
        const contentType = imageReponse.headers[ contentTypeHeader ] as string
        let fileExtension = CONTENT_TYPE_EXT[ contentType as keyof typeof CONTENT_TYPE_EXT ]

        if (!fileExtension) {
            // "image/".length
            fileExtension = contentType.slice( 6 )
            logger.warn(`Can't find file extension resolve to '${fileExtension}'`)
        } 

        return [ fileExtension , imageReponse.data]
    }

    logger.warn( `Can't find content type` )

    return [ "" , imageReponse.data ]
}

export { readImageFile , readImageURL }
export { TImage }