module App

open Browser.Dom
open Browser.Event

open Fable
open Fable.Core
open Fable.React
open Fable.React.Props
open Fable.Core.JsInterop
open Fable.SimpleJson

open Elmish
open Elmish.React

open System.IO

open FSharp.Core

open App.Models.AllTimeStats


type Message =
    | ExtensionEvent of string
    | Sort of SortMethod
    | UpdateTable

and SortMethod =
    | AnimeTitle
    | SongTitle
    | TimesCorrect
    | TimesWrong
    | Unsorted

type Model =
    { RawData: string
      AllTimeStats: AllTimeStats
      TableBody: ReactElement
      LastSortMethod: SortMethod }

let init () =
    { RawData = ""
      AllTimeStats = emptyAllTimeStats
      TableBody = tbody [] []
      LastSortMethod = Unsorted }


let landingPage =
    div [ Class "jumbotron text-center" ]
        [ h1 [ Class "display-4" ] [ str "Click The Button In The Extension" ]
          p [ Class "lead" ] [ str "To install the extension, go to <link here>" ]
          hr [ Class "my-4" ]
          p [ Class "lead" ] [ str "This website is not affiliated in anw way with animemusicquiz.com" ] ]


let statsTable songTableRows =
    thead []
        [ tr []
              [ th [ Scope "col" ] [ str "#" ]
                th [ Scope "col" ] [ str "" ] ] ]

let songTableRow index songStats =
    tr []
        [ th [ Scope "row" ] [ str (index.ToString()) ]
          th [] [ str songStats.animeTitle ]
          th [] [ str songStats.songTitle ]
          th [] [ str (songStats.timesCorrect.ToString()) ]
          th [] [ str (songStats.timesWrong.ToString()) ] ]

let sortAllTimeStats sortMethod model =
    let reverseSort = (sortMethod = model.LastSortMethod)

    { model with
          LastSortMethod = if reverseSort then Unsorted else sortMethod
          AllTimeStats =
              { allTime =
                    model.AllTimeStats.allTime
                    |> match sortMethod with
                       | AnimeTitle -> Array.sortBy (fun songStats -> songStats.animeTitle)
                       | SongTitle -> Array.sortBy (fun songStats -> songStats.songTitle)
                       | TimesCorrect -> Array.sortBy (fun songStats -> songStats.timesCorrect)
                       | TimesWrong -> Array.sortBy (fun songStats -> songStats.timesWrong)
                       | Unsorted -> id
                    |> if reverseSort then Array.rev else id }}

let generateStasTable allTimeStats =
    allTimeStats.allTime
    |> Array.mapi (fun index songStats -> (songTableRow (index + 1) songStats))

let processDataFromExtension rawData model =
    try
        { model with
              RawData = rawData
              AllTimeStats = Json.parseAs<AllTimeStats> (rawData) }
    with _ ->
        { model with
              RawData = rawData
              AllTimeStats = emptyAllTimeStats }

let update message model =
    match message with
    | ExtensionEvent dataFromExtension -> processDataFromExtension dataFromExtension model
    | Sort sortMethod -> sortAllTimeStats sortMethod model
    | UpdateTable ->
        { model with
              TableBody = tbody [] (generateStasTable model.AllTimeStats) }

let view model dispatch =
    window.addEventListener
        ("extensionButtonPressEvent",
         function
         | (event) ->
             printfn "extensionButtonPressEvent"
             let data = event?detail.ToString()
             ExtensionEvent data |> dispatch
             dispatch UpdateTable)
    if model.RawData = "" then
        landingPage
    else
        let tableHeadRow sortMethod text =
            th [ Scope "col" ]
                [ a
                    [ Href "#"
                      Class "sort-header"
                      OnClick(fun _ ->
                          dispatch (Sort sortMethod)
                          dispatch UpdateTable) ] [ str text ] ]

        let tableHead =
            thead []
                [ tr []
                      [ th [ Scope "col" ] [ str "#" ]
                        tableHeadRow AnimeTitle "Anime Title"
                        tableHeadRow SongTitle "Song Title"
                        tableHeadRow TimesCorrect "Times Correct"
                        tableHeadRow TimesWrong "Times Wrong" ] ]

        let statsTable =
            table [ Class "table table-stripped table-hover table-fix-head" ] [ tableHead; model.TableBody ]


        statsTable


Program.mkSimple init update view
|> Program.withReactHydrate "placeholder-div"
|> Program.run
