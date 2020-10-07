module App.Models.AllTimeStats

open App.Models.HomeModel

open Fable.SimpleJson

let jsonToAllTimeStats jsonString =
    jsonString
    |> SimpleJson.parse
    |> SimpleJson.mapKeys (function
        | "allTime" -> "AllTime"
        | "animeTitle" -> "AnimeTitle"
        | "songTitle" -> "SongTitle"
        | "songArtist" -> "SongArtist"
        | "timesCorrect" -> "TimesCorrect"
        | "timesWrong" -> "TimesWrong"
        | "wrongGuesses" -> "WrongGuesses"
        | key -> key)
    |> Json.convertFromJsonAs<AllTimeStats>


let emptySongStats: SongStats =
    { AnimeTitle = ""
      SongTitle = ""
      SongArtist = ""
      TimesCorrect = 0
      TimesWrong = 0
      WrongGuesses = [||] }

let emptyAllTimeStats: AllTimeStats = { AllTime = [||] }
