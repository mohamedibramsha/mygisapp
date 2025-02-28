// const express = require('express');
// const { Pool } = require('pg');
// const path = require('path');

// const app = express();
// const port = 3000;

// // Serve static files from the public directory
// app.use(express.static('public'));

// // PostgreSQL connection setup
// const pool = new Pool({
//   user: 'postgres',
//   host: 'localhost',
//   database: 'postgres',
//   password: 'postgres',
//   port: 5432,
// });

// // Route to dynamically fetch all column data (including geometry) for any table
// app.get('/api/geojson/:tableName', (req, res) => {
//   const tableName = req.params.tableName;

//   // Query to get the geometry column name from the table
//   pool.query(`
//     SELECT column_name 
//     FROM information_schema.columns 
//     WHERE table_schema = 'public' 
//       AND table_name = $1 
//       AND udt_name = 'geometry';
//   `, [tableName], (err, result) => {
//     if (err) {
//       console.error(err);
//       res.status(500).send('Error checking for geometry column');
//       return;
//     }

//     if (result.rows.length === 0) {
//       res.status(404).send('No geometry column found in the specified table');
//       return;
//     }

//     const geomColumn = result.rows[0].column_name;

//     // Query to get all columns and convert geometry to GeoJSON
//     const geoQuery = `
//       SELECT *, ST_AsGeoJSON(${geomColumn}) AS geom 
//       FROM ${tableName};
//     `;

//     pool.query(geoQuery, (err, result) => {
//       if (err) {
//         console.error(err);
//         res.status(500).send('Error fetching data');
//       } else {
//         // Convert the rows into GeoJSON FeatureCollection format
//         const geojson = {
//           type: 'FeatureCollection',
//           features: result.rows.map(row => ({
//             type: 'Feature',
//             properties: { ...row, geom: undefined }, // All non-geometry fields
//             geometry: JSON.parse(row.geom)  // Geometry field as GeoJSON
//           }))
//         };
//         res.json(geojson);
//       }
//     });
//   });
// });

// // Start the server
// app.listen(port, () => {
//   console.log(`Server running at http://localhost:${port}`);
// });

const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const path = require('path');
const cors = require("cors");
const axios = require("axios");



const app = express();
const port = 4000;

// PostgreSQL connection setup
//const pool = new Pool({
  //  user: 'postgres',
    //host: 'localhost',
    //database: 'postgres',
    //password: 'postgres',
    //port: 5432,
  //});
// Use body-parser to parse request bodies
app.use(bodyParser.urlencoded({ extended: true }));

require('dotenv').config();
//const { Pool } = require("pg");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // Required for Render PostgreSQL
});

// Set up session middleware
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }  // For production, use true with HTTPS
}));

// Serve static files from the public directory
app.use(express.static('public'));

// Route to serve login page
app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Handle POST login request
app.post('/login', async (req, res) => {
  
    const { username, password } = req.body;

    try {
        // Query the PostgreSQL database for the user
        const result = await pool.query('SELECT * FROM login_details WHERE username = $1', [username]);
        
        if (result.rows.length === 0) {
            // If no user is found
            return res.send('Invalid username or password');
        }

        const user = result.rows[0];
        
        // Compare the submitted password with the stored hash
        const isMatch = bcrypt.compareSync(password, user.password);

        if (isMatch) {
            // If password is correct, store user in session and redirect to map page
            req.session.user = user;
            res.redirect('/map');
        } else {
            // If password is incorrect
            res.send('Invalid username or password');
        }
    } catch (err) {
        console.error(err);
        res.send('An error occurred during login.');
    }
});

// Middleware to check if the user is logged in
function checkAuth(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
}

// Route to serve the map page (after login)
app.get('/map', checkAuth, (req, res) => {
    res.sendFile(__dirname + '/public/map.html');
});

// Logout route to destroy the session
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

// Function to capitalize the first letter of each word in column names
function capitalizeColumnNames(columns) {
    return columns.map(column => 
        column
            .split('_') // Split the column name by underscores
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize each word
            .join(' ')); // Join the words back together with spaces
}

// Function to fetch GeoJSON for a given table
async function getGeoJSONForTable(tableName) {
  const geomColumnQuery = `
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = $1 
      AND udt_name = 'geometry';
  `;
  const result = await pool.query(geomColumnQuery, [tableName]);

  if (result.rows.length === 0) {
    throw new Error(`No geometry column found in table ${tableName}`);
  }

  const geomColumn = result.rows[0].column_name;

  // Query to get all columns and convert geometry to GeoJSON
  const geoQuery = `
    SELECT *, ST_AsGeoJSON(${geomColumn}) AS geom 
    FROM ${tableName};
  `;
  const data = await pool.query(geoQuery);

  // Capitalize the column names
  const columns = Object.keys(data.rows[0]);
  const capitalizedColumns = capitalizeColumnNames(columns);

  return {
    type: 'FeatureCollection',
    features: data.rows.map(row => {
      // Create a new feature with capitalized column names
      const featureProperties = capitalizedColumns.reduce((acc, column, index) => {
        const originalColumn = columns[index]; // Get the original column name
        acc[column] = row[originalColumn];
        return acc;
      }, {});

      return {
        type: 'Feature',
        properties: featureProperties,
        geometry: JSON.parse(row.geom)
      };
    })
  };
}

