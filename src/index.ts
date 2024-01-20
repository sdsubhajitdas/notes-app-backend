import dotenv from "dotenv";
import app from "./server";

dotenv.config();

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
