import { randomUUID } from "crypto";
import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import { JSONRPCMessageSchema, type JSONRPCMessage } from "@modelcontextprotocol/sdk/types.js";
import type { Context } from "elysia";
import { logger } from "@lib/Logger";

export class SSETransport implements Transport {
  private _sessionId: string;
  private _isConnected = false;
  private _encoder = new TextEncoder();
  private _stream: ReadableStream<Uint8Array>;
  private _controller!: ReadableStreamDefaultController<Uint8Array>;
  
  onclose?: () => void;
  onerror?: (error: Error) => void;
  onmessage?: (message: JSONRPCMessage) => void;


  constructor(private _endpoint: string, private _ctx: Context) {
    this._sessionId = randomUUID();
    
    this._stream = new ReadableStream({
      start: (controller) => {
        this._controller = controller;
      },
      cancel: () => {
        this._isConnected = false;
        this.onclose?.();
      }
    });
  }

  async start(): Promise<void> {
    logger.info(`[Transport:${this._sessionId}] Starting transport`);
    
    // If already started, don't do anything
    if (this._isConnected) {
      logger.info(`[Transport:${this._sessionId}] Already started`);
      return;
    }
    
    try {
      // Set up the response with the stream
      this._ctx.response = new Response(this._stream);
      
      // Mark as connected
      this._isConnected = true;
      logger.info(`[Transport:${this._sessionId}] Transport connected`);
      
      // Send endpoint event
      this._sendEvent("endpoint", `${encodeURI(this._endpoint)}?sessionId=${this._sessionId}`);
      logger.info(`[Transport:${this._sessionId}] Endpoint event sent`);
      
    } catch (error) {
      logger.error(`[Transport:${this._sessionId}] Error starting transport:`, error);
      this._isConnected = false;
      this.onerror?.(error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }
  
  
  private _sendEvent(event: string, data: string): void {
    if (!this._isConnected) {
      logger.error(`[Transport:${this._sessionId}] Cannot send event, not connected`);
      return;
    }
    
    try {
      this._controller.enqueue(this._encoder.encode(`event: ${event}\ndata: ${data}\n\n`));
    } catch (error) {
      logger.error(`[Transport:${this._sessionId}] Error sending event:`, error);
      this._isConnected = false;
      this.onerror?.(error instanceof Error ? error : new Error(String(error)));
    }
  }

  async handlePostMessage(ctx: Context): Promise<Response> {
    logger.info(`[Transport:${this._sessionId}] Received message`);
    
    if (!this._isConnected) {
      logger.error(`[Transport:${this._sessionId}] Not connected`);
      return new Response(JSON.stringify({ error: "SSE connection not established" }), {
        status: 500,
        headers: { "content-type": "application/json" }
      });
    }
    
    try {
      // Handle the message
      await this.handleMessage(ctx.body);
      
      // Return success
      return new Response(JSON.stringify({ success: true }), {
        status: 202,
        headers: { "content-type": "application/json" }
      });
    } catch (error) {
      logger.error(`[Transport:${this._sessionId}] Error handling message:`, error);
      return new Response(JSON.stringify({ error: String(error) }), {
        status: 400,
        headers: { "content-type": "application/json" }
      });
    }
  }

  async handleMessage(message: unknown): Promise<void> {
    logger.info(`[Transport:${this._sessionId}] Parsing message`);
    
    let parsedMessage: JSONRPCMessage;
    try {
      parsedMessage = JSONRPCMessageSchema.parse(message);
    } catch (error) {
      logger.error(`[Transport:${this._sessionId}] Invalid message format:`, error);
      this.onerror?.(error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
    
    logger.info(`[Transport:${this._sessionId}] Forwarding message to handler`);
    this.onmessage?.(parsedMessage);
  }

  async close(): Promise<void> {
    logger.info(`[Transport:${this._sessionId}] Closing transport`);
    
    this._isConnected = false;
    this.onclose?.();
  }

  async send(message: JSONRPCMessage): Promise<void> {
    logger.info(`[Transport:${this._sessionId}] Sending message`);
    
    if (!this._isConnected) {
      logger.error(`[Transport:${this._sessionId}] Not connected`);
      throw new Error("Not connected");
    }
    
    this._sendEvent("message", JSON.stringify(message));
  }

  get sessionId(): string {
    return this._sessionId;
  }
}