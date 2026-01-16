# 📁 LAN File Share

A simple LAN-based file sharing application. This application allows users on the same Wi-Fi network to upload and download any files easily.

## ✨ Features

- **LAN Sharing**: Share files with anyone connected to the same Wi-Fi network.
- **Simple Uploads**: Easy-to-use interface for uploading all types of files.
- **Fast Access**: No complex setup required—just connect and share.

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd lan-video-share
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running the App

1. Start the server:
   ```bash
   npm start
   ```
2. The server will run on port `3000`.
3. To access it from other devices on the LAN, find your local IP address (run `ipconfig` on Windows or `ifconfig` on Linux/Mac) and open:
   `http://YOUR_IP_ADDRESS:3000`

## 🛠️ Built With

- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **Multer**: Middleware for handling file uploads
- **Vanilla CSS**: For a clean and lightweight UI

## 📂 Project Structure

- `server.js`: The backend logic and API endpoints.
- `public/`: Contains the frontend assets (HTML, CSS, JS).
- `uploads/`: Directory where files are stored.
