# game_simulation.py
import random
from typing import List, Dict, Callable, Tuple, Optional


class Character:
    """
    Représente une classe de personnage avec :
    - une fonction de lancer (`roll_movement`) retournant (cases, nombre_de_6).
    - un passif continu (`modify_movement`).
    - un pouvoir passif ponctuel (`passive_power`).
    - un pouvoir actif (`active_power`).
    """

    def __init__(self,
                 name: str,
                 roll_movement: Callable[['Game', 'Player'], Tuple[int, int]],
                 modify_movement: Callable[['Game', 'Player', int], int],
                 passive_power: Callable[['Game', 'Player'], None],
                 active_power: Callable[['Game', 'Player'], None]):
        self.name = name
        self.roll_movement = roll_movement
        self.modify_movement = modify_movement
        self.passive_power = passive_power
        self.active_power = active_power

    def use_active_power(self, game: 'Game', player: 'Player') -> None:
        self.active_power(game, player)

    def apply_passive_power(self, game: 'Game', player: 'Player') -> None:
        self.passive_power(game, player)

    def get_steps_and_sixes(self, game: 'Game', player: 'Player') -> Tuple[int, int]:
        base, sixes = self.roll_movement(game, player)
        effective = self.modify_movement(game, player, base)
        return effective, sixes


class Player:
    """Représente un joueur dans la partie."""

    def __init__(self, player_id: int, character: Character, shot_aggressivity: str = "medium"):
        self.player_id = player_id
        self.character = character
        self.position = 0
        self.sips_consumed = 0
        self.shots_consumed = 0
        if shot_aggressivity not in ("hard", "medium", "easy"):
            raise ValueError("shot_aggressivity must be 'hard', 'medium', or 'easy'")
        self.shot_aggressivity = shot_aggressivity

    def drink_sips(self, amount: int = 1) -> None:
        self.sips_consumed += amount

    def drink_shots(self, amount: int = 1) -> None:
        self.shots_consumed += amount

    def will_drink(self) -> bool:
        if self.shot_aggressivity == "easy":
            return False
        base_prob = 0.8 if self.shot_aggressivity == "hard" else 0.5
        prob = max(0.1, base_prob - 0.05 * self.shots_consumed)
        return random.random() < prob


class BoardSpace:
    def __init__(self, index: int, effect: Callable[['Game', 'Player'], None]):
        self.index = index
        self.effect = effect

    def apply_effect(self, game: 'Game', player: 'Player') -> None:
        self.effect(game, player)


