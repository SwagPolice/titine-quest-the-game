// 📝 CONFIGURATION DES EFFETS DE SALLE KALBLAST (Français)
// L'index de chaque ligne correspond directement au numéro de la salle (Index 0 = Départ, Index 60 = Victoire)
const roomTexts_fr = [
  "", // salle 0
  "Tout le monde boit", // salle 1
  "Le joueur à ta gauche boit", // salle 2
  "Le joueur en face boit", // salle 3
  "Va à la salle 28", // salle 4
  "Tu bois (salope)", // salle 5
  "<b>PFC</b> contre un autre joueur, le perdant boit un <b>Š</b>", // salle 6
  "Bois et déplace une échelle", // salle 7
  "Donne une gorgée à un autre joueur", // salle 8
  "Chuchote jusqu'à ton prochain tour, bois si tu oublies", // salle 9
  "Les mecs boivent, s'il n'y a pas de mec, tout le monde boit", // salle 10
  "Cinq squats ou cinq pompes ou deux <b>Š</b>", // salle 11
  "Bois un quart de ton verre", // salle 12
  "Le joueur à ta droite boit", // salle 13
  "<b>PFC</b> collectif", // salle 14
  "<b>Valise</b>", // salle 15
  "Bois autant de gorgées que le résultat du dé", // salle 16
  "Remplis ton verre, bois autant que tu veux, un autre joueur doit boire autant", // salle 17
  "Lance 1d6 : bois autant de gorgées si pair, distribue-les si impair", // salle 18
  "Bois et rejoue", // salle 19
  "Les meufs boivent, s'il n'y a pas de meuf, tout le monde boit", // salle 20
  "Bois un <b>Š</b> ♥", // salle 21
  "Arrête de parler jusqu'à ton prochain tour. Bois si tu parles", // salle 22
  "<b>X ou Y</b>", // salle 23
  "Tu es la <b>Reine des Questions</b>", // salle 24
  "Bois de l'eau", // salle 25
  "Les personnes d'âge pair boivent", // salle 26
  "Les personnes d'âge impair boivent", // salle 27
  "Bois et invente une règle permanente", // salle 28
  "Choisis un autre joueur avec qui être <b>lié</b>", // salle 29
  "Distribue deux gorgées à deux personnes", // salle 30
  "Bois et va à la salle 50", // salle 31
  "Bois un shot d'alcool fort", // salle 32
  "Prends un jeton Prêtre gratos", // salle 33
  "Le joueur au verre le plus rempli boit deux gorgées", // salle 34
  "Échangez vos classes dans le sens horaire. Les râleurs boivent", // salle 35
  "Échange ton verre avec un joueur, buvez-en chacun la moitié, puis reprends le tien", // salle 36
  "<b>Je n'ai jamais</b>", // salle 37
  "Change l'ordre des bouteilles de <b>Š</b>, puis bois un <b>Š</b> de la bouteille de ton choix", // salle 38
  "Bois et va à la salle 31", // salle 39
  "<b>D'après...</b>", // salle 40
  "Échange de place avec le joueur d'en face. Vous êtes maintenant <b>liés</b>", // salle 41
  "<b>Vrai ou faux ?</b>", // salle 42
  "Un shot d'alcool fort avec quelqu'un, ou deux <b>Š</b> seul", // salle 43
  "Bois de l'eau", // salle 44
  "Jusqu'à ton prochain tour, termine tes phrases par « Yeah », bois si tu oublies", // salle 45
  "Les joueurs au verre plus qu'à moitié plein boivent", // salle 46
  "Jusqu'à ton prochain tour, <b>petit bonhomme dans ton verre</b>. Un <b>Š</b> si tu oublies", // salle 47
  "Bois et active gratuitement ta capacité la prochaine fois", // salle 48
  "Échange ta classe avec le joueur d'en face. Les râleurs boivent", // salle 49
  "Déclenche la capacité de Clazgreb gratos, sauf que tu peux aussi être touché", // salle 50
  "Avance de 3 salles et bois", // salle 51
  "Place une mine de Carnila dans cette salle", // salle 52
  "Lance 2d6, avance d'autant et bois autant de gorgées", // salle 53
  "Supprime une règle créée à la salle 32. Son créateur boit. Bois s'il n'y avait aucune règle", // salle 54
  "<b>PFC</b> royal. Les perdants boivent. Si tu gagnes tout, distribue un <b>Š</b>", // salle 55
  "Le joueur au verre le plus vide le termine", // salle 56
  "Bois 2 gorgées et avance d'une salle OU bois 1 <b>Š</b> et rejoue", // salle 57
  "Bois de l'eau", // salle 58
  "<b>Tu préfères</b>", // salle 59
  "Tu gagnes, tous les autres joueurs cul-sec leur verre, tu peux donner le tien à un autre joueur. <br><br>SURPROTÉGÉE : aucune échelle sur cette salle" // salle 60
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { roomTexts_fr };
}
