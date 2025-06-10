# Setup Guide for Global Connect

This guide will help you set up the Global Connect project on your local machine for development and testing purposes. Follow the steps below to get started.

## Prerequisites

Before you begin, ensure you have the following installed on your machine:

- **Node.js** (version 14 or higher)
- **npm** (Node Package Manager, comes with Node.js)
- **MongoDB** (for the backend database)
- **Redis** (for caching)
- **Docker** (optional, for containerized deployment)
- **Git** (for version control)

## Step 1: Clone the Repository

First, clone the Global Connect repository from GitHub:

```bash
git clone https://github.com/KOSASIH/Global-Connect.git
cd Global-Connect
```

## Step 2: Set Up the Backend

### 2.1 Install Backend Dependencies

Navigate to the backend directory and install the required dependencies:

```bash
cd backend
npm install
```

### 2.2 Configure Environment Variables

Create a `.env` file in the `backend` directory and add the following environment variables:

```plaintext
PORT=5000
MONGODB_URI=mongodb://localhost:27017/global_connect
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_jwt_secret
```

Make sure to replace `your_jwt_secret` with a secure secret key.

### 2.3 Start the Backend Server

You can start the backend server using the following command:

```bash
npm start
```

The backend server should now be running on `http://localhost:5000`.

## Step 3: Set Up the Frontend

### 3.1 Install Frontend Dependencies

Navigate to the frontend directory and install the required dependencies:

```bash
cd ../frontend
npm install
```

### 3.2 Configure API Endpoint

In the `frontend/src/services/api.js` file, ensure that the API base URL points to your backend server:

```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

### 3.3 Start the Frontend Application

You can start the frontend application using the following command:

```bash
npm start
```

The frontend application should now be running on `http://localhost:3000`.

## Step 4: Set Up Redis (Optional)

If you want to use Redis for caching, ensure that Redis is installed and running on your machine. You can start Redis with the following command:

```bash
redis-server
```

## Step 5: Access the Application

Open your web browser and navigate to `http://localhost:3000` to access the Global Connect application. You should see the homepage, and you can start interacting with the features.

## Step 6: Running Tests

To run the tests for the backend and frontend, you can use the following commands:

### 6.1 Backend Tests

Navigate to the backend directory and run:

```bash
npm test
```

### 6.2 Frontend Tests

Navigate to the frontend directory and run:

```bash
npm test
```

## Step 7: Docker Setup (Optional)

If you prefer to run the application using Docker, you can use the provided `docker-compose.yml` file. Make sure Docker is installed and running, then execute the following command in the root directory of the project:

```bash
docker-compose up
```

This will start both the backend and frontend services in Docker containers.

## Conclusion

You have successfully set up the Global Connect project on your local machine. You can now explore the features, contribute to the codebase, and help improve the project. If you encounter any issues, please refer to the documentation or reach out to the maintainers for assistance.

Happy coding!
