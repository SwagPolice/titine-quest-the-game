from random import randrange, randint, shuffle
from abc import ABC, abstractmethod
import csv
import gc


# DEFINE CHARACTERS AND PLAYER CLASSES


class Character(ABC):
    @abstractmethod
    def movement(self, position):
        pass


class Bard(Character):
    def movement(self, position):
        return randint(1, 78)


class Berserker(Character):
    def movement(self, position):
        return position + randint(1, 6)


class Mage(Character):
    def movement(self, position):
        return position + randint(1, 6)


class Priest(Character):
    def movement(self, position):
        return position + randint(1, 6)


class Sob(Character):
    def movement(self, position):
        return position + randint(1, 6)


class Thief(Character):
    def movement(self, position):
        return position + max(randint(1, 6), randint(1, 6))


class Warrior(Character):
    def movement(self, position):
        return position + randint(1, 6)


class Player:
    def __init__(self, name, gender, age, aggro, character_type):
        self.name = name  # name is used to keep track of a player if classes are switched
        self.gender = gender  # gender is used for some boxes
        self.age = age  # age is used for some boxes
        self.aggro = aggro  # aggro level represents likelihood for said player to use ability or ladders
        self.character_type = character_type  # class used to determine trait and ability
        self.position = 0  # box the player is currently on
        self.sh_drinks = 0  # number of shots drunk
        self.sip_drinks = 0  # number of sips drunk

    def __str__(self):
        return f"{self.name} ({self.gender}, {self.age}) as {self.character_type}: sips:{self.sip_drinks}, shots:{self.sh_drinks}"

    def move(self):
        self.position += self.character_type.movement(self.position)
        return self.position

    def change_character(self, new_character_type):
        self.character_type = new_character_type


# DEFINE LIST OF PLAYERS AND THEIR CLASSES


def get_all_subclasses(cls):
    all_subclasses = []

    for subclass in cls.__subclasses__():
        all_subclasses.append(subclass)
        all_subclasses.extend(get_all_subclasses(subclass))

    return all_subclasses


list_of_classes = get_all_subclasses(Character)

nb_players = randint(2, len(list_of_classes))

list_of_players = []

for i in range(nb_players):
    list_of_players.append(
        Player(
            name=f"Player {i+1}",
            gender=('M' if randint(0, 1) == 0 else 'F'),
            age=randint(18, 40),
            aggro=0,
            character_type=list_of_classes.pop(randint(0, len(list_of_classes) - 1))
        )
    )

for obj in gc.get_objects():
    if isinstance(obj, Player):
        print(obj)

for i in range(7):
    list_of_players[0].sip_drinks += 1

print(list_of_players[0])

# print(sum(1 for o in gc.get_referrers(Player) if o.__class__ is Player))


# setting up the board: who drinks what or goes where on each box

class Box:
    def __init__(self, number, gender, age, aggro, character_type):
        self.number



TPdict = {5: 32, 18: 13, 38: 38 - randrange(1, 7), 39: 64, 41: 25, 48: 61, 54: 49, 65: 41, 66: 69,
          68: 68 + 2 * randrange(1, 7), 69: randrange(1, 7), 75: 57}

cardDeck = [[i + 1, 'hearts'] for i in range(13)] + [[i + 1, 'clubs'] for i in range(13)] + [[i + 1, 'diamonds'] for i
                                                                                             in range(13)] + [
               [i + 1, 'spades'] for i in range(13)]
cardDiscard = []

tshots = 0
box = 0
turns = 0


def neutre(box):
    return (box + randrange(1, 7), 0)


def tshot(box):
    return (box + randrange(1, 7), 1)


def condiTShot(box):
    dice = randrange(1, 7) + randrange(1, 7)
    if dice == 2:
        return tshot(box)
    else:
        return neutre(box)


def TP(box):
    return (TPdict[box], 0)


board = [neutre for i in range(79)]

board[5] = TP
board[18] = TP
board[20] = condiTShot
board[25] = tshot
board[37] = tshot
board[38] = TP
board[39] = TP
board[41] = TP
board[48] = TP
board[54] = TP
board[55] = tshot
board[58] = tshot
board[61] = tshot
board[65] = TP
board[66] = TP
board[68] = TP
board[69] = TP
board[75] = TP


def lanceUneRun():
    tshots = 0
    box = 0
    turns = 0
    trip = []
    while box != 78:
        # print(box, tshots)
        trip.append(box)
        (box, tshot) = board[box](box)
        if box > 78:
            box = 78 - (box % 78)
        if tshot:
            tshots += 1
        turns += 1
    # print(trip)
    return ([turns, tshots])


def lanceXRuns(x):
    results = [['turns', 'tshots']]
    avgTshots = 0
    avgTurns = 0
    for i in range(x):
        results.append(lanceUneRun())
        avgTshots += lanceUneRun()[1]
        avgTurns += lanceUneRun()[0]
    print(avgTshots / x)
    print(avgTurns / x)
    with open("out.csv", "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerows(results)


lanceXRuns(100)
