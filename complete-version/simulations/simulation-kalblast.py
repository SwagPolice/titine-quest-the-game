# simulationV4.py
#
# Monte Carlo simulation of KALBLAST, matching the rules in complete-version/rulebook
# and the class cards in complete-version/classes/class_cards/baseline.html.
#
# Goals (per design discussion):
#   - estimate total sips/shots consumed per game (danger check)
#   - estimate win rate per class (balance check)
#   - estimate game length in rounds
#
# Known simplifications (documented inline where they occur):
#   - Named social mini-games (Suitcase, X or Y, According to..., Is this anecdote...,
#     Never have I ever, Would you rather) collapse to "every player drinks 1 sip" —
#     their real outcome depends on human memory/social judgement, not simulatable.
#   - Rooms referencing untracked real-world state (age, gender, glass fullness) use a
#     symmetric stand-in (random player / random half of players).
#   - Each player has a single continuous `aggressivity` in [0, 1] driving every
#     "does this player push their luck" decision (ladder bids, optional ability use,
#     Turbo Killer's K, etc.) — generalizes simulationV3.py's will_drink() decay.
#   - Clazgreb's 1d60 roll is NOT treated as eligible for the "roll a 6 -> move a
#     ladder" rule (that rule reads as being about the d6 movement die specifically).
#   - A ladder Challenge is represented by a single opponent (the most aggressive one),
#     rather than modeling all opponents independently deciding to challenge.

import random
import statistics

BOARD_SIZE = 60
MAX_ROUNDS = 300  # safety timeout (e.g. Advisor "nobody wins" condition)

# Ladders: bottom -> top (as given: 7-33, 27-47, 14-38, 21-43)
DEFAULT_LADDERS = {7: 33, 27: 47, 14: 38, 21: 43}

# Exact spiral coordinates from complete-version/boards/board-rules.js / board.html,
# so Manhattan-distance templates (Clazgreb, Brenchilli) match the real board.
SPIRAL_COORDS = [
    (7, 0), (7, 1), (7, 2), (7, 3), (7, 4), (7, 5), (7, 6), (7, 7),
    (6, 7), (5, 7), (4, 7), (3, 7), (2, 7), (1, 7), (0, 7),
    (0, 6), (0, 5), (0, 4), (0, 3), (0, 2), (0, 1), (0, 0),
    (1, 0), (2, 0), (3, 0), (4, 0), (5, 0), (6, 0),
    (6, 1), (6, 2), (6, 3), (6, 4), (6, 5), (6, 6),
    (5, 6), (4, 6), (3, 6), (2, 6), (1, 6),
    (1, 5), (1, 4), (1, 3), (1, 2), (1, 1),
    (2, 1), (3, 1), (4, 1), (5, 1),
    (5, 2), (5, 3), (5, 4), (5, 5),
    (4, 5), (3, 5), (2, 5),
    (2, 4), (2, 3), (2, 2),
    (3, 2), (4, 2),
    (3, 3),
]

CLAZGREB_TEMPLATE = {0: 4, 1: 3, 2: 2}
BRENCHILLI_TEMPLATE = {0: 3, 1: 2, 2: 1}

CLASSES = [
    "firefoxxx", "spy", "advisor", "clazgreb", "carnila",
    "turbo_killer", "robiocoop", "priest", "vanilla", "brenchilli",
]


def manhattan(room_a, room_b):
    r1, c1 = SPIRAL_COORDS[room_a]
    r2, c2 = SPIRAL_COORDS[room_b]
    return abs(r1 - r2) + abs(c1 - c2)


def rps_winner(rng):
    """Simulate one RPS throw between two players; returns True if player A wins, False if B wins."""
    choices = ("rock", "paper", "scissors")
    beats = {"rock": "scissors", "scissors": "paper", "paper": "rock"}
    while True:
        a, b = rng.choice(choices), rng.choice(choices)
        if a == b:
            continue
        return beats[a] == b


