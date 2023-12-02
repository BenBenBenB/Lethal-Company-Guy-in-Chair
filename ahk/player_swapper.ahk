#Requires AutoHotkey v2.0
#MaxThreads 1
/*
For use in Lethal Company. Allows for fast switching between players in the terminal.
Reads list of players from the clipboard. Intended for use with a companion UI.

Hot keys
    = and middle mouse button will toggle the map view on and off in the terminal
    Several ways to cycle through players:
        [ and ]
        The side mouse buttons
        Scroll wheel left and right
    F5-F8 will jump to the first 4 players, respectively.
*/

; Global vars
curr_player_index := 1

/*
Functions
*/
SendCommand(command)
{
	Send command
	Send "{Enter}"
    sleep 50
    return
}

AllowCycleToPlayer(name)
{
    return name != "" and !RegExMatch(name, "^IGNOREDPLAYER:")
}

AllowJumpToPlayer(name)
{
    return name != ""
}

RemovePrefixFromName(name)
{
    return RegExMatch(name, "^IGNOREDPLAYER:")
    ? SubStr(name, 15)
    : name
}

SwitchToPlayer(name)
{
    name := Trim(name)
    if AllowJumpToPlayer(name) {
        SendCommand("switch " . RemovePrefixFromName(name))
    }
}

SwitchToIndex(index)
{
    global curr_player_index
    players := GetPlayers()
    try {
        SwitchToPlayer(players[index])
        curr_player_index := index
    }
}

IsPlayerListValid(players)
{
    Loop players.length {
        if Trim(players[A_Index]){
            return true
        }
    }
    return false
}

GetPlayers()
{
	text := RegExReplace(A_Clipboard, "`r") ; pesky windows users
	players := StrSplit(text, "`n")
    if (IsPlayerListValid(players) == false) {
        Throw "Your clipboard is empty! It should contain names separated by new lines."
    }
    return players
}

GetNextIndex(index, players)
{
    new_index := index + 1
    if (new_index > players.length) {
        new_index := 1
    }
    return new_index
}

GetNextPlayer()
{
    global curr_player_index
    search_count := 1

    players := GetPlayers()
    new_index := GetNextIndex(curr_player_index, players)
    while (!AllowCycleToPlayer(players[new_index]) and search_count < players.length) {
        new_index := GetNextIndex(new_index, players)
        search_count += 1
    }
    if curr_player_index == new_index {
        return ""
    }
    else {
        curr_player_index := new_index
        return players[curr_player_index]
    }
}

GetPrevIndex(index, players)
{
    new_index := index - 1
    if (new_index == 0) {
        new_index := players.length
    }
    return new_index
}

GetPrevPlayer()
{
    global curr_player_index
    search_count := 1

    players := GetPlayers()
    new_index := GetPrevIndex(curr_player_index, players)
    while (!AllowCycleToPlayer(players[new_index]) and search_count < players.length) {
        new_index := GetPrevIndex(new_index, players)
        search_count += 1
    }
    if curr_player_index == new_index {
        return ""
    }
    else {
        curr_player_index := new_index
        return players[curr_player_index]
    }
}

/*
Hot Keys
*/
; toggle map in terminal
$MButton::
$=::
{
    SendCommand("view monitor")
}

; cycle to prev player
$[::
$XButton1::
$WheelLeft::
{
    next_player := GetPrevPlayer()
    SwitchToPlayer(next_player)
    return
}

; cycle to next player
$]::
$XButton2::
$WheelRight::
{
    next_player := GetNextPlayer()
    SwitchToPlayer(next_player)
    return
}

; bind first four players to hotkeys
$F5::
{
    SwitchToIndex(1)
}
$F6::
{
    SwitchToIndex(2)
}
$F7::
{
    SwitchToIndex(3)
}
$F8::
{
    SwitchToIndex(4)
}
