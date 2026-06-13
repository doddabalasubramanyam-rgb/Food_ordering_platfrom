# Smart Retail Food Ordering Platform — ABC Food Zone

**HCL Hackathon 2026 — Use Case 1**
Full-stack food ordering platform built with React, Spring Boot, and MySQL.

## Tech Stack

- **Frontend:** React.js (CRA/Vite), Axios, React Router, Bootstrap
- **Backend:** Java 17, Spring Boot, Spring Security (JWT), Spring Data JPA
- **Database:** MySQL
- **Docs:** Swagger / OpenAPI

## System Architecture

```
React Frontend (3000) ⟺ Spring Security (JWT + RBAC) → Spring Boot (8080) ⟺ MySQL (3306)
```

## Microservices / Modules

| Module | Responsibility |
|---|---|
| Product Service | Manage product catalog (Pizza, Drinks, Bread); CRUD; stock controlled by Supplier |
| Order Service | Order placement, tracking, history; parallel queue; auto-cancel unpaid orders after 10 min |
| Inventory Service | Track availability; auto-update stock on confirmation; low-stock alerts to Supplier |
| Payment Service | Dummy QR (order_id + amount); "I have completed payment" button; auto-cancel after 2 min |
| Notification Service | Order confirmations & status updates; alerts on placed/fulfilled/cancelled/payment failure |
| Promotions & Offers | Seasonal/festive discounts, coupons, scheduled promos, weekend/hourly specials |

## Project Structure

### Backend (`src/main/java/com/hackathon/retail/`)

```
├── SmartRetailApplication.java       # Main entry point
├── entity/
│   ├── User.java                     # id, name, email, password, role(CUSTOMER|SUPPLIER)
│   ├── Product.java                  # name, category, price, stock_qty, is_available, supplier(FK)
│   ├── Order.java                    # customer(FK), status, total_amount, created_at, paid_at
│   ├── OrderItem.java                # order(FK), product(FK), quantity, unit_price
│   ├── Payment.java                  # order(FK), qr_code, amount, status, confirmed_at
│   ├── Promotion.java                # name, discount_pct, coupon_code, valid_from/to, type
│   └── Notification.java             # user(FK), order(FK), message, sent_at, is_read
├── repository/
│   ├── UserRepository.java           # findByEmail, findByRole
│   ├── ProductRepository.java        # findByCategory, findBySupplierId, findByIsAvailable
│   ├── OrderRepository.java          # findByCustomerId, findByStatus, day-wise supplier view
│   ├── OrderItemRepository.java      # findByOrderId
│   ├── PaymentRepository.java        # findByOrderId, findByStatus
│   ├── PromotionRepository.java      # findActiveBetween, findByCouponCode
│   └── NotificationRepository.java   # findByUserId, findUnreadByUserId
├── service/
│   ├── ProductService.java           # CRUD products, manage availability
│   ├── OrderService.java             # placeOrder, cancelOrder, queueHandling, autoCancel scheduler
│   ├── InventoryService.java         # decrementStock, checkAvailability, lowStockAlert
│   ├── PaymentService.java           # generateQR, confirmPayment, failOnTimeout, applyDiscount
│   ├── PromotionService.java         # getActivePromotions, validateCoupon, applyOffer
│   └── NotificationService.java      # sendOrderAlert, sendInventoryAlert, markAsRead
├── controller/
│   ├── AuthController.java           # /api/auth — register, login
│   ├── ProductController.java        # /api/products — CRUD + listing
│   ├── OrderController.java          # /api/orders — place, cancel, queue, status
│   ├── PaymentController.java        # /api/payment — initiate QR, confirm payment
│   └── PromotionController.java      # /api/promotions — get active, create promo
├── security/
│   ├── SecurityConfig.java           # Filter chain, CORS, role-based permit rules
│   ├── JwtUtil.java                  # Generate & validate JWT tokens
│   └── JwtFilter.java                # OncePerRequestFilter — intercept & verify
├── exception/
│   └── GlobalExceptionHandler.java   # @ControllerAdvice — global error handling
└── dto/
    ├── OrderDTO.java                  # Order request/response with items list
    ├── PaymentDTO.java                # QR payload + confirmation response
    └── AuthDTO.java                   # Login request / JWT response payload
```

**Resources:**
```
src/main/resources/
├── application.properties   # DB url, JPA config, JWT secret, scheduler config
└── schema.sql                # DDL — all CREATE TABLE statements
pom.xml                        # Maven deps: JPA, MySQL, Security, Lombok, OpenAPI, Scheduler
```

### Frontend (`src/`)

```
├── package.json              # axios, react-router-dom, bootstrap
├── .env                       # REACT_APP_API_URL=http://localhost:8080
├── index.js                   # ReactDOM render entry point
├── App.js                      # BrowserRouter + routes; role-based routing
├── pages/
│   ├── customer/
│   │   ├── Home.jsx           # / — landing page
│   │   ├── Products.jsx       # /products — browse menu by category
│   │   ├── Cart.jsx           # /cart — cart summary + coupon + place order
│   │   ├── Orders.jsx         # /orders — order history + re-order
│   │   └── Payment.jsx        # /payment — dummy QR + 2-min timer
│   ├── supplier/
│   │   ├── SupplierProducts.jsx     # /supplier/products — product CRUD + inventory
│   │   ├── SupplierOrders.jsx       # /supplier/orders — order queue + status update
│   │   └── SupplierPromotions.jsx   # /supplier/promotions — create & manage promos
│   └── auth/
│       ├── Login.jsx          # /login — JWT login
│       └── Register.jsx       # /register — customer/supplier register
├── components/
│   ├── Navbar.jsx             # role-aware top nav
│   ├── ProductCard.jsx        # product display with Add to Cart
│   ├── CartItem.jsx           # line item with quantity selector
│   ├── OrderCard.jsx          # order status badge + re-order button
│   ├── QRTimer.jsx            # dummy QR display + 2-min countdown
│   ├── PromoBanner.jsx        # active offers banner
│   └── ProtectedRoute.jsx     # auth + role guard for private routes
├── services/
│   ├── api.js                  # all Axios API call functions
│   └── axiosConfig.js          # base URL + JWT token interceptor
├── context/
│   ├── AuthContext.jsx        # global auth state (user, token, role)
│   └── CartContext.jsx        # cart state (items, add, remove, clear)
└── styles/
    └── App.css                 # global custom styles
```

