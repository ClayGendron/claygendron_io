---
title: "Building AILA: Lessons from AI Tutoring at Scale"
date: "2025-01-15"
excerpt: "What I learned building an AI tutor that serves thousands of students while respecting academic integrity."
tags: ["AI", "Education", "LangGraph"]
published: true
---

Building an AI tutor that actually helps students learn—without just giving them the answers—turns out to be one of the most interesting problems I've worked on.

## The Challenge

When we started building AILA at SNHU, we faced a fundamental tension: how do you create an AI assistant that's genuinely helpful while maintaining academic integrity? Students need support, but they also need to develop their own understanding.

The easy path would be to just let an LLM answer questions directly. But that defeats the purpose of education. The hard path—the one we chose—is to build something that teaches.

## The Architecture

AILA is built on LangGraph, which gives us the flexibility to create complex conversational flows. Here's a simplified version of how we structure a tutoring interaction:

```python
from langgraph.graph import StateGraph, END

def create_tutor_graph():
    graph = StateGraph(TutorState)

    # Core nodes
    graph.add_node("assess", assess_student_understanding)
    graph.add_node("guide", provide_guidance)
    graph.add_node("check", check_comprehension)
    graph.add_node("adapt", adapt_approach)

    # Edges define the conversation flow
    graph.add_edge("assess", "guide")
    graph.add_conditional_edges(
        "guide",
        should_check_understanding,
        {"check": "check", "continue": "guide"}
    )

    return graph.compile()
```

The key insight is that tutoring isn't linear. Students get stuck, have breakthroughs, and sometimes need to revisit concepts. The graph structure lets us model this naturally.

## Lessons Learned

### 1. Socratic method works, but it's hard

Asking the right questions at the right time is an art. We spent months tuning our prompts to:

- Recognize when a student is genuinely stuck vs. just not trying
- Provide hints that illuminate without revealing
- Know when to step back and let the student struggle productively

### 2. Context is everything

A student asking about derivatives in week one needs different support than the same student in week ten. We maintain rich context about:

```typescript
interface StudentContext {
  courseProgress: number;
  recentTopics: Topic[];
  strugglingAreas: string[];
  preferredExplanationStyle: 'visual' | 'verbal' | 'example-based';
  confidenceLevel: number;
}
```

### 3. Guardrails need to be robust

Academic integrity guardrails can't be an afterthought. We built multiple layers:

- **Intent detection**: Is this a learning request or a "do my homework" request?
- **Response filtering**: Even if the model wants to give an answer, we intercept
- **Audit logging**: Every interaction is logged for review

## What's Next

AILA is live and serving thousands of students. But we're just getting started. The next challenges:

- **Multimodal support**: Math problems often need visual explanations
- **Peer learning**: Can AI facilitate productive student collaboration?
- **Adaptive curriculum**: Using learning data to improve course design

---

Building educational AI is humbling work. Every day I'm reminded that learning is deeply human, and our job is to support it—not replace it.
