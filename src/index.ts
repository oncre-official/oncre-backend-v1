import express, { Request, Response } from "express";
import cors from "cors";
import { supabase } from "./supabaseClient";
import "dotenv/config";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Allow specific domains
const allowedOrigins = [
  // "http://localhost:4000",
   "http://localhost:3000",
  "https://www.getoncre.com"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // if you're using cookies/auth
  })
);

// app.use(cors({
//   origin: "https://www.getoncre.com",
//   methods: ["GET", "POST", "PUT", "DELETE"],
//   credentials: true
// }));

// POST /contacts
app.post("/WaitListUsers", async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, phoneNumber } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !phoneNumber) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if phone number already exists
    const { data: existingUser, error: fetchError } = await supabase
      .from("WaitListUsers")
      .select("id")
      .eq("phone_number", phoneNumber)
      .single(); // returns one record or null

    if (fetchError && fetchError.code !== "PGRST116") {
      // Ignore "no rows" error (PGRST116), throw others
      throw fetchError;
    }

    if (existingUser) {
      return res.status(409).json({ error: "Phone number already exists" });
    }

    // Insert new user
    const { data, error } = await supabase
      .from("WaitListUsers")
      .insert([
        {
          first_name: firstName,
          last_name: lastName,
          phone_number: phoneNumber,
        },
      ])
      .select();

    if (error) throw error;

    res
      .status(201)
      .json({ message: "Contact saved successfully", contact: data });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});


app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
