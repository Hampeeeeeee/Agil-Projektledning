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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
