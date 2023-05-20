import html, { HTMLElement } from 'node-html-parser'

type NullAble<T> = T | null
type CondNull<COND extends boolean,TYPE> = COND extends true ? TYPE : NullAble<TYPE>
const NULL = null as any

function Make( root : HTMLElement ) {

    type ExHTMLElement = HTMLElement & { $query : typeof Query, $queryAll : typeof QueryAll }

    function Query<Required extends boolean = true>( query : string , required? : Required) : CondNull<Required, ExHTMLElement> {
        const result = root.querySelector( query )

        if (!result) {
            if ( required === true ) 
                throw Error(`Can't query "${query}"`)
            return NULL
        }

        return Make(result)
    }

    function QueryAll<Required extends boolean = true>( query : string , required? : Required  ) : CondNull<Required, ExHTMLElement[]> {
        const result = root.querySelectorAll( query )

        if (!result) {
            if ( required === true ) 
                throw Error(`Can't queryAll "${query}"`)
            return NULL
        }

        return result.map( element => Make(element) )
    }

    // ( root as any )["$query"] = Query
    // ( root as any )["$queryAll"] = QueryAll

    Object.defineProperties( root , {
        "$query" : { value : Query },
        "$queryAll" : { value : QueryAll },
    })


    return root as ExHTMLElement
}


export default Make 