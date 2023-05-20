import * as process from 'node:process'
import scrape from './scrape'
import { createLogger } from './logger'

const logger = createLogger("CLI")


async function cli() {

    // because 0 is yarn and 1 is cli.ts

    // image url to searach
    const imageURL : string = process.argv[2]
    // folder name in ./data to save search result
    const saveName : string = process.argv[3]

    if (!imageURL)
        throw Error(`Invalid usage`)

    const result = await scrape( imageURL , saveName )

    console.log( result )

    return 0
}

cli().catch( err => logger.error( err ) )