import {beforeEach, describe, expect, it} from "@jest/globals"
import * as Fetch from "node-fetch"
import {Fetcher} from './Fetcher'
import {Jest as jest} from "@jest/environment"

describe("page fetcher", () => {
    jest.mock('node-fetch')

    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should resolve text on valid HTTP response', async () => {
        Fetch.fetch = jest.fn().mockImplementation(url => Promise.resolve({
            text: Promise.resolve("some html")
        }))
        expect(Fetcher.retrievePage('https://some.url')).toStrictEqual("some html")
    })

    it('should emit an error on an HTTP problem or non-200 error', async () => {
        Fetch.fetch = jest.fn().mockImplementation(url => Promise.reject('some reason'))
        expect(Fetcher.retrievePage('https://some.url')).toThrow(Fetch.FetchError)
    })
})
