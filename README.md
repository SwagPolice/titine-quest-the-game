# titine-quest-the-game
A script which simulates a custom drinking board game I created with a friend.
The goal of the script is to balance the game, by determining what changes have to be made to classes and avoid drinking too much.
The current version does not simulate all the classes, but allow to simulates multiple games to get an average number of turns and t-shots.
Why t-shots? Because Titine the Bird decides which shot you will get!

## What is needed to play
- Titine's Quest board
- a regular card game
- some dice
- a piece/token for each player
- a piece representing Titine
- 4 ladders
- drinks
- 4 bottles of shot drinks
- some other tools for the different classes in the game (to be determined)

## Rules of the game
Titine's Quest is a drinking board game with RPG elements, whose board mechanics are inspired by Goose Game.
The goal is to be the first player to land on the last box of the board.

Note that, depending on your class, your moves, start position or actions can change. Only the default behaviour is presented in these rules to keep things clear.

### Game start
At the start of the game, every player rolls a die to be assigned one class (thief, mage, priest,...), which give them access to two abilities: one passive and one active.

The passive one affects the way your move or drink during the game, and you can trigger the active one by drinking a t-shot on your turn.

All pieces start on box 0, the younger starts and the game goes clockwise.

### Playing a turn
At the start of your turn, you roll a die and move forward according to its result.

You play according to the effect of the box you land on: it can just be drinking from your glass, some mini-games (sometimes involving cards), teleporting to another box, or drinking a t-shot.

In case of teleportation or ladder (see Ladders), you keep resolving the effects of the boxes you land on (ex: teleporting --> teleporting --> drink a shot)

You can activate your active ability once anytime during your turn.

If you ever exceed the last box (n°78), you have to go back from the extra number of boxes. Ex: if you are on box 75 and you roll a 5, you will end up on box 76.

### T-shots and Titine
A t-shot is a shot from the bottles of shot drinks. Titine the bird decides which shot drink will be poured everytime a t-shot is required.

At the start of the game, roll a die to determine on which bottle Titine will start, and put the Titine piece on the top of this bottle.

Whenever a player has to drink a t-shot, they have to drink from the bottle Titine is on, and move Titine on the next bottle.

Note that is a player has to drink multiple t-shots, they have to be from the same bottle.

### Ladders
Ladders are tools that connect two boxes from two differents rows.

At the start of the game, the four ladders are placed in each corner of the board.

You can move one of them for every 6 you roll on your move die at the start of your turn. There is no restrictions on where the ladders can be placed.

Anytime a player lands on a box containing a ladder, any player can drink one t-shot to make the player use it.

For example, if you land on a box containing a ladder that connects with a higher box, you can drink one t-shot to use the ladder.

On the contrary, another player can drink a t-shot to make you climb down a ladder if you land on a box containing one that connects with a lower box.

Of course, a player can counter the use of a ladder by drinking 2 shots, and he can himself be countered by another player who drinks 3 shots... In a system similar to an auction.

Note: during the auction, the player using the ladder is considered climbing the ladder. If they stay on the box they were on before climbing at the end of the auction, they do not activate its effect again but, if they climb the ladder, they activate the effect of the box they land on.
