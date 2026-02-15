const thingSpeakReadUrl = "https://api.thingspeak.com/channels/2414963/feeds.json?results=2000";

document.getElementById("loadBtn").addEventListener("click", loadDataFromThingSpeak);

function loadDataFromThingSpeak() {
    document.getElementById("error").innerText = "";
    document.getElementById("output").innerHTML = "Načítám data...";

    const result = fetch(thingSpeakReadUrl);

    result
        .then((response) => {
            if (!response.ok) {
                throw new Error("Chyba serveru: " + response.status);
            }
            return response.json();
        })
        .then((data) => {
            if (!data.feeds || data.feeds.length === 0) {
                throw new Error("Žádná data nebyla nalezena.");
            }

            renderTable(data.feeds);
        })
        .catch((error) => {
            document.getElementById("output").innerHTML = "";
            document.getElementById("error").innerText =
                "Chyba při načítání: " + error.message;
        });
}

async function fetchApiWithAwait() {
    try {
        const response = await fetch(thingSpeakReadUrl);

        if (!response.ok) {
            throw new Error("Chyba serveru: " + response.status);
        }

        const json = await response.json();
        console.log(json);
    } catch (error) {
        console.log("Chyba:", error);
    }
}

function renderTable(data) {
    const output = document.getElementById("output");
    output.innerHTML = "";

    const table = document.createElement("table");

    const header = table.insertRow();
    header.innerHTML = `
        <th>Čas</th>
        <th>Field 1</th>
        <th>Field 2</th>
        <th>Field 3</th>
        <th>Field 4</th>
    `;

    for (const item of data) {
        const row = table.insertRow();
        row.innerHTML = `
            <td>${item.created_at}</td>
            <td>${item.field1 ?? "-"}</td>
            <td>${item.field2 ?? "-"}</td>
            <td>${item.field3 ?? "-"}</td>
            <td>${item.field4 ?? "-"}</td>
        `;
    }

    output.appendChild(table);
}
