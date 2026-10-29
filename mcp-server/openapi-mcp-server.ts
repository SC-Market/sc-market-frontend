#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  CallToolRequest,
  ReadResourceRequest,
} from "@modelcontextprotocol/sdk/types.js"

interface OpenAPISpec {
  openapi: string
  info: {
    title: string
    version: string
    description?: string
  }
  paths: Record<string, Record<string, any>>
  components?: {
    schemas?: Record<string, any>
    parameters?: Record<string, any>
    responses?: Record<string, any>
    [key: string]: Record<string, any> | undefined
  }
  tags?: Array<{ name: string; description?: string }>
}

interface EndpointInfo {
  path: string
  method: string
  summary?: string
  description?: string
  tags?: string[]
  parameters?: any[]
  requestBody?: any
  responses?: Record<string, any>
}

interface ToolArgs {
  force_refresh?: boolean
  path?: string
  method?: string
  tags?: string[]
  search?: string
  name?: string
  type?: string
}

class OpenAPIMCPServer {
  private spec: OpenAPISpec | null = null
  private apiBaseUrl = "http://localhost"
  private server: Server

  constructor() {
    this.server = new Server(
      {
        name: "openapi-mcp-server",
        version: "1.0.0",
      },
      // SDK 1.x refuses handlers for capabilities the server doesn't declare.
      { capabilities: { tools: {}, resources: {} } },
    )

    this.setupToolHandlers()
    this.setupResourceHandlers()
  }

