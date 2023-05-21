[Idea]
- Cache image on image source compress image and only refetch if it's likely to be what we are looking for
- Implement GUI
- use gpu
x https://rsmbl.github.io/Resemble.js/ ( dones't work in nodejs or typesfript for some reason )
- Seperate everything to little task
- We gonna crawl the whole internet
- Make use of google cache
- Make use of AMP
- Learn image processing

[TODO]
(DONE) - Make so tumblr solveURL can return multiple TImageInfo
- Implement Logger
- Create some uid for image
(DONE) - Finish implement cli 
- need some thing to get image type
- Implement yarndex search
    - Maybe need recaptcha shit
- Crawl through Pinterst board
- Use metadata liike create date to search in source
- Implement image similarity check

[FIX]
(DONE) - Can't get shit from tumblr reblog
(DONE) - There is a null in info.json in cli 
            - prealloc array and doesn't use it
- Fix old pinterest url format contain name in id (regex ?)
    # example
    # https://co.pinterest.com/pin/pin-de-salvatore-en-tote--810225789227177096/ 
- Duplicate image (how)

#TEST
