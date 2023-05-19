import { TImage } from "../image"


type SearchResult<TExtra = {}> = {
    url : string 
    title : string
    description : string

    image? : TImage
    extra? : TExtra
}


interface ISearchEngine<TExtra = {} > {
    search( image : TImage ) : Promise<SearchResult<TExtra>[]>
}

export {
    SearchResult,
    ISearchEngine
}