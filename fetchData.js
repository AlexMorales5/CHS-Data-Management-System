const { MongoClient } = require("mongodb");
const fs = require("fs");
const path = require("path");

// Output folder configuration
const outputFolder = "data_exports";

// Create the output folder if it doesn't exist
if (!fs.existsSync(outputFolder)) {
  fs.mkdirSync(outputFolder);
}

// Your connection string to MongoDB
const uri = "mongodb+srv://moral216:camrysCHS@chsdatacluster.hq4eq.mongodb.net/";

// Create a new MongoClient
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// List of collections to fetch data from
const collections = [
  "APs",
  "GPAs",
  "NWEA",
  "PSAT",
  "PlacementExam",
  "PreviousSchool",
  "SAT"
];

async function fetchAllData() {
  try {
    // Connect to MongoDB
    await client.connect();

    // Access the database
    const database = client.db("CHSDataBase");
    
    // Object to store data from all collections
    const allData = {};

    // Loop through each collection and fetch data
    for (const collectionName of collections) {
      console.log(`Fetching data from ${collectionName} collection...`);
      
      const collection = database.collection(collectionName);
      const data = await collection.find().toArray();
      
      // Store the collection data in our object
      allData[collectionName] = data;
      
      // Save individual collection data to separate files in the output folder
      fs.writeFileSync(path.join(outputFolder, `${collectionName}_data.json`), JSON.stringify(data, null, 2), 'utf-8');
      console.log(`Data from ${collectionName} saved to ${outputFolder}/${collectionName}_data.json`);
    }

    // Save all collection data to one combined file in the output folder
    fs.writeFileSync(path.join(outputFolder, 'all_data.json'), JSON.stringify(allData, null, 2), 'utf-8');
    console.log(`All data saved to ${outputFolder}/all_data.json`);

    return allData;

  } catch (err) {
    console.error("Error connecting to the database or fetching data:", err);
    return null;
  } finally {
    // Close the connection to MongoDB
    await client.close();
    console.log("MongoDB connection closed");
  }
}

// Execute the function
fetchAllData().then(data => {
  if (data) {
    console.log("Data fetching completed successfully");
  } else {
    console.log("Failed to fetch data");
  }
});