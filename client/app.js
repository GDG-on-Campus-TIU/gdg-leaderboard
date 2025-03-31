import express from "express";
import content from "./src/content.js";
const app = express();
app.use(express.urlencoded({extended: false}));
app.use(express.static('public/'));
app.use(express.static('public/styles/'));

app.get("/", (req,res)=>{
    res.send(content());
})

app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
}
);