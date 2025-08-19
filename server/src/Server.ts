import app from "./App";

import connectToMongoDB from "./shared/config/db/Mongodb";
connectToMongoDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
