import express from "express";
import cors from "cors";
import fs from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const HIGHLIGHTS_FILE = path.join(__dirname, "highlights.json");

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

async function getProductById(id) {
    try {
        const products = await getProducts();
        const product = products.find((p) => p.id === id);
        if (!product) {
            throw new Error("Product not found");
        }
        return product;
    } catch (error) {
        console.error("Error fetching product by ID:", error);
        throw error;
    }
}

async function editProduct(id, updatedProduct) {
    try {
        const products = await getProducts();
        const productIndex = products.findIndex((p) => p.id === id);
        if (productIndex !== -1) {
            products[productIndex] = {
                ...products[productIndex],
                ...updatedProduct,
            };
            await fs.writeFile(
                path.join(__dirname, "data.json"),
                JSON.stringify(products, null, 4),
                "utf-8"
            );
            return products[productIndex];
        } else {
            throw new Error("Product not found");
        }
    } catch (error) {
        console.error("Error editing product:", error);
        throw error;
    }
}

async function getMessages() {
    try {
        const data = await fs.readFile(
            path.join(__dirname, "messages.json"),
            "utf-8"
        );
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading messages file:", error);
        return [];
    }
}

async function postMessage(newMessage) {
    try {
        const messages = await getMessages();
        const messageWithIdAndTimestamp = {
            id: uuidv4(),
            ...newMessage,
            timestamp: new Date().toISOString(),
        };
        messages.push(messageWithIdAndTimestamp);
        await fs.writeFile(
            path.join(__dirname, "messages.json"),
            JSON.stringify(messages, null, 4),
            "utf-8"
        );
        return messageWithIdAndTimestamp;
    } catch (error) {
        console.error("Error posting message:", error);
        throw error;
    }
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

app.get("/products", async (req, res) => {
    const products = await getProducts();
    res.json(products);
});

app.get("/categories", async (req, res) => {
    try {
        const products = await getProducts();
        const categories = [
            ...new Set(products.map((product) => product.category)),
        ];
        res.json(categories);
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ error: "Failed to fetch categories" });
    }
});

app.get("/products/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const product = await getProductById(id);
        res.json(product);
    } catch (error) {
        console.error("Error fetching product:", error);
        res.status(404).json({ error: "Product not found" });
    }
});

app.get("/messages", async (req, res) => {
    try {
        const messages = await getMessages();
        res.json(messages);
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ error: "Failed to fetch messages" });
    }
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

app.post("/messages", async (req, res) => {
    const newMessage = req.body;
    try {
        const message = await postMessage(newMessage);
        res.status(201).json(message);
    } catch (error) {
        console.error("Error posting message:", error);
        res.status(500).json({ error: "Failed to post message" });
    }
});

app.put("/products/:id", async (req, res) => {
    const { id } = req.params;
    const updatedProduct = req.body;

    try {
        const product = await editProduct(id, updatedProduct);
        res.json(product);
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ error: "Failed to update product" });
    }
});

app.get("/highlights", async (req, res) => {
    try {
        const ids = await getHighlights();
        const products = await getProducts();
        const highlighted = products.filter((p) => ids.includes(p.id));
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
            return res
                .status(400)
                .json({ error: "Invalid highlights array (max 5 IDs)" });
        }
        await setHighlights(ids);
        res.json({ success: true, highlights: ids });
    } catch (err) {
        console.error("Error updating highlights:", err);
        res.status(500).json({ error: "Failed to update highlights" });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
