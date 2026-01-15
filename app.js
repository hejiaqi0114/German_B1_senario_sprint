const screens = {
home: document.getElementById("screen-home"),
dialogue: document.getElementById("screen-dialogue"),
results: document.getElementById("screen-results")
};

const scenarioGrid = document.getElementById("scenario-grid");
const playRandomButton = document.getElementById("play-random");
const backToHomeButton = document.getElementById("back-to-home");
const backHomeResultsButton = document.getElementById("back-home-results");
const replayMissionButton = document.getElementElementById ? document.getElementById("replay-mission") : document.querySelector("#replay-mission");
const headerStars = document.getElementById("header-stars");
const headerMissionName = document.getElementById("header-mission-name");
const politenessFill = document.getElementById("politeness-fill");
const politenessLabel = document.getElementById("politeness-label");
const missionTitle = document.getElementById("mission-title");
const missionSubtitle = document.getElementById("mission-subtitle");
const missionObjectives = document.getElementById("mission-objectives");
const turnCounter = document.getElementById("turn-counter");
const dialogueLog = document.getElementById("dialogue-log");
const turnPanel = document.getElementById("turn-panel");
const npcLineElement = document.getElementById("npc-line");
const playerBlock = document.getElementById("player-block");
const playerPrompt = document.getElementById("player-prompt");
const choiceContainer = document.getElementById("choice-container");
const inputContainer = document.getElementById("input-container");
const playerInput = document.getElementById("player-input");
const hintButton = document.getElementById("hint-button");
const submitButton = document.getElementById("submit-button");
const hintBox = document.getElementById("hint-box");
const feedbackBox = document.getElementById("feedback-box");
const resultsStars = document.getElementById("results-stars");
const resultsSummary = document.getElementById("results-summary");
const resultsAccuracy = document.getElementById("results-accuracy");
const resultsPoliteness = document.getElementById("results-politeness");
const mistakesList = document.getElementById("mistakes-list");
const modelAnswersList = document.getElementById("model-answers-list");

const state = {
missions: [],
progress: {},
currentMission: null,
currentTurnIndex: 0,
currentTurn: null,
currentChoiceIndex: null,
stats: {
totalPlayerTurns: 0,
correctTurns: 0,
politenessPoints: 0,
maxPolitenessPoints: 0
},
mistakes: [],
replacements: {}
};