class Board:
    """Plateau de jeu en spirale 8x8, avec cases numériques et murs spatiaux."""

    def __init__(self, spaces: List[BoardSpace], ladders: Dict[int, int], center_index: int, size: int = 8):
        self.spaces = spaces
        self.ladders = ladders  # bottom -> top
        self.center = center_index
        self.size = size
        # Générer la disposition en spirale et la cartographie index->coord
        self.index_to_coord = self._generate_spiral_coords(size)
        self.coord_to_index = {v: k for k, v in self.index_to_coord.items()}
        # Calculer voisins spatiaux (quart de tour) et murs
        self.spatial_neighbors = self._compute_spatial_neighbors()
        self.walls = self._compute_walls()

    def _generate_spiral_coords(self, n: int) -> Dict[int, Tuple[int, int]]:
        """Retourne mapping index->(row, col) pour une spirale n x n."""
        coords = {}
        top, bottom, left, right = 0, n - 1, 0, n - 1
        num = 0
        while True:
            # vers la droite
            for j in range(left, right + 1):
                coords[num] = (top, j);
                num += 1
            top += 1
            if num >= n * n: break
            # vers le bas
            for i in range(top, bottom + 1):
                coords[num] = (i, right);
                num += 1
            right -= 1
            if num >= n * n: break
            # vers la gauche
            for j in range(right, left - 1, -1):
                coords[num] = (bottom, j);
                num += 1
            bottom -= 1
            if num >= n * n: break
            # vers le haut
            for i in range(bottom, top - 1, -1):
                coords[num] = (i, left);
                num += 1
            left += 1
            if num >= n * n: break
        return coords

    def _compute_spatial_neighbors(self) -> Dict[int, List[int]]:
        """Pour chaque index, liste des indices spatialement voisins (haut, bas, gauche, droite)."""
        neighbors = {idx: [] for idx in self.index_to_coord}
        for idx, (r, c) in self.index_to_coord.items():
            for dr, dc in [(-1, 0), (-1, 1), (1, 0), (1, 1), (0, -1), (-1, -1), (0, 1), (1, -1)]:
                rc = (r + dr, c + dc)
                ni = self.coord_to_index.get(rc)
                if ni is not None:
                    neighbors[idx].append(ni)
        return neighbors

    def _compute_walls(self) -> set:
        """Ensemble de paires (i,j) spatiaux voisins mais séparés par un mur (pas de lien numérique)."""
        walls = set()
        for idx, neighs in self.spatial_neighbors.items():
            for nidx in neighs:
                # mur s'il n'y a pas de lien numérique direct
                if abs(idx - nidx) != 1:
                    walls.add(tuple(sorted((idx, nidx))))
        return walls

    def get_space(self, index: int) -> BoardSpace:
        return self.spaces[index]

    def find_ladders_at(self, pos: int) -> Tuple[List[int], List[int]]:
        bottoms = [b for b, t in self.ladders.items() if b == pos]
        tops = [b for b, t in self.ladders.items() if t == pos]
        return bottoms, tops

    def check_ladder(self, pos: int) -> int:
        return self.ladders.get(pos, pos)

    def find_ladder_end(self, start: int, direction: str = "up") -> Optional[int]:
        """
        Trouve une extrémité d'échelle (haut ou bas) à partir de l'autre extrémité.

        :param board: l'objet Board
        :param start: position connue (base ou sommet)
        :param direction: 'up' (chercher sommet) ou 'down' (chercher base)
        :return: index de l'autre extrémité ou None si introuvable
        """
        candidates = self.get_spatial_neighbors(start)
        results = []
        for neighbor in candidates:
            if direction == "up" and neighbor > start or direction == "down" and neighbor < start:
                if self.has_wall_between(start, neighbor):  # donc pas voisin numérique
                    results.append(neighbor)
        return random.choice(results) if results else None

    def move_ladders(self, moves: int) -> None:
        """Déplace stratégiquement `moves` échelles selon la méta-jeu du joueur actif."""
        # Priorités selon distance à la victoire
        current = self.current
        dist_to_win = self.board.center - current.position
        # Récupérer toutes les échelles
        ladders = list(self.ladders.items())  # [(bot, top), ...]
        for _ in range(moves):
            # 1) Bloquer victoire adversaire : toujours connecter une échelle à la case centrale
            if dist_to_win <= current.character.modify_movement(self, current, 6):
                # si aucune échelle n'arrive à center
                if self.board.center not in self.ladders.values():
                    # choisir échelle dont base peut être déplacée près du centre
                    bot, _ = max(ladders, key=lambda bt: bt[1])
                    self.ladders[bot] = self.board.center
                    continue
            # 2) Joueur loin : placer échelle ascendante vers center si absente
            if dist_to_win > self.board.center // 2 and self.board.center not in self.ladders.values():
                bot, _ = min(ladders, key=lambda bt: bt[0])
                self.ladders[bot] = self.board.center
                continue
            # 3) Sinon, placer sur case atteignable au prochain tour
            reachable = current.character.get_steps_and_sixes(self, current)[0]
            # chercher base parmi ladders pouvant être atteinte
            for base, top in ladders:
                if current.position < base <= current.position + reachable:
                    # trouver voisin spatial non numérique de dial supérieur
                    neighbors = [n for n in self.spatial_neighbors[base] if n > base]
                    if neighbors:
                        self.ladders[base] = neighbors[0]
                        break
            else:
                # fallback : random
                a, b = random.sample([bt[0] for bt in ladders], 2)
                self.ladders[a], self.ladders[b] = self.ladders[b], self.ladders[a]
        bottoms = list(self.ladders.keys())
        for _ in range(moves):
            a, b = random.sample(bottoms, 2)
            self.ladders[a], self.ladders[b] = self.ladders[b], self.ladders[a]

    def get_spatial_neighbors(self, pos: int) -> List[int]:
        """Voisins spatiaux sans considération des murs (pour effets de zone)."""
        return self.spatial_neighbors.get(pos, [])

    def has_wall_between(self, i: int, j: int) -> bool:
        """Retourne True s'il y a un mur entre i et j (spatial neighbors)."""
        return tuple(sorted((i, j))) in self.walls


