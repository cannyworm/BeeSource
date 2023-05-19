import { ISearchEngine, SearchResult } from "./interface";

import axios, { AxiosInstance } from "axios";
import html from 'node-html-parser'
import  Make from "../html";


class GoogleImage implements ISearchEngine {

    private axios : AxiosInstance

    constructor() {
        this.axios = axios.create({ 
            baseURL : "https://www.google.com",
            headers : {
                "User-Agent" : "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:102.0) Gecko/20100101 Firefox/102.0",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
                "Accept-Language" : "en-US,en;q=0.5"
            }
        })
    }

    async search( image : string ): Promise<SearchResult[]>;
    async search( image : Buffer , fileName? : string ): Promise<SearchResult[]>;

    async search( image : string | Buffer , fileName? : string ): Promise<SearchResult[]> {

        if ( typeof image === 'string')
            return this.searchByURL( image )

        return this.searchByBuffer( image , fileName )
    }

    async searchByBuffer( imageBuffer : Buffer , imageName? : string ) {

        const data = new FormData()

        data.append("encoded_image", new Blob( [ imageBuffer ] ), imageName ?? "")
        data.append("sbisrc", "Google Chrome 107.0.5304.107 (Official) Windows")
        data.append("image_url","")

        const response = await this.axios.post<string>("/searchbyimage/upload", data )

        return await this.parseSearch( response.data )
    }

    async searchByURL( imageURL : string ) {

        const response = await this.axios.get<string>("/searchbyimage", {
            params: {
                "image_url": encodeURIComponent( imageURL ),
                "hl": "en-US",
                "sbisrc" : "cr_1_5_2"
            }
        })

        return await this.parseSearch( response.data )
    }

    parsePageList( pageContent : string ) : string[] {
        const document = Make(html( pageContent ))

        return document.$queryAll("td a.fl").map(
            element => {
                return element.getAttribute('href') as string
            }
        )
    }

    parsePageResult( pageContent : string ) {

        const result : SearchResult[] = []

        const document = Make(html( pageContent ))
        const resultElement = document.$queryAll( ".MjjYud div.g" )
        
        resultElement.forEach( element => {
            const image = element.$query(".LicuJb img", false)

            if (!image)
                return

            const url   = element.$query("a").getAttribute("href") as string
            const title = element.$query("h3").textContent.trim()
            const description = element.$query(".UK95Uc.VGXe8 .MUxGbd.yDYNvb").textContent.trim()

            result.push({
                url,
                title,
                description
            })

        })
        
        return result
    }

    async parseSearch( indexContent : string ) {
        const pageURLs = this.parsePageList( indexContent )
        const otherPages = await Promise.all(
            pageURLs.map(
                async url => (await this.axios.get<string>(url)).data
            )
        )

        const pageContents = [
            indexContent,
            ...otherPages
        ]

        const pageResult = pageContents.map(
            content => this.parsePageResult(content)
        ).flat()

        return pageResult
    }



}


export { GoogleImage }