const fallbackMissions = [
{
id: "museum",
title: "Museum: Tickets und Zeitfenster",
shortTitle: "Museum",
tagline: "Tickets für ein Museum und Zeit auswählen",
subtitle: "Du kaufst Tickets für ein Museum mit Zeitfenster.",
objectives: [
"Höflich begrüßen",
"Ticketwunsch sagen",
"Zeit und Preis klären"
],
randomization: {
people: [1, 2, 3, 4],
times: ["10:00 Uhr", "13:30 Uhr", "16:00 Uhr"],
dates: ["am 12. März", "am 3. April", "am 18. Mai"],
details: ["mit Audio-Guide", "für die Sonderausstellung", "mit Studentenrabatt"]
},
maxPolitenessPoints: 10,
modelAnswers: [
"Guten Tag, ich hätte gern {{people}} Tickets für {{date}} um {{time}}, bitte.",
"Könnten Sie mir bitte sagen, ob es auch {{detail}} gibt und was das kostet?"
],
turns: [
{
role: "npc",
text: "Guten Tag, willkommen im Museum. Wie kann ich Ihnen helfen?"
},
{
role: "player",
inputType: "choice",
npcText: "",
prompt: "Du möchtest Tickets kaufen. Formuliere deinen Wunsch höflich.",
hint: "Muster: Guten Tag, ich hätte gern ... für ... um ... Uhr.",
options: [
{
text: "Guten Tag, ich hätte gern {{people}} Tickets für {{date}} um {{time}}, bitte.",
correct: true,
feedback: "Sehr gut, du nennst Anzahl, Datum, Uhrzeit und bist höflich.",
politeness: 4
},
{
text: "Ich brauche Tickets.",
correct: false,
feedback: "Zu allgemein, du nennst weder Datum noch Uhrzeit.",
politeness: 1
},
{
text: "Tickets {{people}} {{time}}.",
correct: false,
feedback: "Zu bruchstückhaft, das klingt nicht wie ein vollständiger Satz.",
politeness: 0
},
{
text: "Ich will rein, machen Sie schnell.",
correct: false,
feedback: "Sehr unhöflich und ohne klare Informationen.",
politeness: 0
}
]
},
{
role: "npc",
text: "Für {{peopleText}} am {{date}} um {{time}}. Möchten Sie {{detail}} dazu?"
},
{
role: "player",
inputType: "choice",
npcText: "",
prompt: "Du möchtest das Angebot annehmen und nach dem Preis fragen.",
hint: "Muster: Ja, gern. Was kostet ...?",
options: [
{
text: "Ja, gern. Was kostet das {{detail}}?",
correct: true,
feedback: "Gut, du nimmst das Angebot an und fragst direkt nach dem Preis.",
politeness: 3
},
{
text: "Ja, natürlich. Das ist mir egal.",
correct: false,
feedback: "Der zweite Satz wirkt unpassend, weil du sagst, dass es dir egal ist.",
politeness: 0
},
{
text: "Nein, ich brauche nichts.",
correct: false,
feedback: "Du lehnst ab, fragst aber nicht nach dem Preis.",
politeness: 1
},
{
text: "Wie teuer?",
correct: false,
feedback: "Die Frage ist verständlich, aber sehr knapp und unhöflich.",
politeness: 0
}
]
},
{
role: "npc",
text: "{{people}} Tickets mit {{detail}} kosten zusammen 28 Euro."
},
{
role: "player",
inputType: "choice",
npcText: "",
prompt: "Du akzeptierst den Preis und beendest den Kauf höflich.",
hint: "Muster: Das ist in Ordnung. Dann nehme ich ...",
options: [
{
text: "Das ist in Ordnung. Dann nehme ich die Tickets, bitte.",
correct: true,
feedback: "Sehr gut, du akzeptierst den Preis und bleibst höflich.",
politeness: 3
},
{
text: "Das ist viel zu teuer, aber ich nehme sie.",
correct: false,
feedback: "Du klingst unzufrieden und unhöflich.",
politeness: 0
},
{
text: "Okay, passt.",
correct: false,
feedback: "Alltagssprache, aber etwas zu informell für eine solche Situation.",
politeness: 1
},
{
text: "Na gut, dann halt.",
correct: false,
feedback: "Das wirkt genervt und wenig freundlich.",
politeness: 0
}
]
},
{
role: "npc",
text: "Vielen Dank. Die Führung beginnt etwa 15 Minuten vor {{time}}. Viel Spaß im Museum."
}
]
},
{
id: "hotel",
title: "Hotel: Reservierung und Check-in",
shortTitle: "Hotel",
tagline: "Zimmer reservieren und einchecken",
subtitle: "Du reservierst ein Zimmer und checkst an der Rezeption ein.",
objectives: [
"Begrüßen",
"Zimmerwunsch äußern",
"Fragen zu Frühstück und Zeit stellen"
],
randomization: {
people: [1, 2, 3],
times: ["18:00 Uhr", "19:30 Uhr", "21:00 Uhr"],
dates: ["vom 5. bis 7. Juni", "vom 10. bis 12. Juli", "vom 20. bis 23. August"],
details: ["ein ruhiges Zimmer", "ein Zimmer mit Balkon", "ein Zimmer mit Blick zum Innenhof"]
},
maxPolitenessPoints: 10,
modelAnswers: [
"Guten Abend, ich habe eine Reservierung auf den Namen Müller {{dates}}.",
"Könnten Sie mir bitte sagen, ab wann es Frühstück gibt und ob es {{detail}} ist?"
],
turns: [
{
role: "npc",
text: "Guten Abend, Rezeption Hotel Stadtblick. Wie kann ich Ihnen helfen?"
},
        {
        role: "player",
        inputType: "choice",
        npcText: "",
        prompt: "Du möchtest deine Reservierung nennen und die Daten bestätigen.",
        hint: "Muster: Guten Abend, ich habe eine Reservierung auf den Namen ...",
        options: [
        {
        text: "Guten Abend, ich habe eine Reservierung auf den Namen Müller {{dates}}.",
        correct: true,
        feedback: "Sehr gut, du nennst Namen und Zeitraum und klingst höflich.",
        politeness: 4
        },
        {
        text: "Guten Abend, ich habe für {{dates}} ein Zimmer auf den Namen Müller reserviert.",
        correct: true,
        feedback: "Ebenfalls gut, Name und Zeitraum sind klar und höflich.",
        politeness: 4
        },
        {
        text: "Hallo, ich brauche ein Zimmer für {{dates}}.",
        correct: false,
        feedback: "Verständlich, aber ohne Namen und etwas zu allgemein.",
        politeness: 1
        },
        {
        text: "Ich will ein Zimmer, sofort.",
        correct: false,
        feedback: "Zu direkt und ohne Reservierungsangabe.",
        politeness: 0
        }
        ]
        },
{
role: "npc",
text: "Ja, ich sehe Ihre Reservierung für {{peopleText}} {{dates}}. Sie wünschen {{detail}}."
},
{
role: "player",
inputType: "choice",
npcText: "",
prompt: "Du möchtest nach dem Frühstück fragen.",
hint: "Muster: Ab wann gibt es Frühstück?",
options: [
{
text: "Könnten Sie mir bitte sagen, ab wann es Frühstück gibt?",
correct: true,
feedback: "Sehr gut, höfliche Frage mit Konjunktiv.",
politeness: 3
},
{
text: "Wann ist Frühstück?",
correct: false,
feedback: "Verständlich, aber eher direkt und knapp.",
politeness: 1
},
{
text: "Frühstück, wie spät?",
correct: false,
feedback: "Zu bruchstückhaft und unhöflich.",
politeness: 0
},
{
text: "Ich will frühstücken.",
correct: false,
feedback: "Du drückst keinen klaren Informationswunsch aus.",
politeness: 0
}
]
},
{
role: "npc",
text: "Das Frühstück gibt es von 6:30 bis 10:00 Uhr im Restaurant im Erdgeschoss."
},
{
role: "player",
inputType: "choice",
npcText: "",
prompt: "Du möchtest ein ruhiges Zimmer und bedankst dich.",
hint: "Muster: Und könnte ich bitte ... bekommen?",
options: [
{
text: "Könnte ich bitte ein besonders ruhiges Zimmer bekommen?",
correct: true,
feedback: "Sehr gut, du stellst eine höfliche Bitte.",
politeness: 3
},
{
text: "Ich brauche ein ruhiges Zimmer.",
correct: false,
feedback: "Der Satz ist verständlich, aber klingt fordernd.",
politeness: 1
},
{
text: "Es muss ganz ruhig sein, sonst kann ich nicht schlafen.",
correct: false,
feedback: "Du klingst eher drohend als höflich.",
politeness: 0
},
{
text: "Machen Sie einfach, was Sie wollen.",
correct: false,
feedback: "Das passt nicht zur Situation.",
politeness: 0
}
]
},
{
role: "npc",
text: "Natürlich, wir geben Ihnen ein Zimmer nach hinten. Hier ist Ihre Schlüsselkarte."
}
]
},
{
id: "restaurant",
title: "Restaurant: Bestellen",
shortTitle: "Restaurant",
tagline: "Essen und Getränke im Restaurant bestellen",
subtitle: "Du bestellst Essen und Getränke im Restaurant.",
objectives: [
"Platz nehmen und bestellen",
"Wunsch höflich äußern",
"Nach Beilage oder Rechnung fragen"
],
randomization: {
people: [1, 2, 3, 4],
times: ["18:30 Uhr", "19:00 Uhr", "20:00 Uhr"],
dates: ["heute Abend", "morgen Abend", "am Wochenende"],
details: ["ohne Fleisch", "mit wenig Salz", "ohne Nüsse"]
},
maxPolitenessPoints: 10,
modelAnswers: [
"Guten Abend, wir würden gern bestellen. Ich hätte gern das Tagesgericht mit Salat, bitte.",
"Könnten wir bitte getrennt zahlen?"
],
turns: [
{
role: "npc",
text: "Guten Abend, haben Sie reserviert oder möchten Sie einfach so Platz nehmen?"
},
{
role: "player",
inputType: "choice",
npcText: "",
prompt: "Du hast nicht reserviert und möchtest einen Tisch für {{peopleText}}.",
hint: "Muster: Wir haben nicht reserviert. Haben Sie einen Tisch für ...?",
options: [
{
text: "Wir haben nicht reserviert. Haben Sie einen Tisch für {{peopleText}}?",
correct: true,
feedback: "Sehr gut, freundlich und klar.",
politeness: 3
},
{
text: "Kein Tisch reserviert, aber wir kommen jetzt.",
correct: false,
feedback: "Verständlich, aber etwas fordernd.",
politeness: 1
},
{
text: "Wir setzen uns einfach dahin.",
correct: false,
feedback: "Du fragst nicht, sondern nimmst dir selbst einen Platz.",
politeness: 0
},
{
text: "Tisch für uns, schnell.",
correct: false,
feedback: "Zu direkt und unhöflich.",
politeness: 0
}
]
},
{
role: "npc",
text: "Natürlich, bitte folgen Sie mir. Hier ist die Karte. Möchten Sie gleich bestellen?"
},
        {
        role: "player",
        inputType: "choice",
        npcText: "",
        prompt: "Du bist bereit zu bestellen und bestellst ein Hauptgericht und ein Getränk.",
        hint: "Muster: Ich hätte gern ... und dazu ... , bitte.",
        options: [
        {
        text: "Ja, ich hätte gern das Tagesgericht und dazu ein Wasser, bitte.",
        correct: true,
        feedback: "Sehr gut, du bestellst klar und höflich.",
        politeness: 4
        },
        {
        text: "Ja, ich hätte gern eine Suppe und ein Glas Rotwein, bitte.",
        correct: true,
        feedback: "Auch hier nennst du Gericht und Getränk höflich.",
        politeness: 4
        },
        {
        text: "Ich nehme das.",
        correct: false,
        feedback: "Zu ungenau, du nennst kein Gericht und kein Getränk.",
        politeness: 1
        },
        {
        text: "Geben Sie mir irgendwas.",
        correct: false,
        feedback: "Unhöflich und ohne klare Bestellung.",
        politeness: 0
        }
        ]
        },
{
role: "npc",
text: "Gerne. Möchten Sie {{detail}} beachten oder haben Sie Allergien?"
},
{
role: "player",
inputType: "choice",
npcText: "",
prompt: "Du möchtest {{detail}} erwähnen.",
hint: "Muster: Ja, bitte. Können Sie ...?",
options: [
{
text: "Ja, bitte. Können Sie das Gericht {{detail}} zubereiten?",
correct: true,
feedback: "Sehr gut, höfliche Bitte und klare Information.",
politeness: 3
},
{
text: "Das ist mir egal.",
correct: false,
feedback: "Dann wäre die Frage des Kellners überflüssig.",
politeness: 0
},
{
text: "Das sagen Sie der Küche.",
correct: false,
feedback: "Zu direkt und unhöflich.",
politeness: 0
},
{
text: "Ich weiß es nicht.",
correct: false,
feedback: "Du gibst keine klare Information.",
politeness: 0
}
]
}
]
},
{
id: "doctor",
title: "Arzt: Termin und Beschwerden",
shortTitle: "Arzt",
tagline: "Arzttermin vereinbaren und Beschwerden schildern",
subtitle: "Du machst einen Arzttermin und erklärst deine Beschwerden.",
objectives: [
"Am Telefon Termin vereinbaren",
"Beschwerden beschreiben",
"Nach Rat fragen"
],
randomization: {
people: [1],
times: ["9:00 Uhr", "11:30 Uhr", "15:00 Uhr"],
dates: ["am 4. Mai", "am 7. Juni", "am 15. Juli"],
details: ["seit drei Tagen", "seit einer Woche", "seit gestern Abend"]
},
maxPolitenessPoints: 10,
modelAnswers: [
"Guten Tag, hier spricht Müller. Ich würde gern einen Termin {{date}} gegen {{time}} vereinbaren.",
"Ich habe {{detail}} starke Kopfschmerzen und wollte fragen, was ich tun soll."
],
turns: [
{
role: "npc",
text: "Guten Tag, Praxis Dr. Schneider, was kann ich für Sie tun?"
},
{
role: "player",
inputType: "choice",
npcText: "",
prompt: "Du möchtest einen Termin {{date}} gegen {{time}} vereinbaren.",
hint: "Muster: Ich würde gern einen Termin ... vereinbaren.",
options: [
{
text: "Guten Tag, ich würde gern einen Termin {{date}} gegen {{time}} vereinbaren.",
correct: true,
feedback: "Sehr gut, du bist höflich und nennst den Terminwunsch.",
politeness: 3
},
{
text: "Ich brauche schnell einen Termin.",
correct: false,
feedback: "Verständlich, aber etwas fordernd und ohne Datum.",
politeness: 1
},
{
text: "Termine machen Sie für mich.",
correct: false,
feedback: "Zu direkt und unklar.",
politeness: 0
},
{
text: "Ich komme einfach heute.",
correct: false,
feedback: "Das ist unpassend, du solltest zuerst fragen.",
politeness: 0
}
]
},
{
role: "npc",
text: "In Ordnung. Worum geht es denn genau?"
},
        {
        role: "player",
        inputType: "choice",
        npcText: "",
        prompt: "Du beschreibst deine Beschwerden.",
        hint: "Muster: Ich habe seit ... starke ...",
        options: [
        {
        text: "Ich habe {{detail}} starke Kopfschmerzen und fühle mich sehr müde.",
        correct: true,
        feedback: "Gut, du nennst Dauer und Art der Beschwerden.",
        politeness: 3
        },
        {
        text: "Ich habe {{detail}} Fieber und starke Halsschmerzen.",
        correct: true,
        feedback: "Auch hier beschreibst du deine Beschwerden klar.",
        politeness: 3
        },
        {
        text: "Mir geht es nicht so gut.",
        correct: false,
        feedback: "Zu allgemein, nenne genauer, was du hast.",
        politeness: 1
        },
        {
        text: "Ich brauche nur schnell ein Rezept.",
        correct: false,
        feedback: "Du erklärst deine Beschwerden nicht.",
        politeness: 0
        }
        ]
        },
{
role: "npc",
text: "Gut, dann kommen Sie bitte {{date}} um {{time}} vorbei."
},
{
role: "player",
inputType: "choice",
npcText: "",
prompt: "Du bestätigst den Termin und bedankst dich.",
hint: "Muster: Ja, das passt. Vielen Dank.",
options: [
{
text: "Ja, das passt gut. Vielen Dank für Ihre Hilfe.",
correct: true,
feedback: "Sehr gut, du bestätigst und bedankst dich.",
politeness: 3
},
{
text: "Na gut, dann komme ich.",
correct: false,
feedback: "Klingt eher genervt.",
politeness: 0
},
{
text: "Ich komme irgendwann.",
correct: false,
feedback: "Zu ungenau.",
politeness: 0
},
{
text: "Schon okay.",
correct: false,
feedback: "Keine klare Bestätigung und Dank.",
politeness: 0
}
]
}
]
},
{
id: "transport",
title: "ÖPNV: Tickets und Verspätung",
shortTitle: "Transport",
tagline: "Ticket kaufen und bei Verspätung nachfragen",
subtitle: "Du kaufst ein Ticket und fragst bei Verspätung nach einer Alternative.",
objectives: [
"Ticketwunsch äußern",
"Nach Alternative fragen",
"Zeit zum Umsteigen klären"
],
randomization: {
people: [1, 2],
times: ["8:15 Uhr", "9:45 Uhr", "17:20 Uhr"],
dates: ["heute", "morgen", "am Freitag"],
details: ["zum Hauptbahnhof", "zum Flughafen", "ins Stadtzentrum"]
},
maxPolitenessPoints: 10,
modelAnswers: [
"Guten Tag, ich hätte gern ein Tagesticket {{details}} für {{peopleText}}.",
"Mein Zug hat Verspätung. Könnten Sie mir bitte sagen, welche Verbindung ich jetzt nehmen kann?"
],
turns: [
{
role: "npc",
text: "Guten Tag, wie kann ich Ihnen helfen?"
},
{
role: "player",
inputType: "choice",
npcText: "",
prompt: "Du möchtest ein Ticket {{details}} für {{peopleText}}.",
hint: "Muster: Ich hätte gern ein Ticket ...",
options: [
{
text: "Ich hätte gern ein Ticket {{details}} für {{peopleText}}, bitte.",
correct: true,
feedback: "Sehr gut, klarer Wunsch und höflich.",
politeness: 3
},
{
text: "Ticket {{details}}, schnell.",
correct: false,
feedback: "Zu knapp und unhöflich.",
politeness: 0
},
{
text: "Sie wissen schon, was ich meine.",
correct: false,
feedback: "Unklar und unpassend.",
politeness: 0
},
{
text: "Ein Ticket.",
correct: false,
feedback: "Zu wenig Informationen.",
politeness: 0
}
]
},
{
role: "npc",
text: "Der nächste Zug fährt {{date}} um {{time}}. Er hat heute aber etwa zehn Minuten Verspätung."
},
        {
        role: "player",
        inputType: "choice",
        npcText: "",
        prompt: "Du machst dir Sorgen um deinen Anschluss und fragst nach einer Alternative.",
        hint: "Muster: Könnten Sie mir bitte sagen, welche Verbindung ich nehmen kann?",
        options: [
        {
        text: "Mein Zug hat Verspätung. Könnten Sie mir bitte sagen, welche Verbindung ich jetzt nehmen kann, um meinen Anschluss noch zu erreichen?",
        correct: true,
        feedback: "Sehr gut, du erklärst dein Problem und bittest höflich um Hilfe.",
        politeness: 4
        },
        {
        text: "Könnten Sie mir bitte sagen, ob es eine andere Verbindung gibt, damit ich meinen Anschluss noch schaffe?",
        correct: true,
        feedback: "Ebenfalls höfliche Nachfrage mit klarer Bitte um Alternative.",
        politeness: 4
        },
        {
        text: "Der Zug ist zu spät, das ist ja typisch.",
        correct: false,
        feedback: "Du beschwerst dich, bittest aber nicht um Hilfe.",
        politeness: 0
        },
        {
        text: "Dann fahre ich eben gar nicht.",
        correct: false,
        feedback: "Du gibst auf, ohne nach einer Lösung zu fragen.",
        politeness: 0
        }
        ]
        },
{
role: "npc",
text: "Sie können auch die S-Bahn nehmen, die zehn Minuten früher fährt."
},
{
role: "player",
inputType: "choice",
npcText: "",
prompt: "Du möchtest wissen, ob die Zeit zum Umsteigen reicht.",
hint: "Muster: Reicht die Zeit zum Umsteigen?",
options: [
{
text: "Meinen Sie, dass ich genug Zeit zum Umsteigen habe?",
correct: true,
feedback: "Sehr gut, höfliche Nachfrage.",
politeness: 3
},
{
text: "Sind Sie sicher?",
correct: false,
feedback: "Klingt misstrauisch.",
politeness: 0
},
{
text: "Das glaube ich nicht.",
correct: false,
feedback: "Du lehnst die Information ab.",
politeness: 0
},
{
text: "Dann ist es eben so.",
correct: false,
feedback: "Du fragst nicht nach, ob es wirklich klappt.",
politeness: 0
}
]
}
]
},
{
id: "shopping",
title: "Einkaufen: Rückgabe und Beschwerde",
shortTitle: "Einkaufen",
tagline: "Ware reklamieren und umtauschen",
subtitle: "Du hast ein Produkt gekauft und möchtest es reklamieren.",
objectives: [
"Problem beschreiben",
"Lösung vorschlagen",
"Höflich bleiben"
],
randomization: {
people: [1],
times: ["gestern", "vorgestern", "letzte Woche"],
dates: ["gestern", "vorgestern", "am Samstag"],
details: ["Pullover", "Kaffeemaschine", "Bluetooth-Kopfhörer"]
},
maxPolitenessPoints: 10,
modelAnswers: [
"Guten Tag, ich habe {{times}} diesen {{detail}} bei Ihnen gekauft, aber er ist kaputt.",
"Wäre es möglich, dass ich das Gerät umtauschen oder mein Geld zurückbekommen könnte?"
],
turns: [
{
role: "npc",
text: "Guten Tag, was kann ich für Sie tun?"
},
        {
        role: "player",
        inputType: "choice",
        npcText: "",
        prompt: "Du erklärst dein Problem mit {{detail}}.",
        hint: "Muster: Ich habe ... gekauft, aber ...",
        options: [
        {
        text: "Guten Tag, ich habe {{times}} diesen {{detail}} bei Ihnen gekauft, aber er funktioniert nicht richtig.",
        correct: true,
        feedback: "Sehr gut, du erklärst sachlich, was passiert ist.",
        politeness: 4
        },
        {
        text: "Guten Tag, ich habe {{times}} einen {{detail}} gekauft, aber er ist schon kaputt.",
        correct: true,
        feedback: "Auch hier nennst du Kaufzeitpunkt und Problem klar.",
        politeness: 4
        },
        {
        text: "Mit dem {{detail}} stimmt etwas nicht.",
        correct: false,
        feedback: "Zu allgemein, nenne auch Kaufzeitpunkt und Situation.",
        politeness: 1
        },
        {
        text: "Der {{detail}} ist schlecht, ich will mein Geld.",
        correct: false,
        feedback: "Unhöflich und ohne sachliche Erklärung.",
        politeness: 0
        }
        ]
        },
{
role: "npc",
text: "Haben Sie den Kassenbon dabei?"
},
{
role: "player",
inputType: "choice",
npcText: "",
prompt: "Du hast den Bon und möchtest höflich reagieren.",
hint: "Muster: Ja, hier ist der Bon.",
options: [
{
text: "Ja, hier ist der Bon.",
correct: true,
feedback: "Kurz, passend und höflich.",
politeness: 2
},
{
text: "Natürlich habe ich den Bon.",
correct: false,
feedback: "Könnte etwas genervt klingen.",
politeness: 0
},
{
text: "Das ist doch egal.",
correct: false,
feedback: "Unhöflich und falsch, der Bon ist wichtig.",
politeness: 0
},
{
text: "Warum fragen Sie das?",
correct: false,
feedback: "Wirkt misstrauisch und unfreundlich.",
politeness: 0
}
]
},
{
role: "npc",
text: "Danke. Was wünschen Sie? Umtausch oder Geld zurück?"
},
{
role: "player",
inputType: "choice",
npcText: "",
prompt: "Du möchtest den Artikel umtauschen.",
hint: "Muster: Wäre es möglich, dass ...?",
options: [
{
text: "Wäre es möglich, dass ich den {{detail}} umtauschen könnte?",
correct: true,
feedback: "Sehr höfliche Bitte mit Konjunktiv.",
politeness: 3
},
{
text: "Ich will einen neuen.",
correct: false,
feedback: "Zu direkt und fordernd.",
politeness: 0
},
{
text: "Sie müssen mir einen neuen geben.",
correct: false,
feedback: "Sehr fordernd und unhöflich.",
politeness: 0
},
{
text: "Das ist Ihre Schuld.",
correct: false,
feedback: "Du greifst die Person an.",
politeness: 0
}
]
}
]
}
];

