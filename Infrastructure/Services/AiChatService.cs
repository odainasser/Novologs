using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using Novologs.Application.Modules.Chat.Services;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Novologs.Infrastructure.Services;

/// <summary>
/// AI chat service that calls any OpenAI-compatible provider (OpenAI, Groq, Ollama, Azure OpenAI, etc.)
/// and connects to the MCP server to retrieve and call business data tools.
/// Configure via the "Ai" section: Endpoint, Model, ApiKey, ChatPath.
/// </summary>
public class AiChatService : IAiChatService
{
    private const string AiPrefix = "@ai";
    private const int DefaultHistorySize = 20;

    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IMemoryCache _cache;
    private readonly ILogger<AiChatService> _logger;
    private readonly AiSettings _settings;

    // Cache of MCP tool definitions (shared across tenants, tools are the same)
    private List<AiTool>? _cachedAiTools;
    private readonly SemaphoreSlim _toolLock = new(1, 1);

    public AiChatService(
        IHttpClientFactory httpClientFactory,
        IMemoryCache cache,
        IConfiguration configuration,
        ILogger<AiChatService> logger)
    {
        _httpClientFactory = httpClientFactory;
        _cache = cache;
        _logger = logger;
        _settings = configuration.GetSection("Ai").Get<AiSettings>() ?? new AiSettings();
    }

