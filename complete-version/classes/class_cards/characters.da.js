// 🗂️ THE CHARACTER DATABASE (Danish)
const characters_da = [
  {
    name: "FireFoxxx",
    title: "CEO for CAGEC",
    image: "firefoxxx.jpg",
    color: "#ef4444",
    difficulty: 3,
    traitName: "Skal jeg gentage mig selv?",
    traitDesc: "Slå 1d6 for bevægelse. Du må slå din bevægelsesterning om. For at gøre det skal du drikke et antal slurke svarende til to gange tiercifferet i dit nuværende rum.",
    abilityName: "Fyrværkeriafhængig",
    abilityCost: "1Š",
    abilityDesc: "Kast en ildkugle fra dit rum, som kan bevæge sig 2d6 rum, gå gennem vægge og frit skifte retning. Enhver spiller, der bliver ramt, drikker 1Š. Hvis ALLE andre spillere bliver ramt af den, drikker de hver 1Š ekstra.",
    flavor: '"Hos CAGEC værdsætter vi vores forbru... vores kunder!"'
  },
  {
    name: "Glamidir Vospo",
    title: "Forklædningens Mester",
    image: "spy.jpg",
    color: "#10b981",
    difficulty: 2,
    traitName: "I deres sko",
    traitDesc: "Kopiér bevægelsesmekanikken for den spiller, der er tættest foran på brættet. Hvis du i øjeblikket ligger først, slå 1d6 i stedet.",
    abilityName: "I deres hoved",
    abilityCost: "1Š",
    abilityDesc: "Når du passerer gennem eller lander i et rum, der er besat af en anden spiller, må du betale prisen. Kopiér deres klasseevne som en ekstra evne, du kan udløse gratis én gang denne tur. Du kan kun have én ekstra evne ad gangen.",
    flavor: '"Jeg er Glamidir... VOSPODINOV!"'
  },
  {
    name: "Hans Pinner",
    title: "Rådgiveren",
    image: "advisor.jpg",
    color: "#35389e",
    difficulty: 3,
    traitName: "Den Store Plan",
    traitDesc: "Slå 1d6 for bevægelse. Slå derefter endnu en 1d6: vælg en modstander, der enten skal rykke frem/tilbage det antal rum, og få dem til enten at drikke/uddele det antal slurke." +
            "<br><br>Når du bliver Rådgiveren, tag et Rådgivertegn. Hvis alle spillere har ét, slutter spillet. <b>Ingen vinder</b>.",
    abilityName: "Mørke Manøvrer",
    abilityCost: "1Š",
    abilityDesc: "Byt din position på brættet og klassekort med en hvilken som helst spiller, der ikke har et Rådgivertegn.",
    flavor: '"Der er ingen plan. Jeg er planen."'
  },
  {
    name: "Clazgreb",
    title: "Ansigtsløs Investor",
    image: "bard.jpg",
    color: "#eab308",
    difficulty: 1,
    traitName: "Jorden Rundt",
    traitDesc: "Slå 1d60 for bevægelse. Resultatet er nummeret på det rum, du lander på.",
    abilityName: "Akut Gruppeopkald",
    abilityCost: "1Š",
    abilityDesc: "Skab en chokbølge centreret på rum 1d60. Andre spillere drikker Š i henhold til dit klasselayout.",
    flavor: '"Markedstendenser indikerer, at jeg bør shorte dit liv. *KLIK*"'
  },
  {
    name: "Carnila",
    title: "Glam Metal-Idol",
    image: "vampire.jpg",
    color: "#981241",
    difficulty: 1,
    traitName: "Bid Tænderne Sammen",
    traitDesc: "Slå 2d6 og brug det højeste resultat til bevægelse.",
    abilityName: "BLODPENGE",
    abilityCost: "1Š",
    abilityDesc: "Annullér effekten af det rum, du landede i, og placér derefter en landmine der. Den næste spiller, der passerer gennem det rum, skal stoppe, fjerne landminen, drikke 1Š og blive <b>bundet</b> til dig.",
    flavor: '"Giv mig din energi, giv mig dit BLOD!"'
  },
  {
    name: "Turbo Killer",
    title: "DIREKTØR hos Imago Pharma",
    image: "berserker.jpg",
    color: "#8327c1",
    difficulty: 2,
    traitName: "Et spørgsmål om dosering",
    traitDesc: "Slå 1d6 for bevægelse. Når du lander i et blåt rum, giv 2 slurke. Når du lander i et lilla rum, drik 1 slurk.",
    abilityName: "Runde med testinjektioner",
    abilityCost: "KŠ",
    abilityDesc: "Vælg en værdi for K og betal KŠ for at aktivere, spil derefter <b>SSP</b> mod hver modstander på skift.\n" +
            "<br>- Hvis du vinder: de drikker KŠ, og du rykker +K rum frem.\n" +
            "<br>- Hvis du taber: de rykker +K rum frem i stedet.\n" +
            "<br><br>Hvis du vinder alle kampe, drikker modstanderne også en ekstra KŠ hver, og du rykker en ekstra +K rum frem pr. modstander.",
    flavor: '"Det, der ikke slår dig ihjel, gør dig hurtigere!"'
  },
  {
    name: "Robiocoop",
    title: "Faldent bestyrelsesmedlem",
    image: "warrior.jpg",
    color: "#27c16f",
    difficulty: 2,
    traitName: "Ubarmhjertig Ødelægger",
    traitDesc: "Slå 1d6 for bevægelse. Du kan klatre op ad stiger, selv når du blot passerer forbi dem.",
    abilityName: "Jagten på Hævn",
    abilityCost: "1Š",
    abilityDesc: "Udfordr den spiller, der er tættest foran på brættet, til <b>SSP</b> (bedst af 3).\n" +
            "<br>- Hvis du taber, drikker den anden spiller 1Š.\n" +
            "<br>- Hvis du vinder, drikker den anden spiller 2Š, og du flytter til deres rum.",
    flavor: '"Jeg vil forvandle hele dette bræt til pap."'
  },
  {
    name: "“Bedste” Luke",
    title: "Mangfoldighedsansættelse",
    image: "priest.jpg",
    color: "#afa8a8",
    difficulty: 2,
    traitName: "Pride-parade",
    traitDesc: "Slå 1d6 for bevægelse. <b>Én gang pr. runde</b>, når den spiller, der er tættest foran på brættet, drikker, må du gå direkte til deres rum og drikke det dobbelte for dem.",
    abilityName: "Jeg foretrækker te",
    abilityCost: "1Š",
    abilityDesc: "Få 1d3 tegn (maks. 3 ad gangen). Når du skylder 1Š eller mere, må du kassere et tegn. Hvis du gør det, slå 1d6: du må derefter drikke så mange slurke for hver Š, du skylder, i stedet for selve Š'en — eller bare drikke Š'en alligevel, hvis du foretrækker det. <br><i>Undtagelse: du kan ikke bruge dette på Š-omkostningen ved at aktivere denne evne.</i>",
    flavor: '"Nogle gange tænker jeg på, hvad jeg dog laver her..."'
  },
  {
    name: "Paul Guaca",
    title: "Overbartender",
    image: "vanilla.jpg",
    color: "#6bae22",
    difficulty: 1,
    traitName: "Barathon",
    traitDesc: "Slå 2d6 for bevægelse. Du drikker et antal slurke svarende til den laveste terning.",
    abilityName: "Sambuquiño?",
    abilityCost: "1Š",
    abilityDesc: "Uddel 1Š, læg 1 til din Š-tæller." +
            "Når tælleren når 6, kan du uddele 6Š, fordelt blandt så mange spillere, du vil. Nulstil tælleren.",
    flavor: '"Gode ånder drikker ens."'
  },
  {
    name: "Brenchilli",
    title: "Modedesigner",
    image: "carpenter.jpg",
    color: "#b08ff6",
    difficulty: 2,
    traitName: "Jeg så det først",
    traitDesc: "Slå 1d6 for bevægelse. Du kan flytte én stige, når du slår et lige tal.\n" +
            "Du kan afbryde en stige-begivenhed, du ikke selv er involveret i, hvis stigen er inden for det angivne område, ved at drikke det nuværende bud + 1Š.",
    abilityName: "Trendsætter",
    abilityCost: "1Š",
    abilityDesc: "Vælg én: " +
            "<br>- Flyt en stige inden for dit angivne område til din beholdning. " +
            "<br>- Placér en stige fra din beholdning i et hvilket som helst rum inden for dit angivne område." +
            "<br>Når en stige placeres eller flyttes på denne måde, skal alle spillere, der står inden for det angivne områdelayout centreret på stigens øverste ende, drikke Š i henhold til gitteret.",
    flavor: '"Væk fra min catwalk, beskidte hunde!"'
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { characters_da };
}
