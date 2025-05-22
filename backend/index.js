import express from "express";
import cors from "cors";
import fs from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, "data.json");
const MESSAGES_FILE = path.join(__dirname, "messages.json");
const HIGHLIGHTS_FILE = path.join(__dirname, "highlights.json");

async function getProducts() {
    try {
        const data = await fs.readFile(DATA_FILE, "utf-8");
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading products file:", error);
        return [];
    }
}

async function getProductById(id) {
    const products = await getProducts();
    const product = products.find(p => p.id === id);
    if (!product) throw new Error("Product not found");
    return product;
}

async function editProduct(id, updatedProduct) {
    const products = await getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) throw new Error("Product not found");
    products[index] = { ...products[index], ...updatedProduct };
    await fs.writeFile(DATA_FILE, JSON.stringify(products, null, 4), "utf-8");
    return products[index];
}

async function getMessages() {
    try {
        const data = await fs.readFile(MESSAGES_FILE, "utf-8");
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading messages file:", error);
        return [];
    }
}

async function postMessage(newMessage) {
    const messages = await getMessages();
    const message = { id: uuidv4(), ...newMessage, timestamp: new Date().toISOString() };
    messages.push(message);
    await fs.writeFile(MESSAGES_FILE, JSON.stringify(messages, null, 4), "utf-8");
    return message;
}

async function getHighlights() {
    try {
        const data = await fs.readFile(HIGHLIGHTS_FILE, "utf-8");
        return JSON.parse(data);
    } catch {
        return [];
    }
}

async function setHighlights(ids) {
    await fs.writeFile(HIGHLIGHTS_FILE, JSON.stringify(ids, null, 4), "utf-8");
}

const PORT = process.env.PORT || 3000;
const app = express();

app.use(cors());
app.use(express.json());

app.get("/highlights", async (req, res) => {
    try {
        const ids = await getHighlights();
        const products = await getProducts();
        const highlighted = products.filter(p => ids.includes(p.id));
        res.json(highlighted);
    } catch (err) {
        console.error("Error fetching highlights:", err);
        res.status(500).json({ error: "Failed to fetch highlights" });
    }
});

app.put("/highlights", async (req, res) => {
    try {
        const ids = req.body;
        if (!Array.isArray(ids) || ids.length > 5) {
            return res.status(400).json({ error: "Invalid highlights array (max 5 IDs)" });
        }
        await setHighlights(ids);
        res.json({ success: true, highlights: ids });
    } catch (err) {
        console.error("Error updating highlights:", err);
        res.status(500).json({ error: "Failed to update highlights" });
    }
});

app.get("/products", async (req, res) => {
    const products = await getProducts();
    res.json(products);
});

app.get("/categories", async (req, res) => {
    try {
        const products = await getProducts();
        const categories = [...new Set(products.map(p => p.category))];
        res.json(categories);
    } catch (err) {
        console.error("Error fetching categories:", err);
        res.status(500).json({ error: "Failed to fetch categories" });
    }
});

app.get("/products/:id", async (req, res) => {
    try {
        const product = await getProductById(req.params.id);
        res.json(product);
    } catch (err) {
        console.error("Error fetching product:", err);
        res.status(404).json({ error: "Product not found" });
    }
});

app.post("/products", async (req, res) => {
    try {
        const products = await getProducts();
        const newProduct = { id: uuidv4(), ...req.body, timestamp: new Date().toISOString() };
        products.push(newProduct);
        await fs.writeFile(DATA_FILE, JSON.stringify(products, null, 4), "utf-8");
        res.status(201).json(newProduct);
    } catch (err) {
        console.error("Error adding product:", err);
        res.status(500).json({ error: "Failed to add product" });
    }
});

app.put("/products/:id", async (req, res) => {
    try {
        const updated = await editProduct(req.params.id, req.body);
        res.json(updated);
    } catch (err) {
        console.error("Error updating product:", err);
        res.status(500).json({ error: "Failed to update product" });
    }
});

app.get("/messages", async (req, res) => {
    try {
        const messages = await getMessages();
        res.json(messages);
    } catch (err) {
        console.error("Error fetching messages:", err);
        res.status(500).json({ error: "Failed to fetch messages" });
    }
});

app.post("/messages", async (req, res) => {
    try {
        const message = await postMessage(req.body);
        res.status(201).json(message);
    } catch (err) {
        console.error("Error posting message:", err);
        res.status(500).json({ error: "Failed to post message" });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});