import express from "express";
import cors from "cors";
import fs from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function getProducts() {
    try {
        const data = await fs.readFile(
            path.join(__dirname, "data.json"),
            "utf-8"
        );
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading products file:", error);
        return [];
    }
}

const PORT = process.env.PORT || 3000;
const app = express();

app.use(cors());
app.use(express.json());

app.get("/products", async (req, res) => {
    const products = await getProducts();
    res.json(products);
});

app.post("/products", async (req, res) => {
    try {
        const products = await getProducts();
        const newProduct = {
            id: uuidv4(),
            ...req.body,
            timestamp: new Date().toISOString(),
        };
        products.push(newProduct);
        await fs.writeFile(
            path.join(__dirname, "data.json"),
            JSON.stringify(products, null, 4),
            "utf-8"
        );
        res.status(201).json(newProduct);
    } catch (error) {
        console.error("Error adding product:", error);
        res.status(500).json({ error: "Failed to add product" });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
