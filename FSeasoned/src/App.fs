module App

open Browser.Dom
open Browser.Event

open Fable
open Fable.Core
open Fable.React
open Fable.React.Props
open Fable.Core.JsInterop
open Fable.SimpleJson
open Fable.SimpleHttp
open System.Collections.Generic

open Elmish
open Elmish.React

open System.IO

open FSharp.Core

open App.Models.HomeModel
open App.Models.AllTimeStats
open App.Models.Anilist
open App.Models.Message.HomeMessage


let init (): Model =
    { Init = false
      RawData = ""
      AllTimeStats = emptyAllTimeStats
      TableBody = tbody [] []
      LastSortMethod = Unsorted
      AnilistUsername = ""
      EnableAnilistIntegration = false
      AnilistData = [||] }


let landingPage (dispatch: Message -> unit) =
    div [ Class "jumbotron text-center" ] [
        h1 [ Class "display-4" ] [
            str "Click The Button In The Extension"
        ]
        p [ Class "lead" ] [
            str "To install the extension, go to <link here>"
        ]
        hr [ Class "my-4" ]
        div [ Class "form-group" ] [
            label [] [
                str "Enter yout Anilist Username to enable Anilist integration"
            ]
            input [ Type "text"
                    Class "form-control"
                    Placeholder "Username"
                    Id "anilist-username-input"
                    OnChange(function
                        | event -> dispatch (AnilistUsernameInputChange event?target?value)) ]
        ]
        p [ Class "lead" ] [
            str "This website is not affiliated in anw way with animemusicquiz.com"
        ]
    ]


let statsTable songTableRows =
    thead [] [
        tr [] [
            th [ Scope "col" ] [ str "#" ]
            th [ Scope "col" ] [ str "" ]
        ]
    ]

let songTableRow index songStats rowClass =
    tr [ Class rowClass ] [
        th [ Scope "row" ] [
            str (index.ToString())
        ]
        th [] [ str songStats.AnimeTitle ]
        th [] [ str songStats.SongTitle ]
        th [] [
            str (songStats.TimesCorrect.ToString())
        ]
        th [] [
            str (songStats.TimesWrong.ToString())
        ]
    ]

let sortAllTimeStats (sortMethod: SortMethod) model =
    let reverseSort = (sortMethod = model.LastSortMethod)

    { model with
          LastSortMethod = if reverseSort then Unsorted else sortMethod
          AllTimeStats =
              { AllTime =
                    model.AllTimeStats.AllTime
                    |> match sortMethod with
                       | AnimeTitle -> Array.sortBy (fun songStats -> songStats.AnimeTitle)
                       | SongTitle -> Array.sortBy (fun songStats -> songStats.SongTitle)
                       | TimesCorrect -> Array.sortBy (fun songStats -> songStats.TimesCorrect)
                       | TimesWrong -> Array.sortBy (fun songStats -> songStats.TimesWrong)
                       | Unsorted -> id
                    |> if reverseSort then Array.rev else id } }

let generateStatsTable model =

    let listTitles =
        model.AnilistData
        |> Array.map (function
            | listEntry ->
                let title = listEntry.Entry.Media.Title
                [| title.English; title.Romaji |])
        |> function
        | titles -> if titles.Length > 0 then (titles |> Array.reduce Array.append) else [||]

    let rowClassName songStats: string =
        if Array.contains songStats.AnimeTitle listTitles
        then "table-success"
        else ""



    model.AllTimeStats.AllTime
    |> Array.mapi (fun index songStats -> (songTableRow (index + 1) songStats (rowClassName songStats)))

let processDataFromExtension rawData model: Model =

    try

        { model with
              RawData = rawData
              AllTimeStats = jsonToAllTimeStats rawData }
    with _ ->
        { model with
              RawData = rawData
              AllTimeStats = emptyAllTimeStats }

let anilistDataResponse str model =
    { model with
          AnilistData =
              if str <> ""
              then (anilistResponseToListEntries (jsonToAnilistResponse str))
              else [||] }

let onAnilistUsernameInputChange model value =
    printfn "%s" value
    { model with
          AnilistUsername = value
          EnableAnilistIntegration = value.Length > 0 }

let update message model =
    // printfn "%s" (message.ToString())

    match message with
    | ExtensionEvent dataFromExtension -> processDataFromExtension dataFromExtension model
    | Sort sortMethod -> sortAllTimeStats sortMethod model
    | UpdateTable ->
        { model with
              TableBody = tbody [] (generateStatsTable model) }
    | AnilistResponse str -> anilistDataResponse str model
    | AnilistError httpResponse -> model
    | AnilistUsernameInputChange value -> onAnilistUsernameInputChange model value
    | ViewInitialized -> { model with Init = true }

let view model dispatch =
    if not model.Init then
        window.addEventListener
            ("extensionButtonPressEvent",
             function
             | (event) ->
                 printfn "extensionButtonPressEvent"
                 printfn "%b" model.Init
                 let data = event?detail.ToString()
                 let inputs = document.getElementsByTagName "input"
                 if inputs.length > 0 then
                     let anilistUsername = inputs.[0]?value
                     getResponseFromAnilist anilistUsername dispatch
                 ExtensionEvent data |> dispatch
                 dispatch UpdateTable)
        dispatch ViewInitialized

    if model.RawData = "" then
        landingPage dispatch
    else
        let tableHeadRow sortMethod text =
            th [ Scope "col" ] [
                a [ Href "#"
                    Class "sort-header"
                    OnClick(fun _ ->
                        dispatch (Sort sortMethod)
                        dispatch UpdateTable) ] [
                    str text
                ]
            ]

        let tableHead =
            thead [] [
                tr [] [
                    th [ Scope "col" ] [ str "#" ]
                    tableHeadRow AnimeTitle "Anime Title"
                    tableHeadRow SongTitle "Song Title"
                    tableHeadRow TimesCorrect "Times Correct"
                    tableHeadRow TimesWrong "Times Wrong"
                ]
            ]

        let statsTable =
            table [ Class "table table-fix-head" ] [
                tableHead
                model.TableBody
            ]

        statsTable

Program.mkSimple init update view
|> Program.withReactHydrate "placeholder-div"
|> Program.run