function loadProgress() {
try {
const raw = window.localStorage.getItem("scenarioSprintProgress");
if (!raw) {
state.progress = {};
return;
}
state.progress = JSON.parse(raw);
} catch (e) {
state.progress = {};
}
}

function saveProgress() {
try {
const raw = JSON.stringify(state.progress);
window.localStorage.setItem("scenarioSprintProgress", raw);
} catch (e) {
}
}

function switchScreen(target) {
Object.values(screens).forEach(screen => {
screen.classList.remove("screen-active");
});
screens[target].classList.add("screen-active");
}

function renderStars(element, count, max) {
const filled = "★".repeat(count);
const empty = "☆".repeat(Math.max(0, max - count));
element.textContent = filled + empty;
}

function updateHeaderMetrics() {
if (!state.currentMission) {
headerMissionName.textContent = "";
headerStars.textContent = "";
politenessFill.style.width = "0%";
politenessLabel.textContent = "0 von 10";
return;
}
const storedStars = state.progress[state.currentMission.id] || 0;
renderStars(headerStars, storedStars, 3);
headerMissionName.textContent = state.currentMission.shortTitle || state.currentMission.title;
const maxPoints = state.stats.maxPolitenessPoints || 10;
const percent = maxPoints === 0 ? 0 : Math.min(100, Math.round((state.stats.politenessPoints / maxPoints) * 100));
politenessFill.style.width = String(percent) + "%";
politenessLabel.textContent = state.stats.politenessPoints + " von " + maxPoints;
}