class Player:
    def __init__(self, idx, cls, aggressivity, rng):
        self.idx = idx
        self.cls = cls
        self.aggressivity = aggressivity
        self.rng = rng
        self.position = 0
        self.sips = 0
        self.shots = 0
        self.priest_tokens = 0
        self.has_advisor_token = False
        self.bound_to = None  # idx of player this one is bound to
        self.ladder_inventory = 0  # Brenchilli: number of ladders held off-board
        self.vanilla_counter = 0  # Paul Guaca's Š-counter

    def drink_sip(self, n=1):
        self.sips += max(0, n)

    def drink_shot(self, n=1):
        self.shots += max(0, n)

    def wants_to_push(self, stakes=0):
        """General 'does this player keep escalating / spend resources' check.
        Decays with stakes already committed, mirroring simulationV3.py's will_drink()."""
        prob = max(0.05, self.aggressivity - 0.05 * stakes)
        return self.rng.random() < prob


class Game:
    def __init__(self, classes, aggressivities, seed=None):
        self.rng = random.Random(seed)
        self.players = [
            Player(i, c, aggressivities[i], self.rng) for i, c in enumerate(classes)
        ]
        self.ladders = dict(DEFAULT_LADDERS)
        self.landmines = {}  # room -> owner idx (Carnila)
        self.house_rules = []  # stack of creator idx (rooms 32/54)
        self.round = 0
        self.current_idx = 0
        self.winner = None
        self.used_ladders_this_turn = set()

        # Advisor tokens are granted at game start to whoever starts as the Advisor,
        # no matter how many players do (duplicates allowed).
        for p in self.players:
            if p.cls == "advisor":
                p.has_advisor_token = True

    # ---- helpers -------------------------------------------------------

    def other_players(self, player):
        return [p for p in self.players if p is not player]

    def player_ahead_of(self, player):
        """'Closest ahead on the board' — smallest positive position gap, ties broken by index."""
        candidates = [p for p in self.other_players(player) if p.position >= player.position]
        if not candidates:
            candidates = self.other_players(player)
        return min(candidates, key=lambda p: (p.position - player.position) % (BOARD_SIZE + 1))

    def all_have_advisor_token(self):
        return all(p.has_advisor_token for p in self.players)

    def break_bond(self, player):
        if player.bound_to is not None:
            self.players[player.bound_to].bound_to = None
            player.bound_to = None

    def bind(self, a, b):
        self.break_bond(a)
        self.break_bond(b)
        a.bound_to = b.idx
        b.bound_to = a.idx

    def drink_sip_with_bond(self, player, n=1):
        player.drink_sip(n)
        if player.bound_to is not None:
            self.players[player.bound_to].drink_sip(n)

    def drink_shot(self, player, n=1):
        # Š never propagates through Bound (per rulebook FAQ).
        player.drink_shot(n)

    # ---- ladders ---------------------------------------------------------

    def ladder_end_at(self, room):
        for bottom, top in self.ladders.items():
            if room == bottom:
                return top, "up"
            if room == top:
                return bottom, "down"
        return None, None

    def move_a_ladder(self, player):
        """Reconnect one ladder between two rooms of the mover's choosing.
        Simplified policy: move the ladder least useful to the leader toward
        rooms closer to the mover's own position, biased by aggressivity."""
        if not self.ladders:
            return  # all ladders currently held in players' inventories (e.g. multiple Brenchillis)
        bottom = self.rng.choice(list(self.ladders.keys()))
        old_top = self.ladders[bottom]
        del self.ladders[bottom]
        new_bottom = max(0, min(BOARD_SIZE - 1, player.position + self.rng.randint(-10, 10)))
        new_top = max(new_bottom + 1, min(BOARD_SIZE - 1, new_bottom + self.rng.randint(5, 20)))
        if new_top >= BOARD_SIZE:
            new_top = BOARD_SIZE - 1
        self.ladders[new_bottom] = new_top

    def ladder_event(self, player, room):
        """Resolve a Ladder Event for `player` landing in `room`. Returns the room
        they end up in after resolution (either end of the ladder)."""
        other_end, direction = self.ladder_end_at(room)
        if other_end is None or room in self.used_ladders_this_turn:
            return room
        self.used_ladders_this_turn.add(room)
        self.used_ladders_this_turn.add(other_end)

        wants_to_climb = direction == "up"  # default: prefer climbing up, avoid climbing down
        challenger = max(self.other_players(player), key=lambda p: p.aggressivity)

        bid = 1
        challenger.drink_shot(bid)
        active_wins = False  # whether the active player's original intent prevails
        turn = "challenger"
        current_bidder, other_bidder = challenger, player
        while True:
            if not current_bidder.wants_to_push(bid):
                active_wins = current_bidder is challenger  # the other side's intent prevails
                break
            bid += 1
            current_bidder.drink_shot(bid)
            current_bidder, other_bidder = other_bidder, current_bidder

        climbs = wants_to_climb if active_wins else not wants_to_climb
        return other_end if climbs else room

    # ---- movement ----------------------------------------------------

    def roll_movement(self, player):
        """Returns (new_room, sixes) where sixes counts d6 movement dice showing a 6
        (only additive d6-based rolls count, per the rulebook's "movement die")."""
        r = self.rng
        pos = player.position

        if player.cls == "clazgreb":
            return r.randint(1, BOARD_SIZE), 0

        if player.cls == "carnila":
            d1, d2 = r.randint(1, 6), r.randint(1, 6)
            steps = max(d1, d2)
            sixes = int(d1 == 6) + int(d2 == 6)
            return pos + steps, sixes

        if player.cls == "vanilla":
            d1, d2 = r.randint(1, 6), r.randint(1, 6)
            player.drink_sip(min(d1, d2))
            sixes = int(d1 == 6) + int(d2 == 6)
            return pos + d1 + d2, sixes

        if player.cls == "advisor":
            d1 = r.randint(1, 6)
            d2 = r.randint(1, 6)
            target = r.choice(self.other_players(player))
            if r.random() < 0.5:
                delta = d2 if r.random() < 0.5 else -d2
                target.position = max(0, min(BOARD_SIZE, target.position + delta))
            else:
                if r.random() < 0.5:
                    self.drink_sip_with_bond(target, d2)
                else:
                    for p in self.other_players(player):
                        self.drink_sip_with_bond(p, 1)
            return pos + d1, int(d1 == 6)

        if player.cls == "spy":
            ahead = [p for p in self.other_players(player) if p.position > pos]
            if ahead:
                nearest = min(ahead, key=lambda p: p.position - pos)
                return self.roll_movement_as(nearest.cls, player)
            d = r.randint(1, 6)
            return pos + d, int(d == 6)

        # Default: 1d6 (FireFoxxx, Turbo Killer, Robiocoop, Priest, Brenchilli)
        d = r.randint(1, 6)
        sixes = int(d == 6)

        if player.cls == "firefoxxx" and player.wants_to_push():
            tens_digit = (pos // 10) % 10
            cost = 2 * tens_digit
            player.drink_sip(cost)
            d = r.randint(1, 6)
            sixes = int(d == 6)

        if player.cls == "brenchilli" and d % 2 == 0:
            self.move_a_ladder(player)

        return pos + d, sixes

    def roll_movement_as(self, cls, player):
        """Helper for the Spy copying another class's movement mechanic (simplified)."""
        r = self.rng
        pos = player.position
        if cls == "clazgreb":
            return r.randint(1, BOARD_SIZE), 0
        if cls == "carnila":
            d1, d2 = r.randint(1, 6), r.randint(1, 6)
            return pos + max(d1, d2), int(d1 == 6) + int(d2 == 6)
        if cls == "vanilla":
            d1, d2 = r.randint(1, 6), r.randint(1, 6)
            player.drink_sip(min(d1, d2))
            return pos + d1 + d2, int(d1 == 6) + int(d2 == 6)
        d = r.randint(1, 6)
        return pos + d, int(d == 6)

    def move(self, player):
        new_room, sixes = self.roll_movement(player)

        if player.cls != "clazgreb":
            if new_room > BOARD_SIZE:
                overshoot = new_room - BOARD_SIZE
                new_room = BOARD_SIZE - overshoot
        new_room = max(0, new_room)

        for _ in range(sixes):
            self.move_a_ladder(player)

        player.position = new_room
        return new_room

    # ---- room effects --------------------------------------------------

    def resolve_landing(self, player, depth=0):
        """Resolve room effect(s) for the active player's current position,
        including ladder events and chained teleports/ladders."""
        if depth > 20:
            return  # safety valve against pathological chains
        room = player.position

        end, _ = self.ladder_end_at(room)
        if end is not None and room not in self.used_ladders_this_turn:
            player.position = self.ladder_event(player, room)
            self.resolve_landing(player, depth + 1)
            return

        teleport_to = self.apply_room_effect(player, room)
        if teleport_to is not None:
            player.position = teleport_to
            self.resolve_landing(player, depth + 1)

    def apply_room_effect(self, player, room):
        """Apply room `room`'s printed effect for `player`. Returns a room number
        to teleport to (for chaining), or None."""
        r = self.rng
        others = self.other_players(player)

        FLAT_SIP_MINIGAME = {9, 15, 17, 22, 23, 24, 37, 40, 42, 45, 47, 59}
        if room in FLAT_SIP_MINIGAME:
            for p in self.players:
                self.drink_sip_with_bond(p, 1)
            return None

        if room == 0:
            return None
        if room == 1:
            for p in self.players:
                self.drink_sip_with_bond(p, 1)
            return None
        if room == 2:  # left
            self.drink_sip_with_bond(self.players[(player.idx + 1) % len(self.players)])
            return None
        if room == 3:  # across
            self.drink_sip_with_bond(self.players[(player.idx + len(self.players) // 2) % len(self.players)])
            return None
        if room == 4:
            return 28
        if room == 5:
            self.drink_sip_with_bond(player)
            return None
        if room == 6:
            opp = r.choice(others)
            winner_is_player = rps_winner(r)
            loser = opp if winner_is_player else player
            self.drink_shot(loser, 1)
            return None
        if room == 7:
            self.drink_sip_with_bond(player)
            self.move_a_ladder(player)
            return None
        if room == 8:
            self.drink_sip_with_bond(r.choice(others))
            return None
        if room == 10 or room == 20:
            for p in self.players:
                self.drink_sip_with_bond(p, 1)
            return None
        if room == 11:
            if player.wants_to_push():
                self.drink_shot(player, 2)
            return None
        if room == 12:
            self.drink_sip_with_bond(player)
            return None
        if room == 13:  # right
            self.drink_sip_with_bond(self.players[(player.idx - 1) % len(self.players)])
            return None
        if room == 14:
            for p in self.players:
                beaten_by = sum(1 for _ in others if rps_winner(r) is False)
            # Each player drinks a sip for every opponent whose sign beats theirs.
            for p in self.players:
                beats_count = 0
                for _ in self.other_players(p):
                    if not rps_winner(r):
                        beats_count += 1
                self.drink_sip_with_bond(p, beats_count)
            return None
        if room == 16:
            d = r.randint(1, 6)
            self.drink_sip_with_bond(player, d)
            return None
        if room == 18:
            d = r.randint(1, 6)
            if d % 2 == 0:
                self.drink_sip_with_bond(player, d)
            else:
                for p in others:
                    self.drink_sip_with_bond(p, d)
            return None
        if room == 19:
            self.drink_sip_with_bond(player)
            self.extra_turn = True
            return None
        if room == 21:
            self.drink_shot(player, 1)
            return None
        if room == 25 or room == 44 or room == 58:
            return None  # drink water
        if room == 26 or room == 27:
            for p in r.sample(self.players, k=max(1, len(self.players) // 2)):
                self.drink_sip_with_bond(p, 1)
            return None
        if room == 28:
            self.drink_sip_with_bond(player)
            self.house_rules.append(player.idx)
            return None
        if room == 29:
            self.bind(player, r.choice(others))
            return None
        if room == 30:
            for p in r.sample(others, k=min(2, len(others))):
                self.drink_sip_with_bond(p, 2)
            return None
        if room == 31:
            self.drink_sip_with_bond(player)
            return 50
        if room == 32:
            self.drink_shot(player, 1)
            self.house_rules.append(player.idx)
            return None
        if room == 33:
            player.priest_tokens += 1
            return None
        if room == 34:
            self.drink_sip_with_bond(r.choice(self.players), 2)
            return None
        if room == 35:
            classes = [p.cls for p in self.players]
            for i, p in enumerate(self.players):
                p.cls = classes[i - 1]
            return None
        if room == 36:
            return None  # trade-glasses flavor effect, no net sip change modeled
        if room == 38:
            self.drink_shot(player, 1)
            return None
        if room == 39:
            self.drink_sip_with_bond(player)
            return 31
        if room == 41:
            partner = self.players[(player.idx + len(self.players) // 2) % len(self.players)]
            self.bind(player, partner)
            return None
        if room == 43:
            if player.wants_to_push():
                self.drink_shot(player, 1)
            else:
                self.drink_shot(player, 2)
            return None
        if room == 46:
            for p in r.sample(self.players, k=max(1, len(self.players) // 2)):
                self.drink_sip_with_bond(p, 1)
            return None
        if room == 48:
            player.free_ability = True
            return None
        if room == 49:
            partner_idx = (player.idx + 1) % len(self.players)
            player.cls, self.players[partner_idx].cls = self.players[partner_idx].cls, player.cls
            return None
        if room == 50:
            self.clazgreb_shockwave(player, self.rng.randint(1, BOARD_SIZE), hits_self=True)
            return None
        if room == 51:
            self.drink_sip_with_bond(player)
            player.position = min(BOARD_SIZE, player.position + 3)
            return None
        if room == 52:
            self.landmines[player.position] = player.idx
            return None
        if room == 53:
            d1, d2 = r.randint(1, 6), r.randint(1, 6)
            self.drink_sip_with_bond(player, d1 + d2)
            player.position = min(BOARD_SIZE, player.position + d1 + d2)
            return None
        if room == 54:
            if self.house_rules:
                creator_idx = self.house_rules.pop()
                self.drink_sip_with_bond(self.players[creator_idx])
            else:
                self.drink_sip_with_bond(player)
            return None
        if room == 55:
            swept = True
            for opp in others:
                if rps_winner(r):
                    self.drink_sip_with_bond(opp, 1)
                else:
                    self.drink_sip_with_bond(player, 1)
                    swept = False
            if swept:
                self.drink_shot(player, 1)
            return None
        if room == 56:
            self.drink_sip_with_bond(r.choice(self.players), 1)
            return None
        if room == 57:
            if player.wants_to_push():
                self.drink_shot(player, 1)
                self.extra_turn = True
            else:
                self.drink_sip_with_bond(player, 2)
                player.position = min(BOARD_SIZE, player.position + 1)
            return None
        if room == 60:
            # "Chug their glass" has no fixed quantity and is a one-time end-of-game
            # event, not part of ongoing pacing — approximate as a full glass (~8 sips)
            # rather than let it dominate the sips-per-turn danger stat.
            for p in others:
                self.drink_sip_with_bond(p, 8)
            self.winner = player.idx
            return None

        # Landmine check (any room not otherwise special-cased may hold one)
        return None

    def clazgreb_shockwave(self, caster, center, hits_self=False):
        for p in self.players:
            if p is caster and not hits_self:
                continue
            dist = manhattan(p.position, center)
            shots = CLAZGREB_TEMPLATE.get(dist, 0)
            if shots:
                self.drink_shot(p, shots)

    # ---- active abilities ------------------------------------------------

    def maybe_use_active_ability(self, player):
        if not player.wants_to_push():
            return
        others = self.other_players(player)
        r = self.rng

        if player.cls == "firefoxxx":
            self.drink_shot(player, 1)
            reach = r.randint(2, 12)
            hit = [p for p in others if manhattan(player.position, p.position) <= reach]
            for p in hit:
                self.drink_shot(p, 1)
            if len(hit) == len(others):
                for p in hit:
                    self.drink_shot(p, 1)

        elif player.cls == "spy":
            occupied = [p for p in others if p.position == player.position]
            if occupied:
                self.drink_shot(player, 1)
                # simplified: no further mechanical effect beyond the cost

        elif player.cls == "advisor":
            eligible = [p for p in others if not p.has_advisor_token]
            if eligible:
                self.drink_shot(player, 1)
                target = r.choice(eligible)
                player.position, target.position = target.position, player.position
                player.cls, target.cls = target.cls, player.cls

        elif player.cls == "clazgreb":
            self.drink_shot(player, 1)
            center = r.randint(1, BOARD_SIZE)
            self.clazgreb_shockwave(player, center, hits_self=False)

        elif player.cls == "carnila":
            self.drink_shot(player, 1)
            self.landmines[player.position] = player.idx

        elif player.cls == "turbo_killer":
            k = 1 + round(player.aggressivity * 2)
            self.drink_shot(player, k)
            swept = True
            for opp in others:
                if rps_winner(r):
                    self.drink_shot(opp, k)
                    player.position = min(BOARD_SIZE, player.position + k)
                else:
                    opp.position = min(BOARD_SIZE, opp.position + k)
                    swept = False
            if swept:
                for opp in others:
                    self.drink_shot(opp, k)
                    player.position = min(BOARD_SIZE, player.position + k)

        elif player.cls == "robiocoop":
            self.drink_shot(player, 1)
            target = self.player_ahead_of(player)
            wins = sum(1 for _ in range(3) if rps_winner(r))
            if wins >= 2:
                self.drink_shot(target, 2)
                player.position = target.position
            else:
                self.drink_shot(target, 1)

        elif player.cls == "priest":
            self.drink_shot(player, 1)
            gained = r.randint(1, 6)
            gained = 1 if gained <= 2 else 2 if gained <= 4 else 3
            player.priest_tokens = min(3, player.priest_tokens + gained)

        elif player.cls == "vanilla":
            self.drink_shot(player, 1)
            target = r.choice(others)
            self.drink_shot(target, 1)
            player.vanilla_counter += 1
            if player.vanilla_counter >= 6:
                pool = list(others)
                for _ in range(6):
                    self.drink_shot(r.choice(pool), 1)
                player.vanilla_counter = 0

        elif player.cls == "brenchilli":
            self.drink_shot(player, 1)
            if self.ladders and r.random() < 0.5 and player.ladder_inventory == 0:
                bottom = r.choice(list(self.ladders.keys()))
                del self.ladders[bottom]
                player.ladder_inventory += 1
                anchor = bottom
            elif player.ladder_inventory > 0:
                player.ladder_inventory -= 1
                new_bottom = max(0, min(BOARD_SIZE - 1, player.position + r.randint(-5, 5)))
                new_top = min(BOARD_SIZE - 1, new_bottom + r.randint(5, 15))
                self.ladders[new_bottom] = new_top
                anchor = new_top
            else:
                anchor = player.position
            for p in self.players:
                dist = manhattan(p.position, anchor)
                shots = BRENCHILLI_TEMPLATE.get(dist, 0)
                if shots:
                    self.drink_shot(p, shots)

    # ---- priest token usage (any class, whenever forced to drink a Š) ----

    def maybe_use_priest_token(self, player, shots_owed):
        if player.priest_tokens <= 0 or shots_owed <= 0:
            return shots_owed
        if not player.wants_to_push():
            return shots_owed
        player.priest_tokens -= 1
        roll = self.rng.randint(1, 6)
        sip_equivalent = shots_owed * roll
        if roll <= 3 or player.wants_to_push():
            self.drink_sip_with_bond(player, sip_equivalent)
            return 0
        return shots_owed

    # ---- turn loop -----------------------------------------------------

    def play_turn(self):
        self.used_ladders_this_turn.clear()
        player = self.current
        self.extra_turn = False

        if self.rng.random() < 0.5:
            self.maybe_use_active_ability(player)
        self.move(player)
        self.resolve_landing(player)
        if self.winner is not None:
            return
        if self.rng.random() >= 0.5:
            self.maybe_use_active_ability(player)

        if player.cls == "turbo_killer":
            if room_is_blue(player.position):
                for p in self.other_players(player):
                    self.drink_sip_with_bond(p, 2)
            elif room_is_purple(player.position):
                self.drink_sip_with_bond(player, 1)

        if self.all_have_advisor_token():
            self.winner = -1  # nobody wins

        if not self.extra_turn:
            self.current_idx = (self.current_idx + 1) % len(self.players)
            if self.current_idx == 0:
                self.round += 1

    @property
    def current(self):
        return self.players[self.current_idx]

    def run(self):
        while self.winner is None and self.round < MAX_ROUNDS:
            self.play_turn()
        return self.winner


def room_is_blue(room):
    return room != 0 and room % 2 == 0


def room_is_purple(room):
    return room % 2 == 1


# ---- Monte Carlo runner ------------------------------------------------

def run_simulations(num_games=2000, min_players=2, max_players=6, seed=None):
    rng = random.Random(seed)
    class_wins = {c: 0 for c in CLASSES}
    class_games = {c: 0 for c in CLASSES}
    all_sips, all_shots, game_lengths, no_winner_count = [], [], [], 0

    for g in range(num_games):
        n_players = rng.randint(min_players, max_players)
        classes = [rng.choice(CLASSES) for _ in range(n_players)]
        aggressivities = [rng.uniform(0.2, 0.9) for _ in range(n_players)]
        for c in classes:
            class_games[c] += 1

        game = Game(classes, aggressivities, seed=rng.randint(0, 2**31))
        winner = game.run()

        game_lengths.append(game.round)
        total_sips = sum(p.sips for p in game.players)
        total_shots = sum(p.shots for p in game.players)
        all_sips.append(total_sips / n_players)
        all_shots.append(total_shots / n_players)

        if winner is None or winner == -1:
            no_winner_count += 1
        else:
            class_wins[classes[winner]] += 1

    print(f"Simulated {num_games} games ({min_players}-{max_players} players, random classes)")
    print(f"Timeouts/no-winner: {no_winner_count} ({100 * no_winner_count / num_games:.1f}%)")
    print()
    print(f"Avg sips/player/game:  {statistics.mean(all_sips):.1f}  (median {statistics.median(all_sips):.1f})")
    print(f"Avg shots/player/game: {statistics.mean(all_shots):.1f}  (median {statistics.median(all_shots):.1f})")
    print(f"Avg game length:       {statistics.mean(game_lengths):.1f} rounds "
          f"(median {statistics.median(game_lengths):.1f}, max {max(game_lengths)})")
    print()
    print("Win rate by class (relative to games played, not games won):")
    for c in CLASSES:
        played = class_games[c]
        wins = class_wins[c]
        rate = 100 * wins / played if played else 0
        print(f"  {c:14s}: {wins:4d} wins / {played:4d} games  ({rate:5.1f}%)")


if __name__ == "__main__":
    run_simulations()
