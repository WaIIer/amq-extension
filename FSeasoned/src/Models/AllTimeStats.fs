module App.Models.AllTimeStats

type AllTimeStats = { allTime: SongStats array }

and SongStats =
    { animeTitle: string
      songArtist: string
      songTitle: string
      songType: string
      timesCorrect: int32
      timesWrong: int32
      wrongGuesses: string array }

let emptyAllTimeStats =
    { allTime = [] |> Seq.cast<SongStats> |> Seq.toArray }
