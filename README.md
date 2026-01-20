# Healthy Carbs

![Java](https://img.shields.io/badge/Java-22-orange)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5-brightgreen)
![Angular](https://img.shields.io/badge/Angular-21-red)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)
![Docker](https://img.shields.io/badge/Docker-Supported-blue)


## Table of Contents

- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Access the Application](#access-the-application)
- [Development with Docker](#development-with-docker)
- [Local Development](#local-development)
- [Running Tests](#running-tests)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)


## Project Structure

```
healthy-carbs/
├── backend/              
│   ├── src/
│   ├── pom.xml
│   └── Dockerfile
├── frontend/             
│   ├── src/
│   ├── package.json
│   └── Dockerfile
├── db/                   
├── docker-compose.yml    
├── .env.example         
└── README.md
```


## Tech Stack

### Backend
- **Java 22**
- **Spring Boot 3.5**
- **Spring Security**
- **Spring Data JPA**
- **Spring WebFlux**
- **Spring Mail**
- **Spring Actuator**
- **Liquibase**
- **MapStruct**
- **SpringDoc OpenAPI**
- **Thymeleaf**
- **iTextPDF / html2pdf**
- **Lombok**
- **JJWT**

### Frontend
- **Angular 21**
- **TypeScript**
- **TailwindCSS**
- **Angular CDK**
- **ApexCharts**
- **RxJS**
- **FontAwesome**
- **canvas-confetti**

### Infrastructure
- **Docker** & **Docker Compose**
- **PostgreSQL**
- **Nginx**
- **GitHub Actions**
- **Firebase**
- **Google Cloud Platform**

## Access the Application

| Service   | URL                          |
|-----------|------------------------------|
| Frontend  | http://localhost:4200        |
| Backend   | http://localhost:8080        |
| Database  | localhost:5432               |

## Development with Docker

### Prerequisites for Docker Development

- **Docker Desktop** - [Download for Mac](https://docs.docker.com/desktop/install/mac-install/) | [Download for Windows](https://docs.docker.com/desktop/install/windows-install/) | [Download for Linux](https://docs.docker.com/desktop/install/linux/)

### Build and run individual services

```bash
# Build all images
docker-compose build

# Build specific service
docker-compose build backend
docker-compose build frontend
```

### Run specific services

```bash
# Start only database
docker-compose up -d postgres

# Start database and backend
docker-compose up -d postgres backend

# Start all services
docker-compose up -d

# Stop all services
docker-compose down
```

### View logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Restart services after code changes

```bash
# Rebuild and restart backend
docker-compose up -d --build backend

# Rebuild and restart frontend
docker-compose up -d --build frontend

# Rebuild all services
docker-compose up -d --build
```

### Access container shell

```bash
# Backend container
docker exec -it healthycarbs-backend /bin/sh

# Database container
docker exec -it healthycarbs-postgres psql -U $DB_USERNAME -d healthy_carbs

```

## Local Development

### Prerequisites for Local Development

- **Java 22** - [Download](https://www.oracle.com/pl/java/technologies/downloads/)
- **Node.js 20+** - [Download](https://nodejs.org/)
- **PostgreSQL 15** - [Download](https://www.postgresql.org/download/)

### Database Setup

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE healthy_carbs;

# Exit
\q
```

### Backend (Spring Boot)

```bash
# Navigate to backend directory
cd backend

# Run the application
./mvnw spring-boot:run

# Or build and run as JAR
./mvnw clean package
java -jar target/healthy-carbs-0.0.1-SNAPSHOT.jar
```

Backend will be available at `http://localhost:8080`.

### Frontend (Angular)

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

Frontend will be available at `http://localhost:4200`.

## Running Tests

### Backend Tests

```bash
cd backend

# Run all tests
./mvnw test

# Run tests with coverage
./mvnw verify
```

### Frontend Tests

```bash
cd frontend

# Run unit tests
npm test

# Run linting
npm run lint
```

## Environment Variables

> **Tip:** Generate a secure JWT secret key with: `openssl rand -hex 32`

> **Quick Setup:** For development, use `postgres` / `postgres` as database credentials.

Create a `.env` file in the project root based on `.env.example`:

### Database Configuration

| Variable          | Description                                      | Example                                        |
|-------------------|--------------------------------------------------|------------------------------------------------|
| `DB_URL`          | JDBC connection URL for the database             | `jdbc:postgresql://localhost:5432/healthy_carbs` |
| `DB_USERNAME`     | Database username                                | `postgres`                                     |
| `DB_PASSWORD`     | Database password                                | `your_secure_password`                         |
| `POSTGRES_DB`     | PostgreSQL database                              | `healthy_carbs`                                |
| `POSTGRES_USER`   | PostgreSQL username                              | `${DB_USERNAME}`                               |
| `POSTGRES_PASSWORD` | PostgreSQL password                            | `${DB_PASSWORD}`                               |

### Authentication & Security

| Variable          | Description                                      | Example                                        |
|-------------------|--------------------------------------------------|------------------------------------------------|
| `JWT_SECRET_KEY`  | 256-bit secret key for JWT token signing.        | `a1b2c3d4e5f6...` (64 hex characters) |

### Email Configuration

| Variable          | Description                                      | Example                                        |
|-------------------|--------------------------------------------------|------------------------------------------------|
| `MAIL_HOST`       | SMTP server hostname                             | `smtp.gmail.com`                               |
| `MAIL_PORT`       | SMTP server port                                 | `587`                                          |
| `MAIL_USERNAME`   | SMTP authentication username                     | `your-email@gmail.com`                         |
| `MAIL_PASSWORD`   | SMTP authentication password                     | `your_app_password`                            |

### PayU Payment Integration

| Variable            | Description                                    | Example                                        |
|---------------------|------------------------------------------------|------------------------------------------------|
| `PAYU_BASE_URL`     | PayU API base URL                              | `https://secure.payu.com`                      |
| `PAYU_POS_ID`       | Point of Sale ID                               | `123456`                                       |
| `PAYU_CLIENT_ID`    | OAuth client ID                                | `123456`                                       |
| `PAYU_CLIENT_SECRET`| OAuth client secret                            | `abc123...`                                    |
| `PAYU_SECOND_KEY`   | Second verification key (MD5)                  | `def456...`                                    |
| `PAYU_NOTIFY_URL`   | Webhook URL for payment notifications          | `https://your-domain.com/api/payments/notify`  |
| `PAYU_CONTINUE_URL` | Redirect URL after payment completion          | `https://your-domain.com/payment/success`      |
| `PAYU_CURRENCY`     | Payment currency code                          | `PLN`                                          |

### Application Configuration

| Variable                | Description                                  | Example                                        |
|-------------------------|----------------------------------------------|------------------------------------------------|
| `SPRING_PROFILES_ACTIVE`| Active Spring profile                        | `dev`, `prod`                                  |
| `CORS_ALLOWED_ORIGINS`  | Allowed CORS origins                         | `http://localhost:4200,https://your-domain.com`|


## API Documentation

Once the backend is running, access the **Swagger UI** for interactive API documentation:

- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **OpenAPI Spec**: http://localhost:8080/v3/api-docs
