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

        this.urlsToCrawl = new Set()
        this.crawledUrls = new Set()

        this.done = function() {}
        this.corePromise = new Promise(this.done)
    }

    markVisitedUrl(result) {
        const {url} = result
        this.crawledUrls.add(this.sanitiseUrl(url))
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
        const sanitisedUrl = this.sanitiseUrl(url)
        if (!this.urlsToCrawl.has(sanitisedUrl) && !this.crawledUrls.has(sanitisedUrl)) {
            this.urlsToCrawl.add(url)
        }
    }

    log(result) {
        console.log(Object.assign({}, result, {content: result ? result.content.slice(0, 1000) : null}))
        return result
    }

    displayResultSummary(result) {
        if (result.containsToken) {
            console.log(`URL: ${result.url} DOES contain token: ${result.desiredToken}`)
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
    }

    popNextUrl() {
        const url = this.urlsToCrawl.values().next().value
        this.urlsToCrawl.delete(url)
        return url
    }

    async queueLoop () {
        const enqueue = async () => {
            for (let i = 0; i < this.slots.length; i++) {
                const slot = this.slots[i]
                if (slot === null && this.urlsToCrawl.size > 0) {
                    this.slots[i] = this.createCrawlPromise(this.popNextUrl())
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

        // this.getStatus()
        if (!this.hasUrlsToCrawl() && this.allSlotsAvailable()) {
            this.done('Crawl complete')
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
        return this.urlsToCrawl.size > 0
    }
}

