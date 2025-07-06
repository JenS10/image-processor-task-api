
# 📸 Image Processor Task API

This is an API to process images. It resizes images to 1024px and 800px, and calculates the processing cost.

---

## 🚀 What Does This API Do?

This API lets users create **image processing tasks**. Each task includes an image that is resized to two predefined widths: **1024px** and **800px**.

It also calculates the **processing price** based on the original image dimensions.

🗂️ **The resized images are saved in the following path structure inside the repository:**

```
<outputDir>/<imageName>/<resolution>/<md5>.<ext>
```

### Example:

```
output/my-image/1024/f3e4a1b5d8c9.jpg
```

---

## 🔧 Configuration

The image output directory and the resolutions used for resizing are defined as constants in the configuration file:

**Path:** `/src/application/config/image-processing.config.ts`

```ts
export const IMAGE_OUTPUT_DIR = 'output';
export const IMAGE_RESOLUTIONS = [1024, 800];
```

You can change these values if you want to use a different folder for output or different target resolutions for the resized images.

---

## 🧑‍💻 Getting Started

### ✅ Requirements

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)

### 🔧 Setup Steps

1. **Start MongoDB with Docker:**

   Open a terminal in the root folder and run:

   ```bash
   docker-compose -f docker-compose-mongodb.yml up -d
   ```

2. **Install project dependencies:**

   In the project root folder, run:

   ```bash
   npm install
   ```

3. **Start the application:**

   ```bash
   npm start
   ```

   The API will be available at:  
   [http://localhost:3000](http://localhost:3000)

---

## 🛠️ Tech Stack

- **NestJS** – Framework for building scalable Node.js apps
- **MongoDB** – NoSQL database for storing tasks and images
- **Mongoose** – ODM for MongoDB integration
- **Sharp** – Library for image processing
- **Class-validator & class-transformer** – For validating and transforming DTOs
- **Jest** – For unit and integration testing
- **Swagger** – For auto-generating API documentation

---

## 📂 Endpoints

### 🔄 `/tasks` – Task Controller

Manages image processing tasks.

#### `POST /tasks`

- **Description:** Creates a new task and processes the image.
- **Request Body (JSON):**
  - `path`: Full path to the original image
- **Response:** Task object with ID, status, and price

#### `GET /tasks/:id`

- **Description:** Returns the status, price, and image details of a specific task
- **URL Parameter:**
  - `id`: Task ID (must be a valid MongoDB ObjectId)
- **Response:**
  - If **completed**, returns image paths
  - If **pending**, returns only status and price

---

### ❤️ `/health` – Health Controller

Checks the API status.

#### `GET /health`

- **Description:** Health check endpoint for monitoring service status
- **Response:** Returns a JSON object with service status

---

## ✅ Validations

- `POST /tasks` checks that the `path` points to a valid image
- `GET /tasks/:id` checks that the `id` is a valid MongoDB ObjectId

---

## 🧪 Testing

This project includes:

- **Unit tests (`*.spec.ts`)** – Test business logic in isolation
- **Integration tests (`*.integration.spec.ts`)** – Test database interactions

Run tests with:

```bash
npm run test
```

---

## 📖 API Documentation (Swagger)

After starting the app, visit:

[http://localhost:3000/api](http://localhost:3000/api)

to view the full Swagger-generated documentation.

---
