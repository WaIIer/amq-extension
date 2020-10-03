module App.Models.Anilist

open System
open Fable.SimpleJson
open FSharp.Data
open Fable.SimpleHttp
open Fable.Core
open Fable

open System.Text.RegularExpressions

open App.Models.Message.HomeMessage
open App.Models.HomeModel


let anilistResponseToListEntries anilistResponse =
    let lists =
        anilistResponse.Data.MediaListCollection.Lists

    lists
    |> Array.map (function
        | animeList ->
            animeList.Entries
            |> Array.map (function
                | entry ->
                    { Entry = entry
                      ListName = animeList.Name }))
    |> Array.reduce Array.append

let emptyAnimeList = { Name = ""; Entries = [||] }
let emptyMediaListCollection = { Lists = [| emptyAnimeList |] }

let emptyAnilistResponseData =
    { MediaListCollection = emptyMediaListCollection }

let emptyAnilistResponse = { Data = emptyAnilistResponseData }


let unicodeToUtf8 (``match``: Match) =
    ``match``.Value
    |> function
    | s -> s.Substring(2) // remove \u
    |> function
    | s -> Int32.Parse("0x" + s) // convert to hex int
    |> function
    | s -> (char s).ToString()


let cleanResponse (str: string) =
    Regex.Replace(str, @": *null *,", ":\"null\",")
    |> function
    | s -> Regex.Replace(s, @"\\u[\da-f]{4}", new MatchEvaluator(unicodeToUtf8))



let jsonToAnilistResponse jsonText =
    printfn "Trying to parse: %s" jsonText
    let testString = sprintf "%s" jsonText
    testString
    |> cleanResponse
    |> SimpleJson.parse
    |> SimpleJson.mapKeys (function
        | "data" -> "Data"
        | "lists" -> "Lists"
        | "name" -> "Name"
        | "entries" -> "Entries"
        | "media" -> "Media"
        | "score" -> "Score"
        | "title" -> "Title"
        | "english" -> "English"
        | "romaji" -> "Romaji"
        | "native" -> "Native"
        | key -> key)
    |> Json.convertFromJsonAs<AnilistResponse>


// let getDataFromAnilist (anilistUser: string) =
let query = """
query listQuery ($userName: String) {
    MediaListCollection(userName: $userName, type: ANIME) {
        lists {
            name
            entries {
                media {
                    title {
                        english
                        romaji
                        native
                    }
                }
                score
            }
        }
    }
}
"""

type InputVariables = { userName: Option<string> }

type GraphqlInput<'T> =
    { query: string
      variables: Option<'T> }

let getResponseFromAnilist username dispatch =
    let url = "https://graphql.anilist.co"

    async {
        let! response =
            Http.request url
            |> Http.method POST
            |> Http.headers [ Headers.contentType "application/json" ]
            |> Http.content
                (BodyContent.Text
                    (Json.stringify
                        { query = query
                          variables = Some { userName = Some username } }))
            |> Http.send

        printfn "%s" response.responseText
        match response.statusCode with
        | 200 ->
            (AnilistResponse response.responseText)
            |> dispatch
            dispatch UpdateTable
        | _ -> (AnilistResponse "") |> dispatch
    }
    |> Async.StartImmediate
