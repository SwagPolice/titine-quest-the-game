// 🗂️ LA BASE DE DONNÉES DES PERSONNAGES (Français)
const characters_fr = [
  {
    name: "FireFoxxx",
    title: "PDG de la CAGEC",
    image: "firefoxxx.jpg",
    color: "#ef4444",
    difficulty: 3,
    traitName: "Brûler d'impatience",
    traitDesc: "Lancez 1d6 pour vous déplacer. Vous pouvez relancer votre dé de mouvement. Pour cela, vous devez boire un nombre de gorgées égal au double du chiffre des dizaines de votre case actuelle.",
    abilityName: "Burn-out",
    abilityCost: "1Š",
    abilityDesc: "Lancez une boule de feu depuis votre case ; elle peut parcourir une distance de 2d6 cases, traverser les murs et changer de direction librement. Tout joueur touché boit 1Š. Si TOUS les autres joueurs sont touchés, ils boivent chacun 1Š supplémentaire.",
    flavor: '« On dirait que vous avez cramé toute votre cagnotte CAGEC... »'
  },
  {
    name: "Glamidir Vospo",
    title: "Maître du Déguisement",
    image: "spy.jpg",
    color: "#10b981",
    difficulty: 2,
    traitName: "Filature",
    traitDesc: "Copiez le mouvement du joueur le plus proche devant vous sur le plateau. Si vous êtes premier, lancez 1d6 à la place.",
    abilityName: "Dans leur tête",
    abilityCost: "1Š",
    abilityDesc: "Chaque fois que vous passez par ou atterrissez sur une case occupée par un autre joueur, vous pouvez payer le coût. Copiez sa Capacité de Classe comme une capacité supplémentaire que vous pouvez déclencher une fois gratuitement ce tour-ci. Vous ne pouvez avoir qu'une seule capacité supplémentaire à la fois.",
    flavor: '"Je suis Glamidir... VOSPODINOV !"'
  },
  {
    name: "Hans Pinner",
    title: "Le Conseiller",
    image: "advisor.jpg",
    color: "#35389e",
    difficulty: 3,
    traitName: "Le Grand Complot",
    traitDesc: "Lancez 1d6 pour vous déplacer. Puis, lancez un second 1d6 : choisissez un adversaire à faire avancer/reculer de ce nombre de cases, et faites-le boire/distribuer ce nombre de gorgées." +
            "<br><br>Quand vous devenez le Conseiller, prenez un jeton Conseiller. Si tous les joueurs en ont un, la partie se termine. <b>Personne ne gagne</b>.",
    abilityName: "Sombres Manœuvres",
    abilityCost: "1Š",
    abilityDesc: "Échangez votre position sur le plateau et votre Carte de Classe avec n'importe quel joueur qui n'a pas de jeton Conseiller.",
    flavor: '« Il n\'y a pas de plan. JE suis le plan. »'
  },
  {
    name: "Clazgreb",
    title: "Investisseur Sur Le Fil",
    image: "bard.jpg",
    color: "#eab308",
    difficulty: 1,
    traitName: "Jet Setteur",
    traitDesc: "Lancez 1d60 pour vous déplacer. Le résultat est le numéro de la case sur laquelle vous atterrissez.",
    abilityName: "Audioconférence d'urgence",
    abilityCost: "1Š",
    abilityDesc: "Créez une onde de choc centrée sur la case 1d60. Les autres joueurs boivent des Š selon le gabarit de votre classe.",
    flavor: '« D\'après la bourse, je devrais shorter ta vie. *BIP* »'
  },
  {
    name: "Carnila",
    title: "Idole du Glam Metal",
    image: "vampire.jpg",
    color: "#981241",
    difficulty: 2,
    traitName: "Une tournée mortelle",
    traitDesc: "Lancez 2d6 et utilisez le résultat le plus élevé pour vous déplacer.",
    abilityName: "LE PRIX DU SANG",
    abilityCost: "1Š",
    abilityDesc: "Annulez l'effet de la case sur laquelle vous avez atterri, puis placez-y une mine. Le prochain joueur qui passe par cette case doit s'arrêter, retirer la mine, boire 1Š, et devenir <b>lié</b> à vous.",
    flavor: '« Donnez-moi votre énergie, donnez-moi votre SANG ! »'
  },
  {
    name: "Turbo Killer",
    title: "Cadre chez Imago Pharma",
    image: "berserker.jpg",
    color: "#8327c1",
    difficulty: 2,
    traitName: "Une question de dosage",
    traitDesc: "Lancez 1d6 pour vous déplacer. Chaque fois que vous atterrissez sur une case bleue, distribuez 2 gorgées. Chaque fois que vous atterrissez sur une case violette, buvez 1 gorgée.",
    abilityName: "Série d'injections tests",
    abilityCost: "KŠ",
    abilityDesc: "Choisissez une valeur pour K et payez KŠ pour activer, puis jouez à <b>PFC</b> contre chaque adversaire à tour de rôle.\n" +
            "<br>- Si vous gagnez : il boit KŠ et vous avancez de +K cases.\n" +
            "<br>- Si vous perdez : il avance de +K cases à la place.\n" +
            "<br><br>Si vous gagnez tous les duels, les adversaires boivent aussi un KŠ supplémentaire chacun, et vous avancez d'un +K supplémentaire par adversaire.",
    flavor: '« Ce qui ne te tue pas te rend plus rapide ! »'
  },
  {
    name: "Robiocoop",
    title: "Ex-Membre du conseil",
    image: "warrior.jpg",
    color: "#27c16f",
    difficulty: 2,
    traitName: "Destructeur Implacable",
    traitDesc: "Lancez 1d6 pour vous déplacer. Vous pouvez grimper aux échelles même en les croisant.",
    abilityName: "Quête de Vengeance",
    abilityCost: "1Š",
    abilityDesc: "Défiez le joueur le plus proche devant vous sur le plateau à <b>PFC</b> (au meilleur des 3).\n" +
            "<br>- Si vous perdez, l'autre joueur boit 1Š.\n" +
            "<br>- Si vous gagnez, l'autre joueur boit 2Š et vous allez sur sa case.",
    flavor: '« Je vais annihiler ce consortium en carton-pâte. »'
  },
  {
    name: "“Mamie” Luc",
    title: "Mascotte LBGTQIA+",
    image: "priest.jpg",
    color: "#afa8a8",
    difficulty: 2,
    traitName: "Marche des Fiertés",
    traitDesc: "Lancez 1d6 pour vous déplacer. <b>Une fois par manche</b>, quand le joueur le plus proche devant vous sur le plateau boit, vous pouvez aller directement sur sa case et boire le double à sa place.",
    abilityName: "Je Préfère le Thé",
    abilityCost: "1Š",
    abilityDesc: "Obtenez 1d3 jetons (3 maximum à la fois). Chaque fois que vous devez 1Š ou plus, vous pouvez défausser un jeton. Si vous le faites, lancez 1d6 : vous pouvez alors boire ce nombre de gorgées pour chaque Š dû, au lieu du Š lui-même — ou simplement boire le Š si vous préférez. <br><i>Exception : vous ne pouvez pas utiliser ceci sur le coût en Š de l'activation de cette capacité.</i>",
    flavor: '« Parfois je me demande ce que je fais ici... »'
  },
  {
    name: "Paul Guaca",
    title: "Chef des Barmans",
    image: "vanilla.jpg",
    color: "#6bae22",
    difficulty: 1,
    traitName: "Barathon",
    traitDesc: "Lancez 2d6 pour vous déplacer. Vous buvez un nombre de gorgées égal au dé le plus faible.",
    abilityName: "Plateau de shots",
    abilityCost: "1Š",
    abilityDesc: "Distribuez 1Š, ajoutez 1 à votre compteur de Š. " +
            "Quand le compteur atteint 6, vous pouvez distribuer 6Š, répartis entre autant de joueurs que vous voulez. Réinitialisez le compteur.",
    flavor: '« On n\'est pas là pour enfiler des perles ! »'
  },
  {
    name: "Brenchilli",
    title: "Styliste éclectique",
    image: "carpenter.jpg",
    color: "#b08ff6",
    difficulty: 2,
    traitName: "Je l'ai vu en premier",
    traitDesc: "Lancez 1d6 pour vous déplacer. Vous pouvez déplacer une échelle chaque fois que vous obtenez un nombre pair.\n" +
            "Vous pouvez interrompre un Événement d'Échelle auquel vous ne participez pas si l'échelle est dans votre portée indiquée, en buvant la mise actuelle + 1Š.",
    abilityName: "Créateur de Tendances",
    abilityCost: "1Š",
    abilityDesc: "Choisissez une option (portée définie par votre gabarit) : " +
            "<br>- Déplacez une échelle à portée vers votre inventaire. " +
            "<br>- Placez une échelle de votre inventaire dans n'importe quelle case à portée." +
            "<br>Quand une échelle est placée ou déplacée de cette façon, tous les joueurs se trouvant à portée, gabarit centré sur l'extrémité haute de l'échelle, doivent boire des Š selon la grille.",
    flavor: '« Hors de mon podium, les crasseux ! »'
  }
];
