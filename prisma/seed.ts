import { PrismaClient } from ".././src/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

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
        description:
            "Broad-spectrum antibiotic capsules for bacterial infections. Effective against various gram-positive and gram-negative bacteria.",
        price: 10.5,
        category: "Antibiotics",
        imageUrl:
            "https://www.paxhealthcare.com/wp-content/uploads/2017/01/MEWAK-500-2.jpg",
        isActive: true,
    },
    {
        name: "Paracetamol 650mg Tablets",
        sku: "PARA650",
        description:
            "Effective analgesic and antipyretic tablets for pain relief and fever reduction. Fast-acting formula.",
        price: 5.25,
        category: "Pain Relief",
        imageUrl:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ0CzGUrrr55GdUow9dyekVuG8pXgqo6BaK7pqgB9xZoIYaalAR",
        isActive: true,
    },
    {
        name: "Atorvastatin 20mg Tablets",
        sku: "ATOR20",
        description:
            "Cholesterol-lowering statin medication. Helps reduce LDL and triglycerides for better heart health.",
        price: 15.75,
        category: "Cardiovascular",
        imageUrl:
            "https://www.scabpharmacy.com/wp-content/uploads/2024/10/Atorvastatin-20mg-Blister-2-scaled.jpg",
        isActive: true,
    },
    {
        name: "Metformin 500mg Tablets",
        sku: "MET500",
        description:
            "First-line antidiabetic medication for type 2 diabetes management. Improves insulin sensitivity.",
        price: 12.0,
        category: "Diabetes",
        imageUrl:
            "https://cdn.pixelbin.io/v2/plain-cake-860195/netmed/wrkr/products/assets/item/free/original/xbzfszt81D-metform_500mg_tablet_20s_0_0.jpg",
        isActive: true,
    },
    {
        name: "Levothyroxine Sodium 100mcg Tablets",
        sku: "LEVO100",
        description:
            "Thyroid hormone replacement therapy for hypothyroidism. Maintains proper metabolic function.",
        price: 8.5,
        category: "Endocrine",
        imageUrl:
            "https://5.imimg.com/data5/SELLER/Default/2024/12/472789767/PC/YH/IZ/236471963/img-2347-500x500.jpeg",
        isActive: true,
    },
    {
        name: "Azithromycin 250mg Tablets",
        sku: "AZI250",
        description:
            "Macrolide antibiotic for respiratory infections and bacterial diseases. Broad spectrum coverage.",
        price: 22.5,
        category: "Antibiotics",
        imageUrl:
            "https://www.biofieldpharma.com/wp-content/uploads/2023/06/BIOFIELD-OZISET-250-TAB-1-scaled.jpg",
        isActive: true,
    },
    {
        name: "Hydrochlorothiazide 25mg Tablets",
        sku: "HCTZ25",
        description:
            "Diuretic medication for hypertension management. Helps reduce blood pressure effectively.",
        price: 7.0,
        category: "Cardiovascular",
        imageUrl:
            "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcQdhYj8HpKcM_p1pH1DL7UjVueMT-GPoZF0ZRA1ISYhjqX1L-Yv",
        isActive: true,
    },
    {
        name: "Prednisone 5mg Tablets",
        sku: "PRED5",
        description:
            "Corticosteroid for inflammation and immune conditions. Potent anti-inflammatory and immunosuppressant.",
        price: 18.25,
        category: "Anti-inflammatory",
        imageUrl: "https://cpimg.tistatic.com/7195001/b/4/prednisone-tablets.jpg",
        isActive: true,
    },
    {
        name: "Sertraline 50mg Tablets",
        sku: "SERT50",
        description:
            "SSRI antidepressant for depression and anxiety disorders. Well-tolerated with minimal side effects.",
        price: 25.0,
        category: "Psychiatric",
        imageUrl:
            "https://5.imimg.com/data5/SELLER/Default/2024/9/454532607/QF/RL/VO/6276597/sertamed-50-sertraline-50-mg.jpg",
        isActive: true,
    },
    {
        name: "Amoxicillin-Clavulanate 500mg/125mg Tablets",
        sku: "AMOXCLV",
        description:
            "Combination antibiotic with enhanced coverage against beta-lactamase producing bacteria.",
        price: 32.5,
        category: "Antibiotics",
        imageUrl:
            "https://5.imimg.com/data5/SELLER/Default/2022/5/SU/EG/RF/3184985/amoxicillin-500-mg-clavulanic-125-mg-tablets.jpg",
        isActive: true,
    },
    {
        name: "Ibuprofen 400mg Tablets",
        sku: "IBU400",
        description:
            "NSAID for pain relief, fever, and inflammation. Fast-acting formula for quick relief.",
        price: 6.75,
        category: "Pain Relief",
        imageUrl:
            "https://5.imimg.com/data5/SELLER/Default/2023/6/319597573/MH/NE/SR/135658020/ibuprofen-400-mg-bp-tablets.jpg",
        isActive: true,
    },
];

async function seed() {
    console.log("🌱 Seeding database...");

    // Upsert warehouses (create or skip)
    for (const wh of warehousesData) {
        await prisma.warehouse.upsert({
            where: { code: wh.code },
            update: { name: wh.name, location: wh.location, city: wh.city, country: wh.country, isActive: wh.isActive },
            create: wh,
        });
    }
    console.log(`🏭 Upserted ${warehousesData.length} warehouses`);

    // Upsert products — updates imageUrl and other fields on existing records
    for (const p of productsData) {
        await prisma.product.upsert({
            where: { sku: p.sku },
            update: {
                name: p.name,
                description: p.description,
                price: p.price,
                category: p.category,
                imageUrl: p.imageUrl,
                isActive: p.isActive,
            },
            create: p,
        });
    }
    console.log(`📦 Upserted ${productsData.length} products`);

    // Get all warehouses and products for inventory seeding
    const allWarehouses = await prisma.warehouse.findMany();
    const allProducts = await prisma.product.findMany();

    // Upsert inventory records — only create if not already present
    let inventoryCreated = 0;
    for (const product of allProducts) {
        for (const warehouse of allWarehouses) {
            const existing = await prisma.inventory.findUnique({
                where: {
                    productId_warehouseId: {
                        productId: product.id,
                        warehouseId: warehouse.id,
                    },
                },
            });

            if (!existing) {
                await prisma.inventory.create({
                    data: {
                        productId: product.id,
                        warehouseId: warehouse.id,
                        totalStock: Math.floor(Math.random() * 500) + 100,
                        reservedStock: 0,
                    },
                });
                inventoryCreated++;
            }
        }
    }

    console.log(`📊 Created ${inventoryCreated} new inventory records`);
    console.log("✅ Database seeded successfully!");
}

seed()
    .catch((e) => {
        console.error("❌ Seed failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
