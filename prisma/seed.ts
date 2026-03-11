import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const demoUserId = "demo-user-001";

  const inventory = await prisma.inventory.create({
    data: {
      userId: demoUserId,
      name: "Electronics Stock",
      description: "Main electronics inventory",
      fieldMetas: {
        create: [
          // fieldType must be UPPERCASE to match the Prisma Enum
          { fieldKey: "text1", fieldType: "TEXT", title: "Brand", showInTable: true, sortOrder: 0 },
          { fieldKey: "text2", fieldType: "TEXT", title: "Model", showInTable: true, sortOrder: 1 },
          { fieldKey: "text3", fieldType: "TEXT", title: "Color", showInTable: false, sortOrder: 2 },
          { fieldKey: "num1", fieldType: "NUMBER", title: "Price ($)", showInTable: true, sortOrder: 3 },
          { fieldKey: "num2", fieldType: "NUMBER", title: "Stock", showInTable: true, sortOrder: 4 },
          { fieldKey: "bool1", fieldType: "BOOLEAN", title: "In Stock", showInTable: true, sortOrder: 5 },
          { fieldKey: "link1", fieldType: "LINK", title: "Image", showInTable: true, sortOrder: 6 },
        ],
      },
      idTemplate: {
        create: {
          elements: JSON.stringify([
            { id: "1", type: "fixed", value: "ELEC-" },
            { id: "2", type: "sequence" },
          ]),
          sequenceVal: 0,
        },
      },
    },
  });

  await prisma.item.createMany({
    data: [
      { inventoryId: inventory.id, customId: "ELEC-000001", text1: "Apple", text2: "MacBook Pro", num1: 2499.99, num2: 15, bool1: true },
      { inventoryId: inventory.id, customId: "ELEC-000002", text1: "Samsung", text2: "Galaxy S24", num1: 899.99, num2: 45, bool1: true },
      { inventoryId: inventory.id, customId: "ELEC-000003", text1: "Sony", text2: "WH-1000XM5", num1: 349.99, num2: 0, bool1: false },
    ],
  });

  console.log("Seed complete!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());