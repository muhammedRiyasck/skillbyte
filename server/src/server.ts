import app from "./app";

import { config } from "dotenv";
config();

import connectToMongoDB from "./config/mongodb";
connectToMongoDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
