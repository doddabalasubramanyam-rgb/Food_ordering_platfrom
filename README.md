# ABC Food Zone - Smart Retail Food Ordering Platform

This is a full-stack, secure, and high-performance food ordering platform built as part of the HCL Hackathon 2026. It enables customers to browse menus, apply dynamic coupons, place orders, and pay via a simulated QR code gateway (with a 2-minute safety window). It also provides suppliers with tools to manage inventory (with low-stock warnings) and transition order states.

## Project Structure

```
foodorderpaltform/
├── backend/                  # Spring Boot (Java) REST API
│   ├── src/main/java         # Java source code
│   └── pom.xml               # Maven configuration
└── frontend/                 # React.js (Vite) Single Page App
    ├── src/                  # React source components & pages
    └── package.json          # Node configuration
```

## Tech Stack

- **Backend**: Spring Boot (Java 17+), Spring Security + JWT, Spring Data JPA / Hibernate, Swagger UI, Maven.
- **Frontend**: React.js, React Router DOM, Lucide Icons, Vanilla CSS (premium glassmorphic theme).
- **Database**: MySQL.

---

## Getting Started

### 1. Database Setup

Make sure MySQL server is running on `localhost:3306`.
The backend is configured to connect using the following credentials:
- **Username**: `root`
- **Password**: `Balu2004`
- **Database**: `food_zone` (will be auto-created on startup)

### 2. Run the Backend

Navigate to the `backend` folder and run the Spring Boot application using Maven:

```powershell
cd backend
# Compile and package the app
C:\Users\DELL\Downloads\apache-maven-3.9.12-bin\apache-maven-3.9.12\bin\mvn.cmd clean package -DskipTests

# Start the server
C:\Users\DELL\Downloads\apache-maven-3.9.12-bin\apache-maven-3.9.12\bin\mvn.cmd spring-boot:run
```

The backend API will run on `http://localhost:8080`.
You can view the interactive **Swagger UI documentation** at `http://localhost:8080/swagger-ui.html`.

### 3. Run the Frontend

Navigate to the `frontend` folder and start the Vite development server:

```powershell
cd frontend
# Install packages (already done)
npm install

# Start the dev server
npm run dev
```

The frontend will run on `http://localhost:5173`. Open this URL in your browser to experience the application.

---

## Key Features

1. **User Auth**: Secured using JWT tokens. Users choose between `CUSTOMER` or `SUPPLIER` roles.
2. **Interactive Menu**: Category filters, real-time stock status (In stock / Low stock / Out of stock).
3. **Simulated Payments**: Generates a dummy UPI QR code. A strict 2-minute timer ensures safety; if payment confirmation is not completed in 2 minutes, the order is auto-cancelled.
4. **Order Scheduler**: A background scheduler scans every minute to cancel unpaid orders after 10 minutes or failed payment sessions after 2 minutes.
5. **Inventory Warnings**: Suppliers receive notification alerts when product stock levels fall below 5 units.
6. **AI Recommendations**: Bonus collaborative recommendation shelf appears on customer homepages based on category order history.
