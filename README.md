Here's the updated README based on your new requirements:

# Check If Your Users Have Been SIM Swapped 

## Overview

This project is a web application demonstrating how to strengthen multifactor security authentication using the Vonage SIM Swap API. The application includes a simple bank dashboard and a login form. When a user attempts to log in, the SIM Swap API checks if the phone number associated with the account has been recently swapped. If a recent SIM swap is detected, additional security measures are applied, and the login process may be halted or flagged for further review. If no recent SIM swap is detected, the user can proceed with the login process.

## Prerequisites

- A [Vonage Developer Account](https://developer.vonage.com).
- Node.js and npm installed.

## Getting Started

1. Clone the repository and change directories.

2. Install the required packages:
   ```bash
   npm install
   ```

3. Move the `.env.example` file to `.env` file in the project root and include the following environment variables:
   ```bash
   mv .env.example .env
   ```

   ```bash
    JWT=your_jwt_token

    MAX_AGE=72
   ```

4. Run the application:
   ```bash
   node server.js
   ```

5. Launch your web browser and enter the URL:
   ```bash
   http://localhost:3000/
   ```