    public async Task<string?> GetAiResponseAsync(
        string prompt,
        string userId,
        string tenantId,
        string conversationKey,
        string? bearerToken = null,
        CancellationToken ct = default)
    {
        _logger.LogInformation(
            "[AI] GetAiResponseAsync called — Enabled={Enabled}, Endpoint={Endpoint}, Model={Model}, ChatPath={ChatPath}, HasApiKey={HasApiKey}",
            _settings.Enabled, _settings.Endpoint, _settings.Model, _settings.ChatPath,
            !string.IsNullOrEmpty(_settings.ApiKey));

        if (!_settings.Enabled)
        {
            _logger.LogWarning("[AI] AI service is disabled. Set Ai:Enabled = true in configuration.");
            return null;
        }

        try
        {
            var tools = await GetAiToolsAsync(bearerToken, ct);
            _logger.LogInformation("[AI] Using {ToolCount} MCP tools. UserId={UserId}, TenantId={TenantId}, ConversationKey={ConversationKey}",
                tools.Count, userId, tenantId, conversationKey);

            var history = GetHistory(tenantId, conversationKey);

            // Inject system prompt once at the start
            if (history.Count == 0)
            {
                history.Add(new AiMessage
                {
                    Role = "system",
                    Content = BuildSystemPrompt(userId, tenantId)
                });
            }

            history.Add(new AiMessage { Role = "user", Content = prompt });
            _logger.LogInformation("[AI] Sending prompt (length={Len}): {Prompt}", prompt.Length, prompt);

            // Agentic loop: keep calling AI until it produces a final text response
            for (int iteration = 0; iteration < 10; iteration++)
            {
                _logger.LogInformation("[AI] Agentic loop iteration={Iteration}, HistoryMessages={Count}", iteration, history.Count);

                var aiResponse = await CallAiProviderAsync(history, tools, ct);
                if (aiResponse == null)
                {
                    _logger.LogWarning("[AI] CallOllamaAsync returned null on iteration {Iteration}", iteration);
                    return null;
                }

                var responseMessage = aiResponse["message"]?.AsObject();
                if (responseMessage == null)
                {
                    _logger.LogWarning("[AI] Response has no 'message' node. Raw response: {Raw}", aiResponse.ToJsonString());
                    break;
                }

                var toolCalls = responseMessage["tool_calls"]?.AsArray();

                // No tool calls → final answer
                if (toolCalls == null || toolCalls.Count == 0)
                {
                    var finalContent = responseMessage["content"]?.GetValue<string>();
                    _logger.LogInformation("[AI] Final response received (length={Len}): {Content}", finalContent?.Length ?? 0, finalContent);
                    history.Add(new AiMessage { Role = "assistant", Content = finalContent ?? "" });
                    TrimAndSaveHistory(tenantId, conversationKey, history);
                    return finalContent;
                }

                _logger.LogInformation("[AI] Model requested {Count} tool call(s) on iteration {Iteration}", toolCalls.Count, iteration);

                // Add assistant's tool-call message to history
                history.Add(new AiMessage
                {
                    Role = "assistant",
                    Content = responseMessage["content"]?.GetValue<string>() ?? "",
                    ToolCalls = toolCalls.Deserialize<List<AiToolCall>>()
                });

                // Execute each tool call against the MCP server
                foreach (var toolCall in toolCalls)
                {
                    var funcNode = toolCall?["function"];
                    var toolName = funcNode?["name"]?.GetValue<string>();
                    var toolArgs = funcNode?["arguments"]?.AsObject();

                    if (string.IsNullOrEmpty(toolName)) continue;

                    _logger.LogInformation("[AI] Calling MCP tool '{Tool}' with args: {Args}", toolName, toolArgs?.ToJsonString());

                    // Inject user/tenant into every MCP tool call
                    toolArgs ??= new JsonObject();
                    if (!toolArgs.ContainsKey("current_user_id"))
                        toolArgs["current_user_id"] = userId;
                    if (!toolArgs.ContainsKey("tenant_id"))
                        toolArgs["tenant_id"] = tenantId;

                    var toolResult = await CallMcpToolAsync(toolName, toolArgs, bearerToken, ct);
                    _logger.LogInformation("[AI] MCP tool '{Tool}' result (length={Len}): {Result}", toolName, toolResult.Length, toolResult);

                    history.Add(new AiMessage
                    {
                        Role = "tool",
                        Content = toolResult,
                        Name = toolName
                    });
                }
            }

            _logger.LogWarning("[AI] Agentic loop exhausted 10 iterations without a final response.");
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[AI] Error getting AI response for user {UserId} in tenant {TenantId}", userId, tenantId);
            return null;
        }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Private helpers
    // ──────────────────────────────────────────────────────────────────────────

    private string BuildSystemPrompt(string userId, string tenantId)
    {
        var frontendBase = string.IsNullOrWhiteSpace(_settings.FrontendBaseUrl)
            ? ""
            : _settings.FrontendBaseUrl.TrimEnd('/');

        var linkHint = string.IsNullOrEmpty(frontendBase)
            ? ""
            : $"\nWhen presenting tasks, include a clickable link for each task using this pattern: {frontendBase}/task/{{taskId}} (replace {{taskId}} with the actual task Id).";

        return $"""
        You are Zeta AI Assistant — a helpful business assistant for an enterprise platform.
        You have access to company data tools that let you look up users, projects, tasks, vendors, documents, clients, folders, and more.
        When answering questions that require live data, use the available tools.
        Always pass current_user_id="{userId}" and tenant_id="{tenantId}" to every tool call.
        Be concise, accurate, and helpful. If you cannot find the data, say so clearly.
        Today's date is {DateTime.UtcNow:yyyy-MM-dd}.{linkHint}
        """;
    }

    private async Task<JsonNode?> CallAiProviderAsync(
        List<AiMessage> messages,
        List<AiTool> tools,
        CancellationToken ct)
    {
        var http = _httpClientFactory.CreateClient("AiProvider");

        // Use top-level temperature (OpenAI-compatible) and also include options (Ollama)
        var requestBody = new
        {
            model = _settings.Model,
            messages = messages.Select(m => new
            {
                role = m.Role,
                content = m.Content ?? "",
                name = m.Name,
                tool_calls = m.ToolCalls
            }),
            tools = tools.Count > 0 ? (object)tools : null,
            stream = false,
            temperature = 0.3,
            options = new { temperature = 0.3 }
        };

        var path = $"{_settings.Endpoint.TrimEnd('/')}{_settings.ChatPath}";
        _logger.LogInformation("[AI] POST {Url} — model={Model}, messages={MsgCount}, tools={ToolCount}",
            path, _settings.Model, messages.Count, tools.Count);

        var requestJson = JsonSerializer.Serialize(requestBody);
        _logger.LogDebug("[AI] Request body: {Body}", requestJson);

        HttpResponseMessage response;
        try
        {
            response = await http.PostAsync(path,
                new StringContent(requestJson, Encoding.UTF8, "application/json"), ct);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[AI] HTTP request to {Url} failed (network/timeout)", path);
            return null;
        }

        var responseBody = await response.Content.ReadAsStringAsync(ct);
        _logger.LogInformation("[AI] Response status={Status}, body length={Len}", (int)response.StatusCode, responseBody.Length);

        if (!response.IsSuccessStatusCode)
        {
            _logger.LogError("[AI] Provider returned {Status}: {Error}", response.StatusCode, responseBody);
            return null;
        }

        _logger.LogDebug("[AI] Response body: {Body}", responseBody);

        var root = JsonNode.Parse(responseBody);

        // Support both Ollama shape { "message": {...} } and OpenAI shape { "choices": [{"message":{...}}] }
        if (root?["message"] != null)
        {
            _logger.LogDebug("[AI] Detected Ollama response format");
            return root;
        }
        var choice = root?["choices"]?[0]?["message"];
        if (choice != null)
        {
            _logger.LogDebug("[AI] Detected OpenAI response format");
            return JsonNode.Parse($"{{\"message\":{choice.ToJsonString()}}}");
        }

        _logger.LogWarning("[AI] Unrecognized response format. Full body: {Body}", responseBody);
        return null;
    }

    private async Task<string> CallMcpToolAsync(string toolName, JsonObject args, string? bearerToken, CancellationToken ct)
    {
        try
        {
            var http = _httpClientFactory.CreateClient("Mcp");
            if (!string.IsNullOrEmpty(bearerToken))
                http.DefaultRequestHeaders.Authorization =
                    new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", bearerToken);
            var rpcRequest = new
            {
                jsonrpc = "2.0",
                id = Guid.NewGuid().ToString(),
                method = "tools/call",
                @params = new { name = toolName, arguments = args }
            };

            var response = await http.PostAsJsonAsync(_settings.McpServerUrl.TrimEnd('/') + "/mcp", rpcRequest, ct);
            var json = await response.Content.ReadAsStringAsync(ct);
            var node = JsonNode.Parse(json);

            // MCP response: { "result": { "content": [{ "type": "text", "text": "..." }] } }
            var content = node?["result"]?["content"]?[0]?["text"]?.GetValue<string>();
            return content ?? json;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "MCP tool call '{Tool}' failed", toolName);
            return $"Error calling tool {toolName}: {ex.Message}";
        }
    }

