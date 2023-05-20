type Meta = {
    status : number
    msg    : string
}

type TumbleResponse<T> = {
    meta : Meta
    response : T
}

type IContent<T extends string> = {
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

type ImageContent = IContent<"image"> & {
    media : ImageMedia[]
    colors : Colors 
}

type TextConent = IContent<"text"> & {

}

type Content = ImageContent | TextConent

export const isImageContent = ( content : Content ) : content is ImageContent => content.type === 'image'

type Trail = {
        content : Content[]
        layout  : []
        post : {
            id : string
        },
        blog : Blog
} 

type BlogPost = {
    objectType : "post"
    type : "blocks"
    originalType : "photo"
    id : string
    blogName : string
    blog : Blog
    postUrl : string
    date  :string
    timestamp  :number
    tags : string[]
    shortUrl : string
    content : Content[]

    trail : Trail[] 
}

type TimelineBlogPost = {
    timeline : {
        elements : BlogPost[]
    }
}


export {
    TumbleResponse,

    Content,

    TextConent ,
    ImageContent ,

    BlogPost,
    TimelineBlogPost
}


export interface Blog {
    name:                    string;
    avatar:                  Avatar[];
    title:                   string;
    url:                     string;
    blogViewUrl:             string;
    isAdult:                 boolean;
    descriptionNpf:          DescriptionNpf[];
    uuid:                    string;
    canBeFollowed:           boolean;
    allowSearchIndexing:     boolean;
    isHiddenFromBlogNetwork: boolean;
    tumblrmartAccessories?:  any[];
    active?:                 boolean;
}

export interface Avatar {
    width:  number;
    height: number;
    url:    string;
}

export interface DescriptionNpf {
    type: string;
    text: string;
}

export interface CommunityLabels {
    hasCommunityLabel: boolean;
    lastReporter:      string;
    categories:        any[];
}
