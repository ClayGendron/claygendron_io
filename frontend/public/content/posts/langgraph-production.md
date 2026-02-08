---
title: "Taking LangGraph to Production"
date: "2024-12-20"
excerpt: "Practical lessons from deploying LangGraph agents in a production environment."
tags: ["LangGraph", "Production", "AI"]
published: true
---

LangGraph is great for building complex AI agents. But taking those agents from notebook to production is where things get interesting.

After deploying several LangGraph-based systems at SNHU, here's what I've learned.

## State Management is Everything

In development, you might get away with simple state. In production, you need to think about:

```python
from langgraph.graph import StateGraph
from pydantic import BaseModel

class ProductionState(BaseModel):
    # Core conversation state
    messages: list[Message]
    current_step: str

    # Observability
    trace_id: str
    started_at: datetime
    step_timings: dict[str, float]

    # Error handling
    error_count: int
    last_error: str | None

    # Business logic
    user_id: str
    session_id: str
    feature_flags: dict[str, bool]

    class Config:
        # Enable validation on assignment
        validate_assignment = True
```

The extra fields pay for themselves when you're debugging at 2 AM.

## Timeouts and Retries

LLM calls fail. APIs go down. Networks hiccup. Your graph needs to handle this gracefully.

```python
from tenacity import retry, stop_after_attempt, wait_exponential

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=4, max=10)
)
async def call_llm_with_retry(messages: list[Message]) -> str:
    async with asyncio.timeout(30):
        return await llm.ainvoke(messages)
```

But retries aren't enough. You also need:

- **Circuit breakers** to fail fast when a service is down
- **Fallback paths** for critical functionality
- **Graceful degradation** when non-critical features fail

## Observability

You can't fix what you can't see. Every node in our production graphs includes:

```python
async def node_with_observability(state: ProductionState) -> ProductionState:
    start = time.time()
    span = tracer.start_span(
        "graph_node",
        attributes={
            "node_name": "process_input",
            "trace_id": state.trace_id,
            "user_id": state.user_id,
        }
    )

    try:
        result = await actual_logic(state)
        span.set_status(Status.OK)
        return result
    except Exception as e:
        span.set_status(Status.ERROR, str(e))
        span.record_exception(e)
        raise
    finally:
        state.step_timings["process_input"] = time.time() - start
        span.end()
```

We use OpenTelemetry for tracing, which integrates nicely with most observability platforms.

## Testing Strategies

Unit tests for individual nodes are straightforward. The challenge is testing the graph as a whole.

```python
@pytest.mark.asyncio
async def test_full_graph_happy_path():
    graph = create_production_graph()

    initial_state = ProductionState(
        messages=[UserMessage("Help me understand recursion")],
        user_id="test-user",
        # ... other fields
    )

    final_state = await graph.ainvoke(initial_state)

    assert final_state.current_step == "completed"
    assert len(final_state.messages) > 1
    assert "recursion" in final_state.messages[-1].content.lower()
```

We also maintain a suite of "golden path" tests with recorded LLM responses. This catches regressions without the cost and flakiness of live LLM calls.

## Deployment Patterns

For AILA, we use a simple but effective pattern:

1. **Stateless compute**: Graph execution runs on ephemeral containers
2. **External state**: Conversation state lives in Redis
3. **Async processing**: Long-running graphs use task queues

```python
# API endpoint
@app.post("/chat")
async def chat(request: ChatRequest):
    state = await load_state(request.session_id)
    task_id = await queue.enqueue(
        "process_message",
        state=state,
        message=request.message
    )
    return {"task_id": task_id}

# Worker
async def process_message(state: dict, message: str):
    graph = create_production_graph()
    result = await graph.ainvoke(state)
    await save_state(result)
    await notify_client(result)
```

## The Payoff

Production-grade LangGraph takes more effort upfront. But the investment pays off:

- **Reliability**: Our agents run 24/7 with 99.9% uptime
- **Debuggability**: When issues arise, we can trace exactly what happened
- **Scalability**: The same patterns work whether we're handling 10 or 10,000 concurrent users

---

LangGraph is a powerful tool. Treat your production deployments with the same rigor you'd apply to any critical system, and it'll serve you well.
