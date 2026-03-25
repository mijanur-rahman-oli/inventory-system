import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const userId = "a81c8068-c385-46ad-9a69-f83c55b1c40d";

  const inventories = [
    {
      name: "Electronics Stock",
      description: "Computers, phones, and electronic accessories",
      fields: [
        { fieldKey: "text1", fieldType: "text", title: "Brand", showInTable: true, sortOrder: 0 },
        { fieldKey: "text2", fieldType: "text", title: "Model", showInTable: true, sortOrder: 1 },
        { fieldKey: "num1", fieldType: "numeric", title: "Price ($)", showInTable: true, sortOrder: 2 },
        { fieldKey: "num2", fieldType: "numeric", title: "Stock Qty", showInTable: true, sortOrder: 3 },
        { fieldKey: "bool1", fieldType: "boolean", title: "In Stock", showInTable: true, sortOrder: 4 },
        { fieldKey: "link1", fieldType: "link", title: "Image", showInTable: true, sortOrder: 5 },
      ],
      idPrefix: "ELEC-",
      items: [
        { text1: "Apple", text2: "MacBook Pro 14", num1: 2499.99, num2: 15, bool1: true },
        { text1: "Samsung", text2: "Galaxy S24 Ultra", num1: 1299.99, num2: 42, bool1: true },
        { text1: "Sony", text2: "WH-1000XM5", num1: 349.99, num2: 0, bool1: false },
        { text1: "Dell", text2: "XPS 15", num1: 1899.99, num2: 8, bool1: true },
      ],
    },
    {
      name: "Office Supplies",
      description: "Stationery, furniture, and office equipment",
      fields: [
        { fieldKey: "text1", fieldType: "text", title: "Item Name", showInTable: true, sortOrder: 0 },
        { fieldKey: "text2", fieldType: "text", title: "Category", showInTable: true, sortOrder: 1 },
        { fieldKey: "num1", fieldType: "numeric", title: "Unit Price", showInTable: true, sortOrder: 2 },
        { fieldKey: "num2", fieldType: "numeric", title: "Quantity", showInTable: true, sortOrder: 3 },
        { fieldKey: "text3", fieldType: "text", title: "Supplier", showInTable: false, sortOrder: 4 },
        { fieldKey: "bool1", fieldType: "boolean", title: "Reorder Needed", showInTable: true, sortOrder: 5 },
      ],
      idPrefix: "OFF-",
      items: [
        { text1: "A4 Paper Ream", text2: "Stationery", num1: 8.99, num2: 250, bool1: false },
        { text1: "Ergonomic Chair", text2: "Furniture", num1: 499.99, num2: 12, bool1: false },
        { text1: "Whiteboard Markers", text2: "Stationery", num1: 3.49, num2: 5, bool1: true },
      ],
    },
    {
      name: "Clothing & Apparel",
      description: "Men, women and kids fashion inventory",
      fields: [
        { fieldKey: "text1", fieldType: "text", title: "Product Name", showInTable: true, sortOrder: 0 },
        { fieldKey: "text2", fieldType: "text", title: "Size", showInTable: true, sortOrder: 1 },
        { fieldKey: "text3", fieldType: "text", title: "Color", showInTable: true, sortOrder: 2 },
        { fieldKey: "num1", fieldType: "numeric", title: "Price ($)", showInTable: true, sortOrder: 3 },
        { fieldKey: "num2", fieldType: "numeric", title: "Stock", showInTable: true, sortOrder: 4 },
        { fieldKey: "bool1", fieldType: "boolean", title: "On Sale", showInTable: true, sortOrder: 5 },
      ],
      idPrefix: "CLT-",
      items: [
        { text1: "Classic T-Shirt", text2: "M", text3: "White", num1: 19.99, num2: 100, bool1: false },
        { text1: "Slim Fit Jeans", text2: "32x30", text3: "Blue", num1: 59.99, num2: 45, bool1: true },
        { text1: "Winter Jacket", text2: "L", text3: "Black", num1: 149.99, num2: 20, bool1: false },
      ],
    },
    {
      name: "Food & Beverages",
      description: "Pantry, drinks and perishable goods",
      fields: [
        { fieldKey: "text1", fieldType: "text", title: "Product", showInTable: true, sortOrder: 0 },
        { fieldKey: "text2", fieldType: "text", title: "Category", showInTable: true, sortOrder: 1 },
        { fieldKey: "num1", fieldType: "numeric", title: "Price ($)", showInTable: true, sortOrder: 2 },
        { fieldKey: "num2", fieldType: "numeric", title: "Units", showInTable: true, sortOrder: 3 },
        { fieldKey: "bool1", fieldType: "boolean", title: "Perishable", showInTable: true, sortOrder: 4 },
        { fieldKey: "text3", fieldType: "text", title: "Expiry Date", showInTable: false, sortOrder: 5 },
      ],
      idPrefix: "FOOD-",
      items: [
        { text1: "Organic Coffee Beans", text2: "Beverages", num1: 14.99, num2: 80, bool1: false },
        { text1: "Whole Milk 1L", text2: "Dairy", num1: 1.89, num2: 200, bool1: true },
        { text1: "Brown Rice 5kg", text2: "Grains", num1: 9.99, num2: 60, bool1: false },
      ],
    },
    {
      name: "Medical Supplies",
      description: "Healthcare and pharmaceutical inventory",
      fields: [
        { fieldKey: "text1", fieldType: "text", title: "Item Name", showInTable: true, sortOrder: 0 },
        { fieldKey: "text2", fieldType: "text", title: "Category", showInTable: true, sortOrder: 1 },
        { fieldKey: "num1", fieldType: "numeric", title: "Unit Cost ($)", showInTable: true, sortOrder: 2 },
        { fieldKey: "num2", fieldType: "numeric", title: "Stock", showInTable: true, sortOrder: 3 },
        { fieldKey: "bool1", fieldType: "boolean", title: "Prescription Required", showInTable: true, sortOrder: 4 },
        { fieldKey: "text3", fieldType: "text", title: "Storage Conditions", showInTable: false, sortOrder: 5 },
      ],
      idPrefix: "MED-",
      items: [
        { text1: "Surgical Gloves (box)", text2: "PPE", num1: 12.99, num2: 500, bool1: false },
        { text1: "Digital Thermometer", text2: "Equipment", num1: 24.99, num2: 75, bool1: false },
        { text1: "Ibuprofen 200mg", text2: "Medication", num1: 5.99, num2: 300, bool1: false },
      ],
    },
    {
      name: "Automotive Parts",
      description: "Car parts, tools and accessories",
      fields: [
        { fieldKey: "text1", fieldType: "text", title: "Part Name", showInTable: true, sortOrder: 0 },
        { fieldKey: "text2", fieldType: "text", title: "Compatible Model", showInTable: true, sortOrder: 1 },
        { fieldKey: "text3", fieldType: "text", title: "Part Number", showInTable: true, sortOrder: 2 },
        { fieldKey: "num1", fieldType: "numeric", title: "Price ($)", showInTable: true, sortOrder: 3 },
        { fieldKey: "num2", fieldType: "numeric", title: "Stock", showInTable: true, sortOrder: 4 },
        { fieldKey: "bool1", fieldType: "boolean", title: "OEM Part", showInTable: true, sortOrder: 5 },
      ],
      idPrefix: "AUTO-",
      items: [
        { text1: "Brake Pads", text2: "Toyota Camry 2020", text3: "BP-4421", num1: 45.99, num2: 30, bool1: true },
        { text1: "Air Filter", text2: "Universal", text3: "AF-1100", num1: 18.99, num2: 85, bool1: false },
        { text1: "Motor Oil 5W-30", text2: "Universal", text3: "OIL-530", num1: 32.99, num2: 120, bool1: false },
      ],
    },
    {
      name: "Books & Stationery",
      description: "Educational books and writing materials",
      fields: [
        { fieldKey: "text1", fieldType: "text", title: "Title", showInTable: true, sortOrder: 0 },
        { fieldKey: "text2", fieldType: "text", title: "Author", showInTable: true, sortOrder: 1 },
        { fieldKey: "text3", fieldType: "text", title: "ISBN", showInTable: false, sortOrder: 2 },
        { fieldKey: "num1", fieldType: "numeric", title: "Price ($)", showInTable: true, sortOrder: 3 },
        { fieldKey: "num2", fieldType: "numeric", title: "Copies", showInTable: true, sortOrder: 4 },
        { fieldKey: "bool1", fieldType: "boolean", title: "In Print", showInTable: true, sortOrder: 5 },
      ],
      idPrefix: "BOOK-",
      items: [
        { text1: "Clean Code", text2: "Robert C. Martin", text3: "978-0132350884", num1: 39.99, num2: 25, bool1: true },
        { text1: "The Pragmatic Programmer", text2: "Hunt & Thomas", text3: "978-0135957059", num1: 44.99, num2: 18, bool1: true },
        { text1: "Design Patterns", text2: "Gang of Four", text3: "978-0201633610", num1: 54.99, num2: 10, bool1: true },
      ],
    },
    {
      name: "Sports & Fitness",
      description: "Gym equipment and sports accessories",
      fields: [
        { fieldKey: "text1", fieldType: "text", title: "Product", showInTable: true, sortOrder: 0 },
        { fieldKey: "text2", fieldType: "text", title: "Sport Type", showInTable: true, sortOrder: 1 },
        { fieldKey: "num1", fieldType: "numeric", title: "Price ($)", showInTable: true, sortOrder: 2 },
        { fieldKey: "num2", fieldType: "numeric", title: "Stock", showInTable: true, sortOrder: 3 },
        { fieldKey: "num3", fieldType: "numeric", title: "Weight (kg)", showInTable: false, sortOrder: 4 },
        { fieldKey: "bool1", fieldType: "boolean", title: "On Promotion", showInTable: true, sortOrder: 5 },
      ],
      idPrefix: "SPT-",
      items: [
        { text1: "Yoga Mat", text2: "Yoga", num1: 29.99, num2: 60, bool1: false },
        { text1: "Dumbbell Set 20kg", text2: "Weightlifting", num1: 89.99, num2: 25, bool1: true },
        { text1: "Running Shoes", text2: "Running", num1: 119.99, num2: 40, bool1: false },
      ],
    },
    {
      name: "Home & Kitchen",
      description: "Household appliances and kitchen tools",
      fields: [
        { fieldKey: "text1", fieldType: "text", title: "Product Name", showInTable: true, sortOrder: 0 },
        { fieldKey: "text2", fieldType: "text", title: "Category", showInTable: true, sortOrder: 1 },
        { fieldKey: "text3", fieldType: "text", title: "Brand", showInTable: false, sortOrder: 2 },
        { fieldKey: "num1", fieldType: "numeric", title: "Price ($)", showInTable: true, sortOrder: 3 },
        { fieldKey: "num2", fieldType: "numeric", title: "Stock", showInTable: true, sortOrder: 4 },
        { fieldKey: "bool1", fieldType: "boolean", title: "Warranty Included", showInTable: true, sortOrder: 5 },
      ],
      idPrefix: "HMK-",
      items: [
        { text1: "Coffee Maker", text2: "Appliances", text3: "Philips", num1: 79.99, num2: 35, bool1: true },
        { text1: "Chef Knife Set", text2: "Cookware", text3: "Wusthof", num1: 149.99, num2: 20, bool1: false },
        { text1: "Air Fryer 5L", text2: "Appliances", text3: "Ninja", num1: 129.99, num2: 18, bool1: true },
      ],
    },
    {
      name: "Garden & Outdoor",
      description: "Plants, tools and outdoor furniture",
      fields: [
        { fieldKey: "text1", fieldType: "text", title: "Item", showInTable: true, sortOrder: 0 },
        { fieldKey: "text2", fieldType: "text", title: "Type", showInTable: true, sortOrder: 1 },
        { fieldKey: "num1", fieldType: "numeric", title: "Price ($)", showInTable: true, sortOrder: 2 },
        { fieldKey: "num2", fieldType: "numeric", title: "Quantity", showInTable: true, sortOrder: 3 },
        { fieldKey: "bool1", fieldType: "boolean", title: "Seasonal", showInTable: true, sortOrder: 4 },
        { fieldKey: "multiline1", fieldType: "multiline", title: "Care Instructions", showInTable: false, sortOrder: 5 },
      ],
      idPrefix: "GRD-",
      items: [
        { text1: "Rose Bush", text2: "Plants", num1: 24.99, num2: 40, bool1: true },
        { text1: "Garden Hose 20m", text2: "Tools", num1: 34.99, num2: 28, bool1: false },
        { text1: "Outdoor Chair Set", text2: "Furniture", num1: 299.99, num2: 10, bool1: false },
      ],
    },
  ];

  console.log("Seeding 10 inventories...");

  for (const inv of inventories) {
    const created = await prisma.inventory.create({
      data: {
        userId,
        name: inv.name,
        description: inv.description,
        fieldMetas: {
          create: inv.fields,
        },
        idTemplate: {
          create: {
            elements: JSON.stringify([
              { id: "1", type: "fixed", value: inv.idPrefix },
              { id: "2", type: "sequence" },
            ]),
            sequenceVal: 0,
          },
        },
      },
    });

    await prisma.item.createMany({
      data: inv.items.map((item, i) => ({
        inventoryId: created.id,
        customId: `${inv.idPrefix}${String(i + 1).padStart(6, "0")}`,
        ...item,
      })),
    });

    console.log(`✔ Created: ${inv.name}`);
  }

  console.log("Done! 10 inventories seeded.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());