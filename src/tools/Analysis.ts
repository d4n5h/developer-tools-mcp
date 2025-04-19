import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import type { PageManager } from "../services/PageManager";
import { z } from "zod";

export const analysisTools = ({ pageManager, server }: { pageManager: PageManager, server: McpServer }) => {
  // Performance profiling
  server.tool(
    "analyze-performance",
    "This tool analyzes page performance metrics",
    {
      pageId: z.string().optional().describe("The ID of the page to analyze the performance of. If not provided, the active page will be used.")
    },
    async ({ pageId }) => {
      const pageData = pageManager.getPage(pageId);
      if (!pageData) {
        return {
          content: [{ type: "text", text: "No active page found" }]
        };
      }
      const metrics = await pageData.page.evaluate(() => {
        const performanceMetrics = {
          // Navigation timing
          timeOrigin: performance.timeOrigin,
          timing: (() => {
            const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
            return {
              responseEnd: navEntry.responseEnd,
              domComplete: navEntry.domComplete,
              loadEventEnd: navEntry.loadEventEnd,
              // Calculated metrics
              timeToFirstByte: navEntry.responseStart,
              domInteractive: navEntry.domInteractive,
              domContentLoaded: navEntry.domContentLoadedEventEnd,
              pageLoadTime: navEntry.loadEventEnd
            };
          })(),

          // Performance entries
          resources: performance.getEntriesByType('resource').map(entry => ({
            name: entry.name,
            duration: entry.duration,
            transferSize: (entry as PerformanceResourceTiming).transferSize,
            initiatorType: (entry as PerformanceResourceTiming).initiatorType
          })),

          // Memory info
          memory: (performance as any).memory ? {
            usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
            totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
            jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit
          } : null
        };
        return performanceMetrics;
      });
      return {
        content: [{ type: "text", text: "Performance metrics: " + JSON.stringify(metrics, null, 2) }]
      };
    }
  );

  // Accessibility testing
  server.tool(
    "analyze-accessibility",
    "This tool performs accessibility analysis on the page",
    {
      pageId: z.string().optional().describe("The ID of the page to analyze the accessibility of. If not provided, the active page will be used.")
    },
    async ({ pageId }) => {
      const pageData = pageManager.getPage(pageId);
      if (!pageData) {
        return {
          content: [{ type: "text", text: "No active page found" }]
        };
      }
      const accessibilityReport = await pageData.page.evaluate(() => {
        const issues: any[] = [];

        // Check for images without alt text
        document.querySelectorAll('img').forEach(img => {
          if (!img.hasAttribute('alt')) {
            issues.push({
              type: 'error',
              message: 'Image missing alt text',
              element: img.outerHTML
            });
          }
        });

        // Check for form inputs without labels
        document.querySelectorAll('input, select, textarea').forEach(input => {
          const hasLabel = Array.from(document.querySelectorAll('label')).some(label =>
            label.getAttribute('for') === input.id
          );
          if (!hasLabel && !input.hasAttribute('aria-label')) {
            issues.push({
              type: 'error',
              message: 'Form control missing label',
              element: input.outerHTML
            });
          }
        });

        // Check for proper heading hierarchy
        let lastHeadingLevel = 0;
        document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(heading => {
          const level = parseInt(heading.tagName[1]);
          if (level - lastHeadingLevel > 1) {
            issues.push({
              type: 'warning',
              message: 'Skipped heading level',
              element: heading.outerHTML
            });
          }
          lastHeadingLevel = level;
        });

        // Check for sufficient color contrast (simplified)
        document.querySelectorAll('*').forEach(element => {
          const style = window.getComputedStyle(element);
          if (style.color === style.backgroundColor) {
            issues.push({
              type: 'warning',
              message: 'Potential insufficient color contrast',
              element: element.outerHTML
            });
          }
        });

        return issues;
      });

      return {
        content: [{ type: "text", text: "Accessibility issues found: " + JSON.stringify(accessibilityReport, null, 2) }]
      };
    }
  );

  // SEO analysis
  server.tool(
    "analyze-seo",
    "This tool performs SEO analysis on the page",
    {
      pageId: z.string().optional().describe("The ID of the page to analyze the SEO of. If not provided, the active page will be used.")
    },
    async ({ pageId }) => {
      const pageData = pageManager.getPage(pageId);
      if (!pageData) {
        return {
          content: [{ type: "text", text: "No active page found" }]
        };
      }
      const seoReport = await pageData.page.evaluate(() => {
        const analysis = {
          meta: {
            title: document.title,
            description: document.querySelector('meta[name="description"]')?.getAttribute('content'),
            keywords: document.querySelector('meta[name="keywords"]')?.getAttribute('content'),
            viewport: document.querySelector('meta[name="viewport"]')?.getAttribute('content'),
            robots: document.querySelector('meta[name="robots"]')?.getAttribute('content'),
            canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href')
          },
          headings: {
            h1: Array.from(document.querySelectorAll('h1')).map(h => h.textContent),
            h2: Array.from(document.querySelectorAll('h2')).map(h => h.textContent),
            h3: Array.from(document.querySelectorAll('h3')).map(h => h.textContent)
          },
          images: Array.from(document.querySelectorAll('img')).map(img => ({
            src: img.src,
            alt: img.alt,
            width: img.width,
            height: img.height
          })),
          links: {
            internal: Array.from(document.querySelectorAll('a[href^="/"], a[href^="' + window.location.origin + '"]')).length,
            external: Array.from(document.querySelectorAll('a[href^="http"]')).length,
            nofollow: Array.from(document.querySelectorAll('a[rel*="nofollow"]')).length
          },
          structured_data: Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map(script => script.textContent)
        };
        return analysis;
      });

      return {
        content: [{ type: "text", text: "SEO analysis: " + JSON.stringify(seoReport, null, 2) }]
      };
    }
  );

  // JavaScript code coverage
  server.tool(
    "analyze-code-coverage",
    "This tool analyzes JavaScript code coverage",
    {
      pageId: z.string().optional().describe("The ID of the page to analyze the code coverage of. If not provided, the active page will be used.")
    },
    async ({ pageId }) => {
      const pageData = pageManager.getPage(pageId);
      if (!pageData) {
        return {
          content: [{ type: "text", text: "No active page found" }]
        };
      }
      await Promise.all([
        pageData.page.coverage.startJSCoverage(),
        pageData.page.coverage.startCSSCoverage()
      ]);

      // Trigger page load to gather coverage
      await pageData.page.reload({ waitUntil: 'networkidle0' });

      const [jsCoverage, cssCoverage] = await Promise.all([
        pageData.page.coverage.stopJSCoverage(),
        pageData.page.coverage.stopCSSCoverage()
      ]);

      const calculateCoverage = (coverage: any[]) => {
        let totalBytes = 0;
        let usedBytes = 0;

        coverage.forEach(entry => {
          totalBytes += entry.text.length;
          for (const range of entry.ranges) {
            usedBytes += range.end - range.start;
          }
        });

        return {
          total: totalBytes,
          used: usedBytes,
          percentage: (usedBytes / totalBytes) * 100
        };
      };

      const report = {
        javascript: {
          coverage: calculateCoverage(jsCoverage),
          files: jsCoverage.map(entry => ({
            url: entry.url,
            ...calculateCoverage([entry])
          }))
        },
        css: {
          coverage: calculateCoverage(cssCoverage),
          files: cssCoverage.map(entry => ({
            url: entry.url,
            ...calculateCoverage([entry])
          }))
        }
      };

      return {
        content: [{ type: "text", text: "Code coverage report: " + JSON.stringify(report, null, 2) }]
      };
    }
  );

  // Security headers check
  server.tool(
    "check-security-headers",
    "This tool checks security headers of the page",
    {
      pageId: z.string().optional().describe("The ID of the page to check the security headers of. If not provided, the active page will be used.")
    },
    async ({ pageId }) => {
      const pageData = pageManager.getPage(pageId);
      if (!pageData) {
        return {
          content: [{ type: "text", text: "No active page found" }]
        };
      }
      const response = await pageData.page.evaluate(async () => {
        const response = await fetch(window.location.href);
        const headers = Array.from(response.headers.entries()).reduce((acc: any, [key, value]) => {
          acc[key] = value;
          return acc;
        }, {});
        return headers;
      });

      const securityHeaders = {
        'Strict-Transport-Security': response['strict-transport-security'],
        'Content-Security-Policy': response['content-security-policy'],
        'X-Frame-Options': response['x-frame-options'],
        'X-Content-Type-Options': response['x-content-type-options'],
        'X-XSS-Protection': response['x-xss-protection'],
        'Referrer-Policy': response['referrer-policy'],
        'Permissions-Policy': response['permissions-policy']
      };

      const recommendations: string[] = [];

      if (!securityHeaders['Strict-Transport-Security']) {
        recommendations.push('Add HSTS header to enforce HTTPS');
      }

      if (!securityHeaders['Content-Security-Policy']) {
        recommendations.push('Implement Content Security Policy');
      }
      
      if (!securityHeaders['X-Frame-Options']) {
        recommendations.push('Add X-Frame-Options header to prevent clickjacking');
      }

      return {
        content: [{
          type: "text",
          text: "Security headers analysis:\n" +
            JSON.stringify(securityHeaders, null, 2) + "\n\n" +
            "Recommendations:\n" + recommendations.join('\n')
        }]
      };
    }
  );
};