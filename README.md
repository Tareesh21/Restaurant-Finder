## BookTable (Hotel Mania)

BookTable is a cloud-native, full-stack reservation system that simplifies everything from customer bookings to back-of-house operations and administrative control. Built for high scalability and robust security, it implements granular, policy-driven role-based access controls for diners, restaurant staff, and platform administrators alike.

## User Roles & Features

### Customer
- **Account Management:** Register and log in securely using JWT  
- **Reservation Search:** Filter by date, time, party size, and location (city/state or ZIP)  
- **Availability Overview:** View open slots within a ±30-minute window, with restaurant name, cuisine, price tier, ratings, and Number of booking count for today.
- **Booking & Cancellation:** Reserve or cancel tables with instant email confirmations  
- **Reviews Browser:** Read customer feedback for each restaurant  
- **Profile Settings:** Access and update personal details

### Restaurant Manager
- **Secure Login:** Authenticate via JWT for manager access  
- **Listing Management:** Create or update restaurant profiles (name, address, contact details, operating hours)  
- **Table Configuration:** Define initial table layouts and available booking times  
- **Content Updates:** Edit restaurant descriptions and upload photo galleries

### Administrator
- **Listing Approval:** Vet and publish new restaurant submissions  
- **Reservation Dashboard:** Monitor daily booking requests with real-time accept/decline controls  

---

### Tech Stack

- **Deployment:** AWS EC2, S3  
- **Database:** MongoDB  
- **Monitoring:** AWS CloudWatch.  
- **Backend:** Node.js, Express.js.
- **Frontend:** React.js, CSS, Styled Components.
- **Authentication:** JWT  

---

## Feature Overview

### Application Architecture
- Model-View-Controller separation between Express controllers, service-layer logic, and Mongoose models

### Authentication & Security
- Stateless JWT tokens for role-based access (Customer, Manager, Admin)  
- bcrypt for secure password hashing  
- Enforced HTTPS, strict CORS policies, and rate limiting on sensitive endpoints

### External Integrations
- Google Maps Places API for geolocation and embedded maps  
- AWS S3 for storing and serving restaurant photos  
- Nodemailer for sending booking confirmations via email/SMS

### Deployment & Infrastructure
- **Frontend:** React.js hosted on AWS S3 and distributed via CloudFront  
- **Backend:** Node.js + Express APIs on an auto-scaling EC2 fleet  
- **Database:** MongoDB Atlas managed cluster

---


### Diagrams

### Schema Diagram

![Schema Diagram](./Documentation/Schema_Diagram.jpg)

### UseCase Diagram

![Use Case Diagram](./Documentation/UseCase_Diagram.jpg)

### System_Architecture

![System_Architecture](./Documentation/System_Architecture.jpg)

### Component Diagram

![Component Diagram](./Documentation/Component_Diagram.jpg)

### Deployment_Diagram

![Deployment_Diagram](./Documentation/Deployment_Diagram.jpg)

### Project Setup

## Installation Steps

1. **Clone the repository**  
   ```bash
   git clone https://github.com/gopinathsjsu/team-project-bytestorm.git

2. **Install dependencies**  
   ```bash
   npm install

3. **Start Backend**
    ```bash
    cd backend
    npm run dev

4. **Start Frontend**
    ```bash
    cd frontend
    npm install 
    npm run dev

---

## Our Team Progress

- **UML Wireframes:** [UML_Wireframes.pdf](Documentation/UML_Wireframes.pdf)  
- **Project Journal:** [Journal_ByteStorm.pdf](Documentation/Journal_ByteStorm.pdf)  
- **Sprint Task & Burndown Chart:** [Sprint_task_sheet_plus_burndown_chart.xlsx](Documentation/Sprint_task_sheet_plus_burndown_chart.xlsx)  
- **Daily Scrum Sheet:** [DAILYSCRUMSHEET.xlsx](Documentation/DAILYSCRUMSHEET.xlsx)  










