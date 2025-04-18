# Developer Tools MCP

A comprehensive Model Context Protocol (MCP) server providing extensive development and browser automation capabilities through Puppeteer. This server enables seamless interaction with browsers and system tools directly from the Cursor IDE and other MCP clients, without requiring additional browser installations or add-ons.

## ✨ Features

This MCP server provides a rich set of tools for browser automation and web development:

### 🌐 Browser Automation

- **Page Management**
  - Create, close, and switch between pages
  - Get page information (title, URL, HTML content)
  - Page navigation and refresh
  - Frame switching
  - Wait for page load and elements

### 📸 Media & Documents

- **Screenshots**
  - Capture partial page screenshots
  - Full page screenshots
  - Generate PDF documents with customizable options

### 🍪 Cookie Management

- Set and get cookies
- Manage cookies by domain
- Cookie manipulation and monitoring

### 📱 View Modes

- Mobile device emulation
- Tablet device emulation
- Desktop view configuration

### 🔍 Debugging Tools

- Console log monitoring
- Page error tracking
- Resource usage analysis
- Custom JavaScript execution
- Network request monitoring

### 📊 Analysis & Testing

- **Performance Analysis**
  - Load time metrics
  - Resource consumption
  - Network performance
- **Security Analysis**
  - Security headers check
  - SSL/TLS configuration
- **Accessibility Testing**
  - WCAG compliance checks
  - Accessibility best practices
- **SEO Analysis**
  - Meta tags verification
  - SEO best practices check
- **Code Coverage**
  - JavaScript code coverage analysis

### 🔧 Element Manipulation

- **Element Information**
  - Text content extraction
  - HTML structure analysis
  - Attribute and property access
  - Element counting and visibility check
  - Position and style computation
- **Element Interactions**
  - Click operations
  - Text input
  - Scrolling (element, page top/bottom, custom position)
  - Hover simulation
  - Form submission
  - File upload
  - Keyboard shortcuts
  - Dialog management (accept/dismiss/prompt)

### 🔄 API & System

- REST API request handling
- System resource monitoring

### 🔑 SSH Connection

- Connect to a remote server via SSH (persistent connection)
- Execute commands on a remote SSH server
- Disconnect from a remote SSH server

## Installation

### Prerequisites

- [Bun](https://bun.sh/) runtime
- [Git](https://git-scm.com/)

### Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/d4n5h/developer-tools-mcp.git
   cd test-mcp
   ```

2. Install dependencies:

   ```bash
   bun install
   ```

3. Start the server:

   ```bash
   bun start
   ```

## Integration with Cursor IDE

1. Open Cursor Settings
2. Navigate to the "Features" tab
3. Scroll to the "Model Context Protocol" section
4. Click "+ Add new MCP server"
5. Enter the server URL: `http://localhost:3001/sse`
6. Click "Add" to complete the integration

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