function createScenarioCard(mission) {
const card = document.createElement("button");
card.className = "scenario-card";
card.addEventListener("click", function () {
startMission(mission.id);
});
const title = document.createElement("div");
title.className = "scenario-title";
title.textContent = mission.title;
const tag = document.createElement("div");
tag.className = "scenario-tag";
tag.textContent = mission.tagline;
const meta = document.createElement("div");
meta.className = "scenario-meta";
const stars = document.createElement("span");
stars.className = "scenario-stars";
const storedStars = state.progress[mission.id] || 0;
renderStars(stars, storedStars, 3);
const badge = document.createElement("span");
badge.textContent = "B1";
badge.style.fontSize = "0.8rem";
badge.style.color = "#4b5563";
meta.appendChild(stars);
meta.appendChild(badge);
const action = document.createElement("div");
action.className = "scenario-action";
const playSpan = document.createElement("span");
playSpan.textContent = "Spielen";
playSpan.style.fontSize = "0.85rem";
playSpan.style.color = "#2563eb";
action.appendChild(playSpan);
card.appendChild(title);
card.appendChild(tag);
card.appendChild(meta);
card.appendChild(action);
return card;
}

function renderHome() {
scenarioGrid.innerHTML = "";
state.missions.forEach(function (mission) {
const card = createScenarioCard(mission);
scenarioGrid.appendChild(card);
});
updateHeaderMetrics();
}

