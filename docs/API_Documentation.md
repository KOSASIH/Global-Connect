# API Documentation for Pi Coin Application

## Overview

This documentation provides an overview of the API endpoints available in the Pi Coin application, which is built on the Stellar network. The API allows users to create assets, issue PiCoins, transfer coins, and check balances.

## Base URL

The base URL for the API is:

```
http://localhost:3000/api
```

## Endpoints

### 1. Create Asset

- **Endpoint**: `/create-asset`
- **Method**: `POST`
- **Description**: Creates a new asset (PiCoin) on the Stellar network.

#### Request

- **Headers**:
  - `Content-Type: application/json`
- **Body**:
  ```json
  {
      "secretKey": "YOUR_SECRET_KEY"
  }
  ```

#### Response

- **Status**: `200 OK`
- **Body**:
  ```json
  {
      "message": "Asset PI created successfully!"
  }
  ```

### 2. Issue PiCoins

- **Endpoint**: `/issue-picoins`
- **Method**: `POST`
- **Description**: Issues a specified amount of PiCoins to the issuer's account.

#### Request

- **Headers**:
  - `Content-Type: application/json`
- **Body**:
  ```json
  {
      "secretKey": "YOUR_SECRET_KEY",
      "amount": 100
  }
  ```

#### Response

- **Status**: `200 OK`
- **Body**:
  ```json
  {
      "message": "100 PI issued successfully!"
  }
  ```

### 3. Transfer PiCoins

- **Endpoint**: `/transfer-picoins`
- **Method**: `POST`
- **Description**: Transfers a specified amount of PiCoins to a destination account.

#### Request

- **Headers**:
  - `Content-Type: application/json`
- **Body**:
  ```json
  {
      "secretKey": "YOUR_SECRET_KEY",
      "destination": "DESTINATION_ACCOUNT_PUBLIC_KEY",
      "amount": 10
  }
  ```

#### Response

- **Status**: `200 OK`
- **Body**:
  ```json
  {
      "message": "10 PI transferred to DESTINATION_ACCOUNT_PUBLIC_KEY!"
  }
  ```

### 4. Get Balance

- **Endpoint**: `/get-balance`
- **Method**: `POST`
- **Description**: Retrieves the balance of the issuer's account.

#### Request

- **Headers**:
  - `Content-Type: application/json`
- **Body**:
  ```json
  {
      "secretKey": "YOUR_SECRET_KEY"
  }
  ```

#### Response

- **Status**: `200 OK`
- **Body**:
  ```json
  {
      "balance": "1000",
      "asset": "PI"
  }
  ```

## Error Handling

In case of an error, the API will return a response with a status code indicating the type of error and a message describing the issue.

### Example Error Response

- **Status**: `400 Bad Request`
- **Body**:
  ```json
  {
      "error": "Invalid secret key"
  }
  ```

## Conclusion

This API documentation provides a comprehensive overview of the available endpoints for the Pi Coin application. For further assistance, please refer to the codebase or contact the development team.
