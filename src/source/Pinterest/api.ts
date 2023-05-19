import axios from "axios";

const embed = axios.create({
    baseURL : "https://widgets.pinterest.com/v3/pidgets",
    params : {
        sub : "www",
        base_scheme : "https",
        callback : "A"
    }
})

embed.interceptors.response.use( function( resp ) {

    if ( !resp.headers["content-type"]?.toLocaleString().includes("javascript") )
        return resp

    const content : string = resp.data
    /**
     * $callback_name({})
     */
    // this may slow thing down a bit
    resp.data = content.slice( content.indexOf("(") + 1  , content.length - 1 )
    resp.data = JSON.parse( resp.data )

    return resp
})


export { embed }