  private setupToolHandlers() {
    // Fetch OpenAPI specification
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "fetch_openapi_spec",
            description: "Fetch the OpenAPI specification from the API server",
            inputSchema: {
              type: "object",
              properties: {
                force_refresh: {
                  type: "boolean",
                  description: "Force refresh the cached spec",
                  default: false,
                },
              },
            },
          },
          {
            name: "query_endpoints",
            description: "Query endpoints based on various criteria",
            inputSchema: {
              type: "object",
              properties: {
                path: {
                  type: "string",
                  description: "Filter by path pattern (supports wildcards)",
                },
                method: {
                  type: "string",
                  description:
                    "Filter by HTTP method (GET, POST, PUT, DELETE, etc.)",
                  enum: [
                    "GET",
                    "POST",
                    "PUT",
                    "DELETE",
                    "PATCH",
                    "HEAD",
                    "OPTIONS",
                  ],
                },
                tags: {
                  type: "array",
                  items: { type: "string" },
                  description: "Filter by tags",
                },
                search: {
                  type: "string",
                  description: "Search in summary and description",
                },
              },
            },
          },
          {
            name: "get_endpoint_details",
            description: "Get detailed information about a specific endpoint",
            inputSchema: {
              type: "object",
              properties: {
                path: {
                  type: "string",
                  description: "The endpoint path",
                },
                method: {
                  type: "string",
                  description: "The HTTP method",
                  enum: [
                    "GET",
                    "POST",
                    "PUT",
                    "DELETE",
                    "PATCH",
                    "HEAD",
                    "OPTIONS",
                  ],
                },
              },
              required: ["path", "method"],
            },
          },
          {
            name: "list_schemas",
            description: "List all available schemas/components",
            inputSchema: {
              type: "object",
              properties: {
                type: {
                  type: "string",
                  description: "Filter by component type",
                  enum: ["schemas", "parameters", "responses"],
                  default: "schemas",
                },
                search: {
                  type: "string",
                  description: "Search in schema names and descriptions",
                },
              },
            },
          },
          {
            name: "get_schema_details",
            description: "Get detailed information about a specific schema",
            inputSchema: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                  description: "The schema name",
                },
                type: {
                  type: "string",
                  description: "The component type",
                  enum: ["schemas", "parameters", "responses"],
                  default: "schemas",
                },
              },
              required: ["name"],
            },
          },
        ],
      }
    })

    this.server.setRequestHandler(
      CallToolRequestSchema,
      async (request: CallToolRequest) => {
        const { name, arguments: args } = request.params
        const toolArgs = (args as ToolArgs) || {}

        switch (name) {
          case "fetch_openapi_spec":
            return await this.fetchOpenAPISpec(toolArgs.force_refresh || false)

          case "query_endpoints":
            return await this.queryEndpoints(toolArgs)

          case "get_endpoint_details":
            if (!toolArgs.path || !toolArgs.method) {
              throw new Error(
                "Path and method are required for get_endpoint_details",
              )
            }
            return await this.getEndpointDetails(toolArgs.path, toolArgs.method)

          case "list_schemas":
            return await this.listSchemas(
              toolArgs.type || "schemas",
              toolArgs.search,
            )

          case "get_schema_details":
            if (!toolArgs.name) {
              throw new Error("Name is required for get_schema_details")
            }
            return await this.getSchemaDetails(
              toolArgs.name,
              toolArgs.type || "schemas",
            )

          default:
            throw new Error(`Unknown tool: ${name}`)
        }
      },
    )
  }

  private setupResourceHandlers() {
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      if (!this.spec) {
        return { resources: [] }
      }

      return {
        resources: [
          {
            uri: "openapi://spec",
            name: "OpenAPI Specification",
            description: "The complete OpenAPI specification",
            mimeType: "application/json",
          },
          {
            uri: "openapi://endpoints",
            name: "All Endpoints",
            description: "List of all available endpoints",
            mimeType: "application/json",
          },
          {
            uri: "openapi://schemas",
            name: "All Schemas",
            description: "List of all available schemas",
            mimeType: "application/json",
          },
        ],
      }
    })

    this.server.setRequestHandler(
      ReadResourceRequestSchema,
      async (request: ReadResourceRequest) => {
        const { uri } = request.params

        switch (uri) {
          case "openapi://spec":
            if (!this.spec) {
              throw new Error(
                "OpenAPI spec not loaded. Call fetch_openapi_spec first.",
              )
            }
            return {
              contents: [
                {
                  uri,
                  mimeType: "application/json",
                  text: JSON.stringify(this.spec, null, 2),
                },
              ],
            }

          case "openapi://endpoints":
            if (!this.spec) {
              throw new Error(
                "OpenAPI spec not loaded. Call fetch_openapi_spec first.",
              )
            }
            const endpoints = this.getAllEndpoints()
            return {
              contents: [
                {
                  uri,
                  mimeType: "application/json",
                  text: JSON.stringify(endpoints, null, 2),
                },
              ],
            }

          case "openapi://schemas":
            if (!this.spec) {
              throw new Error(
                "OpenAPI spec not loaded. Call fetch_openapi_spec first.",
              )
            }
            return {
              contents: [
                {
                  uri,
                  mimeType: "application/json",
                  text: JSON.stringify(
                    this.spec.components?.schemas || {},
                    null,
                    2,
                  ),
                },
              ],
            }

          default:
            throw new Error(`Unknown resource: ${uri}`)
        }
      },
    )
  }

  private async fetchOpenAPISpec(forceRefresh: boolean): Promise<any> {
    if (this.spec && !forceRefresh) {
      return {
        content: [
          {
            type: "text",
            text: `OpenAPI spec already loaded. Version: ${this.spec.info.version}, Title: ${this.spec.info.title}`,
          },
        ],
      }
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/openapi.json`)
      if (!response.ok) {
        throw new Error(
          `Failed to fetch OpenAPI spec: ${response.status} ${response.statusText}`,
        )
      }

      this.spec = await response.json()

      if (!this.spec) {
        throw new Error("Failed to parse OpenAPI spec")
      }

      return {
        content: [
          {
            type: "text",
            text: `Successfully loaded OpenAPI spec. Version: ${this.spec.info.version}, Title: ${this.spec.info.title}`,
          },
          {
            type: "text",
            text: `Found ${Object.keys(this.spec.paths).length} paths and ${Object.keys(this.spec.components?.schemas || {}).length} schemas.`,
          },
        ],
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      throw new Error(`Failed to fetch OpenAPI spec: ${errorMessage}`)
    }
  }

  private async queryEndpoints(args: ToolArgs): Promise<any> {
    if (!this.spec) {
      throw new Error("OpenAPI spec not loaded. Call fetch_openapi_spec first.")
    }

    const endpoints = this.getAllEndpoints()
    let filtered = endpoints

    // Filter by path
    if (args.path) {
      const pathPattern = args.path.replace(/\*/g, ".*")
      const regex = new RegExp(pathPattern)
      filtered = filtered.filter((ep) => regex.test(ep.path))
    }

    // Filter by method
    if (args.method) {
      filtered = filtered.filter(
        (ep) => ep.method.toLowerCase() === args.method!.toLowerCase(),
      )
    }

    // Filter by tags
    if (args.tags && Array.isArray(args.tags)) {
      filtered = filtered.filter(
        (ep) =>
          ep.tags && args.tags!.some((tag: string) => ep.tags!.includes(tag)),
      )
    }

    // Filter by search
    if (args.search) {
      const searchLower = args.search.toLowerCase()
      filtered = filtered.filter(
        (ep) =>
          (ep.summary && ep.summary.toLowerCase().includes(searchLower)) ||
          (ep.description &&
            ep.description.toLowerCase().includes(searchLower)),
      )
    }

    return {
      content: [
        {
          type: "text",
          text: `Found ${filtered.length} endpoints matching criteria:`,
        },
        {
          type: "text",
          text: JSON.stringify(filtered, null, 2),
        },
      ],
    }
  }

  private async getEndpointDetails(path: string, method: string): Promise<any> {
    if (!this.spec) {
      throw new Error("OpenAPI spec not loaded. Call fetch_openapi_spec first.")
    }

    const pathData = this.spec.paths[path]
    if (!pathData) {
      throw new Error(`Path not found: ${path}`)
    }

    const methodData = pathData[method.toLowerCase()]
    if (!methodData) {
      throw new Error(`Method ${method} not found for path ${path}`)
    }

    return {
      content: [
        {
          type: "text",
          text: `Endpoint details for ${method} ${path}:`,
        },
        {
          type: "text",
          text: JSON.stringify(methodData, null, 2),
        },
      ],
    }
  }

  private async listSchemas(type: string, search?: string): Promise<any> {
    if (!this.spec) {
      throw new Error("OpenAPI spec not loaded. Call fetch_openapi_spec first.")
    }

    const components = this.spec.components?.[type] || {}
    let schemas = Object.keys(components)

    if (search) {
      const searchLower = search.toLowerCase()
      schemas = schemas.filter(
        (name) =>
          name.toLowerCase().includes(searchLower) ||
          (components[name].description &&
            components[name].description.toLowerCase().includes(searchLower)),
      )
    }

    return {
      content: [
        {
          type: "text",
          text: `Found ${schemas.length} ${type}:`,
        },
        {
          type: "text",
          text: JSON.stringify(schemas, null, 2),
        },
      ],
    }
  }

  private async getSchemaDetails(name: string, type: string): Promise<any> {
    if (!this.spec) {
      throw new Error("OpenAPI spec not loaded. Call fetch_openapi_spec first.")
    }

    const components = this.spec.components?.[type]
    if (!components || !components[name]) {
      throw new Error(`${type} not found: ${name}`)
    }

    return {
      content: [
        {
          type: "text",
          text: `Schema details for ${name}:`,
        },
        {
          type: "text",
          text: JSON.stringify(components[name], null, 2),
        },
      ],
    }
  }

  private getAllEndpoints(): EndpointInfo[] {
    if (!this.spec) return []

    const endpoints: EndpointInfo[] = []
    const methods = ["get", "post", "put", "delete", "patch", "head", "options"]

    for (const [path, pathData] of Object.entries(this.spec.paths)) {
      for (const method of methods) {
        if (pathData[method]) {
          endpoints.push({
            path,
            method: method.toUpperCase(),
            summary: pathData[method].summary,
            description: pathData[method].description,
            tags: pathData[method].tags,
            parameters: pathData[method].parameters,
            requestBody: pathData[method].requestBody,
            responses: pathData[method].responses,
          })
        }
      }
    }

    return endpoints
  }

  async run() {
    const transport = new StdioServerTransport()
    await this.server.connect(transport)
    console.error("OpenAPI MCP Server running on stdio")
  }
}

// Run the server
const server = new OpenAPIMCPServer()
server.run().catch(console.error)