## Backend Layer Responsibilities

| Layer | Annotations / Tools |
|---|---|
| Controller | `@RestController`, `@CrossOrigin`, `@GetMapping`, `@PostMapping`, `@PutMapping`, `ResponseEntity` |
| Service | `@Service`, `@Transactional`, `@Scheduled`, `@RequiredArgsConstructor` |
| Repository | `JpaRepository`, `@Repository`, `@Query` (JPQL), derived methods |
| Entity | `@Entity`, `@Table`, `@ManyToOne`, `@OneToMany`, `@Enumerated`, `@Data` (Lombok) |
| Security | `SecurityFilterChain`, `JwtFilter`, `UserDetailsService`, `BCryptEncoder` |

## Database Schema (MySQL)

| Table | Fields |
|---|---|
| `user` | id (PK), name, email, password, role (ENUM) |
| `product` | id (PK), name, category, price, stock_qty, is_available, supplier_id (FK) |
| `order` | id (PK), customer_id (FK), status (ENUM), total_amount, created_at, paid_at |
| `order_item` | id (PK), order_id (FK), product_id (FK), quantity, unit_price |
| `payment` | id (PK), order_id (FK), qr_code, amount, status (ENUM), confirmed_at |
| `promotion` | id (PK), name, discount_pct, coupon_code, valid_from, valid_to, type (ENUM) |
| `notification` | id (PK), user_id (FK), order_id (FK), message, sent_at, is_read |

## REST API Endpoints

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/auth/register` | Register new customer/supplier | Public |
| POST | `/api/auth/login` | Login → returns JWT token | Public |
| GET | `/api/products` | List all products with availability | Public |
| POST | `/api/products` | Add new product | Supplier |
| PUT | `/api/products/{id}` | Update product / inventory | Supplier |
| GET | `/api/orders` | Get orders for logged-in user | Auth |
| POST | `/api/orders` | Place a new order | Customer |
| PUT | `/api/orders/{id}/cancel` | Cancel an order | Customer |
| GET | `/api/orders/queue` | View pending order queue | Supplier |
| PUT | `/api/orders/{id}/status` | Update order status | Supplier |
| POST | `/api/payment/initiate` | Generate dummy QR for payment | Customer |
| POST | `/api/payment/confirm` | Confirm payment completion | Customer |
| GET | `/api/promotions` | Get active promotions & offers | Public |
| POST | `/api/promotions` | Create new promotion | Supplier |
| GET | `/swagger-ui.html` | Swagger API documentation UI | Public |

## React Pages

| Route | Page | Features |
|---|---|---|
| `/` | Landing Page | Hero section, browse menu & promotions, key stats, active offers banner |
| `/products` | Browse Products | Category filter, availability filter, ProductCard grid |
| `/cart` | Cart & Checkout | Cart summary, quantity selector, coupon/discount, bill calculation, place order |
| `/orders` | Order History | Order history with status badges, re-order, day-wise filter |
| `/payment` | Dummy QR Payment | QR display, "I have completed payment" button, 2-min countdown, auto-cancel |
| `/supplier/products` | Supplier Products | Product CRUD, stock & availability, inventory dashboard |
| `/supplier/orders` | Order Queue | Pending queue view, status update, day filter |
| `/supplier/promotions` | Manage Promotions | Seasonal/festive offers, coupon codes, schedules |
| `/login`, `/register` | Auth Pages | JWT login with role-based routing; register as Customer/Supplier |

## Recommended Sprint Plan

| Sprint | Focus | Deliverables |
|---|---|---|
| Sprint 0 | Project Setup | Repo init, DB schema, Swagger config, service skeleton, README |
| Sprint 1 | Auth + Products | User registration & login (JWT), Product CRUD, inventory tracking |
| Sprint 2 | Orders + Payment | Order placement, queue, auto-cancel (10 min), dummy QR payment, bill calculation |
| Sprint 3 | Promotions + Notifications | Coupons, seasonal offers, order & inventory notifications |
| Sprint 4 | Frontend + Integration | React UI for Customer & Supplier, full API integration, Postman validation |
| Sprint 5 | Bonus + Polish | AI recommendations, dashboard alerts, performance testing, demo prep |

## Getting Started

### Backend
```bash
cd backend
mvn clean install
mvn spring-boot:run
# Runs on http://localhost:8080
# Swagger UI: http://localhost:8080/swagger-ui.html
```

### Frontend
```bash
cd frontend
npm install
npm start
# Runs on http://localhost:3000
```

### Database
Run `schema.sql` against your MySQL instance (port 3306) and update credentials in `application.properties`.

---
*Smart Retail Food Ordering Platform • ABC Food Zone — Use Case 1 • HCL Hackathon 2026 • VR Siddhartha College, Vijayawada*
