const canvas = document.getElementById("spielFlaeche");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const farben = ["red", "blue", "yellow", "green", "purple"];
const formen = ["rechteck", "kreis", "stern"];

function zufallsFarbe() {
    return farben[Math.floor(Math.random() * farben.length)];
}

function zufallsForm() {
    return formen[Math.floor(Math.random() * formen.length)];
}

function zeichneRechteck(x, y, farbe) {
    ctx.fillStyle = farbe;
    ctx.fillRect(x, y, 50, 50);
}

function zeichneKreis(x, y, farbe) {
    ctx.fillStyle = farbe;
    ctx.beginPath();
    ctx.arc(x + 25, y + 25, 25, 0, Math.PI * 2);
    ctx.fill();
}

function zeichneStern(x, y, farbe) {
    ctx.fillStyle = farbe;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
        ctx.lineTo(x + 25 + 20 * Math.cos((18 + i * 72) / 180 * Math.PI), y + 25 + 20 * Math.sin((18 + i * 72) / 180 * Math.PI));
        ctx.lineTo(x + 25 + 10 * Math.cos((54 + i * 72) / 180 * Math.PI), y + 25 + 10 * Math.sin((54 + i * 72) / 180 * Math.PI));
    }
    ctx.closePath();
    ctx.fill();
}

function zeichneForm(x, y, form, farbe) {
    switch (form) {
        case "rechteck":
            zeichneRechteck(x, y, farbe);
            break;
        case "kreis":
            zeichneKreis(x, y, farbe);
            break;
        case "stern":
            zeichneStern(x, y, farbe);
            break;
    }
}

const spielBrett = [];
const brettBreite = 8;
const brettHoehe = 8;
const feldGroesse = 60;

function erstelleSpielBrett() {
    for (let y = 0; y < brettHoehe; y++) {
        spielBrett[y] = [];
        for (let x = 0; x < brettBreite; x++) {
            spielBrett[y][x] = {
                form: zufallsForm(),
                farbe: zufallsFarbe(),
            };
        }
    }
}

erstelleSpielBrett();

function zeichneSpielBrett() {
    for (let y = 0; y < brettHoehe; y++) {
        for (let x = 0; x < brettBreite; x++) {
            if (spielBrett[y][x]) {
                zeichneForm(x * feldGroesse, y * feldGroesse, spielBrett[y][x].form, spielBrett[y][x].farbe);
            }
        }
    }
}

function findeDreierreihen() {
    const dreierreihen = [];

    for (let y = 0; y < brettHoehe; y++) {
        for (let x = 0; x < brettBreite - 2; x++) {
            if (spielBrett[y][x] && spielBrett[y][x].form === spielBrett[y][x + 1].form && spielBrett[y][x].form === spielBrett[y][x + 2].form) {
                dreierreihen.push({ reihe: [[x, y], [x + 1, y], [x + 2, y]] });
            }
        }
    }

    for (let x = 0; x < brettBreite; x++) {
        for (let y = 0; y < brettHoehe - 2; y++) {
            if (spielBrett[y][x] && spielBrett[y][x].form === spielBrett[y + 1][x].form && spielBrett[y][x].form === spielBrett[y + 2][x].form) {
                dreierreihen.push({ reihe: [[x, y], [x, y + 1], [x, y + 2]] });
            }
        }
    }

    return dreierreihen;
}

function entferneDreierreihen(dreierreihen) {
    dreierreihen.forEach(reihe => {
        reihe.reihe.forEach(koordinate => {
            const [x, y] = koordinate;
            spielBrett[y][x] = null;
        });
    });
}

function aktualisiereSpielBrett() {
    for (let y = brettHoehe - 1; y >= 0; y--) {
        for (let x = 0; x < brettBreite; x++) {
            if (!spielBrett[y][x]) {
                let neuesY = y - 1;
                while (neuesY >= 0 && !spielBrett[neuesY][x]) {
                    neuesY--;
                }
                if (neuesY >= 0) {
                    spielBrett[y][x] = spielBrett[neuesY][x];
                    spielBrett[neuesY][x] = null;
                } else {
                    spielBrett[y][x] = {
                        form: zufallsForm(),
                        farbe: zufallsFarbe(),
                    };
                }
            }
        }
    }
}

let ausgewaehlteForm = null;
let mausX;
let mausY;

