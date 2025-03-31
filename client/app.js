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

function getDSALeaderboard(){
    return `
            ${dsa_player_details.map((player)=>{
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
function getCloudLeaderboard(){
    return `
            ${cloud_player_details.map((player)=>{
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
function getWebDLeaderboard(){  
    return `
            ${webd_player_details.map((player)=>{
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

const app = express();
app.use(express.urlencoded({extended: false}));
app.use(express.static('public/'));
app.use(express.static('public/styles/'));

app.get("/", (req,res)=>{
    res.send(content());
})
app.get("/aiml-leaderboard", (req,res)=>{
    res.send(getAIMLLeaderboard());
})
app.get("/dsa-leaderboard", (req,res)=>{
    res.send(getDSALeaderboard());
})
app.get("/cloud-leaderboard", (req,res)=>{
    res.send(getCloudLeaderboard());
})
app.get("/webd-leaderboard", (req,res)=>{
    res.send(getWebDLeaderboard());
})
app.listen(3001, () => {
    console.log("Server is running on http://localhost:3001");
}
);