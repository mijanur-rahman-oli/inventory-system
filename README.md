# InventoryOS

A production-grade Inventory & Business Operations Management Platform built with Next.js, TypeScript, PostgreSQL, Prisma, and Socket.IO.

InventoryOS helps organizations manage inventory assets, customize product structures, collaborate in real time, and integrate seamlessly with ERP systems such as Odoo. The platform is designed with scalability, flexibility, and enterprise workflows in mind.

## Key Highlights

* Multi-tenant SaaS architecture
* Role-Based Access Control (RBAC)
* Dynamic inventory schema system
* Drag-and-drop Custom ID Builder
* Real-time team communication with Socket.IO
* Odoo ERP Integration
* Secure authentication with NextAuth
* PostgreSQL + Prisma ORM
* Responsive dashboard and analytics
* REST API with Bearer Token Authentication

---

## Core Features

### Dynamic Inventory Management

Manage products with fully customizable inventory structures.

* Create custom fields for each inventory type
* Field visibility toggle system
* Dynamic metadata and descriptions
* Configurable product attributes
* Flexible schema without database redesign

### Custom ID Builder

Generate business-specific inventory IDs using a drag-and-drop template builder.

Examples:

INV-2026-0001

ELEC-LAPTOP-001

Features:

* Drag-and-drop template creation
* Multiple configurable ID elements
* Live preview generation
* Collision-safe unique ID creation
* Custom prefixes and formatting rules

### Real-Time Team Collaboration

Built using Socket.IO for instant communication.

Features:

* Real-time messaging
* User-to-user communication
* Instant updates without page refresh
* Online collaboration workflow

### Role-Based Access Control (RBAC)

Secure access management across the platform.

Roles include:

* Administrator
* Manager
* Staff

Capabilities:

* Protected routes
* Permission-based access
* Session-based authentication
* Secure resource isolation

### Authentication & Security

Implemented with NextAuth.

Features:

* Secure login system
* Session management
* Protected dashboard routes
* Authentication middleware
* Token-based API security

### Odoo ERP Integration

Integrated directly with Odoo APIs to synchronize business operations.

Features:

* Inventory synchronization
* Product data exchange
* ERP connectivity layer
* Bearer Token Authentication
* Automated data flow between systems

### Dashboard & Analytics

Comprehensive operational visibility.

Features:

* Inventory overview dashboard
* Product statistics
* Inventory tracking
* Operational insights
* Business performance metrics

### REST API Infrastructure

Enterprise-ready API layer.

Features:

* Bearer token authentication
* Secure endpoint access
* CRUD operations
* External system integration
* Odoo-compatible endpoints

---

## Technology Stack

Frontend

* Next.js 15 App Router
* TypeScript
* React
* Tailwind CSS

Backend

* Next.js Server Actions
* REST APIs
* Socket.IO

Database

* PostgreSQL
* Prisma ORM

Authentication

* NextAuth

Integrations

* Odoo ERP API

Deployment

* Production-ready cloud deployment
* Environment-based configuration

---

## Architecture Focus

InventoryOS was designed around:

* Scalability
* Extensibility
* Reusable component architecture
* Type-safe development
* Real-time communication
* Enterprise integration capabilities

The system demonstrates modern full-stack engineering practices including dynamic schema management, custom workflow automation, ERP integration, real-time collaboration, and secure role-based access control.

## Project Goals

The objective of InventoryOS was to build a flexible inventory management platform capable of adapting to different business requirements without requiring code or database changes for every new inventory type.

By combining dynamic fields, custom ID generation, real-time collaboration, and ERP integration, InventoryOS provides a foundation for modern inventory and operations management workflows.