function pickRandom(list) {
if (!list || !list.length) {
return "";
}
const index = Math.floor(Math.random() * list.length);
return list[index];
}

function applyTemplateToValue(value, replacements) {
if (typeof value === "string") {
return value.replace(/{{(\w+)}}/g, function (match, key) {
if (Object.prototype.hasOwnProperty.call(replacements, key)) {
return String(replacements[key]);
}
return match;
});
}
if (Array.isArray(value)) {
return value.map(function (item) {
return applyTemplateToValue(item, replacements);
});
}
if (value && typeof value === "object") {
const result = {};
Object.keys(value).forEach(function (key) {
result[key] = applyTemplateToValue(value[key], replacements);
});
return result;
}
return value;
}

function materializeMission(baseMission) {
const config = baseMission.randomization || {};
const replacements = {};
replacements.people = pickRandom(config.people);
replacements.time = pickRandom(config.times);
replacements.date = pickRandom(config.dates);
replacements.detail = pickRandom(config.details);
replacements.peopleText = replacements.people === 1 ? "eine Person" : String(replacements.people) + " Personen";
state.replacements = replacements;
const mission = applyTemplateToValue(baseMission, replacements);
return mission;
}

function startMission(missionId) {
const baseMission = state.missions.find(function (m) {
return m.id === missionId;
});
if (!baseMission) {
return;
}
const mission = materializeMission(baseMission);
state.currentMission = mission;
state.currentTurnIndex = 0;
state.currentTurn = null;
state.currentChoiceIndex = null;
state.stats.totalPlayerTurns = mission.turns.filter(function (t) {
return t.role === "player";
}).length;
state.stats.correctTurns = 0;
state.stats.politenessPoints = 0;
state.stats.maxPolitenessPoints = mission.maxPolitenessPoints || 10;
state.mistakes = [];
dialogueLog.innerHTML = "";
hintBox.classList.add("hidden");
feedbackBox.classList.add("hidden");
playerInput.value = "";
missionTitle.textContent = mission.title;
missionSubtitle.textContent = mission.subtitle;
missionObjectives.innerHTML = "";
(mission.objectives || []).forEach(function (step) {
const li = document.createElement("li");
li.textContent = step;
missionObjectives.appendChild(li);
});
switchScreen("dialogue");
updateHeaderMetrics();
renderTurn();
}

