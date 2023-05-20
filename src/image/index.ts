// Response for handle Image data , Image processing etc...

import * as fs from 'node:fs/promises'
import * as fsa from 'node:fs'
import axios from 'axios'

type TImage = string

async function compareSimiliar( src : Buffer , dst : Buffer) : Promise<number> {

    return 0
}


async function readImageFile( filePath : string ) {
    const buffer = await fs.readFile( filePath )

    return buffer
}

async function readImageURL( imageURL : string ) : Promise<Buffer> {

    const imageReponse = await axios.get( imageURL , { responseType : "arraybuffer" })
    const contentType = imageReponse.config.headers.get("content-type") as string

    console.log( contentType , imageReponse.data )

    return imageReponse.data
}

export { readImageFile , readImageURL }
export { TImage }