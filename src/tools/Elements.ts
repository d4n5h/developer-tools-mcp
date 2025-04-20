import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { PageManager } from "../services/PageManager";
import { z } from "zod";
import { Page, ElementHandle } from "puppeteer";
import jsdom from "jsdom";

async function getFullXPaths(handles: ElementHandle[]) {
  return Promise.all(
    handles.map(handle =>
      handle.evaluate(el => {
        // Recursive helper to build the XPath for a DOM node
        function getXPath(node: Element): string {
          // If this node is the document root
          if (node === document.documentElement) {
            return '/html';
          }
          // If this node is the body element
          if (node === document.body) {
            return '/html/body';
          }
          // Compute this node's position among siblings of the same tag
          const parent = node.parentNode;
          if (!parent || !(parent instanceof Element)) {
            return '';
          }
          const siblings = Array.from(parent.childNodes)
            .filter(n => n instanceof Element && n.nodeName === node.nodeName);
          const index = siblings.indexOf(node) + 1;
          // Build up the path of parent + current node
          return getXPath(parent) +
            '/' +
            node.nodeName.toLowerCase() +
            (siblings.length > 1 ? `[${index}]` : '');
        }

        return getXPath(el);
      })
    )
  );
}

export const elementsTools = ({ pageManager, server }: { pageManager: PageManager, server: McpServer }) => {
  // Get element text
  server.tool(
    "get-element-text",
    "This tool gets the text of an element using a selector",
    {
      selector: z.string().describe("The selector of the element to get the text of"),
      pageId: z.string().optional().describe("The ID of the page to get the text of. If not provided, the active page will be used.")
    },
    async ({ selector, pageId }) => {
      const pageData = pageManager.getPage(pageId);
      if (!pageData) {
        return {
          content: [{ type: "text", text: "No active page found" }]
        };
      }
      const text = await pageData.page.evaluate((selector) => {
        const element = document.querySelector(selector);
        return element ? element.textContent : null;
      }, selector);
      return {
        content: [{ type: "text", text: "Element text: " + text }]
      };
    }
  );

  // Get element HTML
  server.tool(
    "get-element-html",
    "This tool gets the HTML of an element using a selector",
    {
      selector: z.string().describe("The selector of the element to get the HTML of"),
      pageId: z.string().optional().describe("The ID of the page to get the HTML of. If not provided, the active page will be used.")
    },
    async ({ selector, pageId }) => {
      const pageData = pageManager.getPage(pageId);
      if (!pageData) {
        return {
          content: [{ type: "text", text: "No active page found" }]
        };
      }
      const html = await pageData.page.evaluate((selector) => {
        const element = document.querySelector(selector);
        return element ? element.outerHTML : null;
      }, selector);
      return {
        content: [{ type: "text", text: "Element HTML: " + html }]
      };
    }
  );

  // Get element value
  server.tool(
    "get-element-value",
    "This tool gets the value of an element using a selector",
    {
      selector: z.string().describe("The selector of the element to get the value of"),
      pageId: z.string().optional().describe("The ID of the page to get the value of. If not provided, the active page will be used.")
    },
    async ({ selector, pageId }) => {
      const pageData = pageManager.getPage(pageId);
      if (!pageData) {
        return {
          content: [{ type: "text", text: "No active page found" }]
        };
      }
      const value = await pageData.page.evaluate((selector) => {
        const element = document.querySelector(selector) as HTMLInputElement;
        return element ? element.value : null;
      }, selector);
      return {
        content: [{ type: "text", text: "Element value: " + value }]
      };
    }
  );

  // Get element attribute
  server.tool(
    "get-element-attribute",
    "This tool gets the attribute of an element using a selector and attribute name",
    {
      selector: z.string().describe("The selector of the element to get the attribute of"),
      attribute: z.string().describe("The attribute name to get the value of"),
      pageId: z.string().optional().describe("The ID of the page to get the attribute of. If not provided, the active page will be used.")
    },
    async ({ selector, attribute, pageId }) => {
      const pageData = pageManager.getPage(pageId);
      if (!pageData) {
        return {
          content: [{ type: "text", text: "No active page found" }]
        };
      }
      const value = await pageData.page.evaluate((selector, attribute) => {
        const element = document.querySelector(selector) as HTMLElement;
        return element ? element.getAttribute(attribute) : null;
      }, selector, attribute);
      return {
        content: [{ type: "text", text: "Element attribute: " + value }]
      };
    }
  );

  // Get element property
  server.tool(
    "get-element-property",
    "This tool gets the property of an element using a selector and property name",
    {
      selector: z.string().describe("The selector of the element to get the property of"),
      property: z.string().describe("The property name to get the value of"),
      pageId: z.string().optional().describe("The ID of the page to get the property of. If not provided, the active page will be used.")
    },
    async ({ selector, property, pageId }) => {
      const pageData = pageManager.getPage(pageId);
      if (!pageData) {
        return {
          content: [{ type: "text", text: "No active page found" }]
        };
      }
      const value = await pageData.page.evaluate((selector, property) => {
        const element = document.querySelector(selector) as HTMLElement;
        return element ? element[property as keyof HTMLElement] : null;
      }, selector, property);
      return {
        content: [{ type: "text", text: "Element property: " + value }]
      };
    }
  );

  // Get element count
  server.tool(
    "get-element-count",
    "This tool gets the count of elements using a selector",
    {
      selector: z.string().describe("The selector of the elements to get the count of"),
      pageId: z.string().optional().describe("The ID of the page to get the count of. If not provided, the active page will be used.")
    },
    async ({ selector, pageId }) => {
      const pageData = pageManager.getPage(pageId);
      if (!pageData) {
        return {
          content: [{ type: "text", text: "No active page found" }]
        };
      }
      const count = await pageData.page.evaluate((selector) => {
        const elements = document.querySelectorAll(selector);
        return elements.length;
      }, selector);
      return {
        content: [{ type: "text", text: "Element count: " + count }]
      };
    }
  );

  // Get child elements
  server.tool(
    "get-child-elements",
    "This tool gets the child elements of an element using a selector",
    {
      selector: z.string().describe("The selector of the elements to get the child elements of"),
      pageId: z.string().optional().describe("The ID of the page to get the child elements of. If not provided, the active page will be used.")
    },
    async ({ selector, pageId }) => {
      const pageData = pageManager.getPage(pageId);
      if (!pageData) {
        return {
          content: [{ type: "text", text: "No active page found" }]
        };
      }
      const elements = await pageData.page.evaluate((selector) => {
        const element = document.querySelector(selector) as HTMLElement;
        return element ? Array.from(element.children) : [];
      }, selector);
      return {
        content: [{ type: "text", text: "Child elements: " + elements.map(e => e.tagName).join(", ") }]
      };
    }
  );

  // Get parent element
  server.tool(
    "get-parent-element",
    "This tool gets the parent element of an element using a selector",
    {
      selector: z.string().describe("The selector of the element to get the parent element of"),
      pageId: z.string().optional().describe("The ID of the page to get the parent element of. If not provided, the active page will be used.")
    },
    async ({ selector, pageId }) => {
      const pageData = pageManager.getPage(pageId);
      if (!pageData) {
        return {
          content: [{ type: "text", text: "No active page found" }]
        };
      }
      const element = await pageData.page.evaluate((selector) => {
        const element = document.querySelector(selector) as HTMLElement;
        return element ? element.parentElement : null;
      }, selector);
      return {
        content: [{ type: "text", text: "Parent element: " + (element ? element.tagName : "null") }]
      };
    }
  );

  // Get element position
  server.tool(
    "get-element-position",
    "This tool gets the position of an element using a selector",
    {
      selector: z.string().describe("The selector of the element to get the position of"),
      pageId: z.string().optional().describe("The ID of the page to get the position of. If not provided, the active page will be used.")
    },
    async ({ selector, pageId }) => {
      const pageData = pageManager.getPage(pageId);
      if (!pageData) {
        return {
          content: [{ type: "text", text: "No active page found" }]
        };
      }
      const position = await pageData.page.evaluate((selector) => {
        const element = document.querySelector(selector) as HTMLElement;
        const rect = element.getBoundingClientRect();
        return {
          x: rect.left,
          y: rect.top,
          width: rect.width,
          height: rect.height
        };
      }, selector);
      return {
        content: [{ type: "text", text: "Element position: " + JSON.stringify(position) }]
      };
    }
  );

  // Get element style
  server.tool(
    "get-element-style",
    "This tool gets the style of an element using a selector and property name",
    {
      selector: z.string().describe("The selector of the element to get the style of"),
      property: z.string().describe("The property name to get the value of"),
      pageId: z.string().optional().describe("The ID of the page to get the style of. If not provided, the active page will be used.")
    },
    async ({ selector, property, pageId }) => {
      const pageData = pageManager.getPage(pageId);
      if (!pageData) {
        return {
          content: [{ type: "text", text: "No active page found" }]
        };
      }
      const value = await pageData.page.evaluate((selector, property) => {
        const element = document.querySelector(selector) as HTMLElement;
        return element ? window.getComputedStyle(element)[property as keyof CSSStyleDeclaration] : null;
      }, selector, property);
      return {
        content: [{ type: "text", text: "Element style: " + value }]
      };
    }
  );

  // Get element visibility
  server.tool(
    "get-element-visibility",
    "This tool gets the visibility of an element using a selector",
    {
      selector: z.string().describe("The selector of the element to get the visibility of"),
      pageId: z.string().optional().describe("The ID of the page to get the visibility of. If not provided, the active page will be used.")
    },
    async ({ selector, pageId }) => {
      const pageData = pageManager.getPage(pageId);
      if (!pageData) {
        return {
          content: [{ type: "text", text: "No active page found" }]
        };
      }
      const visible = await pageData.page.evaluate((selector) => {
        const element = document.querySelector(selector) as HTMLElement;
        return element ? element.offsetParent !== null : false;
      }, selector);
      return {
        content: [{ type: "text", text: "Element visibility: " + (visible ? "visible" : "hidden") }]
      };
    }
  );

  // Get computed style
  server.tool(
    "get-computed-style",
    "This tool gets the computed style of an element",
    {
      selector: z.string().describe("The selector of the element to get the computed style of"),
      pageId: z.string().optional().describe("The ID of the page to get the computed style of. If not provided, the active page will be used.")
    },
    async ({ selector, pageId }) => {
      const pageData = pageManager.getPage(pageId);
      if (!pageData) {
        return {
          content: [{ type: "text", text: "No active page found" }]
        };
      }
      const style = await pageData.page.evaluate((selector) => {
        const element = document.querySelector(selector);
        if (!element) {
          return null;
        }
        return window.getComputedStyle(element);
      }, selector);
      return {
        content: [{ type: "text", text: "Computed style: " + JSON.stringify(style) }]
      };
    }
  );

  // Get all clickable elements
  server.tool(
    "get-all-clickable-elements",
    "This tool gets all clickable elements, it can be used to find inputs (for search or fill forms), buttons, links, etc.",
    {
      pageId: z.string().optional().describe("The ID of the page to get the clickable elements of. If not provided, the active page will be used.")
    },
    async ({ pageId }) => {
      const pageData = pageManager.getPage(pageId);
      if (!pageData) {
        return {
          content: [{ type: "text", text: "No active page found" }]
        };
      }

      const handles = await pageData.page.$$(`button, a, input[type='button'], input[type='submit'], input[type='reset'], input[type='image'], input[type='file'], input[type='checkbox'], input[type='radio'], input[type='color'], input[type='date'], input[type='datetime-local'], input[type='email'], input[type='month'], input[type='number'], input[type='password'], input[type='range'], input[type='search'], input[type='tel'], input[type='text'], input[type='time'], input[type='url'], input[type='week']`);

      // Get selectors (not xpath) for each element
      const elements = [];
      const xpaths = await getFullXPaths(handles);
      for (let i = 0; i < handles.length; i++) {
        const element = await handles[i].evaluate(el => {

          const { top, left, bottom, right } = el.getBoundingClientRect();

          const height = document.defaultView?.getComputedStyle(el).height
          const width = document.defaultView?.getComputedStyle(el).width
          return {
            label: el.getAttribute("aria-label") || el.getAttribute("placeholder") || el.getAttribute("title") || el.getAttribute("alt") || el.getAttribute("label") || null,
            tag: el.tagName,
            id: el.id,
            top,
            left,
            bottom,
            right,
            height,
            width
          };
        });
        elements.push({
          ...element,
          xpath: xpaths[i]
        });
      }

      return {
        content: [{ type: "text", text: `Clickable elements:\n${JSON.stringify(elements, null, 2)}` }]
      };
    }
  );

  // Get all 
};