function appendDialogueBubble(role, text) {
const row = document.createElement("div");
row.className = "bubble-row " + (role === "npc" ? "bubble-row-npc" : "bubble-row-player");
const bubble = document.createElement("div");
bubble.className = "bubble " + (role === "npc" ? "bubble-npc" : "bubble-player");
bubble.textContent = text;
row.appendChild(bubble);
dialogueLog.appendChild(row);
dialogueLog.scrollTop = dialogueLog.scrollHeight;
}

function renderTurn() {
const mission = state.currentMission;
if (!mission) {
return;
}
if (state.currentTurnIndex >= mission.turns.length) {
finishMission();
return;
}
const turn = mission.turns[state.currentTurnIndex];
state.currentTurn = turn;
turnCounter.textContent = String(state.currentTurnIndex + 1) + "/" + String(mission.turns.length);
hintBox.classList.add("hidden");
feedbackBox.classList.add("hidden");
feedbackBox.classList.remove("feedback-correct");
feedbackBox.classList.remove("feedback-wrong");
state.currentChoiceIndex = null;
playerInput.value = "";
npcLineElement.classList.add("hidden");
playerBlock.classList.add("hidden");
if (turn.role === "npc") {
appendDialogueBubble("npc", turn.text);
state.currentTurnIndex += 1;
renderTurn();
return;
}
npcLineElement.textContent = turn.npcText || "";
if (turn.npcText) {
npcLineElement.classList.remove("hidden");
appendDialogueBubble("npc", turn.npcText);
} else {
npcLineElement.classList.add("hidden");
}
playerBlock.classList.remove("hidden");
playerPrompt.textContent = turn.prompt;
if (turn.inputType === "choice") {
choiceContainer.classList.remove("hidden");
inputContainer.classList.add("hidden");
renderChoices(turn);
} else {
choiceContainer.classList.add("hidden");
inputContainer.classList.remove("hidden");
playerInput.focus();
}
}

