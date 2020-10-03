#r "/home/brandonw/.nuget/packages/fsharp.data/3.3.3/lib/net45/FSharp.Data.dll"

#r "/home/brandonw/.nuget/packages/fsharp.data.graphql.client/0.0.18-beta/lib/netstandard2.0/FSharp.Data.GraphQL.Client.dll"

open FSharp.Data.GraphQL

open System.IO

let anilistUsername = "WaIIer"

let anilistQuery = """
{
    Media(search: "bakemonogatari") {
      title {
        english
        native
      }
      episodes
    }
} """

let url = "http://graphql.anilist.co"

type AnilistResponse = { data: AnilistMedia }

and AnilistMedia =
    { title: AnilistTitle
      episodes: int32 }

and AnilistTitle = { english: string; native: string }

let graphQlRequest =
    { ServerUrl = url
      HttpHeaders =
          [ [ "content-type"; "application/json" ]
            [ "Accept"; "application/json" ] ]
      OperationName = "POST"
      Query = anilistQuery
      Variables = [ [] ] }
