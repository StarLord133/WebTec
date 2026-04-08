import express from "express";

const app = express();
app.use(express.static("public"));
const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});