function renderChoices(turn) {
choiceContainer.innerHTML = "";
(turn.options || []).forEach(function (option, index) {
const button = document.createElement("button");
button.className = "choice-button";
button.textContent = option.text;
button.addEventListener("click", function () {
state.currentChoiceIndex = index;
Array.prototype.forEach.call(choiceContainer.children, function (child, cIndex) {
if (cIndex === index) {
child.classList.add("choice-selected");
} else {
child.classList.remove("choice-selected");
}
});
});
choiceContainer.appendChild(button);
});
}

function evaluateTextTurn(turn, answerRaw) {
const normalized = normalizeText(answerRaw);
let isCorrect = false;
let expectedSample = "";
const expectedList = turn.expected || [];
for (let i = 0; i < expectedList.length; i += 1) {
const expected = expectedList[i];
const normExpected = normalizeText(expected.text);
if (normalized === normExpected) {
isCorrect = true;
expectedSample = expected.text;
state.stats.politenessPoints += expected.politeness || 0;
break;
}
}
if (!isCorrect && expectedList.length) {
expectedSample = expectedList[0].text;
}
const keywords = turn.keywords || [];
keywords.forEach(function (entry) {
const word = entry.word;
const points = entry.politeness || 0;
if (word && points && normalized.indexOf(word.toLowerCase()) !== -1) {
state.stats.politenessPoints += points;
}
});
if (isCorrect) {
state.stats.correctTurns += 1;
}
const feedback = isCorrect ? turn.feedbackCorrect : turn.feedbackWrong;
const record = {
prompt: turn.prompt,
correct: expectedSample,
playerAnswer: answerRaw,
isCorrect: isCorrect,
feedback: feedback
};
if (!isCorrect) {
state.mistakes.push(record);
}
appendDialogueBubble("player", answerRaw);
showFeedback(isCorrect, feedback);
state.currentTurnIndex += 1;
updateHeaderMetrics();
}

function normalizeText(text) {
return String(text || "")
.toLowerCase()
.trim()
.replace(/\s+/g, " ")
.replace(/[.!?]+$/g, "");
}

function showFeedback(isCorrect, text) {
feedbackBox.textContent = text;
feedbackBox.classList.remove("hidden");
feedbackBox.classList.remove("feedback-correct");
feedbackBox.classList.remove("feedback-wrong");
if (isCorrect) {
feedbackBox.classList.add("feedback-correct");
} else {
feedbackBox.classList.add("feedback-wrong");
}
}