// Route to get all table names that have geometry columns
app.get('/api/tables', async (req, res) => {
  const query = `
    SELECT table_name
    FROM information_schema.columns
    WHERE table_schema = 'public' 
      AND udt_name = 'geometry'
    GROUP BY table_name;
  `;

  try {
    const result = await pool.query(query);
    const tableNames = result.rows.map(row => row.table_name);
    
    res.json(tableNames); // Return the table names as a JSON array
  } catch (err) {
    console.error('Error fetching table names:', err);
    res.status(500).send('Error fetching table names');
  }
});

// Route to get GeoJSON for multiple tables dynamically
app.get('/api/geojson/multiple', async (req, res) => {
  try {
    // First, get the table names dynamically
    const tableNamesQuery = `
      SELECT table_name
      FROM information_schema.columns
      WHERE table_schema = 'public' 
        AND udt_name = 'geometry'
      GROUP BY table_name;
    `;
    const tableNamesResult = await pool.query(tableNamesQuery);
    const tableNames = tableNamesResult.rows.map(row => row.table_name);

    const layers = {};

    // Fetch GeoJSON for each table dynamically
    for (const tableName of tableNames) {
      layers[tableName] = await getGeoJSONForTable(tableName);
    }

    res.json(layers);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching GeoJSON data');
  }
});

//Asset search
app.get("/searchAsset", async (req, res) => {
  try {
      let { table, swid } = req.query;

      // Find the geometry column dynamically
      const geomResult = await pool.query(`
          SELECT column_name FROM information_schema.columns 
          WHERE table_name = $1 AND udt_name = 'geometry'
      `, [table]);

      if (geomResult.rows.length === 0) {
          return res.status(400).json({ error: "No geometry column found" });
      }

      let geomColumn = geomResult.rows[0].column_name;
      

      // Query for the asset and return GeoJSON
      const result = await pool.query(`
          SELECT json_build_object(
              'type', 'Feature',
              'geometry', ST_AsGeoJSON(${geomColumn})::json,
              'properties', jsonb_strip_nulls(to_jsonb(${table}) - '${geomColumn}')
          ) AS geojson
          FROM ${table} WHERE swid = $1
      `, [swid]);

      if (result.rows.length === 0) {
          return res.json([]);
      }

      res.json(result.rows.map(row => row.geojson));
  } catch (error) {
      console.error("Error searching asset:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ API to search assets
app.get("/globalsearchAsset", async (req, res) => {
  
  try {
      let { searchTerm } = req.query;
      if (!searchTerm) return res.status(400).json({ error: "Search term is required" });

      const query = `
          SELECT asset_id, asset_table_name, asset_info 
          FROM assetsearch_metadata
          WHERE asset_info ILIKE '%' || $1 || '%'
          ORDER BY asset_info
          LIMIT 10;
      `;

      const resultQuery = await pool.query(query, [searchTerm]);
      if (resultQuery.rows.length === 0) return res.json({ message: "No matching records found" });

      res.json(resultQuery.rows);
  } catch (error) {
      console.error("Error fetching search results:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ API to get asset feature
app.get("/getAsset", async (req, res) => {
  try {
    
      let { assetId, assetTable } = req.query;
      if (!assetId || !assetTable) return res.status(400).json({ error: "Missing parameters" });

      // Get geometry column dynamically
      const geomQuery = `
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_schema = 'public' 
            AND table_name = $1 
            AND udt_name = 'geometry'
          LIMIT 1;
      `;
      const geomResult = await pool.query(geomQuery, [assetTable]);
      
      if (geomResult.rows.length === 0) return res.status(400).json({ error: "No geometry column found" });

      const geometryColumn = geomResult.rows[0].column_name;

      // Get all attributes along with geometry
      const assetQuery = `
          SELECT *, ST_AsGeoJSON(${geometryColumn}) as geometry 
          FROM ${assetTable}
          WHERE swid = $1;
      `;
      const assetResult = await pool.query(assetQuery, [assetId]);

      if (assetResult.rows.length === 0) return res.status(404).json({ error: "Asset not found" });

      const asset = assetResult.rows[0];
      const geometry = JSON.parse(asset.geometry);
      delete asset.geometry; // Remove geometry from attributes

      res.json({ geometry, attributes: asset });

  } catch (error) {
      console.error("Error fetching asset:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
});

// Enable CORS to allow frontend requests
app.use(cors());

app.get("/geocode", async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ error: "Query parameter 'q' is required" });
        }

        // Forward request to Nominatim
        const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
            params: {
                format: "json",
                q,
                limit: 10
            }
        });

        res.json(response.data); // Return the results to the frontend

    } catch (error) {
        console.error("Geocoding error:", error);
        res.status(500).json({ error: "Failed to fetch geocoding data" });
    }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
