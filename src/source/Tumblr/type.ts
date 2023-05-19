type Meta = {
    status : number
    msg    : string
}

type TumbleResponse<T> = {
    meta : Meta
    response : T
}

interface IContent<T extends string> {
    type : T
}

type Colors = { c0 : string , c1 : string }

type ImageMedia = {
    url : string
    type : "image/png" | "image/jpg"
    width : number
    height : number
    colors : Colors 
    hasOriginalDimensions : boolean
    cropped? : boolean
}

type Image = IContent<"image"> & {
    media : ImageMedia[]
    colors : Colors 
}

type Text = IContent<"text"> & {

}

type Content = Image | Text

type BlogPost = {
    objectType : "post"
    type : "blocks"
    originalType : "photo"
    blogName : string
    postUrl : string
    date  :string
    timestamp  :number
    tags : string[]
    shortUrl : string
    content : Content[]
}

type TimelineBlogPost = {
    timeline : {
        elements : BlogPost[]
    }
}


export {
    TumbleResponse,

    Content,

    Text,
    Image,

    BlogPost,
    TimelineBlogPost
}