function handleSubmit() {
const turn = state.currentTurn;
if (!turn || turn.role !== "player") {
return;
}
if (turn.inputType === "choice") {
if (state.currentChoiceIndex === null) {
return;
}
const chosen = turn.options[state.currentChoiceIndex];
const isCorrect = !!chosen.correct;
const feedback = chosen.feedback || "";
const correctOption = turn.options.find(function (o) {
return o.correct;
});
if (isCorrect) {
state.stats.correctTurns += 1;
}
state.stats.politenessPoints += chosen.politeness || 0;
const record = {
prompt: turn.prompt,
correct: correctOption ? correctOption.text : "",
playerAnswer: chosen.text,
isCorrect: isCorrect,
feedback: feedback
};
if (!isCorrect) {
state.mistakes.push(record);
}
Array.prototype.forEach.call(choiceContainer.children, function (child, index) {
const option = turn.options[index];
child.classList.remove("choice-selected");
if (option.correct) {
child.classList.add("choice-correct");
}
if (index === state.currentChoiceIndex && !option.correct) {
child.classList.add("choice-wrong");
}
});
appendDialogueBubble("player", chosen.text);
showFeedback(isCorrect, feedback);
state.currentTurnIndex += 1;
updateHeaderMetrics();
setTimeout(function () {
renderTurn();
}, 500);
return;
}
const value = playerInput.value;
if (!value.trim()) {
playerInput.focus();
return;
}
evaluateTextTurn(turn, value);
setTimeout(function () {
renderTurn();
}, 600);
}

function handleHint() {
const turn = state.currentTurn;
if (!turn || turn.role !== "player") {
return;
}
const hintText = turn.hint || "";
if (!hintText) {
hintBox.textContent = "Kein Tipp verfügbar.";
} else {
hintBox.textContent = hintText;
}
hintBox.classList.remove("hidden");
}

function calculateStars() {
const correct = state.stats.correctTurns;
const total = state.stats.totalPlayerTurns || 1;
const ratio = correct / total;
if (ratio >= 0.9) {
return 3;
}
if (ratio >= 0.6) {
return 2;
}
if (ratio > 0) {
return 1;
}
return 0;
}

function finishMission() {
const mission = state.currentMission;
if (!mission) {
return;
}
const stars = calculateStars();
const previous = state.progress[mission.id] || 0;
if (stars > previous) {
state.progress[mission.id] = stars;
saveProgress();
}
const correct = state.stats.correctTurns;
const total = state.stats.totalPlayerTurns || 1;
const ratio = correct / total;
const percent = Math.round(ratio * 100);
renderStars(resultsStars, stars, 3);
resultsSummary.textContent = "Du hast " + correct + " von " + total + " Spielerzügen passend reagiert (" + percent + "%).";
resultsAccuracy.textContent = "Genauigkeit: " + percent + "%";
const maxPoints = state.stats.maxPolitenessPoints || 10;
const points = state.stats.politenessPoints;
const politePercent = Math.round(Math.min(1, points / maxPoints) * 100);
resultsPoliteness.textContent = points + " von " + maxPoints + " Punkten (" + politePercent + "%).";
mistakesList.innerHTML = "";
state.mistakes.forEach(function (item) {
const div = document.createElement("div");
div.className = "mistake-item";
const q = document.createElement("div");
q.className = "mistake-question";
q.textContent = item.prompt;
const your = document.createElement("div");
your.className = "mistake-your";
your.textContent = "Deine Antwort: " + item.playerAnswer;
const correct = document.createElement("div");
correct.className = "mistake-correct";
correct.textContent = "Besser: " + item.correct;
div.appendChild(q);
div.appendChild(your);
div.appendChild(correct);
mistakesList.appendChild(div);
});
modelAnswersList.innerHTML = "";
(mission.modelAnswers || []).forEach(function (answer) {
const li = document.createElement("li");
li.textContent = answer;
modelAnswersList.appendChild(li);
});
updateHeaderMetrics();
switchScreen("results");
}

function handlePlayRandom() {
if (!state.missions.length) {
return;
}
const index = Math.floor(Math.random() * state.missions.length);
const mission = state.missions[index];
startMission(mission.id);
}

function handleReplayMission() {
if (!state.currentMission) {
return;
}
startMission(state.currentMission.id);
}

function attachEventListeners() {
playRandomButton.addEventListener("click", handlePlayRandom);
backToHomeButton.addEventListener("click", function () {
state.currentMission = null;
switchScreen("home");
updateHeaderMetrics();
});
backHomeResultsButton.addEventListener("click", function () {
state.currentMission = null;
switchScreen("home");
updateHeaderMetrics();
});
replayMissionButton.addEventListener("click", handleReplayMission);
submitButton.addEventListener("click", handleSubmit);
hintButton.addEventListener("click", handleHint);
playerInput.addEventListener("keydown", function (event) {
if (event.key === "Enter") {
event.preventDefault();
handleSubmit();
}
});
}

function initApp() {
loadProgress();
attachEventListeners();
fetch("scenarios.json")
.then(function (response) {
if (!response.ok) {
throw new Error("scenarios.json not available");
}
return response.json();
})
.then(function (data) {
if (data && Array.isArray(data.missions) && data.missions.length) {
state.missions = data.missions;
} else {
state.missions = fallbackMissions;
}
renderHome();
})
.catch(function () {
state.missions = fallbackMissions;
renderHome();
});
}

initApp();
