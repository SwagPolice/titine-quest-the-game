// 🗂️ THE CHARACTER DATABASE (English)
const characters_en = [
  {
    name: "FireFoxxx",
    title: "CEO of CAGEC",
    image: "firefoxxx.jpg",
    color: "#ef4444",
    difficulty: 3,
    traitName: "Shall I repeat myself?",
    traitDesc: "Roll 1d6 for movement. You may reroll your movement die. To do so, you must drink a number of sips equal to twice the tens digit of your current room.",
    abilityName: "Firework-aholic",
    abilityCost: "1Š",
    abilityDesc: "Cast a fireball from your room that can travel a distance of 2d6 rooms, go through walls and change direction freely. Any player hit drinks 1Š. If ALL other players are hit by it, they each drink 1Š extra.",
    flavor: '"At CAGEC, we cherish our consum... our customers!"'
  },
  {
    name: "Glamidir Vospo",
    title: "Master of Disguise",
    image: "spy.jpg",
    color: "#10b981",
    difficulty: 2,
    traitName: "In their shoes",
    traitDesc: "Copy the movement mechanic of the player closest ahead on the board. If you are currently in first place, roll 1d6 instead.",
    abilityName: "In their head",
    abilityCost: "1Š",
    abilityDesc: "Whenever you pass through or land in a room occupied by another player, you may pay the cost. Copy their Class Ability as an extra ability you can trigger once for free on this turn. You can only have one extra ability as a time.",
    flavor: '"I am Glamidir... VOSPODINOV!"'
  },
  {
    name: "Hans Pinner",
    title: "The Advisor",
    image: "advisor.jpg",
    color: "#35389e",
    difficulty: 3,
    traitName: "The Grand Scheme",
    traitDesc: "Roll 1d6 for movement. Then, roll a second 1d6: choose an opponent to either move forward/backward by that many rooms, and make them either drink/distribute that many sips." +
            "<br><br>When you become the Advisor, take an Advisor token. If all players have one, the game ends. <b>Nobody wins</b>.",
    abilityName: "Dark Maneuvers",
    abilityCost: "1Š",
    abilityDesc: "Swap your position on the board and Class Card with any player who does not have an Advisor token.",
    flavor: '"There is no plan. I am the plan."'
  },
  {
    name: "Clazgreb",
    title: "Faceless Investor",
    image: "bard.jpg",
    color: "#eab308",
    difficulty: 1,
    traitName: "Around The World",
    traitDesc: "Roll 1d60 for movement. The result is the number of the room you land on.",
    abilityName: "Emergency Group Call",
    abilityCost: "1Š",
    abilityDesc: "Create a shockwave centered on room 1d60. Other players drink Š according to your class layout.",
    flavor: '"Market trends indicate that I should short your life. *CLICK*"'
  },
  {
    name: "Carnila",
    title: "Glam Metal Idol",
    image: "vampire.jpg",
    color: "#981241",
    difficulty: 2,
    traitName: "Bite Your Teeth",
    traitDesc: "Roll 2d6 and use the highest result for movement.",
    abilityName: "BLOODMONEY",
    abilityCost: "1Š",
    abilityDesc: "Cancel the effect of the room you landed in, then place a landmine there. The next player who passes through that room must stop, remove the landmine, drink 1Š, and become <b>bound</b> to you.",
    flavor: '"Give me your energy, give me your BLOOD!"'
  },
  {
    name: "Turbo Killer",
    title: "EXEC at Imago Pharma",
    image: "berserker.jpg",
    color: "#8327c1",
    difficulty: 2,
    traitName: "A question of dosing",
    traitDesc: "Roll 1d6 for movement. Whenever you land in a blue room, give 2 sips. Whenever you land in a purple room, drink 1 sip.",
    abilityName: "Round of test injections",
    abilityCost: "KŠ",
    abilityDesc: "Choose a value for K and pay KŠ to activate, then play RPS against each opponent in turn.\n" +
            "<br>- If you win: they drink KŠ and you move +K rooms.\n" +
            "<br>- If you lose: they move +K rooms instead.\n" +
            "<br><br>If you win every match, opponents also drink an extra KŠ each, and you move an extra +K rooms per opponent.",
    flavor: '"What does not kill you makes you faster!"'
  },
  {
    name: "Robiocoop",
    title: "Fallen board member",
    image: "warrior.jpg",
    color: "#27c16f",
    difficulty: 2,
    traitName: "Relentless Destroyer",
    traitDesc: "Roll 1d6 for movement. You can climb up ladders even when passing by them.",
    abilityName: "Pursuit of Vengeance",
    abilityCost: "1Š",
    abilityDesc: "Challenge the player closest ahead on the board to RPS (best of 3).\n" +
            "<br>- If you lose, the other player drinks 1Š.\n" +
            "<br>- If you win, the other player drinks 2Š and you go to their room.",
    flavor: '"I will turn this whole board into cardboard."'
  },
  {
    name: "“Grandma” Luke",
    title: "Diversity Hire",
    image: "priest.jpg",
    color: "#afa8a8",
    difficulty: 2,
    traitName: "Pride Parade",
    traitDesc: "Roll 1d6 for movement. <b>Once a round</b>, when the player closest ahead on the board drinks, you may go straight to their room and drink double the amount for them.",
    abilityName: "I Prefer Tea",
    abilityCost: "1Š",
    abilityDesc: "Obtain 1d3 tokens (max 3 at a time). Whenever you owe 1Š or more, you may discard a token. If you do, roll 1d6: you may then drink that many sips for each Š owed, instead of the Š itself — or still just drink the Š, if you'd rather. <br><i>Exception: you cannot use this on the Š cost of activating this ability.</i>",
    flavor: '"Sometimes I wonder what I am doing here..."'
  },
  {
    name: "Paul Guaca",
    title: "Chief of Bartenders",
    image: "vanilla.jpg",
    color: "#6bae22",
    difficulty: 1,
    traitName: "Barathon",
    traitDesc: "Roll 2d6 for movement. You drink a number of sips equal to the lower die.",
    abilityName: "Sambuquiño?",
    abilityCost: "1Š",
    abilityDesc: "Give out 1Š, add 1 to your Š-counter." +
            "When the counter reaches 6, you can give out 6Š, divided amongst how many players you want. Reset the counter.",
    flavor: '"Great spirits drink alike."'
  },
  {
    name: "Brenchilli",
    title: "Fashion Designer",
    image: "carpenter.jpg",
    color: "#b08ff6",
    difficulty: 2,
    traitName: "I saw it first",
    traitDesc: "Roll 1d6 for movement. You can move one ladder whenever you roll an even number.\n" +
            "You can interrupt a ladder event you are not involved in if the ladder is in indicated range by drinking the current bid + 1Š.",
    abilityName: "Trend Setter",
    abilityCost: "1Š",
    abilityDesc: "Choose one: " +
            "<br>- Move a ladder from within your indicated range into your inventory. " +
            "<br>- Place a ladder from your inventory into any room within your indicated range." +
            "<br>When a ladder is placed or moved this way, all players standing within the indicated range layout centered on the upper end of the ladder must drink Š according to the grid.",
    flavor: '"Out of my catwalk, filthy dogs!"'
  }
];
