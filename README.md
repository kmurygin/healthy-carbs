# Healthy Carbs

![Java](https://img.shields.io/badge/Java-21-orange)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5-brightgreen)
![Angular](https://img.shields.io/badge/Angular-21-red)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)
![Docker](https://img.shields.io/badge/Docker-Supported-blue)

A full-stack web application for managing personalized meal plans for people with diabetes. Features include genetic algorithm-based meal plan generation, dietary profile management, recipe browsing, shopping lists, blog, payment integration, and dietitian collaboration.

## Table of Contents

- [Features](#features)
- [Genetic Algorithm](#genetic-algorithm)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Access the Application](#access-the-application)
- [Development with Docker](#development-with-docker)
- [Local Development](#local-development)
- [Running Tests](#running-tests)
- [CI/CD](#cicd)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)

## Features

- **Meal Plan Generation** — genetic algorithm that creates personalized daily meal plans based on dietary profiles and nutritional constraints
- **Dietary Profiles** — configure caloric goals, macronutrient targets, allergens, and dietary preferences
- **Recipe Management** — browse, search, and filter recipes with detailed nutritional information and allergen labels
- **Shopping Lists** — auto-generated shopping lists from meal plans with PDF export
- **Measurements Tracking** — log and visualize body measurements over time
- **Blog** — content management for nutrition-related articles
- **Dietitian Collaboration** — connect patients with dietitians for guided meal planning
- **Payments** — PayU integration for purchasing premium meal plan offers
- **User Management** — JWT-based authentication, password recovery via email, profile management
- **File Storage** — Google Cloud Storage (production) with local filesystem fallback (development)

## Genetic Algorithm

The core of meal plan generation is a **genetic algorithm (GA)** that optimizes daily meal combinations to match a user's dietary profile (calorie target, macronutrient goals, and diet type).

### Representation

Each **genome** (individual) represents a single day's meal plan — a fixed-size list of 4 recipes, one per meal type:

```
Genome = [ Recipe(BREAKFAST), Recipe(LUNCH), Recipe(DINNER), Recipe(SNACK) ]
```

### Algorithm Flow

```
function RUN(genomeSupplier, fitnessFunction, dietType):
    population ← INITIALIZE(genomeSupplier, POPULATION_SIZE)
    bestGenome ← null

    for generation = 0 to MAX_GENERATIONS:
        EVALUATE(population, fitnessFunction)
        bestGenome ← TRACK_BEST(population, bestGenome)

        if bestGenome.fitness ≥ TARGET_FITNESS:
            break

        nextGeneration ← ELITE(population, ELITE_COUNT)

        while |nextGeneration| < POPULATION_SIZE:
            parent1 ← TOURNAMENT_SELECT(population, k=2)
            parent2 ← TOURNAMENT_SELECT(population, k=2)
            child   ← TWO_POINT_CROSSOVER(parent1, parent2)
            child   ← MUTATE(child, MUTATION_RATE, dietType)
            EVALUATE(child, fitnessFunction)
            nextGeneration ← nextGeneration + child

        population ← nextGeneration

    return bestGenome
```

### Fitness Function

The fitness evaluates how closely a genome's total nutritional values match the user's targets. Each macronutrient is scored independently using a **quadratic penalty**:

```
function SCORE(actual, target):
    deviation ← |actual - target|
    ratio    ← min(deviation / target, 1.0)
    return (1 - ratio)²
```

The overall fitness is a weighted sum:

```
fitness = 0.1 × SCORE(calories) + 0.3 × SCORE(carbs) + 0.3 × SCORE(protein) + 0.3 × SCORE(fat)
```

Macronutrients (carbs, protein, fat) are weighted 3× more than calories — the algorithm prioritizes **nutritional balance** over raw calorie matching, which is important for diabetic meal planning where carbohydrate control is critical.

### Genetic Operators

| Operator       | Strategy                | Details                                                                                     |
|----------------|-------------------------|---------------------------------------------------------------------------------------------|
| **Selection**  | Tournament (k=2)        | Randomly pick 2 individuals, select the fitter one                                          |
| **Crossover**  | Two-point               | Select 2 random cut points; child inherits segments alternately from both parents            |
| **Mutation**   | Gene replacement  | Each gene has a chance of being replaced with a random recipe of the same meal type      |
| **Elitism**    | Top-N preservation      | The 5 best genomes are copied unchanged into the next generation                             |

### Configuration

All parameters are configurable via `application.yml` under the `genetic-algorithm` prefix:

| Parameter          | Default | Description                                              |
|--------------------|---------|----------------------------------------------------------|
| `population-size`  | 0.05      | Number of genomes per generation                         |
| `max-generations`  | 1,000   | Maximum iterations before termination                    |
| `mutation-rate`    | 0.4     | Probability of mutating each gene (40%)                  |
| `target-fitness`   | 0.999   | Fitness threshold for early convergence                  |
| `elite-count`      | 5       | Best genomes preserved unchanged per generation          |
| `calories-weight`  | 0.1     | Fitness weight for calorie accuracy                      |
| `carbs-weight`     | 0.3     | Fitness weight for carbohydrate accuracy                 |
| `protein-weight`   | 0.3     | Fitness weight for protein accuracy                      |
| `fat-weight`       | 0.3     | Fitness weight for fat accuracy                          |

### Integration

The GA runs **7 times in parallel** (one per day of the week) using Spring's task executor. Each run independently optimizes a single day's meals. The results are combined into a weekly `MealPlan`, and a shopping list is automatically generated from the selected recipes.

## Project Structure

```
healthy-carbs/
├── backend/                  # Spring Boot API
│   ├── src/
│   │   ├── main/java/…/
│   │   │   ├── auth/         # Authentication & JWT
│   │   │   ├── blog/         # Blog posts
│   │   │   ├── config/       # Security, CORS, Liquibase
│   │   │   ├── dietitian/    # Dietitian profiles
│   │   │   ├── email/        # Email service
│   │   │   ├── mealplan/     # Meal plans, recipes, genetic algorithm
│   │   │   ├── measurements/ # Body measurements
│   │   │   ├── offers/       # Meal plan templates & offers
│   │   │   ├── payments/     # PayU integration
│   │   │   ├── storage/      # File storage (GCS / local)
│   │   │   └── user/         # User management
│   │   └── resources/
│   │       ├── db/           # Liquibase changelogs & seed data
│   │       └── templates/    # Thymeleaf email templates
│   ├── pom.xml
│   └── Dockerfile
├── frontend/                 # Angular SPA
│   ├── src/app/
│   │   ├── core/             # Interceptors, guards, services
│   │   ├── features/         # Feature modules (auth, mealplan, blog, …)
│   │   └── shared/           # Shared components & utilities
│   ├── package.json
│   └── Dockerfile
├── .github/workflows/        # CI/CD pipelines
├── docker compose.yml
├── .env.example
└── README.md
```


## Tech Stack

### Backend
- **Java 21**
- **Spring Boot 3.5**
- **Spring Security** + **JJWT**
- **Spring Data JPA**
- **Spring WebFlux**
- **Spring Mail** + **Thymeleaf**
- **Spring Actuator**
- **Liquibase**
- **MapStruct**
- **SpringDoc OpenAPI**
- **iTextPDF / html2pdf**
- **Lombok**

### Frontend
- **Angular 21**
- **TypeScript**
- **TailwindCSS**
- **Angular CDK**
- **ApexCharts**
- **Vitest** + **Playwright** (testing)
- **RxJS**
- **FontAwesome**

### Infrastructure
- **Docker** & **Docker Compose**
- **PostgreSQL 15**
- **Nginx**
- **GitHub Actions** (CI/CD)
- **Qodana** (static analysis)
- **Google Cloud Platform** — Cloud Run (backend), Cloud SQL, Cloud Storage
- **Firebase Hosting** (frontend)

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
docker compose build

# Build specific service
docker compose build backend
docker compose build frontend
```

### Run specific services

```bash
# Start only database
docker compose up -d postgres

# Start database and backend
docker compose up -d postgres backend

# Start all services
docker compose up -d

# Stop all services
docker compose down
```

### View logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres
```

### Restart services after code changes

```bash
# Rebuild and restart backend
docker compose up -d --build backend

# Rebuild and restart frontend
docker compose up -d --build frontend

# Rebuild all services
docker compose up -d --build
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

- **Java 21** - [Download](https://www.oracle.com/pl/java/technologies/downloads/)
- **Node.js 22** - [Download](https://nodejs.org/)
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
# or using Angular CLI directly
ng serve
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

# Run unit tests (Vitest)
npm run test:unit

# Run DOM tests (Vitest + Playwright)
npm run test:dom

# Run linting
npm run lint
```

## CI/CD

The project uses **GitHub Actions** with two workflows:

### Pull Request Checks (`pull-request-check.yaml`)
Triggered on PRs to `main`. Runs only for changed paths (backend/frontend):
- **Build** — compiles the project
- **Tests** — runs unit and integration tests (backend uses a PostgreSQL service container)
- **Qodana** — static code analysis via JetBrains Qodana

### Deployment (`deploy.yaml`)
Triggered on push to `main`:
- **Backend** — builds Docker image, pushes to Google Artifact Registry, deploys to **Cloud Run**
- **Frontend** — builds Angular app, deploys to **Firebase Hosting**

## Environment Variables

> **Tip:** Generate a secure JWT secret key with: `openssl rand -hex 32`

> **Quick Setup:** For development, use `postgres` / `postgres` as database credentials.

> **Important:** Never commit real secrets to version control.

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

### Google Cloud Storage

| Variable                     | Description                                    | Example                                        |
|------------------------------|------------------------------------------------|------------------------------------------------|
| `GCP_PROJECT_ID`             | Google Cloud project ID                        | `my-project-id`                                |
| `GCS_BUCKET_NAME`            | Cloud Storage bucket name                      | `healthy-carbs-uploads`                        |
| `GCS_PUBLIC_URL_BASE`        | Public URL base for stored files               | `https://storage.googleapis.com/my-bucket`     |
| `GCP_STORAGE_ENABLED`        | Enable GCS storage                             | `true`                                         |
| `GCP_CORE_ENABLED`           | Enable GCP core auto-config                    | `true`                                         |
| `GOOGLE_APPLICATION_CREDENTIALS` | Path to service account JSON (local dev)   | `/path/to/credentials.json`                    |
| `GCS_CACHE_CONTROL`          | Cache-Control header for uploaded files        | `public, max-age=1209600`                      |

### Local File Storage (dev profile)

| Variable          | Description                                      | Example                                        |
|-------------------|--------------------------------------------------|------------------------------------------------|
| `LOCAL_UPLOAD_DIR` | Local directory for file uploads                | `uploads`                                      |
| `LOCAL_BASE_URL`   | Base URL path for serving local files           | `/api/v1/files`                                |

### Application Configuration

| Variable                | Description                                  | Example                                        |
|-------------------------|----------------------------------------------|------------------------------------------------|
| `SPRING_PROFILES_ACTIVE`| Active Spring profile                        | `dev`, `prod`                                  |
| `CORS_ALLOWED_ORIGINS`  | Allowed CORS origins                         | `http://localhost:4200,https://your-domain.com`|


## API Documentation

Once the backend is running, access the **Swagger UI** for interactive API documentation:

- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **OpenAPI Spec**: http://localhost:8080/v3/api-docs

## License

This project was developed as an engineering thesis (praca inżynierska). All rights reserved.
