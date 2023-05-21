
// curl 'https://www.tumblr.com/api/v2/blog/sburbox/posts?fields%5Bblogs%5D=name%2Cavatar%2Ctitle%2Curl%2Cblog_view_url%2Cis_adult%2C%3Fis_member%2Cdescription_npf%2Cuuid%2Ccan_be_followed%2C%3Ffollowed%2C%3Fadvertiser_name%2Ctheme%2C%3Fprimary%2C%3Fis_paywall_on%2C%3Fpaywall_access%2C%3Fsubscription_plan%2Ctumblrmart_accessories%2C%3Flive_now%2Cshare_likes%2Cshare_following%2Ccan_subscribe%2Csubscribed%2Cask%2C%3Fcan_submit%2C%3Fis_blocked_from_primary%2C%3Fis_blogless_advertiser%2C%3Ftweet%2Cis_password_protected%2C%3Fadmin%2Ccan_message%2Cask_page_title%2C%3Fanalytics_url%2C%3Ftop_tags%2C%3Fallow_search_indexing%2Cis_hidden_from_blog_network%2C%3Fshould_show_tip%2C%3Fshould_show_gift%2C%3Fshould_show_tumblrmart_gift%2C%3Fcan_add_tip_message&npf=true&reblog_info=true&include_pinned_posts=true&before_id=178491654097' -H 'User-Agent: Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/113.0' -H 'Accept: application/json;format=camelcase' -H 'Accept-Language: en-us' -H 'Accept-Encoding: gzip, deflate, br' -H 'Referer: https://www.tumblr.com/sburbox/178491654097' -H 'Authorization: Bearer aIcXSOoTtqrzR8L8YEIOmBeW94c3FmbSNSWAUbxsny9KKx5VFh' -H 'X-Ad-Blocker-Enabled: 0' -H 'X-Version: redpop/3/0//redpop/' -H 'Connection: keep-alive' -H 'Cookie: tmgioct=6315317f8523780486762010; tth=Q7C3NDI0MLM2MkmrnGuyio6t9WbxLAcAM0QFXQ; tz=Asia%2FBangkok; language=%2Cen_US; logged_in=1; cl_pref=show; sid=aeBvn0OSqY1jWUdNBJcrnaD4pEnHsV0jCUYxgx0HOk6zqbmwQG.aGog1PVsi6qySxM3QOJb3qM1mkz3PetDs4VFXNu70q8OPf7phg; pfu=420625957; redpop=1; search-displayMode=0; redpop-editor-beta-toggled=1; blog-view-timeline-display-mode=0; blaze-displayMode=1%2C0%2C0; activity=threedays%2Chourly; activity-filter=; likes-displayMode=0; new-menu-item-seen-shop-tumblrmart=1684402856394; customize_word_wrap=1; palette=darkMode; devicePixelRatio=1; documentWidth=1920' -H 'Sec-Fetch-Dest: empty' -H 'Sec-Fetch-Mode: cors' -H 'Sec-Fetch-Site: same-origin' -H 'TE: trailers'
/**
 * Implement error handling 
 */

import axios,{ AxiosInstance } from "axios";
import { IImageSource, TImageInfo } from "../interface";
import { TumbleResponse, TimelineBlogPost , ImageContent, BlogPost, Content, isImageContent} from "./type";
import { TImage } from "../../image";

class TumblrClient implements IImageSource {

    axios : AxiosInstance

    name = "tumblr"

    constructor() {

        this.axios = axios.create({
            baseURL : "https://www.tumblr.com/api/v2",
            headers : {
                // Default auth
                "Authorization" : "Bearer aIcXSOoTtqrzR8L8YEIOmBeW94c3FmbSNSWAUbxsny9KKx5VFh",
                "Accept" : "application/json;format=camelcase"
            }
        })

    }

    isSource(strURL: string): boolean {
        const url = new URL(strURL)

        return url.hostname.endsWith("tumblr.com")
    }

    async solveURLs(strURLs: string[]): Promise<TImageInfo[]> {
        const Images = await  Promise.all( strURLs.map( url => this.solveURL(url)) )

        const ValidImages = Images.filter( image => { 
            return image !== null
        }) as TImageInfo[][]

        return ValidImages.flat()
    }

    async solveURL(strURL: string): Promise<TImageInfo[] | null> {

        const url = new URL(strURL)

        if (url.hostname.startsWith("www")) {
            // new blog url
            const paths = url.pathname.split('/').slice(1)

            // Blog url
            if (paths.length < 2)
                return null 

            const [ blogName , postID ] = paths

            const post = await this.getPost(blogName, postID)

            return this.getImagesFromPost( post )
        }
        else {
            // top domain url
            const paths = url.pathname.split('/').slice(1)

            // Blog url
            if (paths.length < 2)
                return null 

            // What the fuck is this then 
            if (paths[0] !== 'post')
                return null 

            const blogName = url.hostname.split('.')[0]
            const postID   = paths[1]

            const post = await this.getPost(blogName, postID)

            return this.getImagesFromPost( post )
        }

    }


    getImageFromContent( image : ImageContent ) : TImageInfo | null {
        const originalMedia = image.media.find(m => m.hasOriginalDimensions === true)
        if (!originalMedia)
            return null 

        return {
            image : originalMedia.url,
        }
    }

    getImagesFromPost( post : BlogPost ) : TImageInfo[] {

        const Images : TImageInfo[] = []
        const ImageContents : ImageContent[] = []

        if ( post.content.length > 0 ) {
            ImageContents.push(
                ...post.content.filter( isImageContent )
            )
        }

        // put right meta data on trail
        if ( post.trail?.length > 0 ) {

            post.trail.forEach( trail => {

                ImageContents.push(
                    ...trail.content.filter( isImageContent )
                )
            });

        }

        // Maybe process post.content and post.trail seperately
        ImageContents.forEach( imageContent => {
            const image  = this.getImageFromContent( imageContent ) 

            if (image === null )
                throw Error(`Can't get images from ${post.postUrl}`)

            image.source = post.postUrl
            image.url    = post.postUrl

            Images.push(image)
        })


        return Images

    }


    async getPost( blogName : string , postID : string ) {
        const resp =  await this.axios.get<TumbleResponse<TimelineBlogPost>>(`/blog/${blogName}/posts/${postID}/permalink`)
        return resp.data.response.timeline.elements[0]
    }

}

// https://sburbox.tumblr.com/post/178491654097
// https://www.tumblr.com/sburbox/178491654097

export { TumblrClient }

/**
 * name
avatar,title,url,blog_view_url,is_adult,?is_member,description_npf,uuid,can_be_followed,?advertiser_name,?primary
https://api.tumblr.com/v2/blog/sburbox/posts/178491654097/permalink?fields%5Bblogs%5D=avatar%2Ctitle%2Curl%2Cblog_view_url%2Cis_adult%2C%3Fis_member%2Cdescription_npf%2Cuuid%2Ccan_be_followed%2C%3Fadvertiser_name%2C%3Fprimary&reblog_info=true
 */