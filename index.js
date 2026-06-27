const { connectDb } = require('./models/Users');
const createApp = require('./app');

const port = process.env.PORT || 3000;
const mongoUri = process.env.MONGO_URI || "mongodb+srv://nadeemkp:Amazon%40181@cluster0.xlkws2l.mongodb.net/?appName=Cluster0";
const mongoDbName = process.env.MONGO_DB || 'nadeemkp';

const app = createApp();

const dns = require("node:dns/promises");
dns.setServers(["1.1.1.1", "8.8.8.8"]);



connectDb(mongoUri, mongoDbName)
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
      console.log(`MongoDB URI: ${mongoUri}`);
    });
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  });
