// Response for handle Image data , Image processing etc...

import * as fs from 'node:fs/promises'
import * as fsa from 'node:fs'

type TImage = string

async function compareSimiliar( src : Buffer , dst : Buffer) : Promise<number> {

    return 0
}


async function readImageFile( filePath : string ) {
    const buffer = await fs.readFile( filePath )

    return buffer
}

export { readImageFile }
export { TImage }