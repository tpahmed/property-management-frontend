# Property Management System - Frontend

This Angular application serves as the frontend for a property management system. It allows property owners, managers, and tenants to interact with the system.

## Service to Swagger API Mapping

The frontend services are designed to match the API endpoints defined in the Swagger documentation:

### AuthService (`src/app/services/auth.ts`)

Matches the API endpoints defined in `swagger/auth.js`:
- `login(email, password)` -> `POST /api/auth/login`
- `register(user)` -> `POST /api/auth/register`
- `verifyToken(token)` -> `POST /api/auth/verify-token`
- `getUserById(userId)` -> `GET /api/auth/users/:id`
- `getUserByEmail(email)` -> `GET /api/auth/users/email/:email`

### PropertyService (`src/app/services/property.ts`)

Matches the API endpoints defined in `swagger/property.js`:
- `getAllProperties(filters)` -> `GET /api/properties`
- `getPropertyById(id)` -> `GET /api/properties/:id`
- `createProperty(property)` -> `POST /api/properties`
- `updateProperty(id, property)` -> `PUT /api/properties/:id`
- `deleteProperty(id)` -> `DELETE /api/properties/:id`
- `getAvailableRentals()` -> `GET /api/properties/available`
- `getOwnerProperties(ownerId)` -> `GET /api/properties/owner/:ownerId`
- `getManagedProperties(managerId)` -> `GET /api/properties/manager/:managerId`

#### Applications
- `submitApplication(application)` -> `POST /api/properties/applications`
- `getApplicationsByProperty(propertyId)` -> `GET /api/properties/:propertyId/applications`
- `getUserApplications(userId)` -> `GET /api/properties/applications/tenant/:userId`
- `reviewApplication(applicationId, status, rejectionReason)` -> `PUT /api/properties/applications/:id/review`

#### Leases
- `createLease(lease)` -> `POST /api/properties/leases`
- `getPropertyLeases(propertyId)` -> `GET /api/properties/:propertyId/leases`
- `getUserLeases(userId)` -> `GET /api/properties/leases/tenant/:userId`
- `requestTermination(leaseId, terminationDetails)` -> `PUT /api/properties/leases/:id/terminate-request`
- `respondToTermination(leaseId, response)` -> `PUT /api/properties/leases/:id/terminate-response`

#### Property Management
- `assignManagerByEmail(propertyId, managerEmail)` -> `PUT /api/properties/:id/assign-manager`
- `removeManager(propertyId)` -> `PUT /api/properties/:id/remove-manager`

### MaintenanceService (`src/app/services/maintenance.ts`)

Matches the API endpoints defined in `swagger/maintenance.js`:
- `getAllRequests(filters)` -> `GET /api/maintenance`
- `getRequestById(id)` -> `GET /api/maintenance/:id`
- `createRequest(request)` -> `POST /api/maintenance`
- `updateRequestStatus(id, status)` -> `PATCH /api/maintenance/:id/status`
- `assignRequest(id, assignedTo, scheduledDate)` -> `PATCH /api/maintenance/:id/assign`
- `addNote(id, text, isPublic)` -> `POST /api/maintenance/:id/notes`
- `completeRequest(id, cost)` -> `PATCH /api/maintenance/:id/complete`
- `rateRequest(id, score, comment)` -> `POST /api/maintenance/:id/rate`

### PaymentService (`src/app/services/payment.ts`)

Matches the API endpoints defined in `swagger/payment.js`:
- `getAllPayments(filters)` -> `GET /api/payments`
- `getPaymentById(id)` -> `GET /api/payments/:id`
- `createPayment(paymentData)` -> `POST /api/payments`
- `updatePaymentStatus(id, status)` -> `PATCH /api/payments/:id/status`
- `processPayment(id)` -> `POST /api/payments/:id/process`
- `cancelPayment(id)` -> `POST /api/payments/:id/cancel`
- `refundPayment(id)` -> `POST /api/payments/:id/refund`
- `downloadReceipt(id)` -> `GET /api/payments/:id/receipt`
- `getPaymentsByLeaseId(leaseId)` -> `GET /api/payments?leaseId=:leaseId`
- `getPaymentsByPropertyId(propertyId)` -> `GET /api/payments?propertyId=:propertyId`
- `getPaymentsByTenantId(tenantId)` -> `GET /api/payments/tenant/:tenantId`
- `getPaymentsByOwnerId(ownerId)` -> `GET /api/payments/owner/:ownerId`

## PropertyUtilsService

The `PropertyUtilsService` is a utility service that helps handle different data formats:
- `getImageUrl(property)` - Handles both string and object image formats
- `getAddress(property)` - Handles both string and object address formats
- `getArea(property)` - Uses either area or squareFeet property
- `getAvailableDate(property)` - Handles different date field names

## Models

The models are designed to match the schemas defined in the Swagger documentation:

- `User` - Matches the User schema in `swagger/auth.js`
- `Property` - Matches the Property schema in `swagger/property.js`
- `RentalApplication` - Matches the RentalApplication schema in `swagger/property.js`
- `Lease` - Matches the Lease schema in `swagger/property.js`
- `MaintenanceRequest` - Matches the MaintenanceRequest schema in `swagger/maintenance.js`
- `Payment` - Matches the Payment schema in `swagger/payment.js`

## Development

To run the development server:

```bash
npm run start
```

## Build

To build the project:

```bash
npm run build
```

## Features

- User authentication (login/register)
- Role-based access control (tenant, property owner, property manager)
- Property listing and management
- Maintenance request submission and tracking
- Payment processing and history

## Prerequisites

- Node.js (v14+)
- Angular CLI

## Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

4. Open your browser and navigate to `http://localhost:4200`

## API Integration

The frontend is designed to work with a set of microservices:

- Auth Service: `http://localhost:3000/api/auth`
- Property Service: `http://localhost:3000/api/properties`
- Maintenance Service: `http://localhost:3000/api/maintenance`
- Payment Service: `http://localhost:3000/api/payments`

## Project Structure

- `src/app/components`: UI components organized by feature
- `src/app/services`: Services for API communication
- `src/app/models`: TypeScript interfaces for data models
- `src/app/guards`: Route guards for authentication and authorization
- `src/app/interceptors`: HTTP interceptors (e.g., for authentication tokens)

## Development

### Code Scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

### Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## License

This project is licensed under the MIT License.
