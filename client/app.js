import express from "express";
import content from "./src/content.js";
import { aiml_player_details } from "./src/data.js";
import { dsa_player_details } from "./src/data.js";
import { cloud_player_details } from "./src/data.js";
import { webd_player_details } from "./src/data.js";
function getAIMLLeaderboard(){
    return `
            ${aiml_player_details.map((player)=>{
            return `
                <tr>
                    <td class="td">${player.rank}</td>
                    <td class="td">${player.name}</td>
                    <td class="td">${player.attendance}</td>
                    <td class="td">${player.participation}</td>
                    <td class="td">${player.projects}</td>
                    <td class="td">${player.total}</td>
                </tr>`}).join("")}
           `;
}
function getPlayerName(name){
    if(name.length >=30){
        return(name.substring(0,30)+".....");
    }
    return name;
}
function getLeaderboard(player_details) {
    return `
        ${player_details.map((player, index) => {
            return `
                <tr class="tr ${index === 1 ? "odd-tr" : (index % 2 === 0 ? "even-tr" : "odd-tr")} h-16">
                    <td class="td">${player.rank}</td>
                    <td class="td border-x border-x-amber-50">${getPlayerName(player.name)}</td>
                    <td class="td border-x border-x-amber-50">${player.attendance}</td>
                    <td class="td border-x border-x-amber-50">${player.participation}</td>
                    <td class="td border-x border-x-amber-50">${player.projects}</td>
                    <td class="td">${player.total}</td>
                </tr>`;
        }).join("")}
    `;
}
const dsaLeaderboard = getLeaderboard(dsa_player_details);
const cloudLeaderboard = getLeaderboard(cloud_player_details);
const webdLeaderboard = getLeaderboard(webd_player_details);
const aimlLeaderboard = getLeaderboard(aiml_player_details);

const app = express();
app.use(express.urlencoded({extended: false}));
app.use(express.static('public/'));
app.use(express.static('public/styles/'));

app.get("/", (req,res)=>{
    res.send(content());
})
app.get("/aiml-leaderboard", (req,res)=>{
    res.send(aimlLeaderboard);
})
app.get("/dsa-leaderboard", (req,res)=>{
    res.send(dsaLeaderboard);
})
app.get("/cloud-leaderboard", (req,res)=>{
    res.send(cloudLeaderboard);
})
app.get("/webd-leaderboard", (req,res)=>{
    res.send(webdLeaderboard);
})
app.listen(3001, () => {
    console.log("Server is running on http://localhost:3001");
}
);