    private async Task<List<AiTool>> GetAiToolsAsync(string? bearerToken, CancellationToken ct)
    {
        if (_cachedAiTools != null) return _cachedAiTools;

        await _toolLock.WaitAsync(ct);
        try
        {
            if (_cachedAiTools != null) return _cachedAiTools;

            var mcpTools = await FetchMcpToolDefinitionsAsync(bearerToken, ct);
            _cachedAiTools = mcpTools.Select(ConvertToOllamaTool).ToList();
            return _cachedAiTools;
        }
        finally
        {
            _toolLock.Release();
        }
    }

    private async Task<List<McpToolDefinition>> FetchMcpToolDefinitionsAsync(string? bearerToken, CancellationToken ct)
    {
        try
        {
            var http = _httpClientFactory.CreateClient("Mcp");
            if (!string.IsNullOrEmpty(bearerToken))
                http.DefaultRequestHeaders.Authorization =
                    new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", bearerToken);
            var rpcRequest = new
            {
                jsonrpc = "2.0",
                id = "init",
                method = "initialize",
                @params = new
                {
                    protocolVersion = "2024-11-05",
                    capabilities = new { },
                    clientInfo = new { name = "ChatBot", version = "1.0" }
                }
            };

            // Initialize session
            await http.PostAsJsonAsync(_settings.McpServerUrl.TrimEnd('/') + "/mcp", rpcRequest, ct);

            // List tools
            var listRequest = new
            {
                jsonrpc = "2.0",
                id = "list",
                method = "tools/list",
                @params = new { }
            };

            var response = await http.PostAsJsonAsync(_settings.McpServerUrl.TrimEnd('/') + "/mcp", listRequest, ct);
            var json = await response.Content.ReadAsStringAsync(ct);
            var node = JsonNode.Parse(json);

            var toolsArray = node?["result"]?["tools"]?.AsArray();
            if (toolsArray == null) return new List<McpToolDefinition>();

            var tools = toolsArray
                .Select(t => new McpToolDefinition
                {
                    Name = t?["name"]?.GetValue<string>() ?? "",
                    Description = t?["description"]?.GetValue<string>() ?? "",
                    InputSchema = t?["inputSchema"]?.AsObject()
                })
                .Where(t => !string.IsNullOrEmpty(t.Name))
                .ToList();

            _logger.LogInformation("Loaded {Count} MCP tools for AI", tools.Count);
            return tools;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to fetch MCP tool definitions. AI will operate without tools.");
            return new List<McpToolDefinition>();
        }
    }

