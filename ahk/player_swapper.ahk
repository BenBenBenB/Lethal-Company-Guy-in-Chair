#Requires AutoHotkey v2.0
#MaxThreads 1
/*
For use in Lethal Company. Allows for fast switching between players and radars in the terminal.
Also allows user to ping and flash from the terminal.
Reads list of players from the clipboard. Intended for use with a companion UI.
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
    sleep 100
}

CommandPlayerByName(command, name)
{
    cleanName := RemovePrefixFromName(name)
    if (cleanName != "") {
        SendCommand(command . " " . cleanName)
    }
}

CommandPlayerByIndex(command, index)
{
    global curr_player_index
    try {
        players := GetPlayers()
        CommandPlayerByName(command, players[index])
        if (command == "switch") {
            curr_player_index := index
        }
    }
}

AllowCycleToPlayer(name)
{
    return name != "" and !RegExMatch(name, "^IGNOREDPLAYER:")
}

RemovePrefixFromName(name)
{
    return RegExMatch(name, "^IGNOREDPLAYER:")
    ? Trim(SubStr(name, 15))
    : Trim(name)
}

SwitchToIndex(index)
{
    global curr_player_index
    players := GetPlayers()
    try {
        CommandPlayerByName("switch", players[index])
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
    return (new_index > players.length)
        ? new_index := 1
        : new_index
}

GetNextPlayer()
{
    global curr_player_index

    players := GetPlayers()
    new_index := GetNextIndex(curr_player_index, players)
    while (!AllowCycleToPlayer(players[new_index]) and curr_player_index != new_index) {
        new_index := GetNextIndex(new_index, players)
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
    return (new_index == 0)
        ? new_index := players.length
        : new_index
}

GetPrevPlayer()
{
    global curr_player_index

    players := GetPlayers()
    new_index := GetPrevIndex(curr_player_index, players)
    while (!AllowCycleToPlayer(players[new_index]) and curr_player_index != new_index) {
        new_index := GetPrevIndex(new_index, players)
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
; bespoke input: global hot key - toggle map
/*
${toggleMap_global_hotkeys[0]}::
${toggleMap_global_hotkeys[1]}::
*/
$MButton::
$=::
{
    SendCommand("view monitor")
}

; cycle to prev player
; bespoke input: global hot key - cycle prev
/*
${cyclePrev_global_hotkeys[0]}::
${cyclePrev_global_hotkeys[1]}::
*/
$[::
$XButton1::
$WheelLeft::
{
    prev_player := GetPrevPlayer()
    CommandPlayerByName("switch", prev_player)
}

; cycle to next player
; bespoke input: global hot key - cycle next
/*
${cycleNext_global_hotkeys[0]}::
${cycleNext_global_hotkeys[1]}::
*/
$]::
$XButton2::
$WheelRight::
{
    next_player := GetNextPlayer()
    CommandPlayerByName("switch", next_player)
}

; ping current (for radars)
; bespoke input: global hot key - ping hotkeys
/*
${ping_global_hotkeys[0]}::
${ping_global_hotkeys[1]}::
*/
$P::
{
    global curr_player_index
    CommandPlayerByIndex("ping", curr_player_index)
}
; flash current (for radars)
; bespoke input: global hot key - flash hotkeys
/*
${flash_global_hotkeys[0]}::
${flash_global_hotkeys[1]}::
*/
$O::
{
    global curr_player_index
    CommandPlayerByIndex("flash", curr_player_index)
}

; bind hotkeys for specific radars and players - switch, ping, and flash
; bespoke input: each row of table, 'view switch' column hotkeys
/*
${view_hotkeys[0]}::
${view_hotkeys[1]}::
{
    CommandPlayerByIndex("switch", {index})
}
*/

; bespoke input: each row of table, 'ping' column hotkeys
/*
${ping_hotkeys[0]}::
${ping_hotkeys[1]}::
{
    CommandPlayerByIndex("ping", {index})
}
*/

; bespoke input: each row of table, 'flash' column hotkeys
/*
${flash_hotkeys[0]}::
${flash_hotkeys[1]}::
{
    CommandPlayerByIndex("flash", {index})
}
*/
