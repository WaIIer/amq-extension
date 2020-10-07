module App.Models.Message.HomeMessage

open Fable.SimpleHttp

type Message =
    | ExtensionEvent of string
    | Sort of SortMethod
    | UpdateTable
    | AnilistResponse of string
    | AnilistError of HttpResponse
    | AnilistUsernameInputChange of string
    | ViewInitialized


and SortMethod =
    | AnimeTitle
    | SongTitle
    | TimesCorrect
    | TimesWrong
    | Unsorted
