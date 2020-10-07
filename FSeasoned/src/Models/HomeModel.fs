module App.Models.HomeModel

open Fable.React

open App.Models.Message.HomeMessage


type AllTimeStats = { AllTime: SongStats array }

and SongStats =
    { AnimeTitle: string
      SongTitle: string
      SongArtist: string
      TimesCorrect: int32
      TimesWrong: int32
      WrongGuesses: string array }

type AnilistResponse = { Data: AnilistResponseData }

and AnilistResponseData =
    { MediaListCollection: MediaListCollection }

and MediaListCollection = { Lists: AnimeList array }

and AnimeList = { Name: string; Entries: Entry array }

and Entry = { Media: Media; Score: float32 }

and Media = { Title: Title }

and Title =
    { Romaji: string
      Native: string
      English: string }

type ListEntry = { Entry: Entry; ListName: string }

type Model =
    { Init: bool
      RawData: string
      AllTimeStats: AllTimeStats
      TableBody: ReactElement
      LastSortMethod: SortMethod
      AnilistUsername: string
      EnableAnilistIntegration: bool
      AnilistData: ListEntry array }
