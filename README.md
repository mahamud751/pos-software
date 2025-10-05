# e360 – Enterprise eCommerce Business Engine

A comprehensive Point of Sale (POS) and eCommerce solution built with Next.js, Prisma, and PostgreSQL.

## Features Implemented

✅ **POS (Point of Sale) Module**

- Barcode scanning functionality
- Receipt generation
- Product search and selection
- Cart management

✅ **Inventory Management**

- Low stock alerts
- Purchase order management
- Real-time stock tracking

✅ **Warehouse Management**

- Multi-location tracking
- Stock allocation and reservation

✅ **CRM (Customer Relationship Management)**

- Customer communication tracking
- Loyalty program implementation
- Customer segmentation

✅ **Campaign Designer**

- Promotional campaign management
- Coupon and discount code system
- Targeted marketing campaigns

✅ **Marketing & Business Analytics**

- Sales analytics dashboard
- Customer segmentation analysis
- Product performance tracking

✅ **Delivery & Order Management**

- Order tracking system
- Fraud detection mechanisms
- Delivery status updates

✅ **Dynamic Pricing & Discount Rules Engine**

- Flexible pricing rules based on products, categories, or customers
- Time-based discounts and promotions
- Bulk pricing and tiered discounts

✅ **Shopping Cart & Checkout**

- Intuitive shopping cart interface
- Multiple payment method support
- Order confirmation and receipt generation

✅ **Payment Gateway Integration**

- Stripe payment processing
- Secure card payment handling
- Cash payment support

✅ **Order Tracking & Notification System**

- Real-time order status tracking
- Customer and staff notifications
- Email and SMS logging

## Technology Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Payment Processing**: Stripe
- **Authentication**: JWT
- **Deployment**: Vercel or any Node.js hosting platform

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Stripe account for payment processing

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd pos-software
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file with the following variables:

   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/database_name?schema=public"
   JWT_SECRET="your-jwt-secret"
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="your-stripe-publishable-key"
   STRIPE_SECRET_KEY="your-stripe-secret-key"
   ```

4. Run database migrations:

   ```bash
   npx prisma migrate dev
   ```

5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── api/            # API routes
│   ├── sales/          # Sales terminal page
│   ├── products/       # Product management
│   ├── customers/      # Customer management
│   └── ...             # Other pages
├── components/         # React components
├── lib/                # Utility functions and services
│   ├── stripe/         # Stripe payment integration
│   └── prisma.ts       # Prisma client instance
└── styles/             # Global styles
prisma/
├── schema.prisma       # Database schema
└── migrations/         # Database migrations
```

## Pending Features

### Multi-Vendor Support

- Vendor registration and management
- Vendor-specific product catalogs
- Commission and payout systems
- Vendor performance analytics

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue on the repository or contact the development team.
# pos-software