canvas.addEventListener("mousedown", (e) => {
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const spielBrettX = Math.floor(clickX / feldGroesse);
    const spielBrettY = Math.floor(clickY / feldGroesse);

    if (spielBrett[spielBrettY] && spielBrett[spielBrettY][spielBrettX]) {
        ausgewaehlteForm = {
            form: spielBrett[spielBrettY][spielBrettX].form,
            farbe: spielBrett[spielBrettY][spielBrettX].farbe,
            spielBrettX: spielBrettX,
            spielBrettY: spielBrettY,
            offsetX : clickX - (spielBrettX * feldGroesse),
            offsetY : clickY - (spielBrettY * feldGroesse)
        };
        spielBrett[spielBrettY][spielBrettX] = null;
    }
});

canvas.addEventListener("mousemove", (e) => {
    if (ausgewaehlteForm) {
        const rect = canvas.getBoundingClientRect();
        mausX = e.clientX - rect.left;
        mausY = e.clientY - rect.top;
    }
});

canvas.addEventListener("mouseup", (e) => {
    if (ausgewaehlteForm) {
        const rect = canvas.getBoundingClientRect();
        const dropX = e.clientX - rect.left;
        const dropY = e.clientY - rect.top;

        const spielBrettX = Math.floor(dropX / feldGroesse);
        const spielBrettY = Math.floor(dropY / feldGroesse);

        if (spielBrett[spielBrettY] && !spielBrett[spielBrettY][spielBrettX]) {
            spielBrett[spielBrettY][spielBrettX] = {
                form: ausgewaehlteForm.form,
                farbe: ausgewaehlteForm.farbe,
            };
        } else {
            spielBrett[ausgewaehlteForm.spielBrettY][ausgewaehlteForm.spielBrettX] = {
                form: ausgewaehlteForm.form,
                farbe: ausgewaehlteForm.farbe,
            };
        }
        ausgewaehlteForm = null;
    }
});

function spielSchleife() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    zeichneSpielBrett();

    if (ausgewaehlteForm) {
        zeichneForm(mausX - ausgewaehlteForm.offsetX, mausY - ausgewaehlteForm.offsetY, ausgewaehlteForm.form, ausgewaehlteForm.farbe);
    }

    const dreierreihen = findeDreierreihen();
    if (dreierreihen.length > 0) {
        entferneDreierreihen(dreierreihen);
        aktualisiereSpielBrett();
    }

    requestAnimationFrame(spielSchleife);
}

spielSchleife();



function istGueltigerZug(startPos, endPos) {
    if (endPos.x < 0 || endPos.x >= brettBreite || endPos.y < 0 || endPos.y >= brettHoehe) {
        return false;
    }

    if (spielBrett[endPos.y][endPos.x]) {
        return false;
    }

    // Temporäre Änderungen am Spielbrett vornehmen, um den Zug zu simulieren
    const temporaeresSpielBrett = spielBrett.map(reihe => reihe.slice());
    temporaeresSpielBrett[endPos.y][endPos.x] = temporaeresSpielBrett[startPos.y][startPos.x];
    temporaeresSpielBrett[startPos.y][startPos.x] = null;

    // Dreierreihen-Erkennung auf dem temporären Spielbrett durchführen
    const dreierreihen = findeDreierreihen(temporaeresSpielBrett);

    // Wenn der Zug eine Dreierreihe erzeugt, ist er gültig
    return dreierreihen.length > 0;
}

function findeDreierreihen(brett = spielBrett) {
    const dreierreihen = [];

    // Horizontale Dreierreihen
    for (let y = 0; y < brettHoehe; y++) {
        for (let x = 0; x < brettBreite - 2; x++) {
            if (brett[y][x] && brett[y][x].form === brett[y][x + 1].form && brett[y][x].form === brett[y][x + 2].form) {
                dreierreihen.push({ reihe: [[x, y], [x + 1, y], [x + 2, y]] });
            }
        }
    }

    // Vertikale Dreierreihen
    for (let x = 0; x < brettBreite; x++) {
        for (let y = 0; y < brettHoehe - 2; y++) {
            if (brett[y][x] && brett[y][x].form === brett[y + 1][x].form && brett[y][x].form === brett[y + 2][x].form) {
                dreierreihen.push({ reihe: [[x, y], [x, y + 1], [x, y + 2]] });
            }
        }
    }

    return dreierreihen;
}

let punkte = 0;

function entferneDreierreihen(dreierreihen) {
    dreierreihen.forEach(reihe => {
        reihe.reihe.forEach(koordinate => {
            const [x, y] = koordinate;
            spielBrett[y][x] = null;
            punkte += 10; // Punkte für jede entfernte Form vergeben
        });
    });
}
