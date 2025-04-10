import { player_details } from "./data.js";
let content = () =>
/*html*/`
<!DOCTYPE html>

<head>
    <script src="https://unpkg.com/htmx.org@2.0.4"
        integrity="sha384-HGfztofotfshcF7+8n44JQL2oJmowVChPTg48S+jvZoztPfvwD79OC/LTtG6dMp+"
        crossorigin="anonymous"></script>
    <script src="/scripts/script-leaderboard.js"></script>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <link rel="stylesheet" href="/styles/leaderboard/styles.css">
    <link href="/styles/leaderboard/output-leaderboard.css" rel="stylesheet">
</head>

<body>
    <main>
        <div class="gradient-background">
            <div class="gradient-sphere sphere-1"></div>
            <div class="gradient-sphere sphere-2"></div>
            <div class="gradient-sphere sphere-3"></div>
            <div class="glow"></div>
            <div class="grid-overlay"></div>
            <div class="noise-overlay"></div>
            <div class="particles-container" id="particles-container"></div>
        </div>
        <div class="content-container">
            <div class=" align-center justify-center flex flex-col">
                <div class="main-heading flex flex-row justify-center gradient-text">
                    <div class="gdg-tiu flex flex-row justify-center">
                        <h1 class=" text-amber-700">G</h1>
                        <h1>D</h1>
                        <h1>G&nbsp;</h1>
                        <h1>TIU&nbsp;</h1>
                    </div>
                    <h1>LEADERBOARD</h1>
                </div>
                <div class="checkboxes-container flex justify-center mb-5">
                    <div class="all-checkbox-container mx-5 mb-0.5 chip">
                        <input type="radio" id="all" name="chipGroup" value="all" class="chip-radio" onchange="selectOnlyThis(this)" hx-get="/all-leaderboard" hx-target="#leaderboard-body" checked/>
                        <label for="all" class="chip-label">ALL</label>
                    </div>
                    <div class="aiml-checkbox-container mx-5 mb-0.5 chip">
                        <input type="radio" id="aiml" name="chipGroup" value="AI-ML" class="chip-radio" onchange="selectOnlyThis(this)" hx-get="/aiml-leaderboard" hx-target="#leaderboard-body" />
                        <label for="aiml" class="chip-label">AI-ML</label>
                    </div>
                    <div class="dsa-checkbox-container mx-5 mb-0.5 chip">
                        <input type="radio" id="dsa" name="chipGroup" value="DSA" class="chip-radio" onchange="selectOnlyThis(this)" hx-get="/dsa-leaderboard" hx-target="#leaderboard-body" />
                        <label for="dsa" class="chip-label">DSA</label>
                    </div>
                    <div class="cloud-checkbox-container mx-5 mb-0.5 chip">
                        <input type="radio" id="cloud" name="chipGroup" value="CLOUD" class="chip-radio" onchange="selectOnlyThis(this)" hx-get="/cloud-leaderboard" hx-target="#leaderboard-body" />
                        <label for="cloud" class="chip-label">Cloud</label>
                    </div>
                    <div class="webd-checkbox-container mx-5 mb-0.5 chip">
                        <input type="radio" id="webd" name="chipGroup" value="WEBD" class="chip-radio" onchange="selectOnlyThis(this)" hx-get="/webd-leaderboard" hx-target="#leaderboard-body" />
                        <label for="webd" class="chip-label">Web-Development</label>
                    </div>
                </div>

                <div class="leaderboard-parent flex overflow-hidden">
                    <div class="leaderboard-container block ml-auto mr-auto ">
                        <table class="leaderboard-table p-10">
                            <thead class=" h-16">
                                <tr >
                                    <th class="th rank p-5">Rank</th>
                                    <th class="th border-x  p-5 name">Name</th>
                                    <th class="th border-x  p-5 at-sc">Attendance Score</th>
                                    <th class="th border-x  p-5 pt-sc">Participation Score</th>
                                    <th class="th border-x  p-5 pj-sc">Projects Score</th>
                                    <th class="th t-sc p-5">Total Score</th>
                                </tr>
                            </thead>
                            <tbody id="leaderboard-body">
                                ${player_details.map((player, index) => {
                                return `
                                <tr class="tr ${index === 1 ? "odd-tr" : (index % 2 === 0 ? "even-tr" : "odd-tr")} h-16">
                                    <td class="td p-5">${player.rank}</td>
                                    <td class="td border-x p-5">${player.name}</td>
                                    <td class="td border-x p-5">${player.attendance}</td>
                                    <td class="td border-x p-5">${player.participation}</td>
                                    <td class="td border-x p-5">${player.projects}</td>
                                    <td class="td p-5">${player.total}</td>
                                </tr>`;
                                }).join("")}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </main>
</body>
`

export default content;