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

- [Node.js](https://nodejs.org/) runtime (v18 or higher)

### Setup

Since this server has more than 40 tools, it's recommended to use [MCP HUB MCP Server](https://github.com/warpdev/mcp-hub-mcp)

```json
{
  "mcpServers": {
    "developer-tools-mcp": {
      "command": "npx -y developer-tools-mcp"
    }
  }
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
