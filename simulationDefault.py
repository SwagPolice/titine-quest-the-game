from random import randrange
import csv

TPdict = {5: 32, 18: 13, 38: 38 - randrange(1, 7), 39: 64, 41: 25, 48: 61, 54: 49, 65: 41, 66: 69, 68: 68 + 2 * randrange(1, 7), 69: randrange(1, 7), 75: 57}

cardDeck = [[i+1, 'hearts'] for i in range(13)] + [[i+1, 'clubs'] for i in range(13)] + [[i+1, 'diamonds'] for i in range(13)] + [[i+1, 'spades'] for i in range(13)]
cardDiscard = []

tshots = 0
box = 0
turns = 0

def neutre(box):
    return (box + randrange(1, 7), 0)

def tshot(box):
    return(box + randrange(1, 7), 1)

def condiTShot(box):
    dice = randrange(1, 7) + randrange(1, 7)
    if dice == 2:
        return tshot(box)
    else:
        return neutre(box)

def TP(box):
    return (TPdict[box], 0)

game = [neutre for i in range(79)]

game[5] = TP
game[18] = TP
game[20] = condiTShot
game[25] = tshot
game[37] = tshot
game[38] = TP
game[39] = TP
game[41] = TP
game[48] = TP
game[54] = TP
game[55] = tshot
game[58] = tshot
game[61] = tshot
game[65] = TP
game[66] = TP
game[68] = TP
game[69] = TP
game[75] = TP

def lanceUneRun():
    tshots = 0
    box = 0
    turns = 0
    trip = []
    while box != 78:
        #print(box, tshots)
        trip.append(box)
        (box, tshot) = game[box](box)
        if box > 78:
            box = 78 - (box % 78)
        if tshot:
            tshots += 1
        turns += 1
    #print(trip)
    return([turns, tshots])

def lanceXRuns(x):
    results = [['turns', 'tshots']]
    avgTshots = 0
    avgTurns = 0
    for i in range(x):
        results.append(lanceUneRun())
        avgTshots += lanceUneRun()[1]
        avgTurns += lanceUneRun()[0]
    print(avgTshots/x)
    print(avgTurns/x)
    with open("out.csv", "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerows(results)

lanceXRuns(100000)