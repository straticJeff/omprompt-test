import {beforeEach, describe, expect, it} from "@jest/globals"
import {PageParser} from './PageParser'

describe("parsed page", () => {
    const validXmlStringWithToken = "<html><head></head><body><h1>Some text</h1><p>This node contains a TOKEN</p></body></html>"
    const validXmlStringWithLinks = "<html><head></head><body><h1>Some text</h1><p><a href='http://domain.com/blah'>link 1</a> <a href='http://domain2.com/blah'>link 2</a></p></body></html>"

    it('should return a list of anchor links within the content as text', async () => {
        const page = new PageParser(validXmlStringWithLinks, 'domain.com')
        const links = page.getLinks()
        expect(links).toStrictEqual(['http://domain.com/blah'])
    })

    it('should detect the presence of a specified token within the content', async () => {
        const page = new PageParser(validXmlStringWithToken, 'domain.com')
        const containsToken = page.containsTextToken('TOKEN')
        const containsOtherToken = page.containsTextToken('TAKEN')

        expect(containsToken).toBe(true)
        expect(containsOtherToken).toBe(false)
    })
})
