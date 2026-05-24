import { PrismaClient, Prisma } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
    adapter,
});

const warehousesData = [
    {
        name: "Mumbai Central Warehouse",
        code: "WH-MUM-01",
        location: "Bhiwandi Industrial Zone",
        city: "Mumbai",
        country: "India",
        isActive: true,
    },
    {
        name: "Delhi NCR Fulfillment Center",
        code: "WH-DEL-01",
        location: "Manesar Industrial Area",
        city: "Delhi",
        country: "India",
        isActive: true,
    },
    {
        name: "Bangalore South Hub",
        code: "WH-BLR-01",
        location: "Electronic City Phase 2",
        city: "Bangalore",
        country: "India",
        isActive: true,
    },
    {
        name: "Chennai East Distribution",
        code: "WH-CHE-01",
        location: "Sriperumbudur SIPCOT",
        city: "Chennai",
        country: "India",
        isActive: true,
    },
];

const productsData = [
    {
        name: "Amoxicillin 500mg Capsules",
        sku: "AMOX500",
        description: "Broad-spectrum antibiotic capsules",
        price: 10.5,
        category: "Antibiotics",
        isActive: true,
    },
    {
        name: "Paracetamol 650mg Tablets",
        sku: "PARA650",
        description: "Analgesic and antipyretic tablets",
        price: 5.25,
        category: "Pain Relief",
        isActive: true,
    },
    {
        name: "Atorvastatin 20mg Tablets",
        sku: "ATOR20",
        description: "Cholesterol-lowering statin medication",
        price: 15.75,
        category: "Cardiovascular",
        isActive: true,
    },
    {
        name: "Metformin 500mg Tablets",
        sku: "MET500",
        description: "Antidiabetic medication",
        price: 12.0,
        category: "Diabetes",
        isActive: true,
    },
    {
        name: "Levothyroxine Sodium 100mcg Tablets",
        sku: "LEVO100",
        description: "Thyroid hormone replacement therapy",
        price: 8.5,
        category: "Endocrine",
        isActive: true,
    },
    {
        name: "Azithromycin 250mg Tablets",
        sku: "AZI250",
        description: "Macrolide antibiotic for respiratory infections",
        price: 22.5,
        category: "Antibiotics",
        isActive: true,
    },
    {
        name: "Hydrochlorothiazide 25mg Tablets",
        sku: "HCTZ25",
        description: "Diuretic medication for hypertension",
        price: 7.0,
        category: "Cardiovascular",
        isActive: true,
    },
    {
        name: "Prednisone 5mg Tablets",
        sku: "PRED5",
        description: "Corticosteroid for inflammation and immune conditions",
        price: 18.25,
        category: "Anti-inflammatory",
        isActive: true,
    },
    {
        name: "Sertraline 50mg Tablets",
        sku: "SERT50",
        description: "SSRI antidepressant",
        price: 25.0,
        category: "Psychiatric",
        isActive: true,
    },
    {
        name: "Amoxicillin-Clavulanate 500mg/125mg Tablets",
        sku: "AMOXCLV",
        description: "Combination antibiotic",
        price: 32.5,
        category: "Antibiotics",
        isActive: true,
    },
];

export async function seed() {
    console.log("Seeding database...");

    const warehouses = await prisma.warehouse.createMany({
        data: warehousesData,
    });

    const products = await prisma.product.createMany({
        data: productsData,
    });

    console.log("Database seeded successfully");
}

seed();