class Game:
    """Mécanique complète du jeu tour par tour."""

    def __init__(self, players: List[Player], board: Board):
        self.players = players
        self.board = board
        self.current_idx = 0
        # Suivi des échelles activées durant le tour (positions)
        self.used_ladders: set[int] = set()

    @property
    def current(self) -> Player:
        return self.players[self.current_idx]

    def rock_paper_scissors(self, p1: Player, p2: Player) -> Player:
        """
        Simule un pierre-feuille-ciseaux entre p1 et p2.
        Retourne le gagnant.
        """
        choices = ['rock', 'paper', 'scissors']
        c1 = random.choice(choices)
        c2 = random.choice(choices)
        if c1 == c2:
            return self.rock_paper_scissors(p1, p2)
        wins = {'rock': 'scissors', 'scissors': 'paper', 'paper': 'rock'}
        return p1 if wins[c1] == c2 else p2

    def move(self) -> Tuple[int, int]:
        player = self.current
        steps, sixes = player.character.get_steps_and_sixes(self, player)
        pos = min(player.position + steps, self.board.center)
        player.position = self.board.check_ladder(pos)
        return player.position, sixes

    def ladder_duel(self, challenger: Player, first: Player) -> None:
        attacker, defender = first, (challenger if first == self.current else self.current)
        shots = 1
        while True:
            if not attacker.will_drink():
                break
            attacker.drink_shots(shots)
            shots += 1
            attacker, defender = defender, attacker

    def play_turn(self) -> None:
        self.used_ladders.clear()
        pos, sixes = self.move()
        if sixes:
            self.board.move_ladders(sixes)
        # gestion des échelles à la position pos
        bottoms, tops = self.board.find_ladders_at(pos)
        # si conflit ascension/descente
        if bottoms and tops:
            # décision par pierre-feuille-ciseaux
            winner = self.rock_paper_scissors(self.current,
                                              random.choice([p for p in self.players if p != self.current]))
            # si gagnant est courant -> ascension, sinon descente
            ascend = (winner == self.current)
        else:
            ascend = bool(bottoms)
        # activer si non utilisé
        if (ascend and pos in bottoms or not ascend and pos in tops) and pos not in self.used_ladders:
            self.used_ladders.add(pos)
            challenger = random.choice([p for p in self.players if p != self.current])
            first = self.current if ascend else challenger
            self.ladder_duel(challenger, first)
        # effets de case et passifs
        self.board.get_space(self.current.position).apply_effect(self, self.current)
        self.current.character.apply_passive_power(self, self.current)
        self.current_idx = (self.current_idx + 1) % len(self.players)

    def is_finished(self) -> bool:
        return any(p.position >= self.board.center for p in self.players)


# Stratégies de lancer retournant (steps, six_count)
def roll_one_d6(game: Game, player: Player) -> Tuple[int, int]:
    d = random.randint(1, 6)
    return d, int(d == 6)


def roll_best_of_two(game: Game, player: Player) -> Tuple[int, int]:
    d1, d2 = random.randint(1, 6), random.randint(1, 6)
    return max(d1, d2), (d1 == 6) + (d2 == 6)


def roll_random_space(game: Game, player: Player) -> Tuple[int, int]:
    space = random.choice(range(game.board.center + 1))
    return space, 0


# Initialisation des échelles fixes
def default_ladders() -> Dict[int, int]:
    return {7: 33, 14: 38, 21: 43, 27: 47}

# TODO: définir cases et personnages, initialiser Game et boucler la simulation
