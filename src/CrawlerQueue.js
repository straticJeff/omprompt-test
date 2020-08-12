import fetch, {FetchError} from "node-fetch"

export class CrawlerQueue {
    /**
     *
     * @param {number} maxActivePromises
     * @param {string} rootDomain
     * @param {string} desiredToken
     * @param {Function} parsePage
     * @param {Function} fetchPage
     */
    constructor(maxActivePromises, rootDomain, desiredToken, parsePage, fetchPage) {
        this.rootDomain = rootDomain
        this.desiredToken = desiredToken
        this.parsePageFn = parsePage
        this.fetchPageFn = fetchPage
        this.slots = new Array(maxActivePromises).fill(null)

        this.urlsToCrawl = []
        this.crawledUrls = {}

        this.done = function() {}
        this.corePromise = new Promise(this.done)
    }

    markVisitedUrl(result) {
        const {url} = result
        this.crawledUrls[this.sanitiseUrl(url)] = true
        return result
    }

    sanitiseUrl(url) {
        const matches = url.match('(https?:)//(.*)(#.*)?')
        if (!matches || !matches[2]) {
            throw new Error(`Unexpected URL format: ${url}`)
        }
        return matches[2]
    }

    spiderUrls(result) {
        const {urlsToSpider: urlsToSpider} = result
        urlsToSpider.forEach(url => {
            this.crawl(url)
        })
        return result
    }

    crawl(url) {
        if (!this.crawledUrls[this.sanitiseUrl(url)]) {
            this.urlsToCrawl.push(url)
        }
    }

    log(result) {
        console.log(Object.assign({}, result, {content: result ? result.content.slice(0, 1000) : null}))
        return result
    }

    displayResultSummary(result) {
        if (result.containsToken) {
            console.log(`URL: ${result.url} DOES contain token: ${result.desiredToken}`)
        } else {
            console.log(`URL: ${result.url} does NOT contain token ${result.desiredToken}`)
        }
    }

    createCrawlPromise(url) {
        return Promise.resolve({
            url,
            rootDomain: this.rootDomain,
            desiredToken: this.desiredToken
        })
            .then(this.fetchPageFn)
            .then(this.markVisitedUrl.bind(this))
            .then(this.parsePageFn)
            .then(this.spiderUrls.bind(this))
            // .then(this.log)
            .then(this.displayResultSummary)
            .catch(console.error)
    }

    getStatus() {
        console.log("URLs left to crawl: " + this.urlsToCrawl.length)
        // console.log(this.urlsToCrawl.slice(0, 25))
    }


    async queueLoop () {
        const enqueue = async () => {
            for (let i = 0; i < this.slots.length; i++) {
                const slot = this.slots[i]
                if (slot === null && this.urlsToCrawl.length > 0) {
                    const url = this.urlsToCrawl
                        .splice(0, 1)
                        .pop()
                    this.slots[i] = this.createCrawlPromise(url)
                }
            }
            for (let i = 0; i < this.slots.length; i++) {
                const slot = this.slots[i]
                try {
                    await slot
                } catch (e) {
                    // should prevent a single promise rejection from breaking the application
                    console.error(e)
                }
            }
            this.slots.fill(null)
        }

        this.getStatus()
        if (!this.hasUrlsToCrawl() && this.allSlotsAvailable()) {
            console.log('DONE')
            this.done("Complete")
        }
        if (this.hasUrlsToCrawl() && this.getAvailableSlots().length > 0) {
            await enqueue()
        }
        setTimeout(this.queueLoop.bind(this), 1000)
    }

    allSlotsAvailable() {
        return this.getAvailableSlots().length === this.slots.length
    }

    getAvailableSlots() {
        return this.slots.filter(slot => slot === null)
    }

    hasUrlsToCrawl() {
        return this.urlsToCrawl.length > 0
    }
}

