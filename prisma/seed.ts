import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create default roles
  console.log("Seeding database...");

  // Create default admin user
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@grocerypos.com",
      phone: "+1234567890",
      password: "$2b$10$3j8X98z5a3CvP0n6g7U5/.jDGBLNsYWUQvm71hGhr8x1TIaeiAVfC", // password: admin123
      name: "Admin User",
      role: "ADMIN",
      isActive: true,
    },
  });
  console.log("Created admin user:", adminUser.name);

  // Create cashier user
  const cashierUser = await prisma.user.create({
    data: {
      email: "cashier@grocerypos.com",
      phone: "+1234567891",
      password: "$2b$10$3j8X98z5a3CvP0n6g7U5/.jDGBLNsYWUQvm71hGhr8x1TIaeiAVfC", // password: admin123
      name: "Cashier User",
      role: "CASHIER",
      isActive: true,
    },
  });
  console.log("Created cashier user:", cashierUser.name);

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({ data: { name: "Fruits" } }),
    prisma.category.create({ data: { name: "Vegetables" } }),
    prisma.category.create({ data: { name: "Dairy" } }),
    prisma.category.create({ data: { name: "Bakery" } }),
    prisma.category.create({ data: { name: "Meat" } }),
    prisma.category.create({ data: { name: "Beverages" } }),
    prisma.category.create({ data: { name: "Snacks" } }),
    prisma.category.create({ data: { name: "Frozen" } }),
  ]);
  console.log(
    "Created categories:",
    categories.map((c) => c.name)
  );

  // Create brands
  const brands = await Promise.all([
    prisma.brand.create({ data: { name: "Organic Farms" } }),
    prisma.brand.create({ data: { name: "Fresh Choice" } }),
    prisma.brand.create({ data: { name: "Local Produce" } }),
    prisma.brand.create({ data: { name: "Healthy Options" } }),
    prisma.brand.create({ data: { name: "Farm Fresh" } }),
  ]);
  console.log(
    "Created brands:",
    brands.map((b) => b.name)
  );

  // Create units
  const units = await Promise.all([
    prisma.unit.create({ data: { name: "Each", symbol: "ea" } }),
    prisma.unit.create({ data: { name: "Pound", symbol: "lb" } }),
    prisma.unit.create({ data: { name: "Kilogram", symbol: "kg" } }),
    prisma.unit.create({ data: { name: "Gram", symbol: "g" } }),
    prisma.unit.create({ data: { name: "Liter", symbol: "L" } }),
    prisma.unit.create({ data: { name: "Milliliter", symbol: "mL" } }),
    prisma.unit.create({ data: { name: "Dozen", symbol: "dz" } }),
  ]);
  console.log(
    "Created units:",
    units.map((u) => u.name)
  );

  // Create products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: "Organic Bananas",
        sku: "FRU-001",
        barcode: "1234567890123",
        categoryId: categories[0].id,
        brandId: brands[0].id,
        unitId: units[1].id,
        costPrice: 0.6,
        sellingPrice: 0.99,
        stock: 45,
        minStock: 20,
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      },
    }),
    prisma.product.create({
      data: {
        name: "Whole Grain Bread",
        sku: "BAK-001",
        barcode: "1234567890124",
        categoryId: categories[3].id,
        brandId: brands[3].id,
        unitId: units[0].id,
        costPrice: 1.2,
        sellingPrice: 2.49,
        stock: 23,
        minStock: 10,
        expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      },
    }),
    prisma.product.create({
      data: {
        name: "Free Range Eggs",
        sku: "DAI-001",
        barcode: "1234567890125",
        categoryId: categories[2].id,
        brandId: brands[4].id,
        unitId: units[6].id,
        costPrice: 2.5,
        sellingPrice: 3.99,
        stock: 12,
        minStock: 5,
        expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      },
    }),
    prisma.product.create({
      data: {
        name: "Greek Yogurt",
        sku: "DAI-002",
        barcode: "1234567890126",
        categoryId: categories[2].id,
        brandId: brands[1].id,
        unitId: units[0].id,
        costPrice: 0.8,
        sellingPrice: 1.29,
        stock: 30,
        minStock: 15,
        expiryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      },
    }),
    prisma.product.create({
      data: {
        name: "Avocado",
        sku: "FRU-002",
        barcode: "1234567890127",
        categoryId: categories[0].id,
        brandId: brands[2].id,
        unitId: units[0].id,
        costPrice: 1.2,
        sellingPrice: 1.99,
        stock: 18,
        minStock: 10,
        expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      },
    }),
    prisma.product.create({
      data: {
        name: "Almond Milk",
        sku: "BEV-001",
        barcode: "1234567890128",
        categoryId: categories[5].id,
        brandId: brands[0].id,
        unitId: units[4].id,
        costPrice: 1.8,
        sellingPrice: 3.49,
        stock: 15,
        minStock: 8,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
    }),
    prisma.product.create({
      data: {
        name: "Spinach",
        sku: "VEG-001",
        barcode: "1234567890129",
        categoryId: categories[1].id,
        brandId: brands[2].id,
        unitId: units[1].id,
        costPrice: 1.5,
        sellingPrice: 2.29,
        stock: 8,
        minStock: 5,
        expiryDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
      },
    }),
    prisma.product.create({
      data: {
        name: "Salmon Fillet",
        sku: "MEA-001",
        barcode: "1234567890130",
        categoryId: categories[4].id,
        brandId: brands[1].id,
        unitId: units[2].id,
        costPrice: 6.5,
        sellingPrice: 8.99,
        stock: 5,
        minStock: 3,
        expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      },
    }),
  ]);
  console.log(
    "Created products:",
    products.map((p) => p.name)
  );

  // Create customers
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        name: "John Smith",
        email: "john.smith@example.com",
        phone: "+15551234567",
        address: "123 Main St, City, State 12345",
        loyaltyPoints: 1250,
      },
    }),
    prisma.customer.create({
      data: {
        name: "Sarah Johnson",
        email: "sarah.johnson@example.com",
        phone: "+15559876543",
        address: "456 Oak Ave, Town, State 67890",
        loyaltyPoints: 870,
      },
    }),
    prisma.customer.create({
      data: {
        name: "Michael Brown",
        email: "michael.brown@example.com",
        phone: "+15554567890",
        address: "789 Pine Rd, Village, State 54321",
        loyaltyPoints: 2100,
      },
    }),
  ]);
  console.log(
    "Created customers:",
    customers.map((c) => c.name)
  );

  // Create suppliers
  const suppliers = await Promise.all([
    prisma.supplier.create({
      data: {
        name: "Fresh Produce Co.",
        contactPerson: "John Farmer",
        email: "john@freshproduce.com",
        phone: "+15551234568",
        address: "123 Farm Road, Agriculture City",
      },
    }),
    prisma.supplier.create({
      data: {
        name: "Dairy Distributors Inc.",
        contactPerson: "Sarah Milkson",
        email: "sarah@dairydist.com",
        phone: "+15559876544",
        address: "456 Dairy Lane, Milk Town",
      },
    }),
    prisma.supplier.create({
      data: {
        name: "Global Foods Ltd.",
        contactPerson: "Michael International",
        email: "michael@globalfoods.com",
        phone: "+15554567891",
        address: "789 International Blvd, Global City",
      },
    }),
  ]);
  console.log(
    "Created suppliers:",
    suppliers.map((s) => s.name)
  );

  // Create a sample sale
  const sale = await prisma.sale.create({
    data: {
      userId: adminUser.id,
      customerId: customers[0].id,
      invoiceNumber: "INV-001",
      subtotal: 7.75,
      taxAmount: 0.62,
      totalAmount: 8.37,
      amountPaid: 10.0,
      amountDue: 0.0,
      paymentMethod: "Cash",
      status: "completed",
    },
  });
  console.log("Created sample sale:", sale.invoiceNumber);

  // Create sale items
  const saleItems = await Promise.all([
    prisma.saleItem.create({
      data: {
        saleId: sale.id,
        productId: products[0].id,
        quantity: 3,
        unitPrice: 0.99,
        totalPrice: 2.97,
      },
    }),
    prisma.saleItem.create({
      data: {
        saleId: sale.id,
        productId: products[1].id,
        quantity: 2,
        unitPrice: 2.49,
        totalPrice: 4.98,
      },
    }),
  ]);
  console.log("Created sale items:", saleItems.length);

  // Create expense categories
  const expenseCategories = await Promise.all([
    prisma.expenseCategory.create({ data: { name: "Utilities" } }),
    prisma.expenseCategory.create({ data: { name: "Rent" } }),
    prisma.expenseCategory.create({ data: { name: "Salaries" } }),
    prisma.expenseCategory.create({ data: { name: "Supplies" } }),
    prisma.expenseCategory.create({ data: { name: "Marketing" } }),
  ]);
  console.log(
    "Created expense categories:",
    expenseCategories.map((ec) => ec.name)
  );

  // Create sample expenses
  const expenses = await Promise.all([
    prisma.expense.create({
      data: {
        categoryId: expenseCategories[0].id,
        userId: adminUser.id,
        amount: 250.0,
        description: "Electricity bill",
        date: new Date(),
      },
    }),
    prisma.expense.create({
      data: {
        categoryId: expenseCategories[2].id,
        userId: adminUser.id,
        amount: 3500.0,
        description: "Staff salaries",
        date: new Date(),
      },
    }),
  ]);
  console.log("Created sample expenses:", expenses.length);

  // Create business settings
  const business = await prisma.business.create({
    data: {
      name: "Fresh Market Grocery",
      email: "info@freshmarket.com",
      phone: "+15551234567",
      address: "123 Main Street, City, State 12345",
      taxRate: 8.0,
      currency: "USD",
      receiptMessage: "Thank you for shopping with us! Please come again.",
    },
  });
  console.log("Created business settings:", business.name);

  // Display login credentials
  console.log("\n=== LOGIN CREDENTIALS ===");
  console.log("Admin Email: admin@grocerypos.com");
  console.log("Admin Password: admin123");
  console.log("Cashier Email: cashier@grocerypos.com");
  console.log("Cashier Password: admin123");
  console.log("========================\n");

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
