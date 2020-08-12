export class PageParser {
    constructor(content, rootDomain) {
        /** @type string */
        this.rootDomain = rootDomain
        /** @type string */
        this.content = content
    }

    /**
     * @return Boolean
     */
    containsTextToken(token) {
       return this.content.indexOf(token) !== -1
    }

    /**
     * @return String[]
     */
    getLinks() {
        const regex = new RegExp(`href=['"]((https?:)?//${this.rootDomain}([^'"]*))['"]`, 'g')
        const result = this.content.matchAll(regex) || []
        let match
        const matches = []
        while (!(match = result.next()).done) {
            matches.push(match.value)
        }
        return matches.map(match => match[1])
    }

    /**
     *
     * @param doc
     * @return {any}
     */
    static parsePage(doc) {
        const {content, desiredToken, rootDomain} = doc
        const parser = new PageParser(content, rootDomain)
        return Object.assign(doc, {
            containsToken: parser.containsTextToken(desiredToken),
            urlsToSpider: parser.getLinks()
        })

    }

}