    private static AiTool ConvertToOllamaTool(McpToolDefinition mcp) => new()
    {
        Type = "function",
        Function = new AiFunction
        {
            Name = mcp.Name,
            Description = mcp.Description,
            Parameters = mcp.InputSchema != null
                ? JsonSerializer.Deserialize<JsonElement>(mcp.InputSchema.ToJsonString())
                : default
        }
    };

    // ── Conversation history ──────────────────────────────────────────────────

    private List<AiMessage> GetHistory(string tenantId, string conversationKey)
    {
        var key = $"ai_history_{tenantId}_{conversationKey}";
        return _cache.GetOrCreate(key, e =>
        {
            e.SlidingExpiration = TimeSpan.FromHours(2);
            return new List<AiMessage>();
        })!;
    }

    private void TrimAndSaveHistory(string tenantId, string conversationKey, List<AiMessage> history)
    {
        var maxSize = _settings.HistorySize;
        // Keep system prompt + last (maxSize - 1) non-system messages
        var systemMsg = history.FirstOrDefault(m => m.Role == "system");
        var nonSystem = history.Where(m => m.Role != "system").ToList();
        if (nonSystem.Count > maxSize - 1)
            nonSystem = nonSystem.TakeLast(maxSize - 1).ToList();

        history.Clear();
        if (systemMsg != null) history.Add(systemMsg);
        history.AddRange(nonSystem);
    }
}

// ── DTOs ──────────────────────────────────────────────────────────────────────

public class AiSettings
{
    public bool Enabled { get; set; } = false;
    /// <summary>Full base URL of the AI provider (e.g. http://localhost:11434, https://api.openai.com, https://api.groq.com/openai)</summary>
    public string Endpoint { get; set; } = "";
    /// <summary>Model name (e.g. llama3.1, gpt-4o, llama-3.3-70b-versatile)</summary>
    public string Model { get; set; } = "llama3.1";
    /// <summary>API key — leave empty for Ollama</summary>
    public string ApiKey { get; set; } = "";
    /// <summary>Chat completions path appended to Endpoint (e.g. /api/chat for Ollama, /v1/chat/completions for OpenAI-compatible)</summary>
    public string ChatPath { get; set; } = "/api/chat";
    public string McpServerUrl { get; set; } = "http://mcp:8080";
    public int HistorySize { get; set; } = 20;
    /// <summary>Base URL of the frontend app used to construct deep-links (e.g. https://novo7.com)</summary>
    public string FrontendBaseUrl { get; set; } = "";
}

public class AiMessage
{
    public string Role { get; set; } = "";
    public string? Content { get; set; }
    public string? Name { get; set; }
    public List<AiToolCall>? ToolCalls { get; set; }
}

public class AiToolCall
{
    public AiFunction? Function { get; set; }
}

public class AiTool
{
    public string Type { get; set; } = "function";
    public AiFunction Function { get; set; } = new();
}

public class AiFunction
{
    public string Name { get; set; } = "";
    public string Description { get; set; } = "";
    public JsonElement Parameters { get; set; }
}

public class McpToolDefinition
{
    public string Name { get; set; } = "";
    public string Description { get; set; } = "";
    public JsonObject? InputSchema { get; set